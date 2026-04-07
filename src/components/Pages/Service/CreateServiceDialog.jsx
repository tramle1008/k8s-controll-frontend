import { useEffect, useState } from "react";
import { coreApi } from "../../../api/api";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";

export default function CreateServiceDialog({ open, onClose, onCreated }) {
    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();
    const { list = [] } = useSelector((state) => state.namespaceProduct);

    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, [dispatch]);
    const [form, setForm] = useState({
        name: "",
        namespace: "default",
        type: "ClusterIP",

        selectors: [
            { key: "app", value: "" }
        ],

        port: 80,
        targetPort: 80,
        nodePort: ""
    });

    /* FIELD UPDATE */

    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    /* SELECTOR UPDATE */

    const updateSelector = (index, field, value) => {

        const updated = [...form.selectors];

        updated[index][field] = value;

        setForm(prev => ({
            ...prev,
            selectors: updated
        }));
    };

    /* ADD SELECTOR */

    const addSelector = () => {

        setForm(prev => ({
            ...prev,
            selectors: [...prev.selectors, { key: "", value: "" }]
        }));

    };

    /* REMOVE SELECTOR */

    const removeSelector = (index) => {

        const updated = form.selectors.filter((_, i) => i !== index);

        setForm(prev => ({
            ...prev,
            selectors: updated
        }));

    };

    /* BUILD PAYLOAD */

    const buildPayload = () => {

        const selectorObject = {};

        form.selectors.forEach(s => {
            if (s.key && s.value) {
                selectorObject[s.key] = s.value;
            }
        });

        const spec = {
            selector: selectorObject,
            ports: [
                {
                    name: "http",
                    port: Number(form.port),
                    targetPort: Number(form.targetPort),
                    protocol: "TCP"
                }
            ]
        };

        if (form.type === "Headless") {
            spec.clusterIP = "None";
        } else {
            spec.type = form.type;
        }

        const payload = {
            metadata: {
                name: form.name,
                namespace: form.namespace
            },
            spec
        };
        if (form.type === "NodePort" && form.nodePort) {

            payload.spec.ports[0].nodePort = Number(form.nodePort);

        }

        // console.log("Payload:");
        // console.log(JSON.stringify(payload, null, 2));

        return payload;
    };

    /* SUBMIT */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setProcessing(true);

            const payload = buildPayload();

            await coreApi.post("/services", payload);

            if (onCreated) onCreated();

            onClose();

        } catch (err) {

            console.error(err);

        } finally {

            setProcessing(false);

        }

    };

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent className="max-w-xl bg-white">

                <DialogHeader>
                    <DialogTitle>Create Kubernetes Service</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* NAME + NAMESPACE */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <Label>Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="nginx-service"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Namespace</Label>

                            <Select
                                value={form.namespace}
                                onValueChange={(v) => updateField("namespace", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select namespace" />
                                </SelectTrigger>

                                <SelectContent>
                                    {list.map((ns) => (
                                        <SelectItem key={ns} value={ns}>
                                            {ns}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    {/* SERVICE TYPE */}

                    <div>

                        <Label>Service Type</Label>

                        <select
                            value={form.type}
                            onChange={(e) => updateField("type", e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        >
                            <option value="ClusterIP">ClusterIP</option>
                            <option value="NodePort">NodePort</option>
                            <option value="LoadBalancer">LoadBalancer</option>
                            <option value="Headless">Headless</option>
                        </select>

                    </div>

                    {/* SELECTORS */}

                    <div>

                        <Label>Selectors (Labels)</Label>

                        <div className="space-y-2">

                            {form.selectors.map((s, index) => (

                                <div key={index} className="flex gap-2">

                                    <Input
                                        placeholder="key"
                                        value={s.key}
                                        onChange={(e) =>
                                            updateSelector(index, "key", e.target.value)
                                        }
                                    />

                                    <Input
                                        placeholder="value"
                                        value={s.value}
                                        onChange={(e) =>
                                            updateSelector(index, "value", e.target.value)
                                        }
                                    />

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => removeSelector(index)}
                                    >
                                        X
                                    </Button>

                                </div>

                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addSelector}
                            >
                                + Add Label
                            </Button>

                        </div>

                    </div>

                    {/* PORTS */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <Label>Port</Label>
                            <Input
                                type="number"
                                value={form.port}
                                onChange={(e) => updateField("port", e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Target Port</Label>
                            <Input
                                type="number"
                                value={form.targetPort}
                                onChange={(e) => updateField("targetPort", e.target.value)}
                            />
                        </div>

                    </div>

                    {/* NODEPORT */}

                    {form.type === "NodePort" && (

                        <div>

                            <Label>NodePort</Label>

                            <Input
                                type="number"
                                value={form.nodePort}
                                onChange={(e) => updateField("nodePort", e.target.value)}
                                placeholder="30007"
                            />

                        </div>

                    )}

                    {/* FOOTER */}

                    <DialogFooter>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="outline"
                            type="submit"
                            disabled={processing}
                            className="border-blue-400 text-blue-600 hover:bg-blue-50"
                        >
                            {processing ? "Creating..." : "Create"}
                        </Button>

                    </DialogFooter>

                </form>

            </DialogContent>

        </Dialog>

    );

}