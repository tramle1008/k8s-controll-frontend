import { useState } from "react";
import { useSnackbar } from "notistack";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { coreApi } from "../../../api/api";

export default function UploadPVDialog({
    open,
    onOpenChange,
    onUploaded
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            enqueueSnackbar("Vui lòng chọn file YAML", {
                variant: "warning",
                autoHideDuration: 1000
            });
            return;
        }

        try {
            setProcessing(true);

            const formData = new FormData();
            formData.append("file", file);

            await coreApi.post("/pvs/file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            enqueueSnackbar("Upload PV YAML thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            onUploaded?.();
            onOpenChange(false);
            setFile(null);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(
                err?.response?.data || "Upload PV YAML thất bại",
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
            <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload PV YAML</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        type="file"
                        accept=".yaml,.yml"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleUpload} disabled={processing}>
                        {processing ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}