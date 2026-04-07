import { useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DownloadIcon } from "lucide-react";

import yaml from "js-yaml";

import CreateServiceDialog from "./CreateServiceDialog";

export default function ServicePage() {

    const BACKEND_URL =
        import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

    const { enqueueSnackbar } = useSnackbar();

    const [services, setServices] = useState([]);
    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const [openCreate, setOpenCreate] = useState(false);

    const fileInputRef = useRef(null);
    const systemNamespaces = [
        "kube-system",
        "kube-public",
        "kube-node-lease"
    ];
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {

        try {

            const res = await fetch(`${BACKEND_URL}/api/services`);

            if (!res.ok) throw new Error();

            const data = await res.json();

            setServices(data);

        } catch {

            enqueueSnackbar("Không tải được danh sách Service", {
                variant: "error",
                autoHideDuration: 2000
            });

        }

    };

    const filteredServices = services
        .filter((svc) =>
            namespace === "all" ? true : svc.namespace === namespace
        )
        .filter((svc) =>
            svc.name?.toLowerCase().includes(search.toLowerCase())
        );

    const handleDeleteService = async (namespace, name) => {

        try {

            const res = await fetch(
                `${BACKEND_URL}/api/services/${namespace}/${name}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error();

            enqueueSnackbar("Xóa Service thành công", {
                variant: "success",
                autoHideDuration: 1500
            });

            fetchServices();

        } catch {

            enqueueSnackbar("Xóa Service thất bại", {
                variant: "error"
            });

        }

    };

    const handleGetYaml = async (namespace, name) => {

        try {

            const res = await fetch(
                `${BACKEND_URL}/api/services/${namespace}/${name}`
            );

            const data = await res.json();

            const yamlContent = yaml.dump(data);

            const blob = new Blob([yamlContent]);

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = `${name}.yaml`;

            link.click();

        } catch {

            enqueueSnackbar("Tải YAML thất bại", {
                variant: "error"
            });

        }

    };

    const handleImportYaml = async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        const formData = new FormData();

        formData.append("file", file);

        try {

            const res = await fetch(`${BACKEND_URL}/api/services/yaml`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error();

            enqueueSnackbar("Import YAML thành công", {
                variant: "success"
            });

            fetchServices();

        } catch {

            enqueueSnackbar("Import YAML thất bại", {
                variant: "error"
            });

        }

    };

    const columns = [

        {
            field: "namespace",
            headerName: "Namespace",
            flex: 1
        },

        {
            field: "name",
            headerName: "Service Name",
            flex: 2
        },

        {
            field: "type",
            headerName: "Type",
            flex: 1,
            renderCell: (params) => {
                let color;
                switch (params.value) {
                    case "ClusterIP":
                        color = "primary";
                        break;
                    case "LoadBalancer":
                        color = "warning";
                        break;
                    case "NodePort":
                        color = "success";
                        break;
                    default:
                        color = "default";
                }
                return <Chip label={params.value} size="small" color={color} />;
            }
        }
        ,

        {
            field: "clusterIP",
            headerName: "Cluster IP",
            flex: 1
        },

        {
            field: "ports",
            headerName: "Ports",
            flex: 2,
            renderCell: (params) => {

                const ports = params.value || [];

                return ports
                    .map((p) => {

                        const target =
                            p.targetPort?.value ??
                            p.targetPort?.intVal ??
                            p.targetPort;

                        if (p.nodePort) {
                            return `${p.port}:${target} → ${p.nodePort}`;
                        }

                        return `${p.port}:${target}`;
                    })
                    .join(", ");

            }
        },

        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,

            renderCell: (params) => {
                const isSystem = systemNamespaces.includes(params.row.namespace);
                return (
                    <Stack direction="row" >

                        <Tooltip title={isSystem ? "Service hệ thống không thể xóa" : "Xóa Service"}>
                            <IconButton
                                color="error"
                                disabled={isSystem}
                                onClick={() =>
                                    handleDeleteService(
                                        params.row.namespace,
                                        params.row.name
                                    )
                                }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Download YAML">
                            <IconButton
                                color="success"
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

                    </Stack >
                );
            }
        }

    ];

    return (

        <div className="space-y-5">

            <ResourcePage
                title="Kubernetes Services"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={fetchServices}
                        onImport={() => fileInputRef.current.click()}
                        onCreate={() => setOpenCreate(true)}
                    />
                }
            >

                <ResourceTable
                    rows={filteredServices}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}-${row.name}`}
                />

            </ResourcePage>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportYaml}
            />

            <CreateServiceDialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={fetchServices}
            />

        </div>

    );

}