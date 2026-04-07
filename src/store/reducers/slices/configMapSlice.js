import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coreApi } from "../../../api/api";

/* GET CONFIGMAPS */

export const fetchConfigMaps = createAsyncThunk(
    "configmaps/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await coreApi.get("/configmaps");
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "Fetch configmaps failed"
            );
        }
    }
);

/* CREATE JSON */

export const createConfigMap = createAsyncThunk(
    "configmaps/create",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await coreApi.post("/configmaps", payload);
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "Create configmap failed"
            );
        }
    }
);

/* CREATE FILE */

export const uploadConfigMapFile = createAsyncThunk(
    "configmaps/uploadFile",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await coreApi.post("/configmaps/file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "Upload configmap file failed"
            );
        }
    }
);

/* DELETE */

export const deleteConfigMap = createAsyncThunk(
    "configmaps/delete",
    async ({ namespace, name }, { rejectWithValue }) => {
        try {
            await coreApi.delete(`/configmaps/${namespace}/${name}`);
            return { namespace, name };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "Delete configmap failed"
            );
        }
    }
);

const configMapSlice = createSlice({
    name: "configmaps",

    initialState: {
        items: [],
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchConfigMaps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConfigMaps.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchConfigMaps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createConfigMap.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConfigMap.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createConfigMap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(uploadConfigMapFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadConfigMapFile.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(uploadConfigMapFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteConfigMap.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteConfigMap.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(
                    (cm) =>
                        !(
                            cm.namespace === action.payload.namespace &&
                            cm.name === action.payload.name
                        )
                );
            })
            .addCase(deleteConfigMap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default configMapSlice.reducer;