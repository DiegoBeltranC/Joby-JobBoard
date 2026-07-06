"use client";

import { X, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProfileWarningModalProps {
    onClose: () => void;
}

export default function ProfileWarningModal({ onClose }: ProfileWarningModalProps) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-8 text-white relative flex flex-col justify-end">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-7 h-7 text-amber-200" />
                    </div>
                    <h2 className="text-2xl font-black leading-tight">Perfil Incompleto</h2>
                    <p className="text-amber-100/80 text-xs font-bold uppercase tracking-widest mt-1">
                        Tu perfil debe estar al 100% para postularte
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                        Para poder enviar tu postulación a esta vacante, es necesario que completes todos los campos obligatorios de tu perfil.
                    </p>

                    <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 space-y-3">
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Requisitos obligatorios:</h4>
                        <ul className="text-xs font-semibold text-gray-600 space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                Ubicación (Estado y Municipio) y Biografía
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                Habilidades académicas/profesionales
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                Foto de perfil actualizada
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                Currículum Vitae (CV) en formato PDF
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                Al menos una Experiencia Laboral o Proyecto
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Link
                            href="/perfil"
                            className="w-full h-12 bg-gray-900 hover:bg-teal-600 text-white rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                        >
                            Completar mi Perfil
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full h-10 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest text-center"
                        >
                            Volver a la Vacante
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
