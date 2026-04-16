import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import LoginNavbar from "./LoginNavbar";
import { useTheme } from "../../../context/ThemeContext";


export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { theme } = useTheme();

    const resolvedTheme =
        theme === "system"
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : theme;

    const isDark = resolvedTheme === "dark";

    // Hình nền theo theme
    const lightBg = "/k8s-light.jpg";
    const darkBg = "/k8s-dark.jpg";

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACK_END_URL || "http://localhost:8080"}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Đăng nhập thất bại");
            }

            const data = await res.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            localStorage.setItem("clusterId", data.clusterId);

            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${isDark ? darkBg : lightBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Overlay mờ giúp form nổi bật */}
            <div className="absolute inset-0  backdrop-blur-sm dark:bg-black/60"></div>

            <LoginNavbar />

            <div className="flex flex-1 items-center justify-center relative p-5">

                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-400 drop-shadow">
                            K8s Dashboard
                        </h1>
                        <p className={`${isDark ? "text-gray-300" : "text-gray-800"} text-sm`}>
                            Quản lý Kubernetes Cluster
                        </p>
                    </div>

                    <div
                        className={`
                            rounded-xl shadow-xl border backdrop-blur-md p-8
                            ${isDark ? "bg-gray-900/70 border-gray-700" : "bg-white/80 border-gray-300"}
                        `}
                    >
                        <h2
                            className={`
                                text-2xl font-semibold text-center mb-6
                                ${isDark ? "text-white" : "text-gray-900"}
                            `}
                        >
                            Đăng nhập
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* USERNAME */}
                            <TextField
                                fullWidth
                                label="Tên đăng nhập"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: isDark ? "#d1d5db" : "#555" },
                                }}
                                InputProps={{
                                    style: { color: isDark ? "#e5e7eb" : "#111" },
                                }}
                                sx={{
                                    mb: 2, // khoảng cách bạn yêu cầu
                                }}
                            />

                            {/* PASSWORD */}
                            <TextField
                                fullWidth
                                label="Mật khẩu"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: isDark ? "#d1d5db" : "#555" },
                                }}
                                InputProps={{
                                    style: { color: isDark ? "#e5e7eb" : "#111" },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ color: isDark ? "#d1d5db" : "#444" }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.6,
                                    textTransform: "none",
                                    backgroundColor: "#3b82f6",
                                    "&:hover": { backgroundColor: "#2563eb" },
                                }}
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </form>


                    </div>

                    <p className="text-center text-gray-300 dark:text-gray-400 mt-6 text-xs drop-shadow">
                        © {new Date().getFullYear()} Kubernetes Dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}