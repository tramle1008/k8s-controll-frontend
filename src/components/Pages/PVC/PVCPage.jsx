import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DownloadIcon, FileUp } from "lucide-react";

import useConfirm from "../../../store/reducers/slices/useConfirm";
import { deletePVC, fetchPVCs } from "../../../store/reducers/slices/pvcSlice";
import PVCUpload from "./PVCUpload";
import PVCCreateDialog from "./PVCCreateDialog";

const PVCPage = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { confirm, ConfirmComponent } = useConfirm();

    const fileInputRef = useRef(null);

    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);

    const { items: pvcs, loading } = useSelector((state) => state.pvcs);

    useEffect(() => {
        dispatch(fetchPVCs());
    }, [dispatch]);

    const systemNamespaces = [
        "kube-system",
        "kube-public",
        "kube-node-lease"
    ];

    const filteredPVCs = useMemo(() => {
        return pvcs.filter((pvc) => {
            const matchSearch =
                pvc.name?.toLowerCase().includes(search.toLowerCase());

            const matchNamespace =
                namespace === "all" || pvc.namespace === namespace;

            return matchSearch && matchNamespace;
        });
    }, [pvcs, search, namespace]);

    const handleDeletePVC = async (row) => {
        try {
            await dispatch(
                deletePVC({
                    namespace: row.namespace,
                    name: row.name
                })
            ).unwrap();

            enqueueSnackbar(`Đã xóa PVC ${row.name}`, {
                variant: "success",
                autoHideDuration: 1000
            });
        } catch (err) {
            enqueueSnackbar(`Xóa PVC thất bại: ${err}`, {
                variant: "error",
                autoHideDuration: 1200
            });
        }
    };

    const handleGetYaml = async (namespace, name) => {
        try {
            const res = await fetch(`/api/pvcs/${namespace}/${name}/raw`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Download failed");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${name}.yml`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            enqueueSnackbar("Tải YAML thành công", {
                variant: "success",
                autoHideDuration: 1000
            });
        } catch (err) {
            enqueueSnackbar(`Tải YAML thất bại: ${err.message}`, {
                variant: "error",
                autoHideDuration: 1200
            });
        }
    };

    const columns = [
        {
            field: "namespace",
            headerName: "Namespace",
            flex: 1,
            minWidth: 140
        },
        {
            field: "name",
            headerName: "Tên PVC",
            flex: 1.5,
            minWidth: 170
        },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                const value = params.value || "Unknown";
                const color =
                    value === "Bound"
                        ? "success"
                        : value === "Pending"
                            ? "warning"
                            : "default";

                return (
                    <Chip
                        label={value}
                        color={color}
                        size="small"
                        variant={value === "Bound" ? "filled" : "outlined"}
                    />
                );
            }
        },
        {
            field: "volume",
            headerName: "Volume",
            flex: 1.5,
            minWidth: 170
        },
        {
            field: "capacity",
            headerName: "Capacity",
            flex: 1,
            minWidth: 100
        },
        {
            field: "accessModes",
            headerName: "Access Modes",
            flex: 1.2,
            minWidth: 130
        },
        {
            field: "storageClass",
            headerName: "Storage Class",
            flex: 1.2,
            minWidth: 130
        },
        {
            field: "age",
            headerName: "Age",
            flex: 0.8,
            minWidth: 80
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
                const row = params.row;
                const isSystem = systemNamespaces.includes(row.namespace);

                return (
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ width: "100%", height: "100%" }}
                    >
                        <Tooltip
                            title={
                                isSystem
                                    ? "PVC hệ thống không thể xóa"
                                    : "Xóa PVC"
                            }
                        >
                            <span>
                                <IconButton
                                    color="error"
                                    size="small"
                                    disabled={isSystem}
                                    onClick={async () => {
                                        const ok = await confirm(
                                            `Bạn có chắc muốn xóa PVC ${row.name}?`
                                        );

                                        if (ok) {
                                            handleDeletePVC(row);
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
                                    handleGetYaml(row.namespace, row.name)
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
                title="Danh sách PersistentVolumeClaims Kubernetes"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchPVCs())}
                        onCreate={() => setOpenCreate(true)}
                        onImport={() => setOpenUpload(true)}
                    />
                }
            >
                <ResourceTable
                    rows={filteredPVCs}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                />
            </ResourcePage>

            <PVCCreateDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={() => dispatch(fetchPVCs())}
            />

            <PVCUpload
                open={openUpload}
                onOpenChange={setOpenUpload}
                onUploaded={() => dispatch(fetchPVCs())}
            />

            {ConfirmComponent}
        </div>
    );
};

export default PVCPage;