import { useEffect, useState } from "react";
import ResourcePage from "../resource/ResourcePage";
import ResourceToolbar from "../resource/ResourceToolbar";
import ResourceTable from "../resource/ResourceTable";
import { Chip, Stack } from "@mui/material";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import CreateHpaDialog from "./CreateHpaDialog";
import { useRef } from "react";
import { coreApi } from "../../../api/api";
import { ScrollText } from "lucide-react";
import DescribeHpaDialog from "./DescribeHpaDialog";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';
const HpaPage = () => {

    const [hpas, setHpas] = useState([]);
    const [search, setSearch] = useState("");
    const [namespace, setNamespace] = useState("all");
    const { enqueueSnackbar } = useSnackbar();
    const [openCreate, setOpenCreate] = useState(false);
    const fileInputRef = useRef(null);
    const [describeOpen, setDescribeOpen] = useState(false);
    const [describeData, setDescribeData] = useState(null);
    const fetchHpas = async () => {

        const res = await fetch("/api/hpa");

        const data = await res.json();

        setHpas(data);

    };
    const handleImportYaml = async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {

            await coreApi.post("/hpa/yaml", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            enqueueSnackbar(
                "Import YAML thành công",
                {
                    variant: "success",
                    autoHideDuration: 1000
                }
            );

            fetchHpas(); // refresh table

        } catch (err) {

            console.error(err);

            enqueueSnackbar(
                "Import YAML thất bại",
                {
                    variant: "error",
                    autoHideDuration: 1000
                }
            );

        } finally {

            event.target.value = null; // reset input

        }

    };
    useEffect(() => {

        fetchHpas();

    }, []);
    const handleDeleteHpa = async (namespace, name) => {

        try {

            const res = await fetch(
                `/api/hpa/${namespace}/${name}`,
                {
                    method: "DELETE"
                }
            );

            if (!res.ok) {

                const text = await res.text();
                throw new Error(text);

            }

            enqueueSnackbar("Xóa HPA thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            fetchHpas();

        } catch (err) {

            enqueueSnackbar(
                `Xóa HPA thất bại: ${err.message}`,
                {
                    variant: "error",
                    autoHideDuration: 1000
                }
            );

        }

    };
    const filteredHpas = hpas.filter((hpa) => {

        const matchSearch =
            hpa.name.toLowerCase().includes(search.toLowerCase());

        const matchNamespace =
            namespace === "all" || hpa.namespace === namespace;

        return matchSearch && matchNamespace;

    });
    const handleDescribeHpa = async (namespace, name) => {

        try {

            const res = await fetch(
                `${BACKEND_URL}/api/hpa/${namespace}/${name}/describe`
            );

            const json = await res.json();

            setDescribeData(json);
            setDescribeOpen(true);

        } catch (err) {

            console.error("Describe HPA error:", err);

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
            headerName: "HPA Name",
            flex: 2
        },
        {
            field: "reference",
            headerName: "Reference",
            flex: 2
        },
        {
            field: "target",
            headerName: "Target",
            flex: 2,
            renderCell: (params) => {

                const metrics = params.value
                    .replace(/memory/g, "|memory")
                    .split("|");

                return (
                    <Stack direction="row" spacing={1}>
                        {metrics.map((m, index) => (
                            <Chip
                                key={index}
                                label={m}
                                size="small"
                                variant="outlined"
                                color="success"
                            />
                        ))}
                    </Stack>
                );
            }
        },
        {
            field: "minPods",
            headerName: "Min Pods",
            flex: 1
        },
        {
            field: "maxPods",
            headerName: "Max Pods",
            flex: 1
        },
        {
            field: "replicas",
            headerName: "Replicas",
            flex: 1,
            renderCell: (params) => {

                const [current, desired] = params.value.split("/");

                const color =
                    current === desired
                        ? "success"
                        : Number(current) < Number(desired)
                            ? "warning"
                            : "info";

                return (
                    <Chip
                        label={params.value}
                        color={color}
                        size="small"
                    />
                );
            }
        },
        {
            field: "age",
            headerName: "Age",
            flex: 1
        }, {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (

                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                    sx={{ width: "100%", height: "100%" }}
                >

                    <Tooltip title="Xóa HPA">
                        <IconButton
                            color="error"
                            size="small"
                            onClick={() => {

                                if (window.confirm(`Bạn có chắc muốn xóa HPA ${params.row.name}?`)) {

                                    handleDeleteHpa(
                                        params.row.namespace,
                                        params.row.name
                                    );

                                }

                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem Describe">
                        <IconButton
                            color="orange"
                            size="small"
                            onClick={() => {
                                handleDescribeHpa(
                                    params.row.namespace,
                                    params.row.name
                                );
                            }}
                        >
                            <ScrollText />
                        </IconButton>
                    </Tooltip>

                </Stack>

            )
        }
    ];

    return (
        <div className="space-y-5 min-h-[70vh]">

            <ResourcePage
                title="Horizontal Pod Autoscalers"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={fetchHpas}
                        onCreate={() => setOpenCreate(true)}
                        onImport={() => fileInputRef.current.click()}
                    />
                }
            >

                <ResourceTable
                    rows={filteredHpas}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                />

            </ResourcePage>
            <input
                type="file"
                accept=".yaml,.yml"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportYaml}
            />
            <CreateHpaDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={fetchHpas}
            />
            <DescribeHpaDialog
                open={describeOpen}
                onClose={() => setDescribeOpen(false)}
                data={describeData}
            />

        </div>
    );

};

export default HpaPage;