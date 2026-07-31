"use client";

import * as React from "react";
import { Plus, X, Languages } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import catalogos from "@/lib/data/idiomas.json";

interface SelectorIdiomasProps {
    /** Lista actual de idiomas "Idioma - Nivel" (controlada por el padre). */
    idiomas: string[];
    onChange: (idiomas: string[]) => void;
    /** Marca el borde en rojo (validación de "al menos una habilidad o idioma"). */
    error?: boolean;
}

/**
 * Selector de idiomas requeridos con su nivel. Extraído de FormularioVacante.
 * Es controlado: el padre conserva la lista (para el submit y la validación) y
 * este componente maneja los selects temporales y el alta/baja.
 */
export default function SelectorIdiomas({ idiomas, onChange, error }: SelectorIdiomasProps) {
    const [idiomaTemp, setIdiomaTemp] = React.useState("");
    const [nivelTemp, setNivelTemp] = React.useState("");

    const agregarIdioma = () => {
        if (!idiomaTemp || !nivelTemp) {
            toast.error("Selecciona idioma y nivel.");
            return;
        }
        const formato = `${idiomaTemp} - ${nivelTemp.split(" - ")[0]}`;
        if (idiomas.some((i) => i.startsWith(idiomaTemp))) {
            toast.error("Ya agregaste este idioma.");
            return;
        }
        onChange([...idiomas, formato]);
        setIdiomaTemp("");
        setNivelTemp("");
    };

    const quitarIdioma = (index: number) => {
        onChange(idiomas.filter((_, i) => i !== index));
    };

    return (
        <div className={cn(
            "p-5 rounded-2xl border space-y-4 transition-colors",
            error ? "bg-red-50/10 border-red-500" : "bg-violet-50/40 border-violet-100"
        )}>
            <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-violet-600" />
                Idiomas requeridos
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    value={idiomaTemp}
                    onChange={(e) => setIdiomaTemp(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                >
                    <option value="">Seleccionar idioma...</option>
                    {(catalogos?.lista || []).map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </select>
                <select
                    value={nivelTemp}
                    onChange={(e) => setNivelTemp(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                >
                    <option value="">Nivel...</option>
                    {(catalogos?.niveles || []).map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
                <Button
                    type="button"
                    onClick={agregarIdioma}
                    className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Añadir
                </Button>
            </div>
            {idiomas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {idiomas.map((idioma, index) => (
                        <div
                            key={`${idioma}-${index}`}
                            className="flex items-center justify-between bg-white p-3 rounded-xl border border-violet-100"
                        >
                            <span className="text-sm font-medium text-violet-900">{idioma}</span>
                            <button
                                type="button"
                                onClick={() => quitarIdioma(index)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                aria-label="Quitar idioma"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
