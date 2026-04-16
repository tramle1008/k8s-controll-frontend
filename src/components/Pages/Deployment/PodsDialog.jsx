import {
    Dialog,
    DialogTitle,
    DialogContent
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArticleIcon from "@mui/icons-material/Article";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import LogsDialog from "../Pods/LogsDialog";
import useConfirm from "../../../store/reducers/slices/useConfirm";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';
export default function PodsDialog({
    open,
    onClose,
    pods,
    deploymentName,
    namespace,
    refreshPods
}) {
    const [openLogsDialog, setOpenLogsDialog] = useState(false);
    const [selectedPod, setSelectedPod] = useState(null);
    const { confirm, ConfirmComponent } = useConfirm();
    const handleViewLogs = (pod) => {

        setSelectedPod(pod);

        setOpenLogsDialog(true);

    };

    const handleDeletePod = async (namespace, podName) => {


        try {
            const response = await fetch(
                `${BACKEND_URL}/api/pods/${namespace}/${podName}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            enqueueSnackbar(
                "Xóa pod thành công",
                {
                    variant: 'success',
                    autoHideDuration: 1000
                }
            );

            await refreshPods();

        } catch (error) {

            enqueueSnackbar(
                `Xóa Pod thất bại: ${error.message}`,
                {
                    variant: 'error',
                    autoHideDuration: 1000
                }
            );

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
            flex: 1,
            minWidth: 150,
            sortable: false,
            cellClassName: "actions-cell",
            renderCell: (params) => (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ width: "100%" }}
                >
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
                            onClick={async () => {
                                const ok = await confirm(
                                    `Bạn có chắc muốn xóa Pod ${params.row.name}?`
                                );
                                if (ok) handleDeletePod(namespace, params.row.name);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            sx={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            onClick={refreshPods}
                        >
                            <RefreshCwIcon size={18} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];
    return (
        <div>

            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Deloyment {deploymentName}
                </DialogTitle>

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
                                alignItems: "center !important",
                                justifyContent: "center !important",
                                paddingTop: "0px !important",
                                paddingBottom: "0px !important"
                            }
                        }}
                    />

                </DialogContent>

            </Dialog>
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