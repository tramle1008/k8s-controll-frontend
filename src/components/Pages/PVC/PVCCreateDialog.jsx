import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";

import { createPVC, fetchPVCs } from "../../../store/reducers/slices/pvcSlice";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";


const accessModeOptions = [
    "ReadWriteOnce",
    "ReadOnlyMany",
    "ReadWriteMany",
    "ReadWriteOncePod"
];

const PVCCreateDialog = ({ open, onOpenChange, onCreated }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { list } = useSelector((state) => state.namespaceProduct);

    const [processing, setProcessing] = useState(false);

    const [form, setForm] = useState({
        name: "",
        namespace: "default",
        storage: "1Gi",
        storageClassName: "longhorn",
        volumeName: "",
        accessModes: ["ReadWriteOnce"]
    });

    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, []);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            namespace: "default",
            storage: "1Gi",
            storageClassName: "longhorn",
            volumeName: "",
            accessModes: ["ReadWriteOnce"]
        });
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            enqueueSnackbar("PVC name không được để trống", { variant: "warning" });
            return;
        }

        if (!form.storage.trim()) {
            enqueueSnackbar("Storage không được để trống", { variant: "warning" });
            return;
        }

        try {
            setProcessing(true);

            const payload = {
                name: form.name.trim(),
                namespace: form.namespace,
                storage: form.storage.trim(),
                storageClassName: form.storageClassName.trim(),
                accessModes: form.accessModes,
                ...(form.volumeName.trim() && {
                    volumeName: form.volumeName.trim()
                })
            };

            await dispatch(createPVC(payload)).unwrap();
            await dispatch(fetchPVCs());

            enqueueSnackbar("Tạo PVC thành công", { variant: "success" });

            onCreated?.();
            resetForm();
            onOpenChange(false);
        } catch (err) {
            enqueueSnackbar(`Tạo PVC thất bại: ${err}`, { variant: "error" });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Create PVC</DialogTitle>
                    <DialogDescription className="sr-only">-</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                    {/* PVC NAME */}
                    <div>
                        <Label>PVC Name</Label>
                        <Input
                            placeholder="pvc-name"
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                    </div>

                    {/* NAMESPACE */}
                    <div>
                        <Label>Namespace</Label>
                        <Select
                            value={form.namespace}
                            onValueChange={(v) => updateField("namespace", v)}
                        >
                            <SelectTrigger className="w-full h-9 mt-1">
                                <SelectValue placeholder="Chọn namespace" />
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

                    {/* STORAGE */}
                    <div>
                        <Label>Storage</Label>
                        <Input
                            placeholder="1Gi"
                            value={form.storage}
                            onChange={(e) =>
                                updateField("storage", e.target.value)
                            }
                        />
                    </div>

                    {/* STORAGE CLASS */}
                    <div>
                        <Label>Storage Class</Label>
                        <Input
                            placeholder="longhorn"
                            value={form.storageClassName}
                            onChange={(e) =>
                                updateField("storageClassName", e.target.value)
                            }
                        />
                    </div>

                    {/* VOLUME NAME */}
                    <div>
                        <Label>Volume Name (optional)</Label>
                        <Input
                            placeholder="pv-demo"
                            value={form.volumeName}
                            onChange={(e) =>
                                updateField("volumeName", e.target.value)
                            }
                        />
                    </div>

                    {/* ACCESS MODE */}
                    <div>
                        <Label>Access Mode</Label>
                        <Select
                            value={form.accessModes[0]}
                            onValueChange={(v) => updateField("accessModes", [v])}
                        >
                            <SelectTrigger className="w-full h-9 mt-1">
                                <SelectValue placeholder="Chọn access mode" />
                            </SelectTrigger>

                            <SelectContent>
                                {accessModeOptions.map((md) => (
                                    <SelectItem key={md} value={md}>
                                        {md}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="outline"
                        className="border-blue-400 text-blue-600 hover:bg-blue-50"
                    >
                        {processing ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PVCCreateDialog;