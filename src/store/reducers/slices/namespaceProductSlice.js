import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND_URL = import.meta.env.VITE_BACK_END_URL;

// Async thunk gọi API
export const fetchProjectNamespaces = createAsyncThunk(
    "namespaces/fetchProjectNamespaces",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/namespaces/project-namespaces`);
            if (!res.ok) {
                return rejectWithValue("Failed to fetch namespaces");
            }
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const namespaceProductSlice = createSlice({
    name: "namespaces",
    initialState: {
        list: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectNamespaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectNamespaces.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchProjectNamespaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Error loading namespaces";
            });
    }
});

export default namespaceProductSlice.reducer;