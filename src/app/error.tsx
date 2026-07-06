"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertOctagon } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podrías enviar el error a un servicio de monitoreo como Sentry
    console.error("Error global capturado:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-2xl w-full rounded-[40px] p-8 md:p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            {/* Decoraciones de fondo rojas/naranjas para indicar error de sistema */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Imagen del Tlacuache */}
                <div className="w-64 h-64 relative mb-8 drop-shadow-xl hover:scale-105 transition-transform duration-500 grayscale opacity-80">
                    <img
                        src="/tlacuache-404.png"
                        alt="Tlacuache con problemas técnicos"
                        className="w-full h-full object-contain"
                    />
                </div>
                
                {/* Badge de Error */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest mb-6 shadow-sm">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Error del Sistema</span>
                </div>

                {/* Textos Principales */}
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                    ¡Ups! Algo salió mal
                </h1>
                
                <p className="text-slate-500 font-medium text-lg max-w-md mb-10 leading-relaxed">
                    Parece que nuestro tlacuache se tropezó con los cables del servidor. Estamos experimentando un problema técnico inesperado.
                </p>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-black text-sm uppercase tracking-wide rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Intentar de Nuevo
                    </button>
                    

                </div>
            </div>
        </div>
    </div>
  );
}
