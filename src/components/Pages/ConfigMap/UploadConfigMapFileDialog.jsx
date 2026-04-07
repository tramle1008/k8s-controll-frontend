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

    const dispatch = useDispatch();
    const { list } = useSelector((state) => state.namespaceProduct);

    // Load namespace list khi mở dialog
    useEffect(() => {
        if (open) dispatch(fetchProjectNamespaces());
    }, [open, dispatch]);

    const handleUpload = async () => {
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
        formData.append("file", file);

        try {
            await coreApi.post("/configmaps/file", formData);
            enqueueSnackbar("Uploaded", { variant: "success", autoHideDuration: 1000 });

            onUploaded?.();
            onOpenChange(false);
        } catch {
            enqueueSnackbar("Upload failed", { variant: "error" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white">

                <DialogHeader>
                    <DialogTitle>Upload ConfigMap File</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    {/* Namespace chọn từ Select */}
                    <div>
                        <Label>Namespace</Label>

                        <Select
                            value={namespace}
                            onValueChange={(v) => setNamespace(v)}
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

                    {/* File upload */}
                    <div>
                        <Label>ConfigMap File</Label>
                        <Input
                            type="file"
                            accept=".yaml,.yml,.sql"
                            onChange={(e) => setFile(e.target.files[0])}
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