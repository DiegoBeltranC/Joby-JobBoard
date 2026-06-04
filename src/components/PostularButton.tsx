"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ModalPostulacion from "./ModalPostulacion";
import Link from "next/link";
import LoginModal from "./LoginModal";
import ProfileWarningModal from "./ProfileWarningModal";

interface PostularButtonProps {
    vacanteId: number;
    vacanteTitulo: string;
    empresaNombre: string;
    tieneCVPerfil: boolean;
    yaPostulado?: boolean;
    isLoggedIn?: boolean;
    esPerfilCompleto?: boolean;
}

export default function PostularButton({ 
    vacanteId, 
    vacanteTitulo, 
    empresaNombre, 
    tieneCVPerfil,
    yaPostulado: inicial,
    isLoggedIn = true,
    esPerfilCompleto = true
}: PostularButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showProfileWarningModal, setShowProfileWarningModal] = useState(false);
    
    const handleSuccess = () => {
        // Recargar para ver el estado actualizado (yaPostulado)
        window.location.reload();
    };

    if (!isLoggedIn) {
        const redirectUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        return (
            <div className="w-full space-y-4">
                <button 
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-5 font-black rounded-[24px] text-xl transition-all shadow-2xl flex items-center justify-center gap-3 bg-gray-900 hover:bg-teal-600 text-white shadow-gray-200 hover:shadow-teal-100 px-8 cursor-pointer"
                >
                    Iniciar Sesión para Postularte
                    <ChevronRight className="w-6 h-6" />
                </button>
                <div className="text-center text-sm font-semibold text-gray-500">
                    ¿No tienes cuenta?{" "}
                    <Link 
                        href={`/registro?redirect=${encodeURIComponent(redirectUrl)}`}
                        className="text-teal-600 hover:underline hover:text-teal-700 font-bold"
                    >
                        Regístrate aquí
                    </Link>
                </div>
                {showLoginModal && (
                    <LoginModal 
                        onClose={() => setShowLoginModal(false)}
                        onSuccess={() => window.location.reload()}
                    />
                )}
            </div>
        );
    }

    if (!esPerfilCompleto) {
        return (
            <div className="w-full space-y-3">
                <button 
                    type="button"
                    onClick={() => setShowProfileWarningModal(true)}
                    className="w-full py-5 font-black rounded-[24px] text-xl transition-all flex items-center justify-center gap-3 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/50 px-8 cursor-pointer"
                >
                    Completa tu perfil para postularte
                    <ChevronRight className="w-6 h-6" />
                </button>
                {showProfileWarningModal && (
                    <ProfileWarningModal 
                        onClose={() => setShowProfileWarningModal(false)}
                    />
                )}
            </div>
        );
    }

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
