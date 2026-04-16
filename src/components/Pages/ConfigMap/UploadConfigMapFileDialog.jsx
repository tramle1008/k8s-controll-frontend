import { useState, useEffect } from "react";
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
    SelectValue
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSnackbar } from "notistack";
import { coreApi } from "../../../api/api";

import { useDispatch, useSelector } from "react-redux";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";

export default function UploadConfigMapFileDialog({
    open,
    onOpenChange,
    onUploaded
}) {
    const { enqueueSnackbar } = useSnackbar();

    const [namespace, setNamespace] = useState("");
    const [file, setFile] = useState(null);
    const [type, setType] = useState("env");

    const dispatch = useDispatch();
    const { list } = useSelector((state) => state.namespaceProduct);

    useEffect(() => {
        if (open) dispatch(fetchProjectNamespaces());
    }, [open, dispatch]);

    // =========================
    // VALIDATE FILE EXTENSION
    // =========================
    const validateFile = (file) => {
        if (!file) return false;

        const name = file.name.toLowerCase();

        if (type === "env") {
            return name.endsWith(".env");
        }

        if (type === "yaml") {
            return name.endsWith(".yml") || name.endsWith(".yaml");
        }

        if (type === "sql") {
            return name.endsWith(".sql");
        }
        return false;
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];

        if (!selected) return;

        if (!validateFile(selected)) {
            enqueueSnackbar("Invalid file type for selected config type", {
                variant: "error"
            });
            return;
        }

        setFile(selected);
    };

    const handleUpload = async () => {
        let backendType = type;

        if (type === "sql") backendType = "file";

        if (!file) {
            enqueueSnackbar("Please select a file", { variant: "error" });
            return;
        }

        if (!namespace) {
            enqueueSnackbar("Please select a namespace", { variant: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("namespace", namespace);
        formData.append("type", backendType); // 
        formData.append("file", file);

        try {
            await coreApi.post("/configmaps/file", formData);

            enqueueSnackbar("Upload thành công", { variant: "success", autoHideDuration: 1000 });

            onUploaded?.();
            onOpenChange(false);
        } catch {
            enqueueSnackbar("Upload thất bại", { variant: "error", autoHideDuration: 1000 });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white">

                <DialogHeader>
                    <DialogTitle>Upload ConfigMap File</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    {/* Namespace */}
                    <div>
                        <Label>Namespace</Label>

                        <Select value={namespace} onValueChange={setNamespace}>
                            <SelectTrigger className="w-full h-9 mt-1">
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

                    {/* Type */}
                    <div>
                        <Label>ConfigMap Type</Label>

                        <Select value={type} onValueChange={(v) => {
                            setType(v);
                            setFile(null); // reset file khi đổi type
                        }}>
                            <SelectTrigger className="w-full h-9 mt-1">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="env">ENV (.env)</SelectItem>
                                <SelectItem value="yaml">YAML (.yml/.yaml)</SelectItem>
                                <SelectItem value="sql">SQL (.sql)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File */}
                    <div>
                        <Label>ConfigMap File</Label>

                        <Input
                            type="file"
                            accept={
                                type === "env"
                                    ? ".env"
                                    : type === "yaml"
                                        ? ".yml,.yaml"
                                        : ".sql"
                            }
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button
                        variant="outline"
                        className="border-blue-400 text-blue-600 hover:bg-blue-50"
                        onClick={handleUpload}
                    >
                        Upload
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}