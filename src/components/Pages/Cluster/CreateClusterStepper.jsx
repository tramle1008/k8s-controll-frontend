import { useEffect, useState } from "react";
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
} from "@mui/material";

const steps = [
    "Cluster Information",
    "Node Configuration",
    "SSH Authentication",
    "Review & Create",
];

export default function CreateClusterStepper() {
    const [activeStep, setActiveStep] = useState(0);

    // số lượng node (ít nhất 1 master + 1 worker)
    const [counts, setCounts] = useState({
        masters: 1,
        workers: 1,
    });

    // form chính
    const [form, setForm] = useState({
        clusterName: "",
        nodes: [],
    });

    /* ================= helpers ================= */

    const generateNodes = (masters, workers) => {
        const nodes = [];

        for (let i = 0; i < masters; i++) {
            nodes.push({
                name: `master-${i + 1}`,
                role: "master",
                ip: "",
                user: "ubuntu",
                ssh: {
                    method: "password",
                    password: "",
                    publicKey: "",
                },
            });
        }

        for (let i = 0; i < workers; i++) {
            nodes.push({
                name: `worker-${i + 1}`,
                role: "worker",
                ip: "",
                user: "ubuntu",
                ssh: {
                    method: "password",
                    password: "",
                    publicKey: "",
                },
            });
        }

        setForm((prev) => ({ ...prev, nodes }));
    };

    useEffect(() => {
        generateNodes(counts.masters, counts.workers);
    }, [counts.masters, counts.workers]);

    const handleCountChange = (field, value) => {
        const num = Math.max(1, Number(value));
        setCounts((prev) => ({ ...prev, [field]: num }));
    };

    const updateNode = (index, field, value) => {
        const nodes = [...form.nodes];
        nodes[index] = { ...nodes[index], [field]: value };
        setForm({ ...form, nodes });
    };

    const updateNodeSSH = (index, field, value) => {
        const nodes = [...form.nodes];
        nodes[index].ssh = {
            ...nodes[index].ssh,
            [field]: value,
        };
        setForm({ ...form, nodes });
    };

    // 🔥 FIX BUG: đổi SSH method thì RESET password / key
    const handleSshMethodChange = (index, method) => {
        const nodes = [...form.nodes];
        nodes[index].ssh = {
            method,
            password: "",
            publicKey: "",
        };
        setForm({ ...form, nodes });
    };

    /* ================= validation ================= */

    const step0Valid = form.clusterName.trim() !== "";

    const step1Valid =
        counts.masters >= 1 &&
        counts.workers >= 1 &&
        form.nodes.every((n) => n.ip.trim() !== "");

    const step2Valid = form.nodes.every((n) =>
        n.ssh.method === "password"
            ? n.ssh.password.trim() !== ""
            : n.ssh.publicKey.trim() !== ""
    );

    const canNext =
        (activeStep === 0 && step0Valid) ||
        (activeStep === 1 && step1Valid) ||
        (activeStep === 2 && step2Valid);

    /* ================= navigation ================= */

    const handleNext = () => setActiveStep((s) => s + 1);
    const handleBack = () => setActiveStep((s) => s - 1);

    /* ================= render ================= */

    return (
        <Box className="min-h-screen bg-slate-900 text-blue-300 p-8">
            <Paper className="bg-slate-950 p-6 rounded-xl">
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box className="mt-8">
                    {renderStep(
                        activeStep,
                        form,
                        setForm,
                        counts,
                        handleCountChange,
                        updateNode,
                        updateNodeSSH,
                        handleSshMethodChange
                    )}
                </Box>

                <Box className="flex justify-between mt-6">
                    <Button disabled={activeStep === 0} onClick={handleBack}>
                        Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => console.log("CREATE CLUSTER", form)}
                        >
                            Create Cluster
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            disabled={!canNext}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

/* ================= STEP RENDER ================= */

function renderStep(
    step,
    form,
    setForm,
    counts,
    handleCountChange,
    updateNode,
    updateNodeSSH,
    handleSshMethodChange
) {
    switch (step) {
        case 0:
            return (
                <>
                    <Typography variant="h6">Cluster Information</Typography>
                    <TextField
                        fullWidth
                        label="Cluster Name"
                        margin="normal"
                        value={form.clusterName}
                        onChange={(e) =>
                            setForm({ ...form, clusterName: e.target.value })
                        }
                    />
                </>
            );

        case 1:
            return (
                <>
                    <Typography variant="h6">Node Configuration</Typography>

                    <Box className="grid grid-cols-2 gap-4 mt-4">
                        <TextField
                            type="number"
                            label="Number of Masters"
                            value={counts.masters}
                            inputProps={{ min: 1 }}
                            helperText="At least 1 master"
                            onChange={(e) =>
                                handleCountChange("masters", e.target.value)
                            }
                        />

                        <TextField
                            type="number"
                            label="Number of Workers"
                            value={counts.workers}
                            inputProps={{ min: 1 }}
                            helperText="At least 1 worker"
                            onChange={(e) =>
                                handleCountChange("workers", e.target.value)
                            }
                        />
                    </Box>

                    {form.nodes.map((node, i) => (
                        <Paper
                            key={node.name}
                            className="bg-slate-900 p-4 mt-4 rounded"
                        >
                            <Typography className="text-blue-400 mb-2">
                                {node.name} ({node.role})
                            </Typography>

                            <Box className="grid grid-cols-2 gap-4">
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
                </>
            );

        case 2:
            return (
                <>
                    <Typography variant="h6">
                        SSH Authentication (Per Node)
                    </Typography>

                    {form.nodes.map((node, i) => (
                        <Paper
                            key={node.name}
                            className="bg-slate-900 p-4 mt-4 rounded"
                        >
                            <Typography className="text-blue-400 mb-2">
                                {node.name} — {node.ip}
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
                                <FormControlLabel
                                    value="key"
                                    control={<Radio />}
                                    label="SSH Key"
                                />
                            </RadioGroup>

                            {node.ssh.method === "password" ? (
                                <TextField
                                    type="password"
                                    label="SSH Password"
                                    fullWidth
                                    margin="normal"
                                    value={node.ssh.password}
                                    onChange={(e) =>
                                        updateNodeSSH(
                                            i,
                                            "password",
                                            e.target.value
                                        )
                                    }
                                />
                            ) : (
                                <TextField
                                    label="SSH Public Key"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    margin="normal"
                                    value={node.ssh.publicKey}
                                    onChange={(e) =>
                                        updateNodeSSH(
                                            i,
                                            "publicKey",
                                            e.target.value
                                        )
                                    }
                                />
                            )}
                        </Paper>
                    ))}
                </>
            );

        case 3:
            return (
                <>
                    <Typography variant="h6">Review & Create</Typography>
                    <pre className="bg-slate-200 p-4 rounded mt-4 text-sm">
                        {JSON.stringify(form, null, 2)}
                    </pre>
                </>
            );

        default:
            return null;
    }
}
