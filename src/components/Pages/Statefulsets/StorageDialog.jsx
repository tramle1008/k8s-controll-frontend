import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import axios from "axios";
import { Button } from "@mui/material";

const API = import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

export default function StorageDialog() {

    const checkStorage = () =>
        axios.get(`${API}/api/statefulsets/storage/local-path`);

    const installStorage = () =>
        axios.post(`${API}/api/statefulsets/install-storage`);

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkStorage()
            .then(res => {
                if (!res.data.installed) {
                    setOpen(true);
                }
            })
            .catch(() => setOpen(true));
    }, []);

    const handleInstall = async () => {
        try {
            setLoading(true);

            await installStorage();

            setOpen(false);

            enqueueSnackbar("Storage được tải thành công", {
                variant: "success",
                autoHideDuration: 3000
            });

        } catch (err) {
            enqueueSnackbar("tải thất bại", {
                variant: "error",
                autoHideDuration: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent className="bg-white">

                <DialogHeader>
                    <DialogTitle>
                        Storage chưa được tải
                    </DialogTitle>
                </DialogHeader>

                <p>
                    Cluster chưa được tải StorageClass.
                    StatefulSet databases sẽ không hoạt động.
                </p>

                <DialogFooter>

                    <Button
                        variant="outlined"
                        color="info"
                        onClick={handleInstall}
                        disabled={loading}
                    >
                        {loading ? "Installing..." : "Install Storage"}
                    </Button>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}