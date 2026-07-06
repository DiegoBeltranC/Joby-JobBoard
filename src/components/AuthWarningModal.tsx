"use client";

import { X, Lock, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AuthWarningModalProps {
    onClose: () => void;
    onOpenLogin: () => void;
    redirectUrl: string;
    empresaNombre: string;
}

export default function AuthWarningModal({ 
    onClose, 
    onOpenLogin, 
    redirectUrl,
    empresaNombre 
}: AuthWarningModalProps) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-8 text-white relative flex flex-col justify-end">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 border border-teal-500/20">
                        <Lock className="w-6 h-6 text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-black leading-tight">Inicio de sesión requerido</h2>
                    <p className="text-teal-300/80 text-xs font-bold uppercase tracking-widest mt-1">
                        Únete a Joby para continuar
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                        Para poder enviar tu postulación a la vacante de <span className="font-bold text-gray-900">{empresaNombre}</span>, es necesario acceder con tu cuenta de estudiante.
                    </p>

                    <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-100/50 space-y-3">
                        <h4 className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4" />
                            Beneficios de tu cuenta UT:
                        </h4>
                        <ul className="text-xs font-semibold text-gray-600 space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                Postulación instantánea con tu CV digital
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                Seguimiento en tiempo real de tu proceso
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                Comunicación directa con reclutadores
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href={`/registro?redirect=${encodeURIComponent(redirectUrl)}`}
                            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Registrarme como Estudiante
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                        
                        <button
                            type="button"
                            onClick={onOpenLogin}
                            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Iniciar Sesión
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full h-10 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest text-center"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
