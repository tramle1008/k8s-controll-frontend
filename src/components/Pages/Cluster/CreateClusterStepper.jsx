import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    TextField,
    Paper,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    CircularProgress,
} from "@mui/material";
import { coreApi } from "../../../api/api";
import CreateClusterLog from "./CreateClusterLog";
import { switchCluster } from "../../../store/reducers/slices/clusterSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const steps = [
    "Cluster Information",
    "Node Configuration",
    "SSH Authentication",
    "Review & Create",
];

export default function CreateClusterStepper() {
    const [activeStep, setActiveStep] = useState(0);
    const [clusterId, setClusterId] = useState(null);
    const [showLogs, setShowLogs] = useState(false);
    const [counts, setCounts] = useState({
        masters: 1,
        workers: 1,
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        clusterName: "",
        nodes: [],
    });

    const [sshStatus, setSshStatus] = useState("idle"); // idle | loading | success | error
    const [sshMessage, setSshMessage] = useState("");

    /* ================= Helpers ================= */

    const generateNodes = (masters, workers) => {
        const nodes = [];

        for (let i = 0; i < masters; i++) {
            nodes.push({
                name: `master-${i + 1}`,
                role: "master",
                ip: "",
                user: "user1",
                ssh: {
                    method: "password",
                    password: "",
                    sshPort: 22,
                },
            });
        }

        for (let i = 0; i < workers; i++) {
            nodes.push({
                name: `worker-${i + 1}`,
                role: "worker",
                ip: "",
                user: "user1",
                ssh: {
                    method: "password",
                    password: "",
                    sshPort: 22,
                },
            });
        }

        setForm((prev) => ({ ...prev, nodes }));
    };

    useEffect(() => {
        generateNodes(counts.masters, counts.workers);
    }, [counts]);

    const handleCountChange = (field, value) => {
        const num = Math.max(1, Number(value) || 1);
        setCounts((prev) => ({ ...prev, [field]: num }));
    };

    const updateNode = (index, field, value) => {
        setForm((prev) => {
            const nodes = [...prev.nodes];
            nodes[index] = { ...nodes[index], [field]: value };
            return { ...prev, nodes };
        });
    };

    const updateNodeSSH = (index, field, value) => {
        setForm((prev) => {
            const nodes = [...prev.nodes];
            nodes[index].ssh = { ...nodes[index].ssh, [field]: value };
            return { ...prev, nodes };
        });
    };

    const handleSshMethodChange = (index, method) => {
        setForm((prev) => {
            const nodes = [...prev.nodes];
            nodes[index].ssh = {
                method,
                password: "",
                sshPort: nodes[index].ssh?.sshPort || 22,
            };
            return { ...prev, nodes };
        });
    };

    /* ================= SSH Test ================= */

    const handleTestSSH = async () => {
        setSshStatus("loading");
        setSshMessage("");

        try {
            const res = await coreApi.post("/create/ssh", form);

            setSshStatus("success");
            setSshMessage("Kết nối SSH thành công cho tất cả node!");
            console.log(res.data);
        } catch (err) {
            setSshStatus("error");
            setSshMessage(err.response?.data?.message || err.message);
            console.error(err);
        }
    };

    /* ================= Create Cluster ================= */

    const handleCreateCluster = async () => {
        try {
            const payload = {
                clusterName: form.clusterName,
                nodes: form.nodes.map(n => ({
                    role: n.role,
                    ip: n.ip,
                    user: n.user,
                    ssh: n.ssh
                }))
            };

            const res = await fetch("/api/create/cluster", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            setClusterId(data.clusterId);
            setShowLogs(true);

        } catch (err) {
            alert("Lỗi khi tạo cluster: " + err.message);
        }
    };

    /* ================= Validation ================= */

    const step0Valid = form.clusterName.trim() !== "";

    const step1Valid =
        counts.masters >= 1 &&
        counts.workers >= 1 &&
        form.nodes.every((n) => n.ip.trim() !== "");

    const step2Valid = form.nodes.every((n) =>
        n.ssh.method === "password"
            ? n.ssh.password.trim() !== "" &&
            Number(n.ssh.sshPort) > 0
            : null
    );

    const canNext =
        (activeStep === 0 && step0Valid) ||
        (activeStep === 1 && step1Valid) ||
        (activeStep === 2 && step2Valid);

    /* ================= Navigation ================= */

    const handleNext = () => setActiveStep((s) => s + 1);
    const handleBack = () => setActiveStep((s) => s - 1);

    /* ================= Render ================= */

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <>
                        <Typography variant="h5">Cluster Information</Typography>

                        <TextField
                            fullWidth
                            label="Cluster Name"
                            margin="normal"
                            value={form.clusterName}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    clusterName: e.target.value,
                                }))
                            }
                        />
                    </>
                );

            case 1:
                return (
                    <>
                        <Typography variant="h5">Node Configuration</Typography>

                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <TextField
                                type="number"
                                label="Master Nodes"
                                value={counts.masters}
                                inputProps={{ min: 1 }}
                                onChange={(e) =>
                                    handleCountChange("masters", e.target.value)
                                }
                            />

                            <TextField
                                type="number"
                                label="Worker Nodes"
                                value={counts.workers}
                                inputProps={{ min: 1 }}
                                onChange={(e) =>
                                    handleCountChange("workers", e.target.value)
                                }
                            />
                        </Box>

                        <Box className="mt-8 space-y-6">
                            {form.nodes.map((node, i) => (
                                <Paper key={node.name} className="p-6 bg-slate-900 rounded-lg">
                                    <Typography className="text-blue-400 mb-4">
                                        {node.name} ({node.role})
                                    </Typography>

                                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TextField
                                            label="IP Address"
                                            value={node.ip}
                                            onChange={(e) =>
                                                updateNode(i, "ip", e.target.value)
                                            }
                                        />

                                        <TextField
                                            label="User"
                                            value={node.user}
                                            onChange={(e) =>
                                                updateNode(i, "user", e.target.value)
                                            }
                                        />
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </>
                );

            case 2:
                return (
                    <>
                        <Typography variant="h5">SSH Authentication</Typography>

                        <Box className="mt-6 space-y-6">
                            {form.nodes.map((node, i) => (
                                <Paper key={node.name} className="p-6 bg-slate-900 rounded-lg">
                                    <Typography className="text-blue-400 mb-4">
                                        {node.name} — {node.ip || "No IP"}
                                    </Typography>

                                    <RadioGroup
                                        row
                                        value={node.ssh.method}
                                        onChange={(e) =>
                                            handleSshMethodChange(i, e.target.value)
                                        }
                                    >
                                        <FormControlLabel
                                            value="password"
                                            control={<Radio />}
                                            label="Password"
                                        />
                                    </RadioGroup>

                                    <TextField
                                        type="number"
                                        label="SSH Port"
                                        fullWidth
                                        margin="normal"
                                        value={node.ssh.sshPort ?? 22}
                                        inputProps={{ min: 1 }}
                                        onChange={(e) =>
                                            updateNodeSSH(i, "sshPort", Number(e.target.value) || 22)
                                        }
                                    />

                                    <TextField
                                        type="password"
                                        label="SSH Password"
                                        fullWidth
                                        margin="normal"
                                        value={node.ssh.password}
                                        onChange={(e) =>
                                            updateNodeSSH(i, "password", e.target.value)
                                        }
                                    />

                                </Paper>
                            ))}
                        </Box>
                    </>
                );

            case 3:
                return (
                    <>
                        <Typography variant="h5">Review & Create</Typography>

                        {/* Chỉ hiển thị form review khi chưa show logs */}
                        {!showLogs && (
                            <>
                                <Typography variant="body1" className="mt-4 mb-2 text-slate-400">
                                    Review thông tin cluster trước khi tạo:
                                </Typography>
                                <pre className="bg-slate-800 text-blue-200 p-6 rounded-lg mt-6 text-sm overflow-auto max-h-96">
                                    {JSON.stringify({
                                        clusterName: form.clusterName,
                                        nodes: form.nodes.map(n => ({
                                            role: n.role,
                                            ip: n.ip,
                                            user: n.user,
                                            ssh: n.ssh
                                        }))
                                    }, null, 2)}
                                </pre>
                            </>
                        )}

                        {/* Chỉ hiển thị log khi đã bắt đầu tạo cluster */}
                        {showLogs && clusterId && (
                            <CreateClusterLog
                                clusterId={clusterId}
                                onFinish={(status) => {
                                    if (status === "success") {
                                        alert("Cluster deploy thành công cluster " + clusterId);

                                        // Dispatch và chờ switch xong mới chuyển trang
                                        dispatch(switchCluster(clusterId))
                                            .unwrap()
                                            .then(() => {
                                                navigate("/"); // chuyển về trang chủ
                                            })
                                            .catch(() => {
                                                alert("Switch cluster thất bại!");
                                            });

                                    } else if (status === "failed") {
                                        alert("Cluster deploy thất bại!");
                                        setShowLogs(false);
                                    }
                                }}
                            />
                        )}

                        {/* Hiển thị thông báo nếu chưa có clusterId nhưng showLogs = true (ít xảy ra) */}
                        {showLogs && !clusterId && (
                            <Typography color="error">Đang khởi tạo cluster ID...</Typography>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Box className="min-h-screen bg-slate-900 text-blue-300 p-8">
            <Paper className="bg-slate-950 p-6 rounded-xl max-w-5xl mx-auto">
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box className="mt-10">{renderStep()}</Box>

                <Box className="flex justify-between mt-8">
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Back
                    </Button>

                    {activeStep < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!canNext}
                        >
                            Next
                        </Button>
                    ) : (
                        <Box className="flex gap-4">
                            {sshStatus === "success" ? (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleCreateCluster}
                                    disabled={showLogs}
                                >
                                    Create Cluster
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleTestSSH}
                                    disabled={sshStatus === "loading"}
                                    startIcon={
                                        sshStatus === "loading" ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : null
                                    }
                                >
                                    {sshStatus === "loading"
                                        ? "Testing SSH..."
                                        : "Test SSH Connection"}
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
                {!showLogs &&
                    sshMessage && (
                        <Box
                            className="mt-6 p-4 rounded-lg"
                            sx={{
                                bgcolor:
                                    sshStatus === "success"
                                        ? "success.dark"
                                        : "error.dark",
                                color: "white",
                            }}
                        >
                            {sshMessage}
                        </Box>
                    )}

            </Paper>
        </Box>
    );
}