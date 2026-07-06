"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GallerySectionProps {
    fotos: string[];
}

export default function GallerySection({ fotos }: GallerySectionProps) {
    const [indexSeleccionado, setIndexSeleccionado] = useState<number | null>(null);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (indexSeleccionado === null) return;
        setIndexSeleccionado((indexSeleccionado + 1) % fotos.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (indexSeleccionado === null) return;
        setIndexSeleccionado((indexSeleccionado - 1 + fotos.length) % fotos.length);
    };

    // Navegación por teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (indexSeleccionado === null) return;
            if (e.key === "ArrowRight") setIndexSeleccionado((prev) => (prev! + 1) % fotos.length);
            if (e.key === "ArrowLeft") setIndexSeleccionado((prev) => (prev! - 1 + fotos.length) % fotos.length);
            if (e.key === "Escape") setIndexSeleccionado(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [indexSeleccionado, fotos.length]);

    return (
        <section>
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-teal-600" />
                </span>
                Instalaciones y Equipo
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {fotos.map((foto, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setIndexSeleccionado(idx)}
                        className={cn(
                            "relative group rounded-[32px] overflow-hidden shadow-lg hover:scale-[1.02] transition-all duration-500",
                            idx === 0 ? "md:col-span-2 md:row-span-2 h-[450px] sm:h-[500px]" : "h-[200px] sm:h-[240px]"
                        )}
                    >
                        <img src={foto} alt={`Instalación ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                <ZoomIn className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox Modal */}
            {indexSeleccionado !== null && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 sm:bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 backdrop-blur-sm"
                    onClick={() => setIndexSeleccionado(null)}
                >
                    {/* Botón Cerrar */}
                    <button 
                        className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
                        onClick={() => setIndexSeleccionado(null)}
                    >
                        <X className="w-8 h-8 sm:w-10 sm:h-10" />
                    </button>

                    {/* Controles de Navegación (Solo si hay más de 1 foto) */}
                    {fotos.length > 1 && (
                        <>
                            <button 
                                onClick={handlePrev}
                                className="absolute left-4 sm:left-8 z-[110] p-4 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
                            >
                                <ChevronLeft className="w-10 h-10 sm:w-14 sm:h-14" />
                            </button>
                            <button 
                                onClick={handleNext}
                                className="absolute right-4 sm:right-8 z-[110] p-4 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
                            >
                                <ChevronRight className="w-10 h-10 sm:w-14 sm:h-14" />
                            </button>
                        </>
                    )}

                    {/* Imagen con tamaño responsivo */}
                    <div 
                        className="max-w-5xl w-full max-h-[70vh] sm:max-h-[85vh] relative animate-in zoom-in-95 duration-300 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={fotos[indexSeleccionado]} 
                            alt={`Instalación ${indexSeleccionado + 1}`} 
                            className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl select-none"
                        />
                        {/* Contador de imágenes para guía del usuario */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-bold tracking-widest uppercase">
                            {indexSeleccionado + 1} / {fotos.length}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
