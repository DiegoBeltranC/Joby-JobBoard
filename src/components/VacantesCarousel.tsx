"use client";

import { useState, useEffect } from "react";
import VacanteSlideQR from "./VacanteSlideQR";

interface VacanteData {
    id: number;
    titulo: string;
    descripcion?: string;
    sueldo_min?: number | null;
    sueldo_max?: number | null;
    municipio?: string | null;
    estado?: string | null;
    modalidad?: string | null;
    tipo_contrato?: string | null;
    empresa?: {
        id: number;
        nombre_comercial: string;
        logo_url?: string | null;
    } | null;
    empresaId?: number | null;
}

interface VacantesCarouselProps {
    vacantes: VacanteData[];
}

export default function VacantesCarousel({ vacantes }: VacantesCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        if (vacantes.length <= 1) return;

        const interval = setInterval(() => {
            // Iniciar transición (fade-out)
            setFade(false);

            // Cambiar de slide después de que termine la animación de salida (500ms)
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % vacantes.length);
                setFade(true); // Activar animación de entrada (fade-in)
            }, 500);

        }, 8000); // Tiempo de rotación: 8 segundos por vacante

        return () => clearInterval(interval);
    }, [vacantes.length]);

    if (vacantes.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-800">
                <h3 className="text-xl font-bold mb-2">No hay vacantes activas</h3>
                <p className="text-slate-500">Las vacantes aparecerán aquí una vez publicadas.</p>
            </div>
        );
    }

    const currentVacante = vacantes[currentIndex];

    return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {/* Contenedor del Slide con transición de opacidad y escala */}
            <div 
                className={`w-full h-full transition-all duration-500 ease-in-out transform ${
                    fade ? "opacity-100 scale-100" : "opacity-0 scale-[0.99]"
                }`}
            >
                <VacanteSlideQR vacante={currentVacante} />
            </div>

            {/* Indicador flotante estilo Smart TV en la esquina superior derecha */}
            {vacantes.length > 1 && (
                <div className="absolute top-8 right-12 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full flex items-center gap-2 z-20 shadow-lg border border-white/10">
                    {vacantes.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 transition-all duration-500 rounded-full ${
                                index === currentIndex 
                                    ? "w-6 bg-teal-400 shadow-md shadow-teal-400/40" 
                                    : "w-1.5 bg-white/40"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
