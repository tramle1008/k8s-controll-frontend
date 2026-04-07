import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createNamespaceYaml,
    deleteNamespace,
    fetchNamespaces
} from "../../../store/reducers/slices/namespaceSlice";

import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import { DownloadIcon } from "lucide-react";
import DeleteIcon from '@mui/icons-material/Delete';
import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import { useSnackbar } from "notistack";
import CreateNamespaceDialog from "./CreateNameSpaceDialog";
import useConfirm from "../../../store/reducers/slices/useConfirm";


const systemNamespaces = [
    "default",
    "kube-system",
    "kube-public",
    "kube-node-lease"
];

const NameSpacePage = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [namespace, setNamespace] = useState("all");
    const [search, setSearch] = useState("");
    const [openCreate, setOpenCreate] = useState(false);

    const fileInputRef = useRef(null);
    const { confirm, ConfirmComponent } = useConfirm();
    const { namespaces, loading, error } = useSelector(
        (state) => state.namespaces
    );

    useEffect(() => {
        dispatch(fetchNamespaces());
    }, [dispatch]);

    /* ---------------- DELETE ---------------- */

    const handleDeleteNamespace = async (name) => {

        try {

            await dispatch(deleteNamespace(name)).unwrap();

            enqueueSnackbar(`Đã xóa namespace ${name}`, {
                variant: "success",
                autoHideDuration: 2000
            });

            dispatch(fetchNamespaces());

        } catch (err) {

            enqueueSnackbar(err || "Xóa namespace thất bại", {
                variant: "error"
            });

        }
    };

    /* ---------------- IMPORT YAML ---------------- */

    const handleImportYaml = async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        try {

            await dispatch(createNamespaceYaml(file)).unwrap();

            enqueueSnackbar("Import namespace YAML thành công", {
                variant: "success",
                autoHideDuration: 2000
            });

            dispatch(fetchNamespaces());

        } catch (err) {

            enqueueSnackbar(err || "Import YAML thất bại", {
                variant: "error"
            });

        }

        e.target.value = null;
    };

    const handleGetYaml = (name) => {
        console.log("Download YAML:", name);
    };
    /* ---------------- SEARCH ---------------- */
    const filteredNamespaces = namespaces.filter((ns) => {

        const name = ns?.name || "";

        const matchSearch =
            name.toLowerCase().includes(search.toLowerCase());

        const matchNamespace =
            namespace === "all" || name === namespace;

        return matchSearch && matchNamespace;

    });

    /* ---------------- ROWS ---------------- */
    const rows = namespaces.map((ns) => ({
        id: ns.name,
        name: ns.name,
        status: ns.status,
        creationTimestamp: ns.creationTimestamp
    }));

    /* ---------------- COLUMNS ---------------- */

    const columns = [
        {
            field: "name",
            headerName: "Namespace",
            flex: 2,
            minWidth: 180
        },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === "Active" ? "success" : "error"}
                    size="small"
                />
            )
        },
        {
            field: "creationTimestamp",
            headerName: "Created",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {

                const date = new Date(params.value);

                return date.toLocaleString();

            }
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            minWidth: 160,
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {

                const isSystem = systemNamespaces.includes(params.row.name);

                return (
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ width: "100%", height: "100%" }}
                    >

                        <Tooltip title={isSystem ? "Namespace hệ thống" : "Xóa Namespace"}>
                            <span>
                                <IconButton
                                    color="error"
                                    size="small"
                                    disabled={isSystem}
                                    onClick={async () => {

                                        if (await confirm(`Bạn có chắc muốn xóa Namespace ${params.row.name}?`)) {
                                            handleDeleteNamespace(params.row.name);
                                        }

                                    }}
                                >
                                    <DeleteIcon size={16} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Tải YAML">
                            <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleGetYaml(params.row.name)}
                            >
                                <DownloadIcon size={16} />
                            </IconButton>
                        </Tooltip>

                    </Stack>
                );
            }
        }
    ];

    /* ---------------- UI ---------------- */

    return (
        <div className="space-y-5 min-h-[70vh]">

            <ResourcePage
                title="Danh sách Namespace Kubernetes"
                loading={loading}
                error={error}
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchNamespaces())}
                        onCreate={() => setOpenCreate(true)}
                        onImport={() => fileInputRef.current.click()}
                    />
                }
            >

                <ResourceTable
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.name}
                />

            </ResourcePage>

            <input
                type="file"
                accept=".yaml,.yml"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportYaml}
            />
            <CreateNamespaceDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
            />
            {ConfirmComponent}
        </div>
    );
};

export default NameSpacePage;