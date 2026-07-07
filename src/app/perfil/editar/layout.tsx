"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

const PASOS = [
    { id: 1, path: "/perfil/editar/paso-1", titulo: "Sobre ti" },
    { id: 2, path: "/perfil/editar/paso-2", titulo: "Tus Armas" },
    { id: 3, path: "/perfil/editar/paso-3", titulo: "Escaparate" },
];

export default function EditarPerfilLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Averiguamos en qué paso estamos basándonos en la URL
    const pasoActual = PASOS.find(p => pathname.includes(p.path))?.id || 1;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Completa tu Perfil</h1>
                <Link 
                    href="/perfil" 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all shadow-sm"
                    title="Cerrar y volver a mi perfil"
                >
                    <X className="w-4 h-4" />
                    <span>Cerrar</span>
                </Link>
            </div>

            {/* Stepper Visual */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}
                ></div>

                {PASOS.map((paso) => (
                    <div key={paso.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors border-2 
                            ${pasoActual >= paso.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-400 border-gray-300"}`}>
                            {pasoActual > paso.id ? <CheckCircle2 className="w-5 h-5" /> : paso.id}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${pasoActual >= paso.id ? "text-teal-700" : "text-gray-500"}`}>
                            {paso.titulo}
                        </span>
                    </div>
                ))}
            </div>

            {/* Aquí se inyectará el paso 1, 2 o 3 dependiendo de la URL */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                {children}
            </div>
        </div>
    );
}