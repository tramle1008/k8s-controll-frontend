import { useEffect, useState } from "react";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select, SelectTrigger, SelectContent,
    SelectItem, SelectValue,
} from "@/components/ui/select";

import { coreApi } from "../../../api/api";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";
import { TextField } from "@mui/material";

export default function CreateStatefulSetDialog({ open, onOpenChange, onCreated }) {

    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { list = [] } = useSelector((state) => state.namespaceProduct);
    const [envFromList, setEnvFromList] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [configMaps, setConfigMaps] = useState([]);

    const initialForm = {
        name: "",
        namespace: "default",
        replicas: 1,
        serviceName: "",
        container: {
            name: "",
            image: "",
            ports: [
                5432
            ],
            resources: {
                requests: {
                    cpu: "",
                    memory: ""
                },
                limits: {
                    cpu: "",
                    memory: ""
                }
            },
            env: [],
            envFrom: [],
            volumeMounts: []
        },
        pvc: {
            name: "postgres-storage",
            storageClassName: "longhorn",
            storage: "2Gi"
        },
        initSqls: []
    };

    const [form, setForm] = useState(initialForm);

    /** -----------------------------
     * LOAD NAMESPACE
     ------------------------------ */
    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, [dispatch]);

    /** -----------------------------
     * LOAD CONFIGMAP THEO NAMESPACE
     ------------------------------ */
    useEffect(() => {
        if (!form.namespace) return;

        let active = true;

        const load = async () => {
            try {
                const res = await coreApi.get(`/configmaps/${form.namespace}`);
                if (active) setConfigMaps(res.data || []);
            } catch (err) {
                console.error("Load configmap error:", err);
            }
        };

        load();
        return () => { active = false; };

    }, [form.namespace]);

    /** -----------------------------
     * RESET FORM KHI ĐÓNG
     ------------------------------ */
    useEffect(() => {
        if (!open) {
            setForm(initialForm);
            setConfigMaps([]);
        }
    }, [open]);

    /** -----------------------------
     * UPDATE HELPERS
     ------------------------------ */
    const updateField = (field, value) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const updateContainer = (field, value) =>
        setForm(prev => ({
            ...prev,
            container: { ...prev.container, [field]: value }
        }));

    const updatePVC = (field, value) =>
        setForm(prev => ({
            ...prev,
            pvc: { ...prev.pvc, [field]: value }
        }));

    const loadEnvFrom = async () => {
        try {
            const res = await coreApi.get(`/configmaps/${form.namespace}`);

            const cmList = Array.isArray(res?.data) ? res.data : [];

            setEnvFromList(
                cmList.map(x => ({
                    name: x.name,
                    type: "configMap"
                }))
            );

        } catch (err) {
            console.error("loadEnvFrom error:", err);
        }
    };


    useEffect(() => {
        if (!form.namespace) return;
        loadEnvFrom();
    }, [form.namespace]);

    /** -----------------------------
     * ENV VAR
     ------------------------------ */
    const addEnv = () =>
        updateContainer("env", [
            ...form.container.env,
            { id: Date.now(), name: "", value: "" }
        ]);

    const updateEnv = (id, field, value) =>
        updateContainer("env",
            form.container.env.map(e =>
                e.id === id ? { ...e, [field]: value } : e
            )
        );

    const removeEnv = (id) =>
        updateContainer("env",
            form.container.env.filter(e => e.id !== id)
        );
    const envFrom = form.container.envFrom
        .filter(e => e.name)
        .map(e => ({
            type: e.type,
            name: e.name
        }));
    /** -----------------------------
     * INIT SQL
     ------------------------------ */
    const addInitSql = () =>
        setForm(prev => ({
            ...prev,
            initSqls: [
                ...prev.initSqls,
                { id: Date.now(), configMapName: "", fileName: "" }
            ]
        }));

    const updateInitSql = (id, field, value) =>
        setForm(prev => ({
            ...prev,
            initSqls: prev.initSqls.map(it =>
                it.id === id ? { ...it, [field]: value } : it
            )
        }));

    const removeInitSql = (id) =>
        setForm(prev => ({
            ...prev,
            initSqls: prev.initSqls.filter(it => it.id !== id)
        }));

    /** -----------------------------
     * VALIDATE
     ------------------------------ */
    const validate = () => {
        if (!form.name.trim()) return "Name is required";
        if (!form.container.name.trim()) return "Container name required";
        if (!form.container.image.trim()) return "Image is required";
        if (Number(form.replicas) < 1) return "Replicas must be >= 1";
        return null;
    };

    /** -----------------------------
     * BUILD PAYLOAD
     ------------------------------ */
    const buildPayload = () => {

        const envList = form.container.env
            .filter(e => e.name.trim())
            .map(e => ({
                name: e.name.trim(),
                value: e.value || ""
            }));

        const defaultEnv = [
            { name: "POSTGRES_USER", value: "postgres" },
            { name: "POSTGRES_PASSWORD", value: "postgres" },
            { name: "PGDATA", value: "/var/lib/postgresql/data/pgdata" }
        ];

        const volumeMounts = [
            {
                name: form.pvc.name,
                mountPath: "/var/lib/postgresql/data",
                readOnly: false
            }
        ];
        const envFrom = form.container.envFrom
            .filter(e => e.name)
            .map(e => ({
                configMapRef: {
                    name: e.name
                }
            }));

        const volumes = [];

        form.initSqls.forEach((sql, index) => {
            if (!sql.configMapName || !sql.fileName) return;

            const volName = `init-sql-${String(index + 1).padStart(2, "0")}`;

            volumes.push({
                name: volName,
                type: "configMap",
                configMapName: sql.configMapName
            });

            volumeMounts.push({
                name: volName,
                mountPath: `/docker-entrypoint-initdb.d/${sql.fileName}`,
                subPath: sql.fileName,
                readOnly: true
            });
        });

        return {
            metadata: {
                name: form.name,
                namespace: form.namespace,
                labels: { app: form.name }
            },
            serviceName: form.serviceName || form.name,
            replicas: Number(form.replicas),

            containers: [
                {
                    name: form.container.name,
                    image: form.container.image,

                    ports: [
                        {
                            containerPort: 5432,
                            protocol: "TCP"
                        }
                    ],

                    env: [...defaultEnv, ...envList],
                    envFrom: form.container.envFrom
                        .filter(e => e.name)
                        .map(e => ({
                            configMapRef: {
                                name: e.name
                            }
                        })),
                    volumeMounts
                }
            ],

            volumes,

            volumeClaimTemplates: [
                {
                    name: form.pvc.name,
                    storageClassName: form.pvc.storageClassName,
                    accessModes: ["ReadWriteOnce"],
                    storage: form.pvc.storage
                }
            ]
        };
    };

    /** -----------------------------
     * SUBMIT
     ------------------------------ */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errMsg = validate();
        if (errMsg) {
            enqueueSnackbar(errMsg, { variant: "warning" });
            return;
        }

        try {
            setProcessing(true);

            await coreApi.post("/statefulsets", buildPayload());

            enqueueSnackbar("StatefulSet created successfully", {
                variant: "success",
                autoHideDuration: 1000
            });

            onCreated?.();
            onOpenChange(false);

        } catch (err) {
            console.error(err);
            enqueueSnackbar("Failed to create StatefulSet", {
                variant: "error"
            });
        } finally {
            setProcessing(false);
        }
    };

    /** -----------------------------
     * UI
     ------------------------------ */
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-white max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <DialogTitle>Create StatefulSet</DialogTitle>
                    <DialogDescription className="sr-only">-</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* BASIC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Namespace</Label>
                            <Select
                                value={form.namespace}
                                onValueChange={(v) => updateField("namespace", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Namespace" />
                                </SelectTrigger>
                                <SelectContent>
                                    {list.map(ns => (
                                        <SelectItem key={ns} value={ns}>{ns}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Replicas</Label>
                            <Input
                                type="number"
                                value={form.replicas}
                                onChange={(e) =>
                                    updateField("replicas", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    {/* CONTAINER NAME */}
                    <div className="mb-2">
                        <Label>Container Name</Label>
                        <Input
                            value={form.container.name}
                            onChange={(e) => updateContainer("name", e.target.value)}
                        />
                    </div>

                    {/* IMAGE */}
                    <div className="mb-2">
                        <Label>Image</Label>
                        <Input
                            value={form.container.image}
                            onChange={(e) => updateContainer("image", e.target.value)}
                        />
                    </div>

                    {/* PORTS */}
                    <div>
                        <Label>Ports</Label>

                        {form.container.ports.map((port, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <Input
                                    type="number"
                                    value={port}
                                    onChange={(e) => {
                                        const newPorts = [...form.container.ports];
                                        newPorts[index] = Number(e.target.value);
                                        updateContainer("ports", newPorts);
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const newPorts = form.container.ports.filter((_, i) => i !== index);
                                        updateContainer("ports", newPorts);
                                    }}
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            onClick={() => updateContainer("ports", [...form.container.ports, 0])}
                        >
                            + Add Port
                        </Button>
                    </div>
                    {/* ENV */}
                    <div>
                        <div className="flex justify-between">
                            <Label>Environment Variables</Label>
                            <Button type="button" onClick={addEnv}>+ Add</Button>
                        </div>

                        {form.container.env.map(env => (
                            <div key={env.id} className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Name"
                                    value={env.name}
                                    onChange={(e) =>
                                        updateEnv(env.id, "name", e.target.value)
                                    }
                                />
                                <Input
                                    placeholder="Value"
                                    value={env.value}
                                    onChange={(e) =>
                                        updateEnv(env.id, "value", e.target.value)
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={() => removeEnv(env.id)}
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                    {/* ENV FROM */}
                    <div>
                        <div className="flex justify-between">
                            <Label>EnvFrom (ConfigMap / Secret)</Label>
                            <Button
                                type="button"
                                onClick={() =>
                                    updateContainer("envFrom", [
                                        ...form.container.envFrom,
                                        { id: Date.now(), name: "", type: "configMap" }
                                    ])
                                }
                            >
                                + Add
                            </Button>
                        </div>

                        {form.container.envFrom.map(item => (
                            <div key={item.id} className="flex gap-2 mt-2">

                                <Select
                                    value={item.type}
                                    onValueChange={(v) =>
                                        updateContainer("envFrom",
                                            form.container.envFrom.map(e =>
                                                e.id === item.id ? { ...e, type: v } : e
                                            )
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="configMap">ConfigMap</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={item.name}
                                    onValueChange={(v) =>
                                        updateContainer("envFrom",
                                            form.container.envFrom.map(e =>
                                                e.id === item.id ? { ...e, name: v } : e
                                            )
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select name" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {envFromList.map(x => (
                                            <SelectItem key={x.name} value={x.name}>
                                                {x.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    onClick={() =>
                                        updateContainer("envFrom",
                                            form.container.envFrom.filter(e => e.id !== item.id)
                                        )
                                    }
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* INIT SQL */}
                    <div>
                        <div className="flex justify-between">
                            <Label>Init SQL (ConfigMap)</Label>
                            <Button type="button" onClick={addInitSql}>
                                + Add
                            </Button>
                        </div>

                        {form.initSqls.map(sql => (
                            <div key={sql.id} className="grid grid-cols-3 gap-2 mt-2">
                                <Select
                                    value={sql.configMapName}
                                    onValueChange={(v) =>
                                        updateInitSql(sql.id, "configMapName", v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="ConfigMap" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {configMaps.map(cm => (
                                            <SelectItem key={cm.name} value={cm.name}>
                                                {cm.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    placeholder="file.sql"
                                    value={sql.fileName}
                                    onChange={(e) =>
                                        updateInitSql(sql.id, "fileName", e.target.value)
                                    }
                                />

                                <Button
                                    type="button"
                                    onClick={() => removeInitSql(sql.id)}
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                    {/* Resources */}
                    <div>
                        <Label>Resources</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">

                            <Input
                                placeholder="CPU Request"
                                value={form.container.resources.requests.cpu}
                                onChange={e => updateContainer("resources", {
                                    ...form.container.resources,
                                    requests: { ...form.container.resources.requests, cpu: e.target.value }
                                })}
                            />
                            <Input
                                placeholder="Memory Request"
                                value={form.container.resources.requests.memory}
                                onChange={e => updateContainer("resources", {
                                    ...form.container.resources,
                                    requests: { ...form.container.resources.requests, memory: e.target.value }
                                })}
                            />
                            <Input
                                placeholder="CPU Limit"
                                value={form.container.resources.limits.cpu}
                                onChange={e => updateContainer("resources", {
                                    ...form.container.resources,
                                    limits: { ...form.container.resources.limits, cpu: e.target.value }
                                })}
                            />
                            <Input
                                placeholder="Memory Limit"
                                value={form.container.resources.limits.memory}
                                onChange={e => updateContainer("resources", {
                                    ...form.container.resources,
                                    limits: { ...form.container.resources.limits, memory: e.target.value }
                                })}
                            />
                        </div>
                        {/* PVC */}
                        <div className="space-y-2">
                            <Label>PVC</Label>
                            <Input
                                placeholder="PVC name"
                                value={form.pvc.name}
                                onChange={(e) => updatePVC("name", e.target.value)}
                            />
                            <Input
                                placeholder="StorageClass"
                                value={form.pvc.storageClassName}
                                onChange={(e) =>
                                    updatePVC("storageClassName", e.target.value)
                                }
                            />
                            <Input
                                placeholder="2Gi"
                                value={form.pvc.storage}
                                onChange={(e) => updatePVC("storage", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <DialogFooter>
                        <Button type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>

                        <Button type="submit" disabled={processing}>
                            {processing ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
}