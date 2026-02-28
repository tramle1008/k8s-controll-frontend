// src/store/reducers/store.js
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import nodesReducer from './slices/nodesSlice';
import podsReducer from './slices/podsSlice'
import podSummaryReducer from './slices/podSummarySlice';

const user = localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth")) : [];

const initialState = {
    auth: { user: user },
};

const store = configureStore({
    reducer: {
        auth: authReducer,
        nodes: nodesReducer,
        podSummary: podSummaryReducer,
        pods: podsReducer,
    },
    preloadedState: initialState,
});

export default store;

