import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coreApi } from "../../../api/api";

// ================= FETCH ACTIVE LIST =================
export const fetchAllClusterActive = createAsyncThunk(
    "cluster/fetchAllClusterActive",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await coreApi.get("/clusters/active");
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ================= GET CURRENT CLUSTER =================
export const fetchCurrentCluster = createAsyncThunk(
    "cluster/fetchCurrentCluster",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await coreApi.get("/clusters/current");
            return data; // { id, name }
        } catch (error) {
            if (error.response?.status === 204) {
                return null;
            }

            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ================= SWITCH CLUSTER =================
export const switchCluster = createAsyncThunk(
    "cluster/switchCluster",
    async (clusterId, { rejectWithValue }) => {
        try {
            await coreApi.post(`/clusters/${clusterId}/switch`);
            return clusterId;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const clusterSlice = createSlice({
    name: "cluster",
    initialState: {
        clusters: [],
        selectedClusterId: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllClusterActive.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllClusterActive.fulfilled, (state, action) => {
                state.loading = false;
                state.clusters = action.payload;
            })
            .addCase(fetchAllClusterActive.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchCurrentCluster.fulfilled, (state, action) => {
                state.selectedClusterId = action.payload?.id ?? null;
            })
            .addCase(fetchCurrentCluster.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(switchCluster.fulfilled, (state, action) => {
                state.selectedClusterId = action.payload;
            })
            .addCase(switchCluster.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default clusterSlice.reducer;