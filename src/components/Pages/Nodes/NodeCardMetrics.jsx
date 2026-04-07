import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from "notistack";
import { fetchClusterMetrics } from "../../../store/reducers/slices/metricsClusterSlice";
import { fetchNodes } from "../../../store/reducers/slices/nodesSlice";

const BACKEND_URL =
    import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

export default function NodeCardMetrics({ onShowTerminal }) {

    const nodes = useSelector((state) => state.nodes.nodes);
    const [metricsMap, setMetricsMap] = useState({});
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState(null);
    const [currentNodeMenu, setCurrentNodeMenu] = useState(null);
    const handleMenuOpen = (event, nodeName) => {
        setAnchorEl(event.currentTarget);
        setCurrentNodeMenu(nodeName);
    };
    const [drainingNode, setDrainingNode] = useState(null);
    const [uncordoningNode, setUncordoningNode] = useState(null);
    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentNodeMenu(null);
    };
    const handleDrain = async (nodeName) => {
        setDrainingNode(nodeName);
        try {
            const res = await fetch(`${BACKEND_URL}/api/k8s/${nodeName}/drain`, {
                method: "POST",
            });

            const text = await res.text();
            enqueueSnackbar(text, {
                variant: "success",
                autoHideDuration: 1000
            });

            setTimeout(() => {
                dispatch(fetchClusterMetrics());

            }, 7000);


        } catch (e) {
            console.error("Drain error", e);
            enqueueSnackbar("Drain error", {
                variant: "error",
                autoHideDuration: 1000
            });
        }
    };

    const handleUncordon = async (nodeName) => {
        setUncordoningNode(nodeName);
        try {
            const res = await fetch(`${BACKEND_URL}/api/k8s/${nodeName}/uncordon`, {
                method: "POST",
            });

            const text = await res.text();
            enqueueSnackbar(text, {
                variant: "success",
                autoHideDuration: 1000
            })

            setDrainingNode(null);
            setUncordoningNode(null);
            dispatch(fetchClusterMetrics());
            dispatch(fetchNodes());

        } catch (e) {
            console.error("Uncordon error", e);
            enqueueSnackbar("Uncordon error", {
                variant: "error",
                autoHideDuration: 1000
            });
        }
    };
    useEffect(() => {
        const fetchInitialMetrics = async () => {
            try {

                const res = await fetch(`${BACKEND_URL}/api/k8s/nodes/metrics`);
                const data = await res.json();

                const map = {};

                data.forEach((m) => {
                    map[m.nodeName] = m;
                });

                setMetricsMap(map);

            } catch (e) {
                console.error("Initial metrics fetch failed", e);
            }
        };



        fetchInitialMetrics();

        const socket = new SockJS(`${BACKEND_URL}/ws`);

        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
        });

        stompClient.onConnect = () => {

            stompClient.subscribe("/topic/node-metrics", (msg) => {

                const updates = JSON.parse(msg.body);

                setMetricsMap((prev) => {

                    const updated = { ...prev };

                    updates.forEach((node) => {
                        updated[node.nodeName] = node;
                    });

                    return updated;
                });
            });
        };

        stompClient.activate();

        return () => stompClient.deactivate();

    }, []);

    const getColor = (percent) => {
        if (percent > 80) return "bg-red-500";
        if (percent > 50) return "bg-yellow-400";
        return "bg-blue-500";
    };

    const Bar = ({ percent }) => (
        <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
            <div
                className={`h-2 rounded transition-all duration-500 ${getColor(percent)}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">

            {nodes.map((node) => {

                const nodeName = node.name;
                const ready = node.status === "True";

                const m = metricsMap[nodeName];

                const cpu = m?.cpuPercent ?? 0;
                const mem = m?.memoryPercent ?? 0;

                const podsUsed = m?.podsUsed ?? 0;
                const podsCapacity = m?.podsCapacity ?? 0;

                const podsPercent =
                    podsCapacity ? (podsUsed / podsCapacity) * 100 : 0;

                return (
                    <div
                        key={nodeName}
                        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-5"
                    >


                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">

                            {/* LEFT: Node name */}
                            <h3 className="font-semibold text-sm text-blue-400">
                                {node.role?.toUpperCase().includes('CONTROL') || node.role?.toUpperCase().includes('MASTER')
                                    ? 'MASTER'
                                    : 'WORKER'} - {node.internalIp}
                            </h3>
                            {/* RIGHT group */}
                            <div className="flex items-center gap-2">
                                {drainingNode === nodeName || node.taints?.some(t => t.includes("unschedulable")) ? (
                                    <span className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Draining…
                                    </span>
                                ) : (
                                    <span className={`text-sm px-2 py-1 rounded ${ready ? "bg-green-500" : "bg-red-500"} text-white`}>
                                        {ready ? "Ready" : "Not Ready"}
                                    </span>
                                )}

                                <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, nodeName)}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={currentNodeMenu === node.name}
                                    onClose={handleMenuClose}
                                    disableAutoFocus
                                    disableEnforceFocus
                                >

                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            onShowTerminal({
                                                username: node.user,
                                                host: node.internalIp,   // sửa đúng key
                                            });
                                        }}
                                    >
                                        Show Terminal
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            handleDrain(nodeName);
                                        }}
                                    >
                                        Drain
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            handleMenuClose();
                                            handleUncordon(nodeName);
                                        }}
                                    >
                                        Uncordon
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>
                        <div className="space-y-4">

                            {/* CPU */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>CPU</span>
                                    <span>{cpu.toFixed(1)}% / {node.cpuAllocatable} core</span>

                                </div>
                                <Bar percent={cpu} />
                            </div>

                            {/* MEMORY */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Memory</span>
                                    <span>{mem.toFixed(1)}% / {node.memoryCapacity}</span>
                                </div>
                                <Bar percent={mem} />
                            </div>

                            {/* PODS */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Pods</span>
                                    <span>
                                        {podsUsed} / {podsCapacity}
                                    </span>
                                </div>
                                <Bar percent={podsPercent} />
                            </div>

                        </div>


                    </div>
                );
            })}

        </div>
    );
}