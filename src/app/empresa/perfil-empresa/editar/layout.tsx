"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

const PASOS = [
    { id: 1, path: "/empresa/perfil-empresa/editar/paso-1", titulo: "Datos Legales" },
    { id: 2, path: "/empresa/perfil-empresa/editar/paso-2", titulo: "Reclutador" },
    { id: 3, path: "/empresa/perfil-empresa/editar/paso-3", titulo: "Marketing" },
];

export default function EditarPerfilEmpresaLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const pasoActual = PASOS.find(p => pathname.includes(p.path))?.id || 1;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Completa tu Perfil Empresarial</h1>
                <Link 
                    href="/empresa/perfil-empresa" 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Cerrar y volver a mi perfil"
                >
                    <X className="w-6 h-6" />
                </Link>
            </div>

            {/* Stepper Visual */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}
                ></div>

                {PASOS.map((paso) => (
                    <div key={paso.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors border-2 
                            ${pasoActual >= paso.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-400 border-gray-300"}`}>
                            {pasoActual > paso.id ? <CheckCircle2 className="w-5 h-5" /> : paso.id}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${pasoActual >= paso.id ? "text-indigo-700" : "text-gray-500"}`}>
                            {paso.titulo}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                {children}
            </div>
        </div>
    );
}
