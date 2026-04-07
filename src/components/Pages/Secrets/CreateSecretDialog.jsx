import { useEffect, useState } from "react";
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

import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { createSecret, fetchSecrets } from "../../../store/reducers/slices/secretSlice";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";

export default function CreateSecretDialog({ open, onOpenChange, onCreated }) {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [processing, setProcessing] = useState(false);
    const { list = [] } = useSelector(state => state.namespaceProduct);

    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, [dispatch]);
    const [form, setForm] = useState({
        name: "",
        namespace: "default",
        type: "Opaque",
        data: [{ key: "", value: "" }]
    });

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const updateDataRow = (index, field, value) => {
        setForm((prev) => {
            const updated = [...prev.data];
            updated[index][field] = value;
            return {
                ...prev,
                data: updated
            };
        });
    };

    const addDataRow = () => {
        setForm((prev) => ({
            ...prev,
            data: [...prev.data, { key: "", value: "" }]
        }));
    };

    const removeDataRow = (index) => {
        setForm((prev) => ({
            ...prev,
            data: prev.data.filter((_, i) => i !== index)
        }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            namespace: "default",
            type: "Opaque",
            data: [{ key: "", value: "" }]
        });
    };

    const buildPayload = () => {
        const dataObject = Object.fromEntries(
            form.data
                .filter((item) => item.key?.trim())
                .map((item) => [item.key.trim(), item.value ?? ""])
        );

        return {
            name: form.name.trim(),
            namespace: form.namespace.trim() || "default",
            type: form.type || "Opaque",
            data: dataObject
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            enqueueSnackbar("Vui lòng nhập tên Secret", {
                variant: "warning",
                autoHideDuration: 1000
            });
            return;
        }

        try {
            setProcessing(true);

            const payload = buildPayload();

            await dispatch(createSecret(payload)).unwrap();
            await dispatch(fetchSecrets());

            enqueueSnackbar("Secret created successfully", {
                variant: "success",
                autoHideDuration: 1000
            });

            onCreated?.();
            onOpenChange(false);
            resetForm();
        } catch (err) {
            enqueueSnackbar(
                typeof err === "string" ? err : "Failed to create secret",
                {
                    variant: "error",
                    autoHideDuration: 1200
                }
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Secret</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Secret Name</Label>
                            <Input
                                placeholder="my-secret"
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Namespace</Label>
                            <Select
                                value={form.namespace}
                                onValueChange={(v) => updateField("namespace", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Namespace" />
                                </SelectTrigger>

                                <SelectContent>
                                    {list.map(ns => (
                                        <SelectItem key={ns} value={ns}>
                                            {ns}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Type */}
                    <div className="flex items-center gap-2">
                        <Label className="whitespace-nowrap w-24">Type</Label>

                        <select
                            className="border rounded-md px-3 py-2 bg-white flex-1"
                            value={form.type}
                            onChange={(e) => updateField("type", e.target.value)}
                        >
                            <option value="Opaque">Opaque</option>
                            <option value="kubernetes.io/tls">kubernetes.io/tls</option>
                            <option value="kubernetes.io/basic-auth">kubernetes.io/basic-auth</option>
                            <option value="kubernetes.io/dockerconfigjson">kubernetes.io/dockerconfigjson</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-sm text-muted-foreground">
                                Data
                            </h3>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addDataRow}
                            >
                                + Add Data
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {form.data.map((row, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-5 gap-2 items-center"
                                >
                                    <Input
                                        placeholder="Key"
                                        className="col-span-2"
                                        value={row.key}
                                        onChange={(e) =>
                                            updateDataRow(index, "key", e.target.value)
                                        }
                                    />

                                    <Input
                                        placeholder="Value"
                                        className="col-span-2"
                                        value={row.value}
                                        onChange={(e) =>
                                            updateDataRow(index, "value", e.target.value)
                                        }
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDataRow(index)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {processing ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}