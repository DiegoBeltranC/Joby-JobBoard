"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";

export default function BienvenidaPerfilCompleto({ estudianteId }: { estudianteId: number }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hashID = `joby_perfil_estudiante_${estudianteId}`;
        const hasSeenWelcome = localStorage.getItem(hashID);

        if (!hasSeenWelcome) {
            setShow(true);
        }
    }, [estudianteId]);

    const handleCerrar = () => {
        localStorage.setItem(`joby_perfil_estudiante_${estudianteId}`, "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-500 delay-150">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400 rounded-full blur-[80px] opacity-20 pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full blur-[80px] opacity-20 pointer-events-none" />

                <button
                    type="button"
                    onClick={handleCerrar}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="w-20 h-20 bg-teal-100 text-teal-600 flex items-center justify-center rounded-3xl mb-6 shadow-inner mx-auto relative z-10 border-4 border-white ring-1 ring-teal-50">
                    <CheckCircle2 className="w-10 h-10" />
                </div>

                <h2 className="text-2xl font-black text-center text-gray-900 mb-3 relative z-10 tracking-tight">
                    ¡Perfil completo!
                </h2>
                <p className="text-gray-500 text-sm text-center mb-8 relative z-10 leading-relaxed px-4">
                    Felicidades, has completado tu perfil profesional en Joby.
                    <br /><br />
                    Las empresas verificadas de la UTCH ya pueden conocer tu trayectoria. Explora las vacantes disponibles y postúlate a las oportunidades que mejor encajen contigo.
                </p>

                <div className="flex flex-col gap-2 relative z-10">
                    <Link
                        href="/inicio"
                        onClick={handleCerrar}
                        className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-sm shadow-teal-200 text-sm tracking-wide text-center"
                    >
                        Explorar vacantes
                    </Link>
                    <button
                        type="button"
                        onClick={handleCerrar}
                        className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
