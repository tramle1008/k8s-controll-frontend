import { useState } from "react";
import { useSnackbar } from "notistack";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { coreApi } from "../../../api/api";

export default function CreatePVDialog({
    open,
    onOpenChange,
    onCreated
}) {
    const { enqueueSnackbar } = useSnackbar();

    const [processing, setProcessing] = useState(false);

    const [form, setForm] = useState({
        name: "",
        capacity: "5Gi",
        accessModes: ["ReadWriteOnce"],
        reclaimPolicy: "Retain",
        storageClassName: "",
        type: "hostPath",
        hostPath: "",
        nfsServer: "",
        nfsPath: "",
        localPath: ""
    });

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAccessModesChange = (value) => {
        const items = value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);

        setForm((prev) => ({
            ...prev,
            accessModes: items
        }));
    };

    const buildPayload = () => {
        const payload = {
            name: form.name.trim(),
            capacity: form.capacity.trim(),
            accessModes: form.accessModes,
            reclaimPolicy: form.reclaimPolicy,
            storageClassName: form.storageClassName.trim(),
            type: form.type
        };

        if (form.type === "hostPath") {
            payload.hostPath = form.hostPath.trim();
        }

        if (form.type === "nfs") {
            payload.nfsServer = form.nfsServer.trim();
            payload.nfsPath = form.nfsPath.trim();
        }

        if (form.type === "local") {
            payload.localPath = form.localPath.trim();
        }

        return payload;
    };

    const resetForm = () => {
        setForm({
            name: "",
            capacity: "5Gi",
            accessModes: ["ReadWriteOnce"],
            reclaimPolicy: "Retain",
            storageClassName: "",
            type: "hostPath",
            hostPath: "",
            nfsServer: "",
            nfsPath: "",
            localPath: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setProcessing(true);

            const payload = buildPayload();

            await coreApi.post("/pvs", payload);

            enqueueSnackbar("PV created successfully", {
                variant: "success",
                autoHideDuration: 1000
            });

            onCreated?.();
            onOpenChange(false);
            resetForm();
        } catch (err) {
            console.error(err);
            enqueueSnackbar(
                err?.response?.data || "Failed to create PV",
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
                    <DialogTitle>Create Persistent Volume</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>PV Name</Label>
                            <Input
                                placeholder="pv-demo"
                                value={form.name}
                                onChange={(e) =>
                                    updateField("name", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Capacity</Label>
                            <Input
                                placeholder="5Gi"
                                value={form.capacity}
                                onChange={(e) =>
                                    updateField("capacity", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Access Modes</Label>
                            <Input
                                placeholder="ReadWriteOnce, ReadOnlyMany"
                                value={form.accessModes.join(", ")}
                                onChange={(e) =>
                                    handleAccessModesChange(e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Reclaim Policy</Label>
                            <select
                                className="w-full border rounded-md px-3 py-2"
                                value={form.reclaimPolicy}
                                onChange={(e) =>
                                    updateField("reclaimPolicy", e.target.value)
                                }
                            >
                                <option value="Retain">Retain</option>
                                <option value="Delete">Delete</option>
                                <option value="Recycle">Recycle</option>
                            </select>
                        </div>

                        <div>
                            <Label>Storage Class Name</Label>
                            <Input
                                placeholder="manual"
                                value={form.storageClassName}
                                onChange={(e) =>
                                    updateField("storageClassName", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Label>Type</Label>
                            <select
                                className="w-full border rounded-md px-3 py-2"
                                value={form.type}
                                onChange={(e) =>
                                    updateField("type", e.target.value)
                                }
                            >
                                <option value="hostPath">hostPath</option>
                                <option value="nfs">nfs</option>
                                <option value="local">local</option>
                            </select>
                        </div>
                    </div>

                    {form.type === "hostPath" && (
                        <div className="space-y-2">
                            <Label>Host Path</Label>
                            <Input
                                placeholder="/mnt/data"
                                value={form.hostPath}
                                onChange={(e) =>
                                    updateField("hostPath", e.target.value)
                                }
                            />
                        </div>
                    )}

                    {form.type === "nfs" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>NFS Server</Label>
                                <Input
                                    placeholder="192.168.1.10"
                                    value={form.nfsServer}
                                    onChange={(e) =>
                                        updateField("nfsServer", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label>NFS Path</Label>
                                <Input
                                    placeholder="/exports/data"
                                    value={form.nfsPath}
                                    onChange={(e) =>
                                        updateField("nfsPath", e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {form.type === "local" && (
                        <div className="space-y-2">
                            <Label>Local Path</Label>
                            <Input
                                placeholder="/data/local-pv"
                                value={form.localPath}
                                onChange={(e) =>
                                    updateField("localPath", e.target.value)
                                }
                            />
                        </div>
                    )}

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
                        >
                            {processing ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}