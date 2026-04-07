import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND_URL =
    import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

export const fetchStatefulsets = createAsyncThunk(
    "statefulsets/fetchStatefulsets",
    async () => {

        const res = await fetch(`${BACKEND_URL}/api/statefulsets`);

        if (!res.ok) {
            throw new Error("Không thể tải StatefulSets");
        }

        return res.json();

    }
);

const statefulsetSlice = createSlice({
    name: "statefulsets",

    initialState: {
        statefulsets: [],
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {

        builder

            .addCase(fetchStatefulsets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchStatefulsets.fulfilled, (state, action) => {
                state.loading = false;
                state.statefulsets = action.payload;
            })

            .addCase(fetchStatefulsets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });

    }

});

export default statefulsetSlice.reducer;