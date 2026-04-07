import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    IconButton,
    Chip,
    Collapse,
    CircularProgress,
    Tooltip,
    Snackbar,
    Alert,
    Button,
} from "@mui/material";
import { ExpandLess, ExpandMore, Delete } from "@mui/icons-material";
import UploadImageDialog from "./UploadImageDialog";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

function formatDateTime(value) {
    if (!value) return "-";
    return value.replace("T", " ").split(".")[0];
}

export default function RegistryManagerPage() {
    const [repos, setRepos] = useState([]);
    const [openUpload, setOpenUpload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRepo, setExpandedRepo] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    const fetchRepos = async () => {
        try {
            setLoading(true);
            const res = await api.get("/registry/repos");
            setRepos(res.data || []);
        } catch (error) {
            console.error(error);
            showSnackbar("Không tải được danh sách repo", "error");
        } finally {
            setLoading(false);
        }
    };

    //  XÓA TOÀN BỘ REPO
    const handleDeleteRepo = async (repoName) => {
        if (!window.confirm(`Bạn có chắc muốn xoá repo "${repoName}"?`)) return;

        try {
            await api.delete(`/registry/repo?repo=${repoName}`);

            showSnackbar(`Đã xoá repository: ${repoName}`, "success");
            fetchRepos();
        } catch (error) {
            console.error(error);
            showSnackbar("Xoá repo thất bại", "error");
        }
    };

    const handleDeleteTag = async (repoName, tag) => {
        try {
            showSnackbar(`Đã xóa tag ${tag} của repo ${repoName}`, "success");
            fetchRepos();
        } catch (error) {
            console.error(error);
            showSnackbar("Xóa tag thất bại", "error");
        }
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    return (
        <Box sx={{ p: 3 }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                    Registry Manager
                </Typography>

                <Button variant="contained" onClick={() => setOpenUpload(true)}>
                    Upload Image
                </Button>
            </Box>

            <UploadImageDialog
                open={openUpload}
                onClose={() => setOpenUpload(false)}
                onUploaded={() => fetchRepos()} />

            {loading ? (
                <Stack spacing={2}>
                    {[1, 2, 3].map(i => (
                        <Card key={i} sx={{ p: 2, mb: 2 }}>
                            <CircularProgress />
                        </Card>
                    ))}
                </Stack>
            ) : repos.length === 0 ? (
                <Typography>Chưa có repository nào</Typography>
            ) : (
                repos.map(repo => {
                    const open = expandedRepo === repo.name;
                    return (
                        <Card key={repo.name} sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">

                                    {/* Tên repo */}
                                    <Typography variant="h6">{repo.name}</Typography>

                                    {/* Nút expand + delete repo */}
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteRepo(repo.name)}
                                        >
                                            <Delete />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                setExpandedRepo(prev =>
                                                    prev === repo.name ? null : repo.name
                                                )
                                            }
                                        >
                                            {open ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </Stack>

                                </Stack>

                                <Collapse in={open}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                                        {repo.tags.map(tag => (
                                            <Tooltip
                                                key={tag.tag}
                                                title={`Size: ${(tag.size / 1024 / 1024).toFixed(2)} MB | Created: ${formatDateTime(tag.created)}`}
                                                arrow
                                            >
                                                <Chip
                                                    label={`${tag.tag} (${(tag.size / 1024 / 1024).toFixed(2)} MB)`}
                                                    onDelete={() => handleDeleteTag(repo.name, tag.tag)}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ mb: 1 }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </CardContent>
                        </Card>
                    );
                })
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
