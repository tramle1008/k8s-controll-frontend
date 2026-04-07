
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";

import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { DownloadIcon, Box, PackagePlus } from "lucide-react";
import { fetchStatefulsets } from "../../../store/reducers/slices/statefulsetSlice";
import CreateDeploymentDialog from "../Deployment/CreateDeploymentDialog";
import CreateStatefulSetDialog from "./CreateStatefulSetDialog";
import PodsDialog from "../Deployment/PodsDialog";
import StatefulSetPodsDialog from "./StatefulSetPodsDialog";





const BACKEND_URL =
    import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

const StatefulsetPage = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { statefulsets } = useSelector((state) => state.statefulsets);

    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const [openCreate, setOpenCreate] = useState(false);
    const [pods, setPods] = useState([]);
    const [selected, setSelected] = useState(null);

    const [openPodsDialog, setOpenPodsDialog] = useState(false);


    const [replicas, setReplicas] = useState(1);

    useEffect(() => {
        dispatch(fetchStatefulsets());
    }, [dispatch]);

    const filtered = statefulsets.filter((s) => {

        const matchSearch =
            s.name.toLowerCase().includes(search.toLowerCase());

        const matchNamespace =
            namespace === "all" || s.namespace === namespace;

        return matchSearch && matchNamespace;

    });

    const handleDelete = async (namespace, name) => {

        try {

            const res = await fetch(
                `${BACKEND_URL}/api/statefulsets/${namespace}/${name}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            enqueueSnackbar("Xóa StatefulSet thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            dispatch(fetchStatefulsets());

        } catch (err) {

            enqueueSnackbar(`Xóa thất bại: ${err.message}`, {
                variant: "error",
                autoHideDuration: 1000
            });

        }
    };

    const openPods = async (row) => {
        setSelected(row);

        const res = await fetch(
            `/api/statefulsets/${row.namespace}/${row.name}/pods`
        );
        const data = await res.json();
        setPods(data);
        console.log(data);
        setOpenPodsDialog(true);

    };

    const refreshPods = async () => {

        if (!selected) return;

        const res = await fetch(
            `/api/statefulsets/${selected.namespace}/${selected.name}/pods`
        );

        const data = await res.json();

        setPods(data);

    };

    const handleGetYaml = async (namespace, name) => {

        const res = await fetch(
            `/api/statefulsets/${namespace}/${name}/raw`
        );

        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${name}.yaml`;
        link.click();

    };

    const columns = [

        {
            field: "namespace",
            headerName: "Namespace",
            flex: 1
        },

        {
            field: "name",
            headerName: "Tên StatefulSet",
            flex: 2
        },

        {
            field: "ready",
            headerName: "Ready",
            flex: 1,
            renderCell: (params) => {

                const ready = params.row.readyReplicas ?? 0;
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
            field: "replicas",
            headerName: "Replicas",
            flex: 1
        },

        {
            field: "serviceName",
            headerName: "Service",
            flex: 1
        },

        {
            field: "actions",
            headerName: "Hành động",
            flex: 1.5,
            sortable: false,
            renderCell: (params) => (

                <Stack direction="row" spacing={1}>

                    <Tooltip title="Delete">
                        <IconButton
                            color="error"
                            size="small"
                            onClick={() =>
                                handleDelete(
                                    params.row.namespace,
                                    params.row.name
                                )
                            }
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Tải file YAML">
                        <IconButton
                            size="small"
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

                    <Tooltip title="Xem Pods">
                        <IconButton
                            size="small"
                            onClick={() => openPods(params.row)}
                        >
                            <Box color="#1976d2" size={18} />
                        </IconButton>
                    </Tooltip>







                </Stack>

            )
        }
    ];

    return (
        <div>


            <ResourcePage
                title="Danh sách StatefulSets"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchStatefulsets())}
                        onCreate={() => setOpenCreate(true)}
                    />
                }
            >

                <ResourceTable
                    rows={filtered}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                />

            </ResourcePage>

            <CreateStatefulSetDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={() => dispatch(fetchStatefulsets())}
            />
            <StatefulSetPodsDialog
                open={openPodsDialog}
                onClose={() => setOpenPodsDialog(false)}
                pods={pods}
                statefulsetName={selected?.name}
                namespace={selected?.namespace}
                refreshPods={refreshPods}
            />

        </div>
    );
};

export default StatefulsetPage;
