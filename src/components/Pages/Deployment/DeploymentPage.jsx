import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";
import { Button, Chip, IconButton, Stack, Tooltip } from "@mui/material";

import CreateDeploymentDialog from "./CreateDeploymentDialog";
import { fetchDeployments } from "../../../store/reducers/slices/deploymentSlice";
import { coreApi } from "../../../api/api";
import { Box, Container, ContainerIcon, DownloadIcon, FileText, PackagePlus, ScrollText, TrendingUpIcon } from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import ScaleDialog from "./ScaleDialog";
import PodsDialog from "./PodsDialog";
import useConfirm from "../../../store/reducers/slices/useConfirm";



const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

const DeploymentPage = () => {
    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const dispatch = useDispatch();
    const [pods, setPods] = useState([]);
    const [openPodsDialog, setOpenPodsDialog] = useState(false);
    const [selectedDeployment, setSelectedDeployment] = useState(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { deployments, loading, error } = useSelector(
        (state) => state.deployments
    );
    const [openScaleDialog, setOpenScaleDialog] = useState(false);
    const [replicas, setReplicas] = useState(1);
    const [openCreate, setOpenCreate] = useState(false);
    const { confirm, ConfirmComponent } = useConfirm();
    const fileInputRef = useRef(null);
    useEffect(() => {
        dispatch(fetchDeployments());
    }, [dispatch]);
    const systemNamespaces = [
        "kube-system",
        "kube-public",
        "kube-node-lease"
    ];
    const filteredDeployments = deployments.filter((dep) => {
        const matchSearch =
            dep.name.toLowerCase().includes(search.toLowerCase());
        const matchNamespace =
            namespace === "all" || dep.namespace === namespace;
        return matchSearch && matchNamespace;
    });

    const handleDeleteDeployment = async (namespace, name) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/deployments/${namespace}/${name}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }
            enqueueSnackbar(
                `Đã xóa Deployment ${name}`,
                {
                    variant: "success",
                    autoHideDuration: 1000
                }
            );

        } catch (error) {
            enqueueSnackbar(
                `Xóa Deployment thất bại: ${error.message}`,
                {
                    variant: 'error',
                    autoHideDuration: 1000 // ví dụ 2 giây
                }
            );
        }
    };
    const fetchPods = async (namespace, name) => {

        const res = await fetch(
            `/api/deployments/${namespace}/${name}/pods`
        );

        const data = await res.json();

        setPods(data);

    };
    const refreshPods = async () => {

        if (!selectedDeployment) return;

        await fetchPods(
            selectedDeployment.namespace,
            selectedDeployment.name
        );

    };

    const handleGetYaml = async (namespace, name) => {
        try {

            const response = await fetch(
                `/api/deployments/${namespace}/${name}/raw`
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${name}.yaml`;
            document.body.appendChild(link);
            link.click();

            link.remove();

            enqueueSnackbar(
                "Tải YAML thành công",
                {
                    variant: "success",
                    autoHideDuration: 1000
                }
            );

        } catch (error) {

            enqueueSnackbar(
                `Tải thất bại: ${error.message}`,
                {
                    variant: "error",
                    autoHideDuration: 1000
                }
            );

        }
    };

    const handleCreateDeployment = async (payload) => {
        try {
            console.log("Payload gửi lên backend:", JSON.stringify(payload));

            const res = await fetch(`${BACKEND_URL}/api/deployments/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }


            enqueueSnackbar("Tạo Deployment thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            dispatch(fetchDeployments());

        } catch (err) {
            enqueueSnackbar("Tạo Deployment thất bại: " + err.message, {
                variant: "error",
                autoHideDuration: 1000
            });
        }
    };

    const handleImportYaml = async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {

            await coreApi.post("/deployments/yaml", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            enqueueSnackbar("Import YAML thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            dispatch(fetchDeployments());

        } catch (err) {

            console.error(err);

            enqueueSnackbar("Import YAML thất bại", {
                variant: "error",
                autoHideDuration: 1000
            });

        } finally {

            event.target.value = null; // reset input

        }
    };
    const openPods = async (row) => {

        setSelectedDeployment(row);

        const res = await fetch(
            `/api/deployments/${row.namespace}/${row.name}/pods`
        );

        const data = await res.json();

        setPods(data);

        setOpenPodsDialog(true);
    };
    const handleOpenScaleDialog = (row) => {

        setSelectedDeployment(row);

        setReplicas(row.replicas);

        setOpenScaleDialog(true);

    };

    const handleScale = async () => {
        if (replicas >= 0) {
            try {
                await fetch(
                    `/api/deployments/${selectedDeployment.namespace}/${selectedDeployment.name}/scale`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            replicas: replicas
                        })
                    }
                );

                enqueueSnackbar("Scale thành công", {
                    variant: "success",
                    autoHideDuration: 1000
                });

                setOpenScaleDialog(false);
            } catch (err) {
                console.error(err);

                enqueueSnackbar("Scale thất bại ", {
                    variant: "error",
                    autoHideDuration: 1000
                });
            }
        }
        else {
            enqueueSnackbar("Số Pods không hợp lệ ", {
                variant: "warring",
                autoHideDuration: 1000
            });
        }



    };

    const columns = [
        {
            field: 'namespace',
            headerName: 'Namespace',
            flex: 1,
            minWidth: 140
        },
        {
            field: 'name',
            headerName: 'Tên Deployment',
            flex: 2,
            minWidth: 160
        },
        {
            field: 'ready',
            headerName: 'Ready',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const ready = params.row.availableReplicas ?? 0;
                const total = params.row.replicas ?? 0;

                return (
                    <Chip
                        label={`${ready}/${total}`}
                        color={ready === total ? "success" : "warning"}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'replicas',
            headerName: 'Replicas',
            flex: 1,
            minWidth: 50
        },
        {
            field: 'availableReplicas',
            headerName: 'Available',
            flex: 1,
            minWidth: 80
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            flex: 1,
            minWidth: 110,
            renderCell: (params) => {
                const color = params.value === "True" ? "success" : "error";

                return (
                    <Chip
                        label={params.value === "True" ? "Active" : "Unavailable"}
                        color={color}
                        size="small"
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            flex: 1,
            minWidth: 230,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {

                const isSystem = systemNamespaces.includes(params.row.namespace);

                return (
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ width: "100%", height: "100%" }}
                    >

                        <Tooltip title={isSystem ? "Deployment hệ thống không thể xóa" : "Xóa Deployment"}>
                            <span>
                                <IconButton
                                    color="error"
                                    size="small"
                                    disabled={isSystem}
                                    onClick={async () => {

                                        if (await confirm(`Bạn có chắc muốn xóa Deployment ${params.row.name}?`)) {
                                            handleDeleteDeployment(
                                                params.row.namespace,
                                                params.row.name
                                            );
                                        }

                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Tải YAML">
                            <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleGetYaml(params.row.namespace, params.row.name)}
                            >
                                <DownloadIcon size={18} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Xem Pods">
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => openPods(params.row)}
                            >
                                <Box color="#1976d2" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Scale Deployment">
                            <IconButton
                                color="#4CAF50"
                                size="small"
                                onClick={() => handleOpenScaleDialog(params.row)}
                            >
                                <PackagePlus fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )
            }
        }
    ];

    return (
        <div className="space-y-5 min-h-[70vh]">
            <ResourcePage
                title="Danh sách Deployments Kubernetes"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchDeployments())}
                        onCreate={() => setOpenCreate(true)}
                        onImport={() => fileInputRef.current.click()}
                    />
                }
            >
                <ResourceTable
                    rows={filteredDeployments}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                />
            </ResourcePage>
            <CreateDeploymentDialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreate={handleCreateDeployment}
            />
            <input
                type="file"
                accept=".yaml,.yml"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportYaml}
            />
            <PodsDialog
                open={openPodsDialog}
                onClose={() => setOpenPodsDialog(false)}
                pods={pods}
                deploymentName={selectedDeployment?.name}
                namespace={selectedDeployment?.namespace}
                refreshPods={refreshPods}
            />
            <ScaleDialog
                open={openScaleDialog}
                onClose={() => setOpenScaleDialog(false)}
                deploymentName={selectedDeployment?.name}
                replicas={replicas}
                setReplicas={setReplicas}
                onScale={handleScale}
            />
            {ConfirmComponent}
        </div>
    );

}

export default DeploymentPage;