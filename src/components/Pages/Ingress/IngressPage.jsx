import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DownloadIcon } from "lucide-react";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import CreateIngressDialog from "./CreateIngressDialog";
import useConfirm from "../../../store/reducers/slices/useConfirm";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

const IngressPage = () => {
    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const [ingresses, setIngresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { confirm, ConfirmComponent } = useConfirm();

    const fetchIngresses = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/ingress`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setIngresses(data);
        } catch (err) {
            enqueueSnackbar(`Lấy danh sách Ingress thất bại: ${err.message}`, { variant: "error", autoHideDuration: 1000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngresses();
    }, []);

    const filteredIngresses = ingresses.filter((ing) => {
        const matchSearch =
            ing.name?.toLowerCase().includes(search.toLowerCase()) ||
            ing.namespace?.toLowerCase().includes(search.toLowerCase());
        const matchNamespace = namespace === "all" || ing.namespace === namespace;
        return matchSearch && matchNamespace;
    });

    const handleDeleteIngress = async (namespace, name) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/ingress/${namespace}/${name}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error(await res.text());
            enqueueSnackbar(`Đã xóa Ingress ${name}`, { variant: "success", autoHideDuration: 1000 });
            fetchIngresses(); // reload lại danh sách
        } catch (err) {
            enqueueSnackbar(`Xóa Ingress thất bại: ${err.message}`, { variant: "error" });
        }
    };

    const handleGetYaml = async (namespace, name) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/ingress/${namespace}/${name}/raw`);
            if (!res.ok) throw new Error(await res.text());
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${name}.yaml`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            enqueueSnackbar("Tải YAML thành công", { variant: "success" });
        } catch (err) {
            enqueueSnackbar(`Tải YAML thất bại: ${err.message}`, { variant: "error" });
        }
    };

    const columns = [
        { field: "namespace", headerName: "Namespace", flex: 1, minWidth: 150 },
        { field: "name", headerName: "Tên Ingress", flex: 1.5, minWidth: 180 },
        {
            field: "hosts",
            headerName: "Hosts",
            flex: 2,
            minWidth: 200,
            renderCell: (params) => params.row.hosts?.join(", ") || "-"
        },
        {
            field: "addresses",
            headerName: "Addresses",
            flex: 2,
            minWidth: 200,
            renderCell: (params) => params.row.addresses?.join(", ") || "-"
        },
        {
            field: "age",
            headerName: "Tuổi",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => params.row.age || "-"
        },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            minWidth: 180,
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                    <Tooltip title="Xóa Ingress">
                        <IconButton
                            color="error"
                            size="small"
                            onClick={async () => {
                                if (await confirm(`Bạn có chắc muốn xóa Ingress ${params.row.name}?`)) {
                                    handleDeleteIngress(params.row.namespace, params.row.name);
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
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
                </Stack>
            )
        }
    ];

    return (
        <div className="space-y-5 min-h-[70vh]">
            <ResourcePage
                title="Danh sách Ingress Kubernetes"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={fetchIngresses}
                        onCreate={() => setOpenCreate(true)}
                    />
                }
            >
                <ResourceTable
                    rows={filteredIngresses}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                    loading={loading}
                />
            </ResourcePage>


            <CreateIngressDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={fetchIngresses} // reload list khi tạo xong
            />

            {ConfirmComponent}
        </div>
    );
};

export default IngressPage;