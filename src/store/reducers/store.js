// src/store/reducers/store.js
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import nodesReducer from './slices/nodesSlice';
import podsReducer from './slices/podsSlice'
import podSummaryReducer from './slices/podSummarySlice';
import clusterReducer from './slices/clusterSlice';
import deploymentsReducer from './slices/deploymentSlice';
import statefulsetsReducer from "./slices/statefulsetSlice";
import configMapReducer from "./slices/configMapSlice";
import namespaceReducer from "./slices/namespaceSlice";
import secretReducer from "./slices/secretSlice";
import pvcReducer from "./slices/pvcSlice";
import metricsClusterReducer from "./slices/metricsClusterSlice";
import namespaceProductReducer from "./slices/namespaceProductSlice";

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
        cluster: clusterReducer,
        deployments: deploymentsReducer,
        statefulsets: statefulsetsReducer,
        configmaps: configMapReducer,
        namespaces: namespaceReducer,
        secrets: secretReducer,
        pvcs: pvcReducer,
        metricsCluster: metricsClusterReducer,
        namespaceProduct: namespaceProductReducer,
    },
    preloadedState: initialState,
});

export default store;

