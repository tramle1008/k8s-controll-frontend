import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coreApi } from "../../../api/api";

/* GET ALL PVCs */
export const fetchPVCs = createAsyncThunk(
    "pvcs/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await coreApi.get("/pvcs");
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to fetch PVCs"
            );
        }
    }
);

/* CREATE PVC */
export const createPVC = createAsyncThunk(
    "pvcs/create",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await coreApi.post("/pvcs", payload);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to create PVC"
            );
        }
    }
);

/* UPLOAD PVC FILE */
export const uploadPVCFile = createAsyncThunk(
    "pvcs/uploadFile",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            await coreApi.post("/pvcs/file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            return true;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to upload PVC file"
            );
        }
    }
);

/* DELETE PVC */
export const deletePVC = createAsyncThunk(
    "pvcs/delete",
    async ({ namespace, name }, { rejectWithValue }) => {
        try {
            await coreApi.delete(`/pvcs/${namespace}/${name}`);
            return { namespace, name };
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to delete PVC"
            );
        }
    }
);

const pvcSlice = createSlice({
    name: "pvcs",
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            .addCase(fetchPVCs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPVCs.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchPVCs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createPVC.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPVC.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createPVC.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(uploadPVCFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadPVCFile.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(uploadPVCFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deletePVC.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePVC.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(
                    (pvc) =>
                        !(
                            pvc.namespace === action.payload.namespace &&
                            pvc.name === action.payload.name
                        )
                );
            })
            .addCase(deletePVC.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default pvcSlice.reducer;