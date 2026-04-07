// src/redux/slices/metricsClusterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


const BACKEND_URL = import.meta.env.VITE_BACK_END_URL;

export const fetchClusterMetrics = createAsyncThunk(
    "metrics/fetchClusterMetrics",
    async (_, thunkAPI) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/k8s/metrics`);
            return await res.json();
        } catch (error) {
            console.error("Fetch metrics error:", error);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const metricsClusterSlice = createSlice({
    name: "metricsCluster",
    initialState: {
        metrics: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClusterMetrics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClusterMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.metrics = action.payload;
            })
            .addCase(fetchClusterMetrics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default metricsClusterSlice.reducer;