import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080';

/* =========================
   Fetch Deployments
========================= */
export const fetchDeployments = createAsyncThunk(
    'deployments/fetchDeployments',
    async () => {
        const response = await axios.get(`http://localhost:8080/api/deployments`);
        return response.data;
    }
);

const deploymentSlice = createSlice({
    name: 'deployments',
    initialState: {
        deployments: [],
        loading: false,
        error: null,
    },

    reducers: {

        /* =========================
           Update realtime từ websocket
        ========================= */
        updateDeploymentRealtime: (state, action) => {

            const index = state.deployments.findIndex(
                d =>
                    d.namespace === action.payload.namespace &&
                    d.name === action.payload.name
            );

            if (index !== -1) {
                state.deployments[index] = {
                    ...state.deployments[index],
                    ...action.payload
                };
            } else {
                state.deployments.push(action.payload);
            }
        },

    },

    extraReducers: (builder) => {
        builder

            /* =========================
               FETCH PENDING
            ========================= */
            .addCase(fetchDeployments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            /* =========================
               FETCH SUCCESS
            ========================= */
            .addCase(fetchDeployments.fulfilled, (state, action) => {
                state.loading = false;
                state.deployments = action.payload;
            })

            /* =========================
               FETCH ERROR
            ========================= */
            .addCase(fetchDeployments.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || 'Không thể tải danh sách deployments';
            });
    },
});

export const { updateDeploymentRealtime } = deploymentSlice.actions;

export default deploymentSlice.reducer;