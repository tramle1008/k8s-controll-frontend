import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DownloadIcon, FileUp, KeyRound, Plus } from "lucide-react";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import CreateSecretDialog from "./CreateSecretDialog";
import UploadSecretFileDialog from "./UploadSecretFileDialog";

import useConfirm from "../../../store/reducers/slices/useConfirm";
import {
    fetchSecrets,
    deleteSecret
} from "../../../store/reducers/slices/secretSlice";

const SecretPage = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { confirm, ConfirmComponent } = useConfirm();

    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);

    const { items: secrets = [], loading } = useSelector(
        (state) => state.secrets
    );

    useEffect(() => {
        dispatch(fetchSecrets());
    }, [dispatch]);

    const systemNamespaces = [
        "kube-system",
        "kube-public",
        "kube-node-lease"
    ];

    const filteredSecrets = secrets.filter((secret) => {
        const matchSearch = secret.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchNamespace =
            namespace === "all" || secret.namespace === namespace;

        return matchSearch && matchNamespace;
    });

    const handleDeleteSecret = async (namespace, name) => {
        try {
            await dispatch(deleteSecret({ namespace, name })).unwrap();

            enqueueSnackbar(`Đã xóa Secret ${name}`, {
                variant: "success",
                autoHideDuration: 1000
            });
        } catch (error) {
            enqueueSnackbar(
                typeof error === "string"
                    ? error
                    : `Xóa Secret thất bại`,
                {
                    variant: "error",
                    autoHideDuration: 1200
                }
            );
        }
    };

    const handleGetYaml = async (namespace, name) => {
        try {
            const response = await fetch(
                `/api/secrets/${namespace}/${name}/raw`
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Download failed");
            }

            const blob = await response.blob();
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
        } catch (error) {
            enqueueSnackbar(
                `Tải thất bại: ${error.message}`,
                {
                    variant: "error",
                    autoHideDuration: 1200
                }
            );
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
            headerName: "Tên Secret",
            flex: 2,
            minWidth: 180
        },
        {
            field: "type",
            headerName: "Type",
            flex: 1.4,
            minWidth: 180,
            renderCell: (params) => (
                <Chip
                    label={params.value || "Opaque"}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )
        },
        {
            field: "dataCount",
            headerName: "Data Count",
            flex: 1,
            minWidth: 100
        },
        {
            field: "age",
            headerName: "Age",
            flex: 1,
            minWidth: 90
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            minWidth: 220,
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
                                    ? "Secret hệ thống không thể xóa"
                                    : "Xóa Secret"
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
                                                `Bạn có chắc muốn xóa Secret ${params.row.name}?`
                                            )
                                        ) {
                                            handleDeleteSecret(
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
                title="Danh sách Secrets Kubernetes"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchSecrets())}
                        onCreate={() => setOpenCreate(true)}
                        onImport={() => setOpenUpload(true)}
                    />
                }
            >
                <ResourceTable
                    rows={filteredSecrets}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                    loading={loading}
                />
            </ResourcePage>

            <CreateSecretDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={() => dispatch(fetchSecrets())}
            />

            <UploadSecretFileDialog
                open={openUpload}
                onOpenChange={setOpenUpload}
                onUploaded={() => dispatch(fetchSecrets())}
            />

            {ConfirmComponent}
        </div>
    );
};

export default SecretPage;