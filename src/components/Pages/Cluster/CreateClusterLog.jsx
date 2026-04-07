import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { Box, Paper, Typography } from "@mui/material";

export default function CreateClusterLog({ clusterId, onFinish }) {

    const [logs, setLogs] = useState([]);
    const logEndRef = useRef(null);

    useEffect(() => {

        if (!clusterId) return;

        const socket = new SockJS("http://localhost:8080/ws");

        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000
        });

        client.onConnect = () => {

            client.subscribe(`/topic/cluster/${clusterId}`, (message) => {

                const log = message.body;

                setLogs(prev => [...prev, log]);

                if (log.includes("Cluster ACTIVE")) {
                    onFinish?.("success");
                }

                if (log.includes("Deploy FAILED")) {
                    onFinish?.("failed");
                }

            });
        };

        client.activate();

        return () => client.deactivate();

    }, [clusterId]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <Paper className="bg-black text-green-400 p-6 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            <Typography className="text-blue-400 mb-4">
                Cluster Deployment Logs
            </Typography>

            <Box>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
                <div ref={logEndRef} />
            </Box>
        </Paper>
    );
}