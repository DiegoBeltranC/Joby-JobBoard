"use client";

import { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";
import { Menu } from "lucide-react";

interface DashboardShellAdminProps {
    children: React.ReactNode;
    admin: {
        nombre: string;
        apellido: string;
        esSuperAdmin: boolean;
    };
}

export default function DashboardShellAdmin({ children, admin }: DashboardShellAdminProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar Desktop */}
            <div className="hidden lg:block">
                <SidebarAdmin admin={admin} />
            </div>

            {/* Overlay para móvil */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Móvil */}
            <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarAdmin admin={admin} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Móvil */}
                <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-xl">Joby</span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Admin</span>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
