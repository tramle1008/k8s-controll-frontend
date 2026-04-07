import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography
} from "@mui/material";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

export default function ImportDatabaseDialog({ open, onClose, podName, namespace }) {
    const [file, setFile] = useState(null);
    const [dbName, setDbName] = useState("");

    const handleImport = async () => {
        if (!file) {
            enqueueSnackbar("Chọn file .sql trước!", { variant: "warning" });
            return;
        }
        if (!dbName.trim()) {
            enqueueSnackbar("Nhập tên database!", { variant: "warning" });
            return;
        }

        const formData = new FormData();
        formData.append("namespace", namespace);
        formData.append("pod", podName);
        formData.append("database", dbName);
        formData.append("file", file);

        const res = await fetch(`${BACKEND_URL}/api/database/import`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const txt = await res.text();
            enqueueSnackbar(`Import thất bại: ${txt}`, { variant: "error", autoHideDuration: 1000 });
        } else {
            enqueueSnackbar("Import SQL thành công!", { variant: "success", autoHideDuration: 1000 });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: "bold" }}>
                Import Database vào Pod <span style={{ color: "#1976d2" }}>{podName}</span>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} mt={1}>
                    <TextField
                        label="Tên Database"
                        placeholder="appointment_db"
                        fullWidth
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                    />

                    <Stack spacing={1}>
                        <Typography variant="body2" fontWeight={500}>
                            Chọn file SQL:
                        </Typography>

                        <TextField
                            type="file"
                            fullWidth
                            inputProps={{ accept: ".sql" }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={handleImport}>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}