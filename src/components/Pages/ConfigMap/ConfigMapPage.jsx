import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import CreateConfigMapDialog from "./CreateConfigMapDialog";
import UploadConfigMapFileDialog from "./UploadConfigMapFileDialog";

import { fetchConfigMaps } from "../../../store/reducers/slices/configMapSlice";
import useConfirm from "../../../store/reducers/slices/useConfirm";

import { DownloadIcon, FileText } from "lucide-react";

const BACKEND_URL =
    import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

const ConfigMapPage = () => {
    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");

    const [openCreate, setOpenCreate] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { confirm, ConfirmComponent } = useConfirm();

    const { items: configMaps = [], loading, error } = useSelector(
        (state) => state.configmaps
    );

    useEffect(() => {
        dispatch(fetchConfigMaps());
    }, [dispatch]);

    const systemNamespaces = [
        "kube-system",
        "kube-public",
        "kube-node-lease"
    ];

    const filteredConfigMaps = configMaps.filter((cm) => {
        const matchSearch =
            cm.name?.toLowerCase().includes(search.toLowerCase()) ||
            cm.namespace?.toLowerCase().includes(search.toLowerCase());

        const matchNamespace =
            namespace === "all" || cm.namespace === namespace;

        return matchSearch && matchNamespace;
    });

    const handleDeleteConfigMap = async (namespace, name) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/configmaps/${namespace}/${name}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            enqueueSnackbar(`Đã xóa ConfigMap ${name}`, {
                variant: "success",
                autoHideDuration: 1000
            });

            dispatch(fetchConfigMaps());
        } catch (error) {
            enqueueSnackbar(`Xóa ConfigMap thất bại: ${error.message}`, {
                variant: "error",
                autoHideDuration: 1000
            });
        }
    };

    const handleGetYaml = async (namespace, name) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/configmaps/${namespace}/${name}/raw`
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

            window.URL.revokeObjectURL(url);

            enqueueSnackbar("Tải YAML thành công", {
                variant: "success",
                autoHideDuration: 1000
            });
        } catch (error) {
            enqueueSnackbar(`Tải YAML thất bại: ${error.message}`, {
                variant: "error",
                autoHideDuration: 1000
            });
        }
    };

    const columns = [
        {
            field: "namespace",
            headerName: "Namespace",
            flex: 1,
            minWidth: 150
        },
        {
            field: "name",
            headerName: "Tên ConfigMap",
            flex: 1.5,
            minWidth: 180
        },
        {
            field: "dataCount",
            headerName: "Số keys",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const count =
                    params.row.dataCount ??
                    (params.row.data ? Object.keys(params.row.data).length : 0);

                return (
                    <Chip
                        label={count}
                        color={count > 0 ? "primary" : "default"}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: "createdAt",
            headerName: "Tuổi",
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) => {
                return params.row.age || params.row.creationTimestamp || "-";
            }
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            minWidth: 180,
            sortable: false,
            headerAlign: "center",
            align: "center",
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
                        <Tooltip
                            title={
                                isSystem
                                    ? "ConfigMap hệ thống không thể xóa"
                                    : "Xóa ConfigMap"
                            }
                        >
                            <span>
                                <IconButton
                                    color="error"
                                    size="small"
                                    disabled={isSystem}
                                    onClick={async () => {
                                        if (
                                            await confirm(
                                                `Bạn có chắc muốn xóa ConfigMap ${params.row.name}?`
                                            )
                                        ) {
                                            handleDeleteConfigMap(
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
                                onClick={() =>
                                    handleGetYaml(
                                        params.row.namespace,
                                        params.row.name
                                    )
                                }
                            >
                                <DownloadIcon size={18} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            }
        }
    ];

    return (
        <div className="space-y-5 min-h-[70vh]">
            <ResourcePage
                title="Danh sách ConfigMaps Kubernetes"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchConfigMaps())}
                        onCreate={() => setOpenCreate(true)}
                        onImport={() => setOpenUpload(true)}
                    />
                }
            >
                <ResourceTable
                    rows={filteredConfigMaps}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                    loading={loading}
                />
            </ResourcePage>

            <CreateConfigMapDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={() => dispatch(fetchConfigMaps())}
            />

            <UploadConfigMapFileDialog
                open={openUpload}
                onOpenChange={setOpenUpload}
                onUploaded={() => dispatch(fetchConfigMaps())}
            />

            {ConfirmComponent}
        </div>
    );
};

export default ConfigMapPage;