import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { fetchSecrets, uploadSecretFile } from "../../../store/reducers/slices/secretSlice";

export default function UploadSecretFileDialog({
    open,
    onOpenChange,
    onUploaded
}) {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            enqueueSnackbar("Vui lòng chọn file", {
                variant: "warning",
                autoHideDuration: 1000
            });
            return;
        }

        try {
            setProcessing(true);

            await dispatch(uploadSecretFile(file)).unwrap();
            await dispatch(fetchSecrets());

            enqueueSnackbar("Uploaded successfully", {
                variant: "success",
                autoHideDuration: 1000
            });

            onUploaded?.();
            onOpenChange(false);
            setFile(null);
        } catch (err) {
            enqueueSnackbar(
                typeof err === "string" ? err : "Upload failed",
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
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Upload Secret File</DialogTitle>
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
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleUpload}
                        disabled={processing}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {processing ? "Uploading..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}