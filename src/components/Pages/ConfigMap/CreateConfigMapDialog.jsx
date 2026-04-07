import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSnackbar } from "notistack";
import { coreApi } from "../../../api/api";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";

export default function CreateConfigMapDialog({
    open,
    onOpenChange,
    onCreated
}) {

    const { enqueueSnackbar } = useSnackbar();
    const [name, setName] = useState("");
    const [namespace, setNamespace] = useState("");

    const dispatch = useDispatch();
    const { list } = useSelector((state) => state.namespaceProduct);

    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, [dispatch]);

    const [data, setData] = useState([{ key: "", value: "" }]);

    const addRow = () => {
        setData([...data, { key: "", value: "" }]);
    };

    const removeRow = (i) => {
        setData(data.filter((_, idx) => idx !== i));
    };

    const updateRow = (i, field, value) => {
        const updated = [...data];
        updated[i][field] = value;
        setData(updated);
    };

    const handleSubmit = async () => {
        const dataObject = {};

        data.forEach(d => {
            if (d.key) dataObject[d.key] = d.value;
        });

        const payload = { name, namespace, data: dataObject };

        try {
            await coreApi.post("/configmaps", payload);
            enqueueSnackbar("Created", { variant: "success", autoHideDuration: 1000 });

            onCreated?.();
            onOpenChange(false);
        } catch {
            enqueueSnackbar("Create failed", { variant: "error" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Create ConfigMap</DialogTitle>
                    <DialogDescription className="sr-only">-</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                    {/* Name */}
                    <div className="w-full">
                        <Label>ConfigMap Name</Label>
                        <Input
                            placeholder="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Namespace */}
                    <div className="w-full">
                        <Label>Namespace</Label>
                        <Select
                            value={namespace}
                            onValueChange={val => setNamespace(val)}
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

                    {/* Key-value */}
                    <div className="w-full">
                        <Label>Key - Value</Label>

                        {data.map((row, i) => (
                            <div key={i} className="flex gap-2 items-center mt-2">
                                <Input
                                    placeholder="key"
                                    value={row.key}
                                    onChange={(e) => updateRow(i, "key", e.target.value)}
                                />

                                <Input
                                    placeholder="value"
                                    value={row.value}
                                    onChange={(e) => updateRow(i, "value", e.target.value)}
                                />

                                {/* Nút X xóa */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeRow(i)}
                                >
                                    X
                                </Button>
                            </div>
                        ))}

                        <Button variant="outline" className="mt-2" onClick={addRow}>
                            + Add Data
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="outline"
                        className="border-blue-400 text-blue-600 hover:bg-blue-50"
                    >
                        Create
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}