import { useRef, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import ClusterSelector from '../Cluster/ClusterSelector';
import { useNavigate } from "react-router-dom";
import { useSnackbar } from 'notistack';

export default function TopNav({ onToggleSidebar }) {
    const { theme, toggleTheme } = useTheme();
    const icon = theme === 'dark' ? 'sun' : 'moon';
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "Guest";
    const initials = username.split(" ").map(n => n[0]).join("").toUpperCase();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const role = localStorage.getItem("role") || "USER";
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/k8s/apply", {
                method: "POST",
                body: formData,
            });

            const text = await res.text();

            if (!res.ok) {
                enqueueSnackbar(text || "Upload failed", {
                    variant: "error",
                    autoHideDuration: 2000
                });
                return;
            }

            enqueueSnackbar(text || "Upload success", {
                variant: "success",
                autoHideDuration: 1000
            });

        } catch (err) {
            console.log(err);
        }

        e.target.value = null; // reset
    };

    return (
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">

            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="text-gray-300 hover:text-white lg:hidden">
                    <i className="fas fa-bars text-xl"></i>
                </button>

                <div className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded text-sm">
                    <i className="fas fa-cubes text-blue-400"></i>
                    <ClusterSelector />
                </div>
            </div>

            <div className="flex items-center gap-6">

                {/* APPLY YAML */}
                {role === "ADMIN" && (
                    <button
                        onClick={() => {
                            fileInputRef.current?.click();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2"
                    >
                        <i className="fas fa-file-upload"></i>
                        Apply YAML
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".yaml,.yml"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="text-gray-300 hover:text-white"
                >
                    <i className={`fas fa-${icon} text-xl`}></i>
                </button>

                {/* USER DROPDOWN */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">{username}</span>
                    <div className="relative">
                        <div
                            onClick={() => setOpen(!open)}
                            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer"
                        >
                            {initials}
                        </div>

                        {open && (
                            <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                >
                                    <i className="fas fa-sign-out-alt mr-2"></i>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}