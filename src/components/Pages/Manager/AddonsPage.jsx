import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Typography,
    Button, Box, Card, CardContent, Stack, Chip
} from "@mui/material";

import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";


import { coreApi } from "../../../api/api";
import { useSnackbar } from "notistack";

const addonApiMap = {
    "Longhorn": "longhorn",
    "Metrics Server": "metrics",
    "MetalLB": "metallb",
    "NGINX Ingress": "ingress"
};


const AddonsPage = () => {
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState({});
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const fetchAddons = async () => {
        try {
            setLoading(true);
            const res = await coreApi.get("/k8s/addons");
            setAddons(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddons();
    }, []);

    const handleInstall = async (name) => {
        try {
            setInstalling((prev) => ({ ...prev, [name]: true }));

            const apiName = addonApiMap[name];

            await coreApi.post(`/k8s/addons/install/${apiName}`);

            await fetchAddons();
            enqueueSnackbar(
                `Đã cài đặt thành công ${name}`,
                {
                    variant: "success",
                    autoHideDuration: 1000
                }
            );
        } catch (err) {
            console.error("Install addon failed:", err);
            enqueueSnackbar(
                `Tải thất bại ${name}`,
                {
                    variant: "error",
                    autoHideDuration: 1000
                }
            );
        } finally {
            setInstalling((prev) => ({ ...prev, [name]: false }));
        }
    };

    const statusChip = (addon) => {
        if (!addon.installed) {
            return <Chip label="Not Installed" color="default" size="small" />;
        }
        if (addon.healthy) {
            return <Chip label="Healthy" color="success" size="small" />;
        }
        return <Chip label="Unhealthy" color="error" size="small" icon={<ErrorIcon />} />;
    };

    return (
        <Box sx={{ p: 3 }}>

            <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent>

                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" mb={2}>
                        <Typography variant="h5" fontWeight={700}>
                            Kubernetes Addons
                        </Typography>
                    </Stack>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>

                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Name</b></TableCell>
                                    <TableCell><b>Namespace</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                    <TableCell align="center"><b>Action</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : addons.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No addons found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    addons.map((addon) => (
                                        <TableRow key={addon.name} hover>

                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {addon.name}
                                            </TableCell>

                                            <TableCell>
                                                {addon.namespace}
                                            </TableCell>

                                            <TableCell>
                                                {statusChip(addon)}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={
                                                        installing[addon.name] ? (
                                                            <CircularProgress size={16} color="inherit" />
                                                        ) : (
                                                            <CloudDownloadIcon />
                                                        )
                                                    }
                                                    disabled={addon.installed || installing[addon.name]}
                                                    onClick={() => handleInstall(addon.name)}
                                                >
                                                    {installing[addon.name]
                                                        ? "Installing..."
                                                        : addon.installed
                                                            ? "Installed"
                                                            : "Install"}
                                                </Button>
                                            </TableCell>

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </TableContainer>

                </CardContent>
            </Card>
        </Box>
    );
};

export default AddonsPage;