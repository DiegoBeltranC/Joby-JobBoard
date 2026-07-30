"use client";

import * as React from "react";
import { Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { habilidades as sugerenciasHabilidades } from "@/lib/data/habilidades";

const MAX_HABILIDADES = 15;

interface SelectorHabilidadesProps {
    /** Lista actual de habilidades (controlada por el padre). */
    habilidades: string[];
    onChange: (habilidades: string[]) => void;
    /** Marca el borde en rojo (validación de "al menos una habilidad o idioma"). */
    error?: boolean;
}

/**
 * Entrada de habilidades técnicas con autocompletado, límite de 15 y sin
 * duplicados. Extraído de FormularioVacante. Es controlado: el padre conserva
 * la lista (para el submit y la validación) y este componente maneja el input,
 * las sugerencias y el alta/baja.
 */
export default function SelectorHabilidades({ habilidades, onChange, error }: SelectorHabilidadesProps) {
    const [inputHabilidad, setInputHabilidad] = React.useState("");

    const sugerenciasFiltradas =
        inputHabilidad.trim() === ""
            ? []
            : (sugerenciasHabilidades || [])
                  .filter(
                      (sug) =>
                          sug.toLowerCase().includes(inputHabilidad.toLowerCase()) &&
                          !habilidades.some((h) => h.toLowerCase() === sug.toLowerCase())
                  )
                  .slice(0, 5);

    const agregarHabilidad = (habilidad: string) => {
        const limpia = habilidad.trim();
        if (!limpia) return;
        if (habilidades.length >= MAX_HABILIDADES) {
            toast.error("Máximo 15 habilidades.");
            return;
        }
        if (habilidades.some((h) => h.toLowerCase() === limpia.toLowerCase())) return;

        const capitalizada = limpia.charAt(0).toUpperCase() + limpia.slice(1).toLowerCase();
        onChange([...habilidades, capitalizada]);
        setInputHabilidad("");
    };

    const quitarHabilidad = (index: number) => {
        onChange(habilidades.filter((_, i) => i !== index));
    };

    return (
        <div className={cn(
            "bg-gray-50 p-5 rounded-2xl border space-y-4 transition-colors",
            error ? "border-red-500 bg-red-50/10" : "border-gray-100"
        )}>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-violet-600" />
                Habilidades requeridas
            </h3>
            <div className="relative">
                <Input
                    type="text"
                    value={inputHabilidad}
                    onChange={(e) => setInputHabilidad(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault()
                            agregarHabilidad(inputHabilidad)
                        }
                    }}
                    placeholder="Ej: React, Cocina Mexicana..."
                    autoComplete="off"
                    className="pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {habilidades.length}/15
                </span>
                {sugerenciasFiltradas.length > 0 && (
                    <ul className="absolute z-[110] w-full bg-white border border-gray-200 shadow-lg rounded-xl mt-1 overflow-hidden">
                        {sugerenciasFiltradas.map((sug, idx) => (
                            <li
                                key={idx}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    agregarHabilidad(sug)
                                }}
                                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-800 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                                {sug}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[46px] p-2 bg-white rounded-xl border border-dashed border-gray-200">
                {habilidades.length === 0 && (
                    <p className="text-xs text-gray-500 italic p-2">
                        Escribe y presiona Enter para añadir habilidades técnicas...
                    </p>
                )}
                {habilidades.map((h, i) => (
                    <span
                        key={`${h}-${i}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-900 border border-violet-200 rounded-lg text-xs font-medium"
                    >
                        {h}
                        <button
                            type="button"
                            onClick={() => quitarHabilidad(i)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            aria-label={`Quitar ${h}`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
