import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import ResourceCard from './ResourceCard';
import NodesPage from '../Nodes/NodesPage';
import { updatePodSummary } from '../../../store/reducers/slices/podSummarySlice';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CreateNodeDialog from '../Nodes/CreateNodeDialog';
import { fetchAllClusterActive } from '../../../store/reducers/slices/clusterSlice';
import { useSnackbar } from 'notistack';
import { fetchNodes } from '../../../store/reducers/slices/nodesSlice';
import ClusterCapacityCard from './ClusterCapacityCard';
import NodeCardMetrics from '../Nodes/NodeCardMetrics';
import BottomTerminal from '../Nodes/BottomTerminal';
import { fetchClusterMetrics } from '../../../store/reducers/slices/metricsClusterSlice';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [open, setOpen] = useState(false);
    const [sshInfo, setSshInfo] = useState(null);
    const [terminalOpen, setTerminalOpen] = useState(false);

    const terminalRef = useRef(null);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // Redux state
    const {
        totalPods = 0,
        runningPods = 0,
        pendingPods = 0,
        failedPods = 0,
        alertedPods = 0,
        loading: loadingPodSummary = false,
        error: errorPodSummary = null
    } = useSelector(state => state.podSummary || {});

    const { nodes, loadingNode, errorNode } = useSelector(state => state.nodes);

    const { metrics, loading: loadingMetrics, error: metricsError } = useSelector(
        state => state.metricsCluster
    );

    // ==== Tổng loading cho Dashboard ====
    const loading =
        loadingNode ||
        loadingMetrics ||
        loadingPodSummary;


    // Fetch nodes
    useEffect(() => {
        dispatch(fetchNodes());
    }, [dispatch]);

    // Fetch metrics
    useEffect(() => {
        dispatch(fetchClusterMetrics());
    }, [dispatch]);

    // Điều hướng khi không có node
    // useEffect(() => {
    //     if (!loadingNode && nodes.length === 0 && !errorNode) {
    //         navigate('/cluster/create', { replace: true });
    //         console.log("chưa có cluster");
    //     }

    //     if (!loadingNode && errorNode?.includes('Chưa có node')) {
    //         navigate('/cluster/create', { replace: true });
    //         console.log("chưa có node");
    //     }
    // }, [loadingNode, nodes, errorNode, navigate]);


    // Fetch initial pod summary + Websocket
    useEffect(() => {
        const fetchInitialSummary = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/pods/summary`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                dispatch(updatePodSummary(data));
            } catch (err) {
                console.error("Initial fetch pod summary failed:", err);
            }
        };

        fetchInitialSummary();

        const socket = new SockJS(`${BACKEND_URL}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe('/topic/pods-summary', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        dispatch(updatePodSummary(data));
                    } catch (err) {
                        console.error("WS JSON parse error:", err);
                    }
                });
            }
        });

        stompClient.activate();
        return () => stompClient.deactivate();
    }, [dispatch]);


    // Scroll terminal khi mở
    useEffect(() => {
        if (!terminalOpen) return;
        const el = terminalRef.current;
        if (!el) return;

        setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }, [terminalOpen]);


    const totalNodes = nodes.length;
    const readyNodes = nodes.filter(n => n.status === "True").length;
    const notReadyNodes = nodes.filter(n => n.status !== "True").length;


    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-blue-400">local-cluster</h1>
                <p className="text-sm text-gray-400 mt-1">Active Context - Kubernetes v1.35.2</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                <ResourceCard
                    title="Nodes"
                    value={totalNodes}
                    subValue={
                        <span>
                            <span className="text-green-400">Running: {readyNodes}</span>
                            {' | '}
                            <span className="text-red-400">Failed: {notReadyNodes}</span>
                        </span>
                    }
                    icon="server"
                    linkTo="/nodes"
                />

                <ResourceCard
                    title="Pods"
                    value={loading ? "..." : `${runningPods}`}
                    subValue={
                        <span className="text-xs">
                            <span className="text-green-400">Running: {runningPods}</span>
                            {' | '}
                            <span className="text-yellow-400">Pending: {pendingPods}</span>
                            {' | '}
                            <span className="text-red-400">Failed: {failedPods}</span>
                        </span>
                    }
                    icon="cube"
                    warning={alertedPods > 0 || pendingPods > 0 || failedPods > 0}
                    linkTo="/workloads/pods"
                />

                <div className="lg:col-span-2">
                    <ClusterCapacityCard
                        metrics={metrics}
                        loading={loadingMetrics}
                    />
                </div>
            </div>

            {errorNode && (
                <div className="text-red-500 mb-4">
                    Lỗi tải dữ liệu Node: {errorNode}
                </div>
            )}

            <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] overflow-hidden relative min-h-[300px] md:min-h-[200px]">
                <Button
                    onClick={() => setOpen(true)}
                    className="absolute top-4 z-10 px-5 py-2 text-white left-2"
                >
                    Add Node
                </Button>

                <NodeCardMetrics
                    onShowTerminal={(info) => {
                        setSshInfo(info);
                        setTerminalOpen(true);
                    }}
                />

                <CreateNodeDialog open={open} onOpenChange={setOpen} />
            </div>

            <BottomTerminal
                ref={terminalRef}
                isOpen={terminalOpen}
                sshInfo={sshInfo}
                onClose={() => setTerminalOpen(false)}
            />
        </>
    );
}