import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Stack,
} from "@mui/material";
import {
    Add,
    ExpandLess,
    ExpandMore,
} from "@mui/icons-material";
import ClusterImportDialog from "./ClusterImportDialog";
import ClusterNodeCollapse from "./ClusterNodeCollapse";
import DeleteIcon from '@mui/icons-material/Delete';
import Register from "../Identity/RegisterDialog";
import RegisterDialog from "../Identity/RegisterDialog";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import useConfirm from "../../../store/reducers/slices/useConfirm";
const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

const emptyNode = {
    name: "",
    ipAddress: "",
    role: "WORKER",
    username: "ubuntu",
};

function formatDateTime(value) {
    if (!value) return "-";
    return value.replace("T", " ");
}

export default function ClusterManagerPage() {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedClusterId, setExpandedClusterId] = useState(null);
    const [openRegister, setOpenRegister] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [submittingImport, setSubmittingImport] = useState(false);
    // xác nhận xóa
    const { confirm, ConfirmComponent } = useConfirm();

    const [clusterName, setClusterName] = useState("");
    const [nodes, setNodes] = useState([
        { ...emptyNode, name: "master-1", role: "MASTER" },
    ]);
    const [adminConfFile, setAdminConfFile] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        severity: "success",
        message: "",
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            severity,
            message,
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const fetchClusters = async () => {
        try {
            setLoading(true);
            const res = await api.get("/clusters/management");
            setClusters(res.data || []);
        } catch (error) {
            console.error(error);
            showSnackbar("Không tải được danh sách cluster", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClusters();
    }, []);

    const handleDeleteCluster = async (clusterId) => {
        try {
            await api.delete(`/clusters/${clusterId}`);
            showSnackbar("Xóa cluster thành công", "success");

            if (expandedClusterId === clusterId) {
                setExpandedClusterId(null);
            }

            fetchClusters();
        } catch (error) {
            console.error(error);
            showSnackbar(
                error?.response?.data?.message || "Xóa cluster thất bại",
                "error"
            );
        }
    };


    const handleAddNode = () => {
        setNodes((prev) => [...prev, { ...emptyNode }]);
    };

    const handleRemoveNode = (index) => {
        setNodes((prev) => prev.filter((_, i) => i !== index));
    };

    const handleNodeChange = (index, field, value) => {
        setNodes((prev) =>
            prev.map((node, i) => (i === index ? { ...node, [field]: value } : node))
        );
    };

    const resetImportForm = () => {
        setClusterName("");
        setNodes([{ ...emptyNode, name: "master-1", role: "MASTER" }]);
        setAdminConfFile(null);
    };

    const handleCloseImportDialog = () => {
        setImportOpen(false);
        resetImportForm();
    };

    const handleImport = async () => {
        if (!clusterName.trim()) {
            showSnackbar("Vui lòng nhập tên cluster", "warning");
            return;
        }

        if (!adminConfFile) {
            showSnackbar("Vui lòng chọn file admin.conf", "warning");
            return;
        }

        const hasInvalidNode = nodes.some(
            (node) => !node.name?.trim() || !node.ipAddress?.trim() || !node.role
        );

        if (hasInvalidNode) {
            showSnackbar("Vui lòng nhập đầy đủ thông tin node", "warning");
            return;
        }

        const masterCount = nodes.filter((n) => n.role === "MASTER").length;
        if (masterCount === 0) {
            showSnackbar("Cluster phải có ít nhất 1 node MASTER", "warning");
            return;
        }

        try {
            setSubmittingImport(true);

            const payload = {
                clusterName: clusterName.trim(),
                nodes: nodes.map((node) => ({
                    name: node.name?.trim(),
                    ipAddress: node.ipAddress?.trim(),
                    role: node.role,
                    username: node.username?.trim() || "ubuntu",
                })),
            };

            const formData = new FormData();
            formData.append(
                "data",
                new Blob([JSON.stringify(payload)], {
                    type: "application/json",
                })
            );
            formData.append("adminConfFile", adminConfFile);

            await api.post("/clusters/import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            showSnackbar("Import cluster thành công", "success");
            handleCloseImportDialog();
            fetchClusters();
        } catch (error) {
            console.error(error);
            showSnackbar(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Import cluster thất bại",
                "error"
            );
        } finally {
            setSubmittingImport(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card elevation={3}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Cluster Management
                            </Typography>

                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setImportOpen(true)}
                        >
                            Import Cluster
                        </Button>
                    </Stack>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={80}></TableCell>
                                    <TableCell>
                                        <strong>Cluster Name</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Created At</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Updated At</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Total Nodes</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Owner</strong>
                                    </TableCell>
                                    <TableCell align="center">
                                        <strong>Action</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : clusters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Chưa có cluster nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    clusters.map((cluster) => {
                                        const open = expandedClusterId === cluster.id;

                                        return (
                                            <React.Fragment key={cluster.id}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                setExpandedClusterId((prev) =>
                                                                    prev === cluster.id ? null : cluster.id
                                                                )
                                                            }
                                                        >
                                                            {open ? <ExpandLess /> : <ExpandMore />}
                                                        </IconButton>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Typography fontWeight={600}>
                                                            {cluster.name}
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatDateTime(cluster.createdAt)}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatDateTime(cluster.updatedAt)}
                                                    </TableCell>

                                                    <TableCell>{cluster.totalNodes ?? 0}</TableCell>
                                                    <TableCell>{cluster.userOwner ? cluster.userOwner.username : null}</TableCell>

                                                    <TableCell align="center">
                                                        <IconButton
                                                            color="error"
                                                            onClick={async () => {
                                                                if (await confirm("Bạn có chắc muốn xóa cluster này? Toàn bộ node thuộc cluster cũng sẽ bị xóa.")) {
                                                                    handleDeleteCluster(cluster.id);
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>

                                                        {cluster.userOwner === null && (
                                                            <IconButton
                                                                color="info"
                                                                onClick={() => setOpenRegister(true)}
                                                            >
                                                                <PersonAddIcon />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                <ClusterNodeCollapse open={open} cluster={cluster} />
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <ClusterImportDialog
                open={importOpen}
                submitting={submittingImport}
                clusterName={clusterName}
                setClusterName={setClusterName}
                nodes={nodes}
                onNodeChange={handleNodeChange}
                onAddNode={handleAddNode}
                onRemoveNode={handleRemoveNode}
                adminConfFile={adminConfFile}
                setAdminConfFile={setAdminConfFile}
                onClose={handleCloseImportDialog}
                onSubmit={handleImport}
            />
            <RegisterDialog open={openRegister} onOpenChange={setOpenRegister} />
            {ConfirmComponent}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={handleCloseSnackbar}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}