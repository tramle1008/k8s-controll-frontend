import { useEffect, useState } from "react";
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

import { useSnackbar } from "notistack";
import { coreApi } from "../../../api/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

export default function CreateHpaDialog({ open, onOpenChange, onCreated }) {
    const { enqueueSnackbar } = useSnackbar();
    const { list = [] } = useSelector(state => state.namespaceProduct);
    const dispatch = useDispatch();
    const [processing, setProcessing] = useState(false);
    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, [dispatch]);
    const [form, setForm] = useState({
        name: "",
        namespace: "default",
        targetKind: "Deployment",
        targetName: "",
        minReplicas: 1,
        maxReplicas: 5,
        cpuUtilization: "",
        memoryUtilization: ""
    });

    const resetForm = () => {
        setForm({
            name: "",
            namespace: "default",
            targetKind: "Deployment",
            targetName: "",
            minReplicas: 1,
            maxReplicas: 5,
            cpuUtilization: "",
            memoryUtilization: ""
        });
    };

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const buildPayload = () => {
        const payload = {
            metadata: {
                name: form.name.trim(),
                namespace: form.namespace.trim() || "default"
            },
            spec: {
                targetKind: form.targetKind,
                targetName: form.targetName.trim(),
                minReplicas: Number(form.minReplicas),
                maxReplicas: Number(form.maxReplicas)
            }
        };

        if (form.cpuUtilization !== "" && form.cpuUtilization !== null) {
            payload.spec.cpuUtilization = Number(form.cpuUtilization);
        }

        if (form.memoryUtilization !== "" && form.memoryUtilization !== null) {
            payload.spec.memoryUtilization = Number(form.memoryUtilization);
        }

        return payload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            enqueueSnackbar("Vui lòng nhập tên HPA", {
                variant: "warning",
                autoHideDuration: 1200
            });
            return;
        }

        if (!form.targetName.trim()) {
            enqueueSnackbar("Vui lòng nhập Target Name", {
                variant: "warning",
                autoHideDuration: 1200
            });
            return;
        }

        if (!form.cpuUtilization && !form.memoryUtilization) {
            enqueueSnackbar("Phải nhập CPU hoặc Memory target", {
                variant: "warning",
                autoHideDuration: 1200
            });
            return;
        }

        if (Number(form.minReplicas) > Number(form.maxReplicas)) {
            enqueueSnackbar("Min Replicas không được lớn hơn Max Replicas", {
                variant: "warning",
                autoHideDuration: 1200
            });
            return;
        }

        try {
            setProcessing(true);

            const payload = buildPayload();

            console.log("HPA Payload:");
            console.log(JSON.stringify(payload, null, 2));

            await coreApi.post("/hpa", payload);

            enqueueSnackbar("Tạo HPA thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            onCreated?.();
            onOpenChange(false);
            resetForm();
        } catch (err) {
            console.error(err);

            enqueueSnackbar(
                `Tạo HPA thất bại: ${err.response?.data || err.message}`,
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
                    <DialogTitle>Create Horizontal Pod Autoscaler</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>HPA Name</Label>
                            <Input
                                placeholder="my-hpa"
                                value={form.name}
                                onChange={(e) =>
                                    updateField("name", e.target.value)
                                }
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

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                            Scale Target
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Kind</Label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 bg-white"
                                    value={form.targetKind}
                                    onChange={(e) =>
                                        updateField("targetKind", e.target.value)
                                    }
                                >
                                    <option value="Deployment">Deployment</option>
                                    <option value="StatefulSet">StatefulSet</option>
                                    <option value="ReplicaSet">ReplicaSet</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Target Name</Label>
                                <Input
                                    placeholder="nginx-deployment"
                                    value={form.targetName}
                                    onChange={(e) =>
                                        updateField("targetName", e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                            Replicas
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Replicas</Label>
                                <Input
                                    type="number"
                                    value={form.minReplicas}
                                    onChange={(e) =>
                                        updateField("minReplicas", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Max Replicas</Label>
                                <Input
                                    type="number"
                                    value={form.maxReplicas}
                                    onChange={(e) =>
                                        updateField("maxReplicas", e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">
                            Metrics
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CPU Target (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="70"
                                    value={form.cpuUtilization}
                                    onChange={(e) =>
                                        updateField("cpuUtilization", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Memory Target (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="80"
                                    value={form.memoryUtilization}
                                    onChange={(e) =>
                                        updateField("memoryUtilization", e.target.value)
                                    }
                                />
                            </div>
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