import { useTheme } from "../../../../src/context/ThemeContext";

export default function LoginNavbar() {
    const { theme, toggleTheme } = useTheme();

    // xử lý nếu theme = system
    const resolvedTheme =
        theme === "system"
            ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            : theme;

    const icon = resolvedTheme === "dark" ? "sun" : "moon";

    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4">

            {/* Logo */}
            <h1 className="text-blue-400 font-bold text-lg flex items-center gap-2">
                <i className="fas fa-cubes"></i>

            </h1>

            <div className="flex items-center gap-5">

                {/* Toggle theme */}
                <button
                    onClick={toggleTheme}
                    className="text-gray-300 hover:text-white transition-transform hover:rotate-12"
                    title={`Switch theme`}
                >
                    <i className={`fas fa-${icon} text-xl`}></i>
                </button>

                {/* User */}
                <span className="text-sm text-gray-300">
                    {user?.username || "Guest"}
                </span>

            </div>
        </header>
    );
}