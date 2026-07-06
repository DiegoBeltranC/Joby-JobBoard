"use client";

import Link from 'next/link';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="bg-white max-w-2xl w-full rounded-[40px] p-8 md:p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                {/* Decoraciones de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Imagen del Tlacuache */}
                    <div className="w-64 h-64 relative mb-8 drop-shadow-xl hover:scale-105 transition-transform duration-500">
                        <img
                            src="/tlacuache-404.png"
                            alt="Tlacuache confundido"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    
                    {/* Badge de Error */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-6 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Error 404 - No Encontrado</span>
                    </div>

                    {/* Textos Principales */}
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                        ¡Ups! No deberías estar aquí
                    </h1>
                    
                    <p className="text-slate-500 font-medium text-lg max-w-md mb-10 leading-relaxed">
                        Parece que nuestro tlacuache se perdió explorando el sistema y la página que buscas ya no existe o fue movida a otro lugar.
                    </p>

                    {/* Botones de Acción */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => router.back()}
                            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-black text-sm uppercase tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Regresar
                        </button>
                        

                    </div>
                </div>
            </div>
        </div>
    );
}
