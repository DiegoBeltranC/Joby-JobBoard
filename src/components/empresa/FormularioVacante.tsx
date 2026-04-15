"use client"

import * as React from "react"
import { useState } from "react"
import { crearVacanteAction } from "@/actions/vacantes"
import { toast } from "sonner"
import { 
    Loader2, 
    Plus, 
    X, 
    Briefcase, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Sparkles,
    Wrench,
    Languages,
    Info,
    Clock
} from "lucide-react"

// 1. Reutilización de Catálogos (DRY) - Mandatorio para Algoritmo de Match
import { habilidades as sugerenciasHabilidades } from "@/lib/data/habilidades";
import catalogos from "@/lib/data/idiomas.json";
import locaciones from "@/lib/data/mexico.json";

interface FormularioVacanteProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function FormularioVacante({ onSuccess, onCancel }: FormularioVacanteProps) {
    const [isPending, setIsPending] = useState(false)
    
    // Estados para Habilidades (TagsInput/ComboBox)
    const [inputHabilidad, setInputHabilidad] = useState("")
    const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState<string[]>([])
    
    // Estados para Idiomas (ComboBox)
    const [idiomaTemp, setIdiomaTemp] = useState("")
    const [nivelTemp, setNivelTemp] = useState("")
    const [idiomasSeleccionados, setIdiomasSeleccionados] = useState<string[]>([])
    // Estados para Horario
    const [horaEntrada, setHoraEntrada] = useState("09:00")
    const [horaSalida, setHoraSalida] = useState("18:00")
    
     // Estados para Geografía (Cascada)
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("Quintana Roo")
    const listaEstados = Object.keys(locaciones)
    const municipiosDisponibles = locaciones[estadoSeleccionado as keyof typeof locaciones] || []

    // --- LÓGICA DE AUTOCOMPLETADO (DROPDOWN) ---
    const sugerenciasFiltradas = inputHabilidad.trim() === "" 
        ? [] 
        : (sugerenciasHabilidades || [])
            .filter(sug => 
                sug.toLowerCase().includes(inputHabilidad.toLowerCase()) && 
                !habilidadesSeleccionadas.some(h => h.toLowerCase() === sug.toLowerCase())
            )
            .slice(0, 5);

    const agregarHabilidad = (habilidad: string) => {
        const limpia = habilidad.trim();
        if (!limpia) return;
        if (habilidadesSeleccionadas.length >= 15) return toast.error("Máximo 15 habilidades.");
        if (habilidadesSeleccionadas.some(h => h.toLowerCase() === limpia.toLowerCase())) return;

        const capitalizada = limpia.charAt(0).toUpperCase() + limpia.slice(1).toLowerCase();
        setHabilidadesSeleccionadas([...habilidadesSeleccionadas, capitalizada]);
        setInputHabilidad("");
    }

