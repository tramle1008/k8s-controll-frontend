import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

const menuGroups = [
    {
        title: 'Cluster',
        items: [
            {
                icon: 'add',
                label: 'Create',
                to: "/cluster/create",
                roles: ["ADMIN"],
            },
            {
                icon: 'gauge-high',
                label: 'Overview',
                to: '/',
                roles: ["ADMIN", "USER"],
            },
            {
                icon: 'server',
                label: 'Nodes',
                to: '/nodes',
                roles: ["ADMIN"],
            },

            // ===== USER + ADMIN =====
            {
                icon: 'cube',
                label: 'Workloads',
                roles: ["ADMIN", "USER"],
                children: [
                    { label: 'Name Space', to: '/workloads/namespace' },
                    { label: 'Deployments', to: '/workloads/deployments' },
                    { label: 'StatefulSet', to: '/workloads/statefulset' },
                    { label: 'ConfigMaps', to: '/workloads/configmap' },
                    { label: 'Secrets', to: '/workloads/secrets' },
                    { label: 'HPA', to: '/workloads/hpa' },
                    { label: 'Pods', to: '/workloads/pods' },
                ],
            },

            // ===== 2 CẤP NETWORK =====
            {
                icon: 'network-wired',
                label: 'Networking',
                roles: ["ADMIN", "USER"],
                children: [
                    { label: 'Services', to: '/networking/services' }, // USER dùng được
                ],
            },
            {
                icon: 'globe',
                label: 'Ingress',
                roles: ["ADMIN"],
                children: [
                    { label: 'Ingress', to: '/networking/ingress' },
                ],
            },
            {
                icon: 'database',
                label: 'Storage',
                roles: ["ADMIN"],
                children: [
                    { label: 'PVC', to: '/storage/pvc' },
                    { label: 'PV', to: '/storage/pv' },
                ],
            },
            {
                icon: 'cubes',
                label: 'Manager Cluster',
                roles: ["ADMIN"],
                children: [
                    { label: 'Manager', to: '/cluster/manager' },
                    { label: 'Users', to: '/cluster/users' },
                    { label: 'Registry', to: '/cluster/registry' },
                ],
            },

            // ===== USER =====
            {
                icon: 'user',
                label: 'Profile',
                roles: ["USER"],
                children: [
                    { label: 'My Info', to: '/user/info' },
                ],
            }
        ],
    },
];


export default function Sidebar({ collapsed, onToggle }) {

    //
    const [openMenus, setOpenMenus] = useState({});

    const [role, setRole] = useState(localStorage.getItem("role") || "USER");
    useEffect(() => {
        const updateRole = () => {
            setRole(localStorage.getItem("role") || "USER");
        };
        window.addEventListener("storage", updateRole);
        return () => window.removeEventListener("storage", updateRole);
    }, []);
    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    return (
        <aside
            className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 h-screen overflow-y-auto
      ${collapsed ? 'w-16' : 'w-64'}`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <Link to="/">
                    {!collapsed && (
                        <span className={`font-bold text-2xl ml-3 ${role === "ADMIN" ? "text-blue-400" : "text-gray-400"
                            }`}>
                            {role === "ADMIN" ? "Admin" : "User"}
                        </span>
                    )}
                </Link>

                <button onClick={onToggle} className="text-gray-400 hover:text-white">
                    <i className={`fas fa-${collapsed ? 'expand' : 'compress'} fa-fw`}></i>
                </button>
            </div>

            {/* Menu */}
            <nav className="mt-4 px-2 space-y-6">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        {!collapsed && (
                            <div className="px-3 mb-2 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                {group.title}
                            </div>
                        )}

                        {group.items
                            .filter(item => !item.roles || item.roles.includes(role))
                            .map((item) => (
                                <div key={item.label}>
                                    {item.children && item.children.some(child => !child.roles || child.roles.includes(role)) ? (
                                        <>
                                            <button

                                                onClick={() => toggleMenu(item.label)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                                                    {!collapsed && <span>{item.label}</span>}
                                                </div>
                                                {!collapsed && (
                                                    <i
                                                        className={`fas fa-chevron-${openMenus[item.label] ? 'down' : 'right'
                                                            } text-xs`}
                                                    ></i>
                                                )}
                                            </button>

                                            {openMenus[item.label] && !collapsed && (
                                                <div className="ml-8 mt-1 space-y-1">
                                                    {item.children
                                                        .filter(child => !child.roles || child.roles.includes(role))
                                                        .map((child) => (
                                                            <NavLink
                                                                key={child.label}
                                                                to={child.to}
                                                                className={({ isActive }) =>
                                                                    `block px-3 py-2 rounded-md text-sm transition-colors
                              ${isActive
                                                                        ? 'bg-blue-900/40 text-blue-300'
                                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {child.label}
                                                            </NavLink>
                                                        ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            end={item.to === '/'}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                      ${isActive
                                                    ? 'bg-blue-900/40 text-blue-300'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`
                                            }
                                        >
                                            <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                                            {!collapsed && <span>{item.label}</span>}
                                        </NavLink>
                                    )}
                                </div>
                            ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}