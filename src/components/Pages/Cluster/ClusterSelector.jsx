import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllClusterActive,
    fetchCurrentCluster,
    switchCluster
} from "../../../store/reducers/slices/clusterSlice";

function ClusterSelector() {
    const role = localStorage.getItem("role");
    const userClusterId = Number(localStorage.getItem("clusterId"));

    const dispatch = useDispatch();

    const { clusters, selectedClusterId, loading } = useSelector(
        (state) => state.cluster
    );
    useEffect(() => {
        if (role === "ADMIN") {
            dispatch(fetchAllClusterActive());
            dispatch(fetchCurrentCluster());
        } else if (role === "USER") {
            if (userClusterId) {
                dispatch(switchCluster(userClusterId));
            }
        }
    }, [dispatch, role, userClusterId]);

    const handleChange = async (e) => {
        const clusterId = Number(e.target.value);

        if (!clusterId) return;

        try {
            await dispatch(switchCluster(clusterId)).unwrap();
        } catch (err) {
            console.error("Switch cluster lỗi:", err);
        }
    };
    if (role === "USER") {
        return (
            <span className="text-white">
                Cluster {userClusterId}
            </span>
        );
    }

    return (
        <select
            className="bg-gray-800 text-white px-2 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClusterId ? String(selectedClusterId) : ""}
            onChange={handleChange}
            disabled={loading}
        >
            <option value="" disabled>
                Chọn Cluster
            </option>

            {clusters.map((cluster) => (
                <option key={cluster.id} value={String(cluster.id)}>
                    {cluster.name}
                </option>
            ))}
        </select>
    );
}

export default ClusterSelector;