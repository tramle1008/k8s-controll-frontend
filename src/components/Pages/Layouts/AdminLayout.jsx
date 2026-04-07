
import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Outlet để render nội dung trang con
import Sidebar from '../Admin/Sidebar';
import TopNav from '../Admin/TopNav';


export default function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNav onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}