import { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

export default function TopNav({ onToggleSidebar }) {
    const { theme, toggleTheme } = useTheme();
    const icon = theme === 'dark' ? 'sun' : 'moon';
    return (
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="text-gray-300 hover:text-white lg:hidden">
                    <i className="fas fa-bars text-xl"></i>
                </button>

                {/* Cluster Switcher (giả lập) */}
                <div className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded text-sm">
                    <i className="fas fa-cubes text-blue-400"></i>
                    <span
                        className="text-white"
                    >
                        local-cluster
                    </span>
                    {/* <i className="fas fa-chevron-down text-xs text-gray-500"></i> */}
                </div>

                <button className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded text-sm">
                    <i className="fa-solid fa-file-import text-blue-400 text-xs"></i>
                    <span className='text-white'>
                        import
                    </span></button>

            </div>

            <div className="flex items-center gap-6">

                <button
                    onClick={toggleTheme}
                    className="text-gray-300 hover:text-white focus:outline-none transition-transform hover:rotate-12"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                    <i className={`fas fa-${icon} text-xl`}></i>
                </button>
                {/* User */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">Tram</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        TY
                    </div>
                </div>
            </div>
        </header>
    );
}