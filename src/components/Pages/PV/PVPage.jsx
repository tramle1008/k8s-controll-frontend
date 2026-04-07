import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Search, Download } from "lucide-react";

import ResourcePage from "../resource/ResourcePage";
import ResourceTable from "../resource/ResourceTable";

import { coreApi } from "../../../api/api";
import useConfirm from "../../../store/reducers/slices/useConfirm";
import CreatePVDialog from "./CreatePVDialog";
import UploadPVDialog from "./UploadPVDialog";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

const PVPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { confirm, ConfirmComponent } = useConfirm();

    const [search, setSearch] = useState("");
    const [pvs, setPVs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openCreate, setOpenCreate] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);

    const fetchPVs = async () => {
        try {
            setLoading(true);
            const res = await coreApi.get("/pvs");
            setPVs(res.data || []);
        } catch (err) {
            console.error("Fetch PVs failed:", err);
            enqueueSnackbar("Tải danh sách PV thất bại", {
                variant: "error",
                autoHideDuration: 2500,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPVs();
    }, []);

    const handleDeletePV = async (name) => {
        try {
            await coreApi.delete(`/pvs/${name}`);
            enqueueSnackbar(`Đã xóa PV ${name}`, {
                variant: "success",
                autoHideDuration: 2000,
            });
            fetchPVs();
        } catch (err) {
            console.error("Delete PV failed:", err);
            enqueueSnackbar("Xóa PV thất bại", {
                variant: "error",
                autoHideDuration: 2500,
            });
        }
    };

    const handleDownloadYaml = async (name) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/pvs/${name}/raw`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Tải file thất bại");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${name}.yaml`; // dùng .yaml thay vì .yml cho chuẩn hơn
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            enqueueSnackbar("Tải YAML thành công", {
                variant: "success",
                autoHideDuration: 2000,
            });
        } catch (err) {
            console.error("Download YAML failed:", err);
            enqueueSnackbar(`Tải YAML thất bại: ${err.message}`, {
                variant: "error",
                autoHideDuration: 4000,
            });
        }
    };

    const filteredPVs = pvs.filter((pv) =>
        pv.name?.toLowerCase().includes(search.toLowerCase())
    );

    const PVToolbar = ({ search, setSearch, fetchPVs, setOpenCreate, setOpenUpload }) => (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                gap: 2,
            }}
        >
            <TextField
                placeholder="Tìm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                    width: 320,
                    "& .MuiInputBase-root": { height: 40 },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={20} />
                        </InputAdornment>
                    ),
                }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" onClick={fetchPVs}>
                    Refresh
                </Button>
                <Button variant="outlined" onClick={() => setOpenUpload(true)}>
                    Import
                </Button>
                <Button variant="contained" onClick={() => setOpenCreate(true)}>
                    Create
                </Button>
            </Box>
        </Box>
    );

    const columns = [
        { field: "name", headerName: "Tên PV", flex: 1.5, minWidth: 180 },
        { field: "capacity", headerName: "Capacity", flex: 1, minWidth: 100 },
        { field: "accessModes", headerName: "Access Modes", flex: 1.3, minWidth: 150 },
        { field: "reclaimPolicy", headerName: "Reclaim Policy", flex: 1.1, minWidth: 140 },
        {
            field: "storageClass",
            headerName: "Storage Class",
            flex: 1.1,
            minWidth: 140,
            renderCell: ({ value }) => (
                <Chip
                    label={value || "-"}
                    size="small"
                    variant="outlined"
                    color="primary"
                />
            ),
        },
        {
            field: "claim",
            headerName: "Claim",
            flex: 1.2,
            minWidth: 150,
            renderCell: ({ value }) => value || "-",
        },
        {
            field: "status",
            headerName: "Trạng thái",
            flex: 1,
            minWidth: 120,
            renderCell: ({ value = "" }) => {
                let color = "default";
                if (value === "Bound") color = "success";
                else if (value === "Available") color = "info";
                else if (value === "Released") color = "warning";
                else if (value === "Failed") color = "error";

                return (
                    <Chip label={value || "Unknown"} color={color} size="small" />
                );
            },
        },
        { field: "age", headerName: "Age", flex: 0.8, minWidth: 80 },
        {
            field: "actions",
            headerName: "Hành động",
            flex: 1,
            minWidth: 160,
            sortable: false,
            headerAlign: "center",
            align: "center",
            renderCell: ({ row }) => (
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                    sx={{ width: "100%", height: "100%" }}
                >
                    <Tooltip title="Xóa PV">
                        <IconButton
                            color="error"
                            size="small"
                            onClick={async () => {
                                if (await confirm(`Bạn có chắc muốn xóa PV ${row.name}?`)) {
                                    handleDeletePV(row.name);
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
                            onClick={() => handleDownloadYaml(row.name)}
                        >
                            <Download size={18} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    return (
        <div className="space-y-5 min-h-[70vh]">
            <ResourcePage
                title="Danh sách Persistent Volumes"
                toolbar={
                    <PVToolbar
                        search={search}
                        setSearch={setSearch}
                        fetchPVs={fetchPVs}
                        setOpenCreate={setOpenCreate}
                        setOpenUpload={setOpenUpload}
                    />
                }
            >
                <ResourceTable
                    rows={filteredPVs}
                    columns={columns}
                    loading={loading}
                    getRowId={(row) => row.name}
                />
            </ResourcePage>

            <CreatePVDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
                onCreated={fetchPVs}
            />

            <UploadPVDialog
                open={openUpload}
                onOpenChange={setOpenUpload}
                onUploaded={fetchPVs}
            />

            {ConfirmComponent}
        </div>
    );
};

export default PVPage;