    const quitarHabilidad = (index: number) => {
        setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter((_, i) => i !== index));
    }

    const agregarIdioma = () => {
        if (!idiomaTemp || !nivelTemp) return toast.error("Selecciona idioma y nivel.");
        const formato = `${idiomaTemp} - ${nivelTemp.split(" - ")[0]}`; 
        
        if (idiomasSeleccionados.some(i => i.startsWith(idiomaTemp))) return toast.error("Ya agregaste este idioma.");

        setIdiomasSeleccionados([...idiomasSeleccionados, formato]);
        setIdiomaTemp("");
        setNivelTemp("");
    }

    const quitarIdioma = (index: number) => {
        setIdiomasSeleccionados(idiomasSeleccionados.filter((_, i) => i !== index));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        // Fusionamos habilidades e idiomas en habilidades_req para respetar el Schema
        const requisitosFusionados = [...habilidadesSeleccionadas, ...idiomasSeleccionados];
        
        // CORRECCIÓN DE PARSEO: Asegurar que los números sean válidos o null
        const sMinRaw = formData.get("sueldo_min");
        const sMaxRaw = formData.get("sueldo_max");

        const datos = {
            titulo: formData.get("titulo")?.toString() || "",
            descripcion: formData.get("descripcion")?.toString() || "",
            tipo_contrato: formData.get("tipo_contrato")?.toString() || "ESTADIA",
            modalidad: formData.get("modalidad")?.toString() || "PRESENCIAL",
            estado: formData.get("estado")?.toString() || "Quintana Roo",
            municipio: formData.get("municipio")?.toString() || "Othón P. Blanco",
            habilidades_req: requisitosFusionados,
            sueldo_min: sMinRaw ? Number(sMinRaw) : null,
            sueldo_max: sMaxRaw ? Number(sMaxRaw) : null,
            horario: formData.get("horario")?.toString() || null,
            fecha_limite: formData.get("fecha_limite") || null,
        }

        if (requisitosFusionados.length === 0) {
            return toast.error("Requisito faltante", { description: "Debes añadir al menos una habilidad o idioma." });
        }

        setIsPending(true)
        try {
            const res = await crearVacanteAction(datos)
            if (res.success) {
                toast.success(res.message)
                onSuccess()
            } else {
                toast.error("Error al publicar", { description: res.error })
            }
        } catch (error: any) {
            toast.error("Error crítico", { description: "Fallo inesperado en la comunicación con el servidor." })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header Institucional Morado (VIOLET) */}
            <div className="bg-violet-700 p-6 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-amber-300" />
                            Nueva Vacante
                        </h2>
                        <p className="text-violet-100 text-sm font-medium italic opacity-80 underline underline-offset-4 decoration-violet-400">Panel Corporativo UTCH</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Briefcase className="w-24 h-24 rotate-12" />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Sección 1: Lo básico */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-violet-700 mb-2 border-b border-violet-50 pb-2">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="font-bold">Información General</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Título de la Oferta *</label>
                            <input
                                name="titulo"
                                required
                                placeholder="Ej: Desarrollador Backend Junior"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all outline-none text-gray-800 font-medium placeholder:text-gray-300"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Descripción del Puesto *</label>
                            <textarea
                                name="descripcion"
                                required
                                rows={4}
                                placeholder="Describe brevemente el puesto, beneficios y cultura corporativa..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all outline-none text-gray-800 font-medium resize-none placeholder:text-gray-300"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Sección 2: Logística y Clasificación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-violet-700 border-b border-violet-50 pb-2">
                            <MapPin className="w-5 h-5" />
                            <h3 className="font-bold">Ubicación y Contrato</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Tipo de Contrato</label>
                                <select name="tipo_contrato" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-violet-500 outline-none font-bold text-sm text-gray-700">
                                    <option value="ESTADIA">Estadía Profesional</option>
                                    <option value="MEDIO_TIEMPO">Medio Tiempo</option>
                                    <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Modalidad</label>
                                <select name="modalidad" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-violet-500 outline-none font-bold text-sm text-gray-700">
                                    <option value="PRESENCIAL">Presencial</option>
                                    <option value="HIBRIDO">Híbrido</option>
                                    <option value="REMOTO">Remoto</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2 bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200">
                                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-violet-500" /> Rango de Horario (Entrada - Salida)
                                </label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="time"
                                        value={horaEntrada}
                                        onChange={(e) => setHoraEntrada(e.target.value)}
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 outline-none font-bold text-sm text-gray-700"
                                    />
                                    <span className="text-gray-300 font-black">—</span>
                                    <input 
                                        type="time"
                                        value={horaSalida}
                                        onChange={(e) => setHoraSalida(e.target.value)}
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 outline-none font-bold text-sm text-gray-700"
                                    />
                                </div>
                                <input type="hidden" name="horario" value={`${horaEntrada} - ${horaSalida}`} />
                                <p className="text-[9px] text-gray-400 font-medium italic px-1">Formato 24h: {horaEntrada} a {horaSalida}</p>
                            </div>

                        <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Estado *</label>
                                <select 
                                    name="estado" 
                                    required
                                    value={estadoSeleccionado}
                                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-violet-500 outline-none"
                                >
                                    <option value="" disabled>Selecciona un estado</option>
                                    {listaEstados.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Municipio *</label>
                                <select 
                                    name="municipio" 
                                    required
                                    defaultValue={"Othón P. Blanco"}
                                    disabled={!estadoSeleccionado}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-violet-500 outline-none disabled:opacity-50"
                                >
                                    <option value="" disabled>Selecciona tu municipio</option>
                                    {municipiosDisponibles.map((m: string) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-violet-700 border-b border-violet-50 pb-2">
                            <DollarSign className="w-5 h-5" />
                            <h3 className="font-bold">Sueldo y Plazo</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Sueldo Mín.</label>
                                <input type="number" name="sueldo_min" placeholder="$ 0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-500 text-sm font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Sueldo Máx.</label>
                                <input type="number" name="sueldo_max" placeholder="$ 0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-500 text-sm font-medium" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Cierre de Vacante</label>
                            <input type="date" name="fecha_limite" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-500 text-sm font-medium text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Sección 3: Habilidades (ComboBox) */}
                <div className="space-y-4">
                     <div className="flex items-center gap-2 text-violet-700 border-b border-violet-50 pb-2">
                        <Wrench className="w-5 h-5" />
                        <h3 className="font-bold">Habilidades Requeridas</h3>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={inputHabilidad}
                            onChange={(e) => setInputHabilidad(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarHabilidad(inputHabilidad))}
                            placeholder="Ej: React, Cocina Mexicana..."
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all pr-24"
                            autoComplete="off"
                        />
                        <div className="absolute right-3 top-2.5 text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {(habilidadesSeleccionadas || []).length}/15
                        </div>

                        {/* Dropdown de Sugerencias */}
                        {(sugerenciasFiltradas || []).length > 0 && (
                            <ul className="absolute z-50 w-full bg-white border border-gray-200 shadow-2xl rounded-xl mt-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {sugerenciasFiltradas.map((sug, idx) => (
                                    <li 
                                        key={idx} 
                                        onMouseDown={(e) => { e.preventDefault(); agregarHabilidad(sug); }}
                                        className="px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 cursor-pointer border-b border-gray-50 last:border-0 font-medium transition-colors"
                                    >
                                        {sug}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* Tags de Habilidades */}
                    <div className="flex flex-wrap gap-2 min-h-[46px] p-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        {(habilidadesSeleccionadas || []).length === 0 && <p className="text-[11px] text-gray-400 italic p-2">Escribe y presiona Enter para añadir habilidades técnicas...</p>}
                        {(habilidadesSeleccionadas || []).map((h, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-violet-700 border border-violet-100 rounded-lg text-xs font-bold shadow-sm group">
                                {h}
                                <button type="button" onClick={() => quitarHabilidad(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sección 4: Idiomas (ComboBox) */}
                <div className="space-y-4">
                     <div className="flex items-center gap-2 text-violet-700 border-b border-violet-50 pb-2">
                        <Languages className="w-5 h-5" />
                        <h3 className="font-bold">Idiomas Requeridos</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select value={idiomaTemp} onChange={(e) => setIdiomaTemp(e.target.value)} className="flex-1 rounded-xl border border-gray-300 p-3 text-sm bg-white font-medium outline-none focus:border-violet-500 transition-all">
                            <option value="">Seleccionar idioma...</option>
                            {(catalogos?.lista || []).map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                        <select value={nivelTemp} onChange={(e) => setNivelTemp(e.target.value)} className="flex-1 rounded-xl border border-gray-300 p-3 text-sm bg-white font-medium outline-none focus:border-violet-500 transition-all">
                            <option value="">Nivel...</option>
                            {(catalogos?.niveles || []).map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button type="button" onClick={agregarIdioma} className="flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl transition-all font-bold text-sm">
                            <Plus className="w-4 h-4 mr-1.5" /> Añadir
                        </button>
                    </div>

                    {(idiomasSeleccionados || []).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {(idiomasSeleccionados || []).map((idioma, index) => (
                                <div key={index} className="flex items-center justify-between bg-violet-50/30 p-3 rounded-xl border border-violet-100/50 group animate-in slide-in-from-left-2 shadow-sm">
                                    <span className="text-sm font-bold text-violet-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                                        {idioma}
                                    </span>
                                    <button type="button" onClick={() => quitarIdioma(index)} className="text-violet-300 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Advertencia de Seguridad Zero Trust */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        <b>Politica UTCH:</b> Toda vacante será verificada por la administración. No incluyas enlaces externos o teléfonos directos si no han sido autorizados previamente.
                    </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full md:w-auto px-8 py-3.5 text-gray-400 font-bold hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        Descartar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full md:w-auto px-12 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-violet-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Publicación"}
                    </button>
                </div>
            </form>
        </div>
    )
}
