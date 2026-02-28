import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const menuGroups = [
    {
        title: 'Cluster',
        items: [
            {
                icon: 'gauge-high',
                label: 'Overview',
                to: '/',
            },
            {
                icon: 'server',
                label: 'Nodes',
                to: '/nodes',
            },
            {
                icon: 'cube',
                label: 'Workloads',
                children: [
                    { label: 'Pods', to: '/workloads/pods' },
                    { label: 'Deployments', to: '/workloads/deployments' },
                    { label: 'StatefulSets', to: '/workloads/statefulsets' },
                ],
            },
            {
                icon: 'network-wired',
                label: 'Networking',
                children: [
                    { label: 'Services', to: '/networking/services' },
                    { label: 'Ingress', to: '/networking/ingress' },
                ],
            },
            {
                icon: 'database',
                label: 'Storage',
                children: [
                    { label: 'PVC', to: '/storage/pvc' },
                    { label: 'PV', to: '/storage/pv' },
                    { label: 'StorageClass', to: '/storage/sc' },
                ],
            },
            // {
            //     icon: 'shield-halved',
            //     label: 'Security',
            //     children: [
            //         { label: 'Roles', to: '/security/roles' },
            //         { label: 'RoleBindings', to: '/security/rolebindings' },
            //     ],
            // },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle }) {

    // ✅ Đặt hook ở đây
    const [openMenus, setOpenMenus] = useState({});

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
                {!collapsed && <span className="text-blue-400 font-bold text-lg">K8S</span>}
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

                        {group.items.map((item) => (
                            <div key={item.label}>
                                {item.children ? (
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
                                                {item.children.map((child) => (
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