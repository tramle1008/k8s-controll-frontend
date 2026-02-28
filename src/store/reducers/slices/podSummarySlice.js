// src/store/reducers/slices/podSummarySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    totalPods: 0,
    runningPods: 0,
    pendingPods: 0,
    failedPods: 0,
    succeededPods: 0,
    unknownPods: 0,
    alertedPods: 0,
    lastUpdated: null,
    loading: false,
    error: null
};

const podSummarySlice = createSlice({
    name: 'podSummary',
    initialState,
    reducers: {
        updatePodSummary: (state, action) => {
            return {
                ...state,
                ...action.payload,
                loading: false,
                error: null
            };
        },
        setPodSummaryLoading: (state) => {
            state.loading = true;
        },
        setPodSummaryError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { updatePodSummary, setPodSummaryLoading, setPodSummaryError } = podSummarySlice.actions;
export default podSummarySlice.reducer;