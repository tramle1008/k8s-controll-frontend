import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import ResourceCard from './ResourceCard';
import NodesPage from '../Nodes/NodesPage';
import { updatePodSummary } from '../../../store/reducers/slices/podSummarySlice';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

export default function AdminDashboard() {
    const dispatch = useDispatch();

    // Lấy data từ Redux store
    const {
        totalPods = 0,
        runningPods = 0,
        pendingPods = 0,
        failedPods = 0,
        alertedPods = 0,
        loading = false,
        error = null
    } = useSelector(state => state.podSummary || {});

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        // 1. Fetch initial summary từ REST (để có data ngay lập tức)
        const fetchInitialSummary = async () => {
            try {
                console.log("Fetching initial pod summary from REST...");
                const res = await fetch(`${BACKEND_URL}/api/pods/summary`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                console.log("Initial pod summary loaded:", data);
                dispatch(updatePodSummary(data));
            } catch (err) {
                console.error("Initial fetch pod summary failed:", err);
                // Optional: dispatch error action nếu bạn có
            }
        };

        fetchInitialSummary();

        // 2. WebSocket cho realtime update
        const socket = new SockJS(`${BACKEND_URL}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("STOMP Debug:", str),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                console.log("Dashboard WS Connected - subscribing to /topic/pods-summary");

                stompClient.subscribe('/topic/pods-summary', (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        console.log("Realtime pod summary from WS:", data);
                        dispatch(updatePodSummary(data));
                    } catch (err) {
                        console.error("Lỗi parse JSON từ WS:", err, message.body);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            },
            onWebSocketClose: () => {
                console.log("WebSocket closed");
            },
            onWebSocketError: (error) => {
                console.error("WebSocket error:", error);
            }
        });

        stompClient.activate();

        return () => {
            console.log("Cleaning up stomp client");
            stompClient.deactivate();
        };
    }, [dispatch]);

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-blue-400">local-cluster</h1>
                <p className="text-sm text-gray-400 mt-1">Active Context  Kubernetes v1.28.5</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <ResourceCard
                    title="Nodes"
                    value="3"
                    subValue="Ready"
                    icon="server"
                    trend=""
                    linkTo="/nodes"  // giữ nguyên clickable cho Nodes
                />

                {/* Card Pods - clickable đi đến /workloads/pods */}
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
                    statusType="running"
                    warning={alertedPods > 0 || pendingPods > 0 || failedPods > 0}
                    linkTo="/workloads/pods"  // ← THÊM DÒNG NÀY
                />

                <ResourceCard
                    title="CPU Usage"
                    value="42%"
                    subValue="of 20 cores"
                    icon="microchip"
                    trend="-3%"
                    warning
                />
                <ResourceCard
                    title="Memory Usage"
                    value="58%"
                    subValue="of 64Gi"
                    icon="memory"
                    trend="+5%"
                />
            </div>

            {error && (
                <div className="text-red-500 mb-4">
                    Lỗi tải dữ liệu pods: {error}
                </div>
            )}

            <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                <NodesPage />
            </div>
        </>
    );
}