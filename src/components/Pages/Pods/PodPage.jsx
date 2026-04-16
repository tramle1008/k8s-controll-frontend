import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    Button,
    IconButton,
    Tooltip,
    Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileText } from 'lucide-react';

import { fetchPods, updatePodRealtime } from '../../../store/reducers/slices/podsSlice';
import useConfirm from '../../../store/reducers/slices/useConfirm';

import ResourcePage from '../resource/ResourcePage';
import ResourceTable from '../resource/ResourceTable';
import ResourceToolbar from '../resource/ResourceToolbar';
import LogsDialog from './LogsDialog';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

const PodsPage = () => {
    // ──────────────────────────────────────────────
    // STATES
    // ──────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [namespace, setNamespace] = useState('all');
    const [openLogsDialog, setOpenLogsDialog] = useState(false);
    const [selectedPod, setSelectedPod] = useState(null);

    // ──────────────────────────────────────────────
    // REDUX & ROUTER
    // ──────────────────────────────────────────────
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { pods = [], loading, error } = useSelector((state) => state.pods);
    const { confirm, ConfirmComponent } = useConfirm();

    // ──────────────────────────────────────────────
    // EFFECTS – TẤT CẢ Ở ĐÂY, TRƯỚC MỌI RETURN
    // ──────────────────────────────────────────────

    // 1. Fetch pods ban đầu
    useEffect(() => {
        dispatch(fetchPods());
    }, [dispatch]);

    // 2. WebSocket realtime
    useEffect(() => {
        const socket = new SockJS(`${BACKEND_URL}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: () => { },
            reconnectDelay: 5000,

            onConnect: () => {
                console.log('Connected to /topic/pods-all');

                stompClient.subscribe('/topic/pods-all', (message) => {
                    const data = JSON.parse(message.body);
                    dispatch(updatePodRealtime(data));

                    const variant =
                        data.ready === true
                            ? 'success'
                            : data.phase === 'Pending'
                                ? 'warning'
                                : 'error';

                    enqueueSnackbar(`Pod ${data.name} (${data.namespace}) - ${data.phase}`, {
                        variant,
                        action: (snackbarKey) => (
                            <button
                                onClick={() => closeSnackbar(snackbarKey)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginLeft: '16px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                }}
                            >
                                ĐÓNG
                            </button>
                        ),
                    });
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [dispatch, enqueueSnackbar, closeSnackbar]);

    // ──────────────────────────────────────────────
    // DERIVED DATA
    // ──────────────────────────────────────────────
    const filteredPods = pods.filter((pod) => {
        const matchSearch = pod.name.toLowerCase().includes(search.toLowerCase());
        const matchNamespace = namespace === 'all' || pod.namespace === namespace;
        return matchSearch && matchNamespace;
    });

    // ──────────────────────────────────────────────
    // HANDLERS
    // ──────────────────────────────────────────────
    const handleDeletePod = async (namespace, podName) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/pods/${namespace}/${podName}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Xóa pod thất bại');
            }

            enqueueSnackbar(`Đã xóa pod ${podName}`, { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(`Xóa pod thất bại: ${err.message}`, { variant: 'error' });
        }
    };

    const openLogs = (pod) => {
        setSelectedPod(pod);
        setOpenLogsDialog(true);
    };

    // ──────────────────────────────────────────────
    // EARLY RETURNS (sau khi tất cả hooks đã gọi xong)
    // ──────────────────────────────────────────────
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                {error}
            </Alert>
        );
    }

    // Nếu không có pod nào (và không redirect) – trường hợp fallback
    if (pods.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 3 }}>
                Không tìm thấy pod nào. Vui lòng kiểm tra kết nối hoặc namespace.
            </Alert>
        );
    }

    // ──────────────────────────────────────────────
    // COLUMNS cho DataGrid (hoặc ResourceTable)
    // ──────────────────────────────────────────────
    const columns = [
        { field: 'namespace', headerName: 'Namespace', width: 180, sortable: true },
        { field: 'name', headerName: 'Tên Pod', width: 300, sortable: true },
        {
            field: 'ready',
            headerName: 'Ready',
            width: 85,
            renderCell: (params) => (
                <Chip
                    label={params.value || 'deleted'}
                    color={params.value === '1/1' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            minwidth: 50,
            renderCell: (params) => {
                let color = 'default';
                if (params.value === 'Running') color = 'success';
                if (['Pending', 'Unknown'].includes(params.value)) color = 'warning';
                if (['CrashLoopBackOff', 'Error', 'Failed'].includes(params.value))
                    color = 'error';
                return <Chip label={params.value} color={color} size="small" />;
            },
        },
        { field: 'restarts', headerName: 'Restarts', width: 50, type: 'number' },
        {
            field: "labels",
            headerName: "Labels",
            flex: 1,
            minwidth: 180,
            renderCell: (params) => {
                const sel = params.value;
                if (!sel) return "—";

                return Object.entries(sel)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ");
            }
        },
        { field: 'nodeName', headerName: 'Node', width: 150 },
        {
            field: 'creationTimestamp',
            headerName: 'Tạo lúc',
            width: 180,
            valueFormatter: (value) => (value ? new Date(value).toLocaleString('vi-VN') : ''),
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            width: 160,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Xóa Pod">
                        <IconButton
                            color="error"
                            size="small"
                            onClick={async () => {
                                const ok = await confirm(
                                    `Bạn có chắc muốn xóa Pod ${params.row.namespace}/${params.row.name}?`
                                );
                                if (ok) {
                                    handleDeletePod(params.row.namespace, params.row.name);
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem Logs">
                        <IconButton size="small" onClick={() => openLogs(params.row)}>
                            <FileText color="orange" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    // ──────────────────────────────────────────────
    // MAIN RENDER
    // ──────────────────────────────────────────────
    return (
        <div>
            <ResourcePage
                title="Danh sách Pods Kubernetes"
                toolbar={
                    <ResourceToolbar
                        search={search}
                        onSearchChange={setSearch}
                        namespace={namespace}
                        onNamespaceChange={setNamespace}
                        onRefresh={() => dispatch(fetchPods())}
                    // onCreate={() => console.log('create pod')} // thay bằng navigate nếu cần
                    // onImport={() => console.log('import yaml')}
                    />
                }
            >
                <ResourceTable
                    rows={filteredPods}
                    columns={columns}
                    getRowId={(row) => `${row.namespace}/${row.name}`}
                />
            </ResourcePage>

            <LogsDialog
                open={openLogsDialog}
                onClose={() => setOpenLogsDialog(false)}
                namespace={selectedPod?.namespace}
                podName={selectedPod?.name}
                containers={selectedPod?.containers}
            />

            {ConfirmComponent}
        </div>
    );
};

export default PodsPage;