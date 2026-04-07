import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { coreApi } from "../../../api/api";
import toast from "react-hot-toast";
import { useSnackbar } from "notistack";

export default function UploadImageDialog({ open, onClose, onUploaded }) {
    const { enqueueSnackbar } = useSnackbar();
    const [file, setFile] = useState(null);
    const [username, setUsername] = useState("");
    const [appName, setAppName] = useState("");
    const [tag, setTag] = useState("");
    const [loading, setLoading] = useState(false);

    // === Auto-fill username khi mở dialog ===
    useEffect(() => {
        if (open) {
            const saved = localStorage.getItem("username");

            if (saved) {
                const normalized = saved
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "")
                    .toLowerCase();

                setUsername(normalized);
            }
        }
    }, [open]);

    const show = (message, type = "default") => {
        toast({
            description: message,
            variant: type === "error" ? "destructive" : "default",
        });
    };

    const handleUpload = async () => {
        if (!file || !username || !appName) {
            show("Thiếu file, username hoặc appName", "error");
            return;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("username", username);
        form.append("appName", appName);
        if (tag) form.append("tag", tag);

        try {
            setLoading(true);   // 🔥 bật loading

            await coreApi.post("/registry/upload", form, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            enqueueSnackbar("Upload thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            if (onUploaded) onUploaded();
            onClose();

        } catch (err) {
            enqueueSnackbar(
                `Upload thất bại: ${err.response?.data?.error || "Lỗi không xác định"}`,
                { variant: "error", autoHideDuration: 1200 }
            );
        } finally {
            setLoading(false);  //  tắt loading
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Upload Docker Image (.tar)</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Username — auto-fill & disabled */}
                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                            value={username}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                        />
                        {/* File upload */}
                        <div className="space-y-2">
                            <Label>File .tar</Label>
                            <Input
                                type="file"
                                accept=".tar"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            {file && (
                                <p className="text-sm text-muted-foreground">
                                    Đã chọn: {file.name}
                                </p>
                            )}
                        </div>


                    </div>

                    {/* App Name */}
                    <div className="space-y-2">
                        <Label>App Name</Label>
                        <Input
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="vd: my-app"
                        />
                    </div>

                    {/* Tag */}
                    <div className="space-y-2">
                        <Label>Tag (optional)</Label>
                        <Input
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            placeholder="vd: v1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button
                        variant="outline"
                        onClick={handleUpload}
                        disabled={loading}
                        className="border-blue-400 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                    >
                        {loading && (
                            <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12" cy="12" r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                        )}

                        {loading ? "Đang upload..." : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}