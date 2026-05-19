"use client";

import AvatarEmpresa from "@/app/empresa/perfil-empresa/editar/paso-3/AvatarEmpresa";
import BannerUpload from "@/app/empresa/perfil-empresa/editar/paso-3/BannerUpload";
import { Shield, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeaderEditorProps {
    empresa: {
        id: number;
        nombre_comercial: string;
        logo_url: string | null;
        banner_url: string | null;
        estatus_verificacion: string;
    };
}

export default function ProfileHeaderEditor({ empresa }: ProfileHeaderEditorProps) {
    // Estilos de estatus
    const estatusStyles: Record<string, { bg: string; text: string; label: string }> = {
        SIN_ENVIAR: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", label: "Perfil sin enviar" },
        PENDIENTE: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", label: "En revisión" },
        APROBADA: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Cuenta Verificada" },
        RECHAZADA: { bg: "bg-red-50 border-red-100", text: "text-red-700", label: "Solicitud Rechazada" },
    };
    const estatus = estatusStyles[empresa.estatus_verificacion] || estatusStyles.SIN_ENVIAR;

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Contenedor de Banner Interactivo */}
            <div className="relative group h-48 sm:h-56 w-full">
                <BannerUpload bannerActualUrl={empresa.banner_url} />
            </div>

            <div className="px-8 pb-8 relative pt-4">
                {/* Avatar Flotante con Posicionamiento Absoluto */}
                <div className="absolute -top-12 left-8 z-20">
                    <div className="relative">
                        <AvatarEmpresa 
                            logoActualUrl={empresa.logo_url} 
                            iniciales={empresa.nombre_comercial.charAt(0)} 
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full z-10 ${
                            empresa.estatus_verificacion === "APROBADA" ? 'bg-emerald-500' :
                            empresa.estatus_verificacion === "PENDIENTE" ? 'bg-amber-400' :
                            empresa.estatus_verificacion === "RECHAZADA" ? 'bg-red-400' :
                            'bg-gray-300'
                        }`}></div>
                    </div>
                </div>

                {/* Texto con clearance (margen izquierdo) */}
                <div className="ml-32 sm:ml-36 pt-4 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{empresa.nombre_comercial}</h2>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap self-start sm:self-auto ${estatus.bg} ${estatus.text}`}>
                            <Shield className="w-3.5 h-3.5" />
                            {estatus.label}
                        </span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mt-1.5">Identidad Corporativa y Gestión Visual</p>
                </div>
            </div>
        </div>
    );
}
