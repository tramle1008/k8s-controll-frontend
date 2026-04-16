import { green } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function MetalLBPage() {
    const clusterId = useSelector(
        (state) => state.cluster.selectedClusterId
    );

    const [pool, setPool] = useState(null);
    const [range, setRange] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState("");

    // ======================
    // FETCH POOL
    // ======================
    const fetchPool = async () => {
        if (!clusterId) return;

        setFetching(true);
        try {
            const res = await fetch(
                `/api/metallb/${clusterId}/pool`
            );
            const data = await res.json();
            setPool(data);
        } catch (err) {
            console.error("Fetch pool error", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchPool();
    }, [clusterId]);

    // ======================
    // APPLY POOL
    // ======================
    const applyPool = async () => {
        if (!range) {
            setMessage("Please enter IP range");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(
                `/api/metallb/${clusterId}/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        range: range,
                    }),
                }
            );

            if (!res.ok) throw new Error("Apply failed");

            setRange("");
            setMessage("✅ Pool applied successfully");

            await fetchPool();
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to apply pool");
        } finally {
            setLoading(false);
        }
    };

    const autoCreatePool = async () => {
        if (!clusterId) return;

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(
                `/api/metallb/${clusterId}/fixauto`,
                {
                    method: "POST",
                }
            );

            const text = await res.text();

            if (!res.ok) throw new Error(text);

            setMessage("✅ Auto create pool thành công");

            await fetchPool();
        } catch (err) {
            console.error(err);
            setMessage("❌ Auto create thất bại");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={styles.wrapper}>

            {/* MESSAGE */}
            {message && (
                <div style={styles.messageBox}>
                    {message}
                </div>
            )}

            {/* CURRENT POOL */}
            <div style={styles.card}>
                <h3>Current IP Pool</h3>
                {clusterId && (
                    <p style={styles.clusterInfo}>
                        Cluster ID: <b>{clusterId}</b>
                    </p>
                )}
                {fetching ? (
                    <p>Loading...</p>
                ) : pool?.addresses ? (
                    <div style={styles.poolBox}>
                        {pool.addresses.map((ip, index) => (
                            <h3 key={index} style={styles.badge}>
                                {ip}
                            </h3>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#888" }}>
                        No pool configured
                    </p>
                )}
            </div>

            {/* FORM */}
            <div style={styles.card}>
                <h3>Apply New Pool</h3>

                <label style={styles.label}>
                    IP Range
                </label>

                <input
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    placeholder="192.168.235.100-192.168.235.200"
                    style={styles.input}
                />

                <div style={styles.row}>
                    <button
                        onClick={() => setRange("")}
                        style={styles.secondaryBtn}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={applyPool}
                        disabled={loading}
                        style={styles.primaryBtn}
                    >
                        {loading ? "Applying..." : "Apply Pool"}
                    </button>

                    <button
                        onClick={autoCreatePool}
                        disabled={loading}
                        style={styles.autoBtn}
                    >
                        {loading ? "Processing..." : "Auto Create"}
                    </button>

                </div>

            </div>
        </div>
    );
}

// ======================
// STYLES
// ======================
const styles = {
    wrapper: {
        padding: 20,
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "Arial",
    },
    title: {
        marginBottom: 20,
    },
    card: {
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    },
    label: {
        display: "block",
        marginBottom: 5,
        fontWeight: 500,
    },
    input: {
        width: "100%",
        padding: 10,
        borderRadius: 6,
        border: "1px solid #ccc",
        marginBottom: 10,
    },
    row: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
    },
    primaryBtn: {
        padding: "8px 14px",
        border: "2px solid green",
        color: "#16a34a",
        borderRadius: 6,
        cursor: "pointer",
    },
    autoBtn: {
        padding: "8px 14px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
    },

    secondaryBtn: {
        padding: "8px 14px",
        background: "#e5e7eb",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
    },
    poolBox: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    badge: {
        background: "#dbeafe",
        color: "#1e3a8a",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 16,
    },
    messageBox: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 6,
        background: "#f3f4f6",
    },
    clusterInfo: {
        marginTop: 10,
        fontSize: 12,
        color: "#666",
    },
};