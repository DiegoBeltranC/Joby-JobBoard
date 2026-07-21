"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Briefcase, Loader2 } from "lucide-react";
import { useCallback, useState, useEffect, useTransition } from "react";

export default function FiltrosVacantes() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(searchParams.get("q") || "");
    const [debouncedQ, setDebouncedQ] = useState(q);

    const [modalidad, setModalidad] = useState(searchParams.get("modalidad") || "");
    const [contrato, setContrato] = useState(searchParams.get("contrato") || "");

    const [isPending, startTransition] = useTransition();

    // Debounce the text input (500ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQ(q);
        }, 500);
        return () => clearTimeout(handler);
    }, [q]);

    const updateParams = useCallback((newQ: string, newModalidad: string, newContrato: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        
        if (newQ) params.set("q", newQ);
        else params.delete("q");

        if (newModalidad) params.set("modalidad", newModalidad);
        else params.delete("modalidad");

        if (newContrato) params.set("contrato", newContrato);
        else params.delete("contrato");
        
        startTransition(() => {
            router.push(`/inicio?${params.toString()}`);
        });
    }, [router, searchParams]);

    // Cuando debouncedQ, modalidad o contrato cambian, actualizamos la URL
    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        const currentModalidad = searchParams.get("modalidad") || "";
        const currentContrato = searchParams.get("contrato") || "";

        if (debouncedQ !== currentQ || modalidad !== currentModalidad || contrato !== currentContrato) {
            updateParams(debouncedQ, modalidad, contrato);
        }
    }, [debouncedQ, modalidad, contrato, updateParams, searchParams]);

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por vacante o empresa..."
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 font-medium text-sm text-gray-700 outline-none"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isPending && <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                    <select
                        className="w-full sm:w-52 pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 font-bold text-sm text-gray-600 appearance-none outline-none cursor-pointer"
                        value={contrato}
                        onChange={(e) => setContrato(e.target.value)}
                    >
                        <option value="">Cualquier Contrato</option>
                        <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                        <option value="MEDIO_TIEMPO">Medio Tiempo</option>
                        <option value="ESTADIA">Estadía</option>
                    </select>
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        className="w-full sm:w-52 pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 font-bold text-sm text-gray-600 appearance-none outline-none cursor-pointer"
                        value={modalidad}
                        onChange={(e) => setModalidad(e.target.value)}
                    >
                        <option value="">Cualquier Modalidad</option>
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="REMOTO">Remoto</option>
                        <option value="HIBRIDO">Híbrido</option>
                    </select>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
