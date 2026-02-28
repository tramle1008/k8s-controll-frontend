import React, { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { fetchPods, updatePodRealtime } from '../../../store/reducers/slices/podsSlice'; // ← giả định bạn sẽ tạo slice này
import { useSnackbar } from 'notistack';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

const PodsPage = () => {
    const dispatch = useDispatch();
    const { pods = [], loading, error } = useSelector((state) => state.pods);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const handleDeletePod = async (namespace, podName) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/pods/${namespace}/${podName}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }



        } catch (error) {
            enqueueSnackbar(
                `Xóa Pod thất bại: ${error.message}`,
                { variant: 'error' }
            );
        }
    };
    // Load danh sách pods ban đầu
    useEffect(() => {
        dispatch(fetchPods());
    }, [dispatch]);

    // WebSocket realtime update
    useEffect(() => {
        const socket = new SockJS(`${BACKEND_URL}/ws`);

        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: () => { },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected to /topic/pods-all");

                stompClient.subscribe('/topic/pods-all', (message) => {
                    const data = JSON.parse(message.body);
                    dispatch(updatePodRealtime(data));
                    if (data.status === "Deleted") {
                        enqueueSnackbar(
                            `Pod ${data.name} (${data.namespace}) - ${data.status}`,
                            {
                                variant: 'success',
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
                            }
                        );
                    }
                    else if (data.ready !== "1/1" || data.status === "CrashLoopBackOff") {
                        enqueueSnackbar(
                            `Pod ${data.name} (${data.namespace}) - ${data.status} (${data.ready})`,
                            {
                                variant: data.ready === "1/1" ? 'warning' : 'error',
                                persist: data.status === "CrashLoopBackOff",
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
                            }
                        );
                    }
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [dispatch, enqueueSnackbar, closeSnackbar]);

    const columns = [
        { field: 'namespace', headerName: 'Namespace', width: 140, sortable: true },
        { field: 'name', headerName: 'Tên Pod', width: 300, sortable: true },
        {
            field: 'ready',
            headerName: 'Ready',
            width: 90,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === '1/1' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 130,
            renderCell: (params) => {
                let color = 'default';
                if (params.value === 'Running') color = 'success';
                if (['Pending', 'Unknown'].includes(params.value)) color = 'warning';
                if (['CrashLoopBackOff', 'Error', 'Failed'].includes(params.value)) color = 'error';
                return <Chip label={params.value} color={color} size="small" />;
            },
        },
        { field: 'restarts', headerName: 'Restarts', width: 100, type: 'number' },
        { field: 'age', headerName: 'Tuổi', width: 100 },
        { field: 'nodeName', headerName: 'Node', width: 160 },

        {
            field: 'creationTimestamp',
            headerName: 'Tạo lúc',
            width: 200,
            valueFormatter: (value) => {
                if (!value) return '';
                return new Date(value).toLocaleString('vi-VN');
            },
        }
        ,
        {
            field: 'actions',
            headerName: 'Hành động',
            width: 160,
            sortable: false,
            renderCell: (params) => (
                <button
                    onClick={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa Pod ${params.row.name}?`)) {
                            handleDeletePod(params.row.namespace, params.row.name);
                        }
                    }}
                    style={{
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                    }}
                >
                    XÓA
                </button>
            ),
        }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    if (pods.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 3 }}>
                Không tìm thấy pod nào. Vui lòng kiểm tra kết nối Kubernetes hoặc namespace.
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                color: 'text.primary',
            }}
        >
            <Typography variant="h5" gutterBottom>
                Danh sách Pods Kubernetes
            </Typography>

            <DataGrid
                rows={pods}
                columns={columns}
                getRowId={(row) => `${row.namespace}/${row.name}`}
                pageSizeOptions={[10, 20, 50, 100]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                    sorting: { sortModel: [{ field: 'namespace', sort: 'asc' }] },
                }}
                disableRowSelectionOnClick
                autoHeight
                density="compact"
                sx={[
                    {
                        backgroundColor: 'background.paper',
                        border: 0,
                        borderRadius: 2,
                        overflow: 'hidden',

                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'grey.500',
                            color: 'common.gray',
                            fontWeight: 'medium',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        },

                        '& .MuiDataGrid-columnHeader': {
                            px: 1.5,
                            py: 1,
                        },

                        '& .MuiDataGrid-row': {
                            borderBottom: '1px solid',
                            borderColor: 'grey.800',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                        },

                        '& .MuiDataGrid-cell': {
                            px: 1.5,
                            py: 1,
                            whiteSpace: 'normal',
                            lineHeight: 'normal',
                            borderBottom: 'none',
                        },

                        '& .MuiDataGrid-cell[data-field="name"]': {
                            fontWeight: 'medium',
                            color: 'primary.main',
                        },

                        '& .MuiDataGrid-cell:not([data-field="name"])': {
                            color: 'text.secondary',
                        },

                        '& .MuiDataGrid-cell[data-field="podIp"], & .MuiDataGrid-cell[data-field="creationTimestamp"]': {
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        },

                        '& .MuiChip-root': {
                            fontSize: '0.75rem',
                        },
                    },

                    (theme) => theme.applyStyles('dark', {
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'grey.700',
                        },

                        '& .MuiDataGrid-row': {
                            borderColor: 'grey.700',
                        },

                        '& .MuiDataGrid-cell[data-field="name"]': {
                            color: 'primary.light',
                        },
                    }),
                ]}

            // hideFooter
            />
        </Box>
    );
};

export default PodsPage;