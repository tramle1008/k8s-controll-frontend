// src/store/slices/nodesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';
import toast from 'react-hot-toast';

// ==========================
// Async fetch ban đầu
// ==========================
export const fetchNodes = createAsyncThunk(
    'nodes/fetchNodes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/nodes');
            return response.data;
        } catch (error) {
            console.error('Lỗi khi fetch nodes:', error);
            toast.error('Không thể lấy danh sách nodes');
            return rejectWithValue(
                error.response?.data?.message || 'Không thể lấy danh sách nodes'
            );
        }
    }
);

const initialState = {
    nodes: [],
    loading: false,
    error: null,
};

const nodesSlice = createSlice({
    name: 'nodes',
    initialState,
    reducers: {

        // ==========================
        // 🔥 Realtime update từ WebSocket
        // ==========================
        updateNodeRealtime: (state, action) => {
            const updated = action.payload;

            const index = state.nodes.findIndex(
                (node) => node.name === updated.name
            );

            if (index !== -1) {
                // chỉ update status
                state.nodes[index].status = updated.ready ? "True" : "False";
            }
        },

        clearNodesError: (state) => {
            state.error = null;
        },

        resetNodes: (state) => {
            state.nodes = [];
            state.loading = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchNodes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNodes.fulfilled, (state, action) => {
                state.loading = false;
                state.nodes = action.payload;
            })
            .addCase(fetchNodes.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || 'Có lỗi xảy ra khi tải nodes';
            });
    },
});

export const {
    clearNodesError,
    resetNodes,
    updateNodeRealtime
} = nodesSlice.actions;

export default nodesSlice.reducer;