import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:8080/api/namespaces";

/*
========================
GET NAMESPACES
========================
*/
export const fetchNamespaces = createAsyncThunk(
    "namespaces/fetchNamespaces",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(API);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

/*
========================
CREATE NAMESPACE
========================
*/
export const createNamespace = createAsyncThunk(
    "namespaces/createNamespace",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axios.post(API, data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

/*
========================
DELETE NAMESPACE
========================
*/
export const deleteNamespace = createAsyncThunk(
    "namespaces/deleteNamespace",
    async (name, { rejectWithValue }) => {
        try {
            await axios.delete(`${API}/${name}`);
            return name;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

/*
========================
CREATE NAMESPACE FROM YAML
========================
*/
export const createNamespaceYaml = createAsyncThunk(
    "namespaces/createNamespaceYaml",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(`${API}/yaml`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

/*
========================
SLICE
========================
*/

const namespaceSlice = createSlice({
    name: "namespaces",
    initialState: {
        namespaces: [],
        loading: false,
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder

            /* FETCH */
            .addCase(fetchNamespaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNamespaces.fulfilled, (state, action) => {
                state.loading = false;
                state.namespaces = action.payload;
            })
            .addCase(fetchNamespaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* CREATE */
            .addCase(createNamespace.fulfilled, (state) => {
                state.loading = false;
            })

            /* DELETE */
            .addCase(deleteNamespace.fulfilled, (state, action) => {
                state.namespaces = state.namespaces.filter(
                    (ns) => ns.name !== action.payload
                );
            });
    },
});

export default namespaceSlice.reducer;