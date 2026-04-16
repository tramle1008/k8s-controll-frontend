import { useTheme } from "../../../context/ThemeContext";

export default function LoginNavbar() {
    const { theme, toggleTheme } = useTheme();

    // Để Navbar tự re-render → chỉ dùng themeContext
    const effectiveTheme =
        theme === "system"
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : theme;

    const isDark = effectiveTheme === "dark";
    const icon = isDark ? "sun" : "moon";

    const username = localStorage.getItem("username");

    return (
        <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4 z-20">

            {/* Logo */}
            <h1 className="text-blue-400 font-bold text-lg flex items-center gap-2 drop-shadow">
                <i className="fas fa-cubes"></i>
                Kubernetes Dashboard
            </h1>

            <div className="flex items-center gap-5">

                {/* Toggle Theme */}
                <button
                    onClick={toggleTheme}
                    className="transition hover:scale-110"
                    title="Đổi giao diện"
                >
                    <i
                        className={`fas fa-${icon} text-xl ${isDark ? "text-yellow-300" : "text-gray-700"
                            }`}
                    ></i>
                </button>

                {/* Username */}
                <span className={`${isDark ? "text-gray-200" : "text-gray-800"} text-sm`}>
                    {username || "Guest"}
                </span>
            </div>
        </header>
    );
}