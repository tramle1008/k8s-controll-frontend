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
            env: []
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

                    {/* CONTAINER */}
                    <TextField
                        fullWidth
                        label="Container Name"
                        value={form.container.name}
                        onChange={(e) => updateContainer("name", e.target.value)}
                    />

                    <TextField
                        fullWidth
                        label="Image"
                        value={form.container.image}
                        onChange={(e) => updateContainer("image", e.target.value)}
                    />

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