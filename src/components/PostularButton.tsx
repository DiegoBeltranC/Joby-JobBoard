"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ModalPostulacion from "./ModalPostulacion";

interface PostularButtonProps {
    vacanteId: number;
    vacanteTitulo: string;
    empresaNombre: string;
    tieneCVPerfil: boolean;
    yaPostulado?: boolean;
}

export default function PostularButton({ 
    vacanteId, 
    vacanteTitulo, 
    empresaNombre, 
    tieneCVPerfil,
    yaPostulado: inicial 
}: PostularButtonProps) {
    const [showModal, setShowModal] = useState(false);
    
    const handleSuccess = () => {
        // Recargar para ver el estado actualizado (yaPostulado)
        window.location.reload();
    };

    return (
        <>
            <button 
                disabled={inicial}
                onClick={() => setShowModal(true)}
                className={cn(
                    "w-full py-5 font-black rounded-[24px] text-xl transition-all shadow-2xl flex items-center justify-center gap-3 group px-8",
                    inicial 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed shadow-none" 
                        : "bg-gray-900 hover:bg-teal-600 text-white shadow-gray-200 hover:shadow-teal-100"
                )}
            >
                {inicial ? (
                    <>
                        <CheckCircle2 className="w-6 h-6" />
                        Solicitud Enviada con Éxito
                    </>
                ) : (
                    <>
                        Enviar mi Postulación ahora
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
            </button>

            {showModal && (
                <ModalPostulacion 
                    vacanteId={vacanteId}
                    vacanteTitulo={vacanteTitulo}
                    empresaNombre={empresaNombre}
                    tieneCVPerfil={tieneCVPerfil}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
