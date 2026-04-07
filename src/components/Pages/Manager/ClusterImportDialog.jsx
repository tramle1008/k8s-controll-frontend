import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Add, UploadFile } from "@mui/icons-material";

export default function ClusterImportDialog({
    open,
    submitting,
    clusterName,
    setClusterName,
    nodes,
    onNodeChange,
    onAddNode,
    onRemoveNode,
    adminConfFile,
    setAdminConfFile,
    onClose,
    onSubmit,
}) {
    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Import Cluster</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        label="Tên cluster"
                        value={clusterName}
                        onChange={(e) => setClusterName(e.target.value)}
                        fullWidth
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            File admin.conf
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadFile />}
                            >
                                Chọn file
                                <input
                                    hidden
                                    type="file"
                                    accept=".conf,.yaml,.yml,text/plain"
                                    onChange={(e) =>
                                        setAdminConfFile(e.target.files?.[0] || null)
                                    }
                                />
                            </Button>

                            <Typography variant="body2" color="text.secondary">
                                {adminConfFile ? adminConfFile.name : "Chưa chọn file"}
                            </Typography>
                        </Stack>
                    </Box>

                    <Divider />

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h6">Danh sách node</Typography>
                        <Button startIcon={<Add />} onClick={onAddNode}>
                            Thêm node
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        {nodes.map((node, index) => (
                            <Card key={index} variant="outlined">
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Typography fontWeight={600}>Node {index + 1}</Typography>

                                            {nodes.length > 1 && (
                                                <Button color="error" onClick={() => onRemoveNode(index)}>
                                                    Xóa
                                                </Button>
                                            )}
                                        </Stack>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    label="Tên node"
                                                    value={node.name}
                                                    onChange={(e) =>
                                                        onNodeChange(index, "name", e.target.value)
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    label="IP Address"
                                                    value={node.ipAddress}
                                                    onChange={(e) =>
                                                        onNodeChange(index, "ipAddress", e.target.value)
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    select
                                                    label="Role"
                                                    value={node.role}
                                                    onChange={(e) =>
                                                        onNodeChange(index, "role", e.target.value)
                                                    }
                                                    fullWidth
                                                >
                                                    <MenuItem value="MASTER">MASTER</MenuItem>
                                                    <MenuItem value="WORKER">WORKER</MenuItem>
                                                </TextField>
                                            </Grid>

                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    label="Username"
                                                    value={node.username}
                                                    onChange={(e) =>
                                                        onNodeChange(index, "username", e.target.value)
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>
                    Hủy
                </Button>
                <Button onClick={onSubmit} variant="contained" disabled={submitting}>
                    {submitting ? "Đang import..." : "Import"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}