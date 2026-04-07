import React from "react";
import {
    Box,
    Chip,
    Collapse,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

function getRoleChipColor(role) {
    if (role === "MASTER") return "warning";
    if (role === "WORKER") return "primary";
    return "default";
}

export default function ClusterNodeCollapse({ open, cluster }) {
    return (
        <TableRow>
            <TableCell colSpan={7} sx={{ p: 0, borderBottom: open ? undefined : 0 }}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                            Nodes of {cluster?.name || "-"}
                        </Typography>

                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Node Name</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Role</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>IP Address</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>SSH name</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {!cluster?.nodes || cluster.nodes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                Không có node
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cluster.nodes.map((node) => (
                                            <TableRow key={node.id}>
                                                <TableCell>{node.name || "-"}</TableCell>
                                                <TableCell>
                                                    {node.role ? (
                                                        <Chip
                                                            size="small"
                                                            label={node.role}
                                                            color={getRoleChipColor(node.role)}
                                                        />
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell>{node.ipAddress || "-"}</TableCell>
                                                <TableCell>{node.username || "-"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}