import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coreApi } from "../../../api/api";

/* GET SECRETS */
export const fetchSecrets = createAsyncThunk(
    "secrets/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await coreApi.get("/secrets");
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || err.message || "Fetch secrets failed"
            );
        }
    }
);

/* CREATE SECRET */
export const createSecret = createAsyncThunk(
    "secrets/create",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await coreApi.post("/secrets", payload);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || err.message || "Create secret failed"
            );
        }
    }
);

/* UPLOAD SECRET FILE */
export const uploadSecretFile = createAsyncThunk(
    "secrets/uploadFile",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await coreApi.post("/secrets/file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || err.message || "Upload secret file failed"
            );
        }
    }
);

/* DELETE SECRET */
export const deleteSecret = createAsyncThunk(
    "secrets/delete",
    async ({ namespace, name }, { rejectWithValue }) => {
        try {
            await coreApi.delete(`/secrets/${namespace}/${name}`);
            return { namespace, name };
        } catch (err) {
            return rejectWithValue(
                err.response?.data || err.message || "Delete secret failed"
            );
        }
    }
);

const secretSlice = createSlice({
    name: "secrets",
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSecrets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSecrets.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSecrets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Fetch secrets failed";
            })

            .addCase(deleteSecret.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (item) =>
                        !(
                            item.namespace === action.payload.namespace &&
                            item.name === action.payload.name
                        )
                );
            })

            .addCase(createSecret.rejected, (state, action) => {
                state.error = action.payload || "Create secret failed";
            })

            .addCase(uploadSecretFile.rejected, (state, action) => {
                state.error = action.payload || "Upload secret file failed";
            });
    }
});

export default secretSlice.reducer;