// StatefulSetPodsDialog
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArticleIcon from "@mui/icons-material/Article";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import LogsDialog from "../Pods/LogsDialog";
import useConfirm from "../../../store/reducers/slices/useConfirm";
import ImportDatabaseDialog from "./ImportDatabaseDialog";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

export default function StatefulSetPodsDialog({
    open,
    onClose,
    pods,
    deploymentName,
    namespace,
    refreshPods
}) {
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [importTargetPod, setImportTargetPod] = useState(null);
    const [openLogsDialog, setOpenLogsDialog] = useState(false);
    const [selectedPod, setSelectedPod] = useState(null);
    const { confirm, ConfirmComponent } = useConfirm();

    const handleViewLogs = (pod) => {
        setSelectedPod(pod);
        setOpenLogsDialog(true);
    };

    const handleOpenImport = (pod) => {
        setImportTargetPod(pod);
        setOpenImportDialog(true);
    };

    const handleDeletePod = async (namespace, podName) => {
        try {
            const ok = await confirm(`Bạn có chắc muốn xóa Pod ${podName}?`);
            if (!ok) return;

            const response = await fetch(
                `${BACKEND_URL}/api/pods/${namespace}/${podName}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            enqueueSnackbar("Xóa pod thành công", { variant: "success" });
            await refreshPods();
        } catch (error) {
            enqueueSnackbar(`Xóa Pod thất bại: ${error.message}`, {
                variant: "error"
            });
        }
    };

    const columns = [
        { field: "name", headerName: "Pod Name", flex: 2 },
        { field: "phase", headerName: "Status", flex: 1 },
        { field: "nodeName", headerName: "Node", flex: 1 },
        { field: "restartCount", headerName: "Restarts", flex: 1 },
        { field: "podIP", headerName: "Pod IP", flex: 1 },

        {
            field: "actions",
            headerName: "Actions",
            flex: 1.4,
            minWidth: 230,
            sortable: false,
            cellClassName: "actions-cell",
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center">

                    {/* LOGS BUTTON */}
                    <Tooltip title="Xem Logs">
                        <IconButton
                            size="small"
                            sx={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            onClick={() => handleViewLogs(params.row)}
                        >
                            <ArticleIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {/* DELETE */}
                    <Tooltip title="Xóa Pod">
                        <IconButton
                            size="small"
                            color="error"
                            sx={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            onClick={() =>
                                handleDeletePod(namespace, params.row.name)
                            }
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {/* IMPORT */}
                    <Tooltip title="Import Database (.sql)">
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{
                                height: 30,
                                padding: "0px 10px",
                                minWidth: "85px",
                                textTransform: "none",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            onClick={() => handleOpenImport(params.row)}
                        >
                            + Import
                        </Button>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    return (
        <div>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Statefulset</DialogTitle>

                <DialogContent>
                    <DataGrid
                        autoHeight
                        rows={pods}
                        getRowId={(row) => row.name}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10]}
                        sx={{
                            "& .actions-cell": {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important"
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <ImportDatabaseDialog
                open={openImportDialog}
                onClose={() => setOpenImportDialog(false)}
                podName={importTargetPod?.name}
                namespace={namespace}
            />

            <LogsDialog
                open={openLogsDialog}
                onClose={() => setOpenLogsDialog(false)}
                namespace={namespace}
                podName={selectedPod?.name}
                containers={selectedPod?.containers}
            />

            {ConfirmComponent}
        </div>
    );
}