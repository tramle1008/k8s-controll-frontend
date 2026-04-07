import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Select,
    MenuItem
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

export default function LogsDialog({
    open,
    onClose,
    namespace,
    podName,
    containers
}) {

    const [logs, setLogs] = useState("");
    const [container, setContainer] = useState("");

    useEffect(() => {

        if (!open) return;

        fetchLogs();

    }, [open, container]);

    const fetchLogs = async () => {

        if (!podName) return;

        let url = `/api/pods/${namespace}/${podName}/logs`;

        if (container) {
            url += `?container=${container}`;
        }

        const res = await fetch(url);

        const text = await res.text();

        setLogs(text);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >

            <DialogTitle>

                Logs - {podName}

                <IconButton
                    onClick={onClose}
                    sx={{ position: "absolute", right: 10, top: 10 }}
                >
                    <CloseIcon />
                </IconButton>

            </DialogTitle>

            <DialogContent>

                {containers?.length > 1 && (
                    <Select
                        value={container}
                        onChange={(e) => setContainer(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {containers.map(c => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </Select>
                )}

                <Box
                    sx={{
                        background: "#111",
                        color: "#00ff00",
                        fontFamily: "monospace",
                        fontSize: 13,
                        p: 2,
                        height: 500,
                        overflow: "auto",
                        borderRadius: 2
                    }}
                >
                    <pre>{logs}</pre>
                </Box>

            </DialogContent>

        </Dialog>
    );
}