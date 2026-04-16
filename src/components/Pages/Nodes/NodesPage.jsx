import React, { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { fetchNodes, updateNodeRealtime } from '../../../store/reducers/slices/nodesSlice';
import { useSnackbar } from 'notistack';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import useConfirm from '../../../store/reducers/slices/useConfirm';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';



const NodesPage = () => {
    const dispatch = useDispatch();
    const { nodes = [], loading, error } = useSelector((state) => state.nodes);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { confirm, ConfirmComponent } = useConfirm();

    useEffect(() => {
        dispatch(fetchNodes());
    }, [dispatch]);

    useEffect(() => {
        const socket = new SockJS(`${BACKEND_URL}/ws`);

        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: () => { },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected");

                stompClient.subscribe('/topic/nodes', (message) => {
                    const data = JSON.parse(message.body);
                    dispatch(updateNodeRealtime(data));

                    // Logic toast: chỉ show khi node Not Ready
                    if (!data.ready) {
                        enqueueSnackbar(
                            `Node ${data.name} Not Ready! (từ ${new Date(data.lastTransitionTime).toLocaleString('vi-VN')})`,
                            {
                                variant: 'error',
                                persist: true,
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
    }, [dispatch, enqueueSnackbar, closeSnackbar]);  // ← Thêm dependency để React biết
    const { selectedClusterId, clusters } = useSelector((state) => state.cluster);


    const handleDeleteNode = async (nodeName) => {

        if (!(await confirm(`Bạn có chắc muốn xóa node ${nodeName}?`))) {
            return;
        }

        try {

            const res = await fetch(
                `${BACKEND_URL}/api/create/${selectedClusterId}/nodes/${nodeName}`,
                {
                    method: "DELETE"
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Delete failed");
            }

            enqueueSnackbar(`Đã xóa node ${nodeName}`, { variant: "success", autoHideDuration: 2000 });

            // reload nodes
            dispatch(fetchNodes());

        } catch (err) {

            enqueueSnackbar(`Xóa node thất bại: ${err.message}`, {
                variant: "error",
                autoHideDuration: 2000
            });

        }
    };


    const columns = [
        { field: 'name', headerName: 'Tên Node', width: 180, sortable: true },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value === 'True' ? 'Ready' : 'NotReady'}
                    color={params.value === 'True' ? 'success' : 'error'}
                    size="small"
                />
            ),
        },
        { field: 'role', headerName: 'Vai trò', width: 140 },
        { field: 'age', headerName: 'Tuổi', width: 70 },
        { field: 'version', headerName: 'Phiên bản', width: 130 },
        { field: 'internalIp', headerName: 'IP Nội bộ', width: 150 },
        {
            field: 'cpu',
            headerName: 'CPU (Alloc/ Total)',
            width: 130,
            renderCell: (params) =>
                `${params.row.cpuAllocatable}/${params.row.cpuCapacity}`,
        }
        ,
        {
            field: 'memory',
            headerName: 'Mem (Alloc/ Total)',
            width: 140,
            renderCell: (params) =>
                `${params.row.memoryAllocatable}/${params.row.memoryCapacity}`,
        },
        { field: 'podsAllocatable', headerName: 'Pods Allocatable', width: 140 },
        {
            field: 'actions',
            headerName: 'Hành động',
            width: 140,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {

                const nodeName = params.row.name;
                const role = params.row.role;

                if (role === "master" || role === "MASTER") {
                    return (
                        <Chip label="Protected" size="small" />
                    );
                }

                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteNode(nodeName)}
                        >
                            Delete
                        </Button>
                    </Box>
                );
            }
        }


    ];
    // Bảo vệ render
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

    // Thêm kiểm tra này để tránh render DataGrid khi chưa có data
    if (nodes.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 3 }}>
                Không có node nào được tìm thấy. Vui lòng kiểm tra kết nối Kubernetes.
            </Alert>
        );
    }

    return (
        <>
            <Box
                sx={{
                    p: 2,  // giảm padding nếu cần
                    // Xóa minHeight: '100vh' để tránh kháng cự cuối trang (dashboard đã xử lý height)
                    // backgroundColor: 'background.default',  // CssBaseline đã lo body, không cần set lại
                    color: 'text.primary',
                }}
            >
                <Typography variant="h5" gutterBottom>
                    Danh sách Nodes Kubernetes
                </Typography>

                <DataGrid
                    rows={nodes}
                    columns={columns}
                    getRowId={(row) => row.name || 'unknown'}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
                    }}
                    disableRowSelectionOnClick
                    autoHeight
                    density="compact"
                    sx={[
                        {
                            // Style chung (áp dụng cho cả light & dark)
                            backgroundColor: 'background.paper',
                            border: 0,
                            borderRadius: 2,
                            overflow: 'hidden',

                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'grey.500',      // gray-500 light (MUI palette)
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
                                borderColor: 'grey.800',          // gray-800 light
                                '&:hover': {
                                    backgroundColor: 'action.hover', // MUI tự động hover (light: gray nhạt)
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
                                color: 'primary.main',            // primary.main light: blue-600/700
                            },

                            '& .MuiDataGrid-cell:not([data-field="name"])': {
                                color: 'text.secondary',          // text.secondary light: gray-600/700
                            },

                            '& .MuiDataGrid-cell[data-field="kubeletVersion"], & .MuiDataGrid-cell[data-field="internalIP"]': {
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                color: 'text.secondary',
                            },

                            '& .MuiChip-root': {
                                fontSize: '0.75rem',
                            },
                        },

                        // Dark mode override – dùng applyStyles để MUI tự inject CSS vars
                        (theme) => theme.applyStyles('dark', {
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'grey.700',      // gray-700 dark
                            },

                            '& .MuiDataGrid-row': {
                                borderColor: 'grey.700',
                                '&:hover': {
                                    backgroundColor: 'action.hover', // MUI tự động hover dark (gray đậm hơn)
                                },
                            },

                            '& .MuiDataGrid-cell[data-field="name"]': {
                                color: 'primary.light',           // primary.light dark: blue sáng hơn (blue-400)
                            },

                            '& .MuiDataGrid-cell:not([data-field="name"])': {
                                color: 'text.secondary',          // text.secondary dark: gray-400/300
                            },

                            '& .MuiDataGrid-cell[data-field="kubeletVersion"], & .MuiDataGrid-cell[data-field="internalIP"]': {
                                color: 'text.secondary',
                            },
                        }),
                    ]}
                    hideFooter
                />
            </Box>

            {ConfirmComponent}
        </>
    );
};

export default NodesPage;