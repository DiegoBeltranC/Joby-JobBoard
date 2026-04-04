// components/DashboardShell.tsx
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children, perfil }: { children: React.ReactNode, perfil: any }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Fondo oscuro cuando el menú está abierto en móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Contenedor del Sidebar con animación para móvil */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-300 ease-in-out`}>
                <Sidebar perfil={perfil} onClose={() => setSidebarOpen(false)} />
            </div>

            <main className="flex-1 flex flex-col w-full md:w-auto">
                {/* Header móvil */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <span className="font-bold text-teal-700 text-xl">Joby</span>
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}