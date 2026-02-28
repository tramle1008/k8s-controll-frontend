
import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Outlet để render nội dung trang con
import Sidebar from '../Admin/Sidebar';
import TopNav from '../Admin/TopNav';


export default function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
            {/* Sidebar – luôn giữ nguyên */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation – giống Rancher, có nút toggle sidebar */}
                <TopNav onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

                {/* Nội dung trang con sẽ render ở đây */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />  {/* ← Đây là nơi render NodesPage, AdminDashboard, PodsPage... */}
                </main>
            </div>
        </div>
    );
}