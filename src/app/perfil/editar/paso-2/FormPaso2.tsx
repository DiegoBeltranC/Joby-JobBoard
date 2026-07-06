"use client";

import * as React from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, ArrowLeft, X, Plus, Wrench, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso2 } from "@/actions/perfil";
import { cn } from "@/lib/utils";

// 1. Importaciones de catálogos
import { habilidades as sugerenciasHabilidades } from "@/lib/data/habilidades"; // Usamos alias para evitar conflictos
import catalogos from "@/lib/data/idiomas.json";

// 2. ESQUEMA ZOD ACTUALIZADO
const paso2Schema = z.object({
    habilidades: z.array(z.string()).min(1, "Ingresa al menos una habilidad").max(15, "Máximo 15 habilidades"),
    idiomas: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof paso2Schema>;

export default function FormPaso2({ valoresIniciales }: { valoresIniciales: { habilidades: string, idiomas: string } }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Convertimos los strings separados por comas que envía la BD a arreglos reales
    const habilidadesIniciales = valoresIniciales.habilidades ? valoresIniciales.habilidades.split(", ").filter(Boolean) : [];
    const idiomasIniciales = valoresIniciales.idiomas ? valoresIniciales.idiomas.split(", ").filter(Boolean) : [];

    const { handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso2Schema),
        defaultValues: {
            habilidades: habilidadesIniciales,
            idiomas: idiomasIniciales,
        }
    });

    // 3. ESTADOS DE LOS DATOS Y LA INTERFAZ
    const habilidades = watch("habilidades") || [];
    const idiomas = watch("idiomas") || [];

    const [inputHabilidad, setInputHabilidad] = React.useState("");
    const [idiomaTemp, setIdiomaTemp] = React.useState("");
    const [nivelTemp, setNivelTemp] = React.useState("");

    // --- LÓGICA DE AUTOCOMPLETADO (DROPDOWN) ---
    const sugerenciasFiltradas = inputHabilidad.trim() === "" 
        ? [] 
        : sugerenciasHabilidades
            .filter(sug => 
                sug.toLowerCase().includes(inputHabilidad.toLowerCase()) && 
                !habilidades.some(h => h.toLowerCase() === sug.toLowerCase())
            )
            .slice(0, 5); // Máximo 5 sugerencias

    const agregarDesdeSugerencia = (habilidad: string) => {
        if (habilidades.length >= 15) return toast.error("Máximo 15 habilidades permitidas.");
        const capitalizada = habilidad.charAt(0).toUpperCase() + habilidad.slice(1).toLowerCase();
        setValue("habilidades", [...habilidades, capitalizada], { shouldValidate: true });
        setInputHabilidad("");
    };

    // --- LÓGICA DE HABILIDADES (TEXTO LIBRE ENTER) ---
    const agregarHabilidad = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter' && e.key !== ',') return;
        if (e) e.preventDefault();

        const limpia = inputHabilidad.trim();
        if (!limpia) return;
        
        if (habilidades.length >= 15) return toast.error("Máximo 15 habilidades permitidas.");
        if (habilidades.some(h => h.toLowerCase() === limpia.toLowerCase())) return toast.error("Ya agregaste esta habilidad.");

        // Sanitización visual
        const capitalizada = limpia.charAt(0).toUpperCase() + limpia.slice(1).toLowerCase();
        setValue("habilidades", [...habilidades, capitalizada], { shouldValidate: true });
        setInputHabilidad("");
    };

    const quitarHabilidad = (index: number) => {
        setValue("habilidades", habilidades.filter((_, i) => i !== index), { shouldValidate: true });
    };

    // --- LÓGICA DE IDIOMAS ---
    const agregarIdioma = () => {
        if (!idiomaTemp || !nivelTemp) return toast.error("Selecciona idioma y nivel.");
        const formato = `${idiomaTemp} - ${nivelTemp.split(" - ")[0]}`; // Ej: "Inglés - B2"
        
        if (idiomas.some(i => i.startsWith(idiomaTemp))) return toast.error("Ya agregaste este idioma.");

        setValue("idiomas", [...idiomas, formato], { shouldValidate: true });
        setIdiomaTemp("");
        setNivelTemp("");
    };

    const quitarIdioma = (index: number) => {
        setValue("idiomas", idiomas.filter((_, i) => i !== index), { shouldValidate: true });
    };

    // --- ENVÍO A LA BASE DE DATOS ---
    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            const idCarga = toast.loading("Guardando herramientas...");
            const result = await guardarPaso2(data);

            if (result?.error) {
                toast.error(result.error, { id: idCarga });
            } else {
                toast.success("¡Habilidades guardadas!", { id: idCarga });
                router.push("/perfil/editar/paso-3");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECCIÓN 1: HABILIDADES TÉCNICAS */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-teal-600" /> Habilidades Clave
                </h3>
                <p className="text-xs text-gray-500">Agrega las herramientas o conocimientos que dominas. Presiona <b>Enter</b> para añadir libremente o selecciona de la lista.</p>

                <div className="relative">
                    <input
                        type="text"
                        value={inputHabilidad}
                        onChange={(e) => setInputHabilidad(e.target.value)}
                        onKeyDown={agregarHabilidad}
                        className={cn("w-full rounded-xl border border-gray-300 p-3 pr-24 text-sm focus:ring-2 focus:ring-teal-500 outline-none", errors.habilidades && "border-red-500")}
                        placeholder="Escribe para buscar o añadir..."
                        disabled={habilidades.length >= 15}
                        autoComplete="off"
                    />
                    
                    {/* DROPDOWN AUTOFILTRADO */}
                    {sugerenciasFiltradas.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {sugerenciasFiltradas.map((sug, idx) => {
                                // Encontramos dónde empieza la palabra que el usuario escribió para ponerla en negritas
                                const matchIndex = sug.toLowerCase().indexOf(inputHabilidad.toLowerCase());
                                const prefijo = sug.substring(0, matchIndex);
                                const matchStr = sug.substring(matchIndex, matchIndex + inputHabilidad.length);
                                const sufijo = sug.substring(matchIndex + inputHabilidad.length);

                                return (
                                    <li 
                                        key={idx} 
                                        onMouseDown={(e) => { e.preventDefault(); agregarDesdeSugerencia(sug); }}
                                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                    >
                                        {prefijo}<span className="font-bold text-teal-700">{matchStr}</span>{sufijo}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Contador de Habilidades */}
                    <div className="absolute right-2 top-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {habilidades.length} / 15
                    </div>
                </div>
                {errors.habilidades && <p className="text-xs text-red-500">{errors.habilidades.message}</p>}

                {/* Zona de Tags ya seleccionados */}
                {habilidades.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-gray-200 min-h-[60px]">
                        {habilidades.map((hab, index) => (
                            <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800 rounded-lg text-sm font-medium border border-teal-100 animate-in zoom-in-95">
                                {hab}
                                <button type="button" onClick={() => quitarHabilidad(index)} className="text-teal-400 hover:text-red-500 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: IDIOMAS */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-blue-600" /> Idiomas
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <select value={idiomaTemp} onChange={(e) => setIdiomaTemp(e.target.value)} className="flex-1 rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Seleccionar idioma...</option>
                        {catalogos.lista.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>

                    <select value={nivelTemp} onChange={(e) => setNivelTemp(e.target.value)} className="flex-1 rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Seleccionar nivel...</option>
                        {catalogos.niveles.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>

                    <button type="button" onClick={agregarIdioma} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors font-medium text-sm">
                        <Plus className="w-4 h-4 mr-1" /> Añadir
                    </button>
                </div>

                {idiomas.length > 0 && (
                    <div className="space-y-2 mt-4">
                        {idiomas.map((idioma, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm animate-in fade-in">
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    {idioma}
                                </span>
                                <button type="button" onClick={() => quitarIdioma(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN 3: CONTROLES DE NAVEGACIÓN */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
                <button type="button" onClick={() => router.push("/perfil/editar/paso-1")} className="flex items-center text-sm font-medium text-gray-600 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                </button>
                <button type="submit" disabled={isSubmitting || isPending} className="flex items-center bg-teal-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting || isPending ? "Guardando..." : "Guardar y Continuar"} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </form>
    );
}