import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const BottomTerminal = forwardRef(({ isOpen, onClose, sshInfo }, containerRef) => {
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const wsRef = useRef(null);
    const innerTerminalRef = useRef(null);

    const [height, setHeight] = useState(320);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    // === Resize handlers ===
    const handleMouseDown = useCallback((e) => {
        e.stopPropagation();
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startHeightRef.current = height;

        document.documentElement.style.cursor = "ns-resize";
        document.documentElement.style.userSelect = "none";
    }, [height]);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;

        const deltaY = startYRef.current - e.clientY;
        let newHeight = startHeightRef.current + deltaY;

        newHeight = Math.max(200, Math.min(900, newHeight)); // min 200px, max 900px

        setHeight(newHeight);
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        document.documentElement.style.cursor = "default";
        document.documentElement.style.userSelect = "auto";

        // Fit terminal sau khi resize
        setTimeout(() => fitAddonRef.current?.fit(), 20);
    }, []);

    // Global mouse events
    useEffect(() => {
        const onMove = (e) => handleMouseMove(e);
        const onUp = () => handleMouseUp();

        if (isDraggingRef.current) {
            window.addEventListener("mousemove", onMove, { passive: false });
            window.addEventListener("mouseup", onUp, { passive: false });
        }

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isDraggingRef.current, handleMouseMove, handleMouseUp]);

    // Tạo Terminal
    useEffect(() => {
        if (!isOpen || !sshInfo || !innerTerminalRef.current) return;

        xtermRef.current?.dispose();
        wsRef.current?.close();

        xtermRef.current = new Terminal({
            theme: { background: "#1e1e1e" },
            cursorBlink: true,
            convertEol: true,
            fontSize: 14,
            lineHeight: 1.15,
            scrollback: 1000,
        });

        fitAddonRef.current = new FitAddon();
        xtermRef.current.loadAddon(fitAddonRef.current);

        xtermRef.current.open(innerTerminalRef.current);
        fitAddonRef.current.fit();

        wsRef.current = new WebSocket(
            `ws://localhost:8080/ws/ssh?user=${sshInfo.username}&host=${sshInfo.host}`
        );

        wsRef.current.onmessage = (msg) => xtermRef.current?.write(msg.data);
        xtermRef.current.onData((data) => {
            wsRef.current?.send(data);
        });

        wsRef.current.onclose = () => {
            xtermRef.current?.write("\r\n[Disconnected]\r\n");
        };

        return () => {
            wsRef.current?.close();
            xtermRef.current?.dispose();
        };
    }, [isOpen, sshInfo]);

    // Refit khi height thay đổi
    useEffect(() => {
        if (fitAddonRef.current && isOpen) {
            const timer = setTimeout(() => fitAddonRef.current.fit(), 30);
            return () => clearTimeout(timer);
        }
    }, [height, isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={containerRef}
            style={{
                height: `${height}px`,
                minHeight: "200px",
                background: "#1e1e1e",
                borderTop: "2px solid #555",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 100,           // tăng z-index để chắc chắn
                boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
            }}
        >
            {/* Header */}
            <div style={{
                background: "#2b2b2b",
                color: "white",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
            }}>
                <span style={{ fontWeight: 500 }}>Node Terminal — {sshInfo?.host}</span>
                <button
                    onClick={onClose}
                    style={{ background: "none", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer" }}
                >
                    ✕
                </button>
            </div>

            {/* Thanh kéo - tăng độ dày và dễ click hơn */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    height: "6px",
                    background: "#666",
                    cursor: "ns-resize",
                    position: "relative",
                    zIndex: 200,
                }}
            >
                <div style={{
                    position: "absolute",
                    top: "2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60px",
                    height: "2px",
                    background: "#aaa",
                    borderRadius: "2px",
                }} />
            </div>

            {/* Terminal content */}
            <div style={{
                flex: 1,
                padding: "8px 12px",
                boxSizing: "border-box",
                overflow: "hidden",
                background: "#1e1e1e",
            }}>
                <div
                    ref={innerTerminalRef}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
});

export default BottomTerminal;