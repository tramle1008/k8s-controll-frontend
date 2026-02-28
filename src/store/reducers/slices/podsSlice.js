import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

export const fetchPods = createAsyncThunk(
    'pods/fetchPods',
    async () => {
        const response = await axios.get(`${BACKEND_URL}/api/pods/details`);
        return response.data;
    }
);

const podsSlice = createSlice({
    name: 'pods',
    initialState: {
        pods: [],
        loading: false,
        error: null,
    },
    reducers: {
        updatePodRealtime: (state, action) => {
            const index = state.pods.findIndex(
                p => p.namespace === action.payload.namespace && p.name === action.payload.name
            );
            if (index !== -1) {
                state.pods[index] = { ...state.pods[index], ...action.payload };
            } else {
                state.pods.push(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPods.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPods.fulfilled, (state, action) => {
                state.loading = false;
                state.pods = action.payload;
            })
            .addCase(fetchPods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Không thể tải danh sách pods';
            });
    },
});

export const { updatePodRealtime } = podsSlice.actions;
export default podsSlice.reducer;