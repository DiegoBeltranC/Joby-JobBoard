"use client"

import * as React from "react"
import { useState } from "react"
import { 
    X, 
    Briefcase, 
    MapPin, 
    Clock, 
    DollarSign, 
    Calendar, 
    Wrench, 
    Languages, 
    Trash2, 
    PauseCircle, 
    PlayCircle,
    Info,
    AlertTriangle
} from "lucide-react"
import { cambiarEstatusVacanteAction, eliminarVacanteAction } from "@/actions/vacantes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DetalleVacanteModalProps {
    vacante: any
    onClose: () => void
    onUpdate: () => void
}

export default function DetalleVacanteModal({ vacante, onClose, onUpdate }: DetalleVacanteModalProps) {
    const [isPending, setIsPending] = useState(false)
    const [confirmarEliminar, setConfirmarEliminar] = useState(false)

    const handleToggleEstatus = async () => {
        setIsPending(true)
        try {
            const res = await cambiarEstatusVacanteAction(vacante.id, !vacante.activa)
            if (res.success) {
                toast.success(res.message)
                onUpdate()
                onClose() // Cerramos para evitar estado inconsistente en el modal
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("Error al actualizar estatus")
        } finally {
            setIsPending(false)
        }
    }

    const handleEliminar = async () => {
        setIsPending(true)
        try {
            const res = await eliminarVacanteAction(vacante.id)
            if (res.success) {
                toast.success(res.message)
                onUpdate()
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("Error al eliminar la vacante")
        } finally {
            setIsPending(false)
            setConfirmarEliminar(false)
        }
    }

    // Separar habilidades e idiomas del campo habilidades_req
    const habilidades = (vacante.habilidades_req || []).filter((h: string) => !h.includes(" - "))
    const idiomas = (vacante.habilidades_req || []).filter((h: string) => h.includes(" - "))

    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col w-full max-w-2xl">
            
            {/* Header Creativo */}
            <div className="bg-violet-700 p-8 text-white relative">
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            vacante.activa ? "bg-emerald-400 text-emerald-900" : "bg-amber-400 text-amber-900"
                        )}>
                            {vacante.activa ? "Publicación Activa" : "Publicación Pausada"}
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight leading-none uppercase">{vacante.titulo}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-violet-100 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {vacante.municipio}, {vacante.estado}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-violet-300" />
                            {vacante.tipo_contrato} • {vacante.modalidad} {vacante.horario && `• ${vacante.horario}`}
                        </div>
                    </div>
                </div>
                {/* Decoración */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Briefcase className="w-32 h-32 rotate-12" />
                </div>
            </div>

            {/* Contenido Scrolleable */}
            <div className="p-8 space-y-8 overflow-y-auto">
                
                {/* Sección 1: Descripción */}
                <div className="space-y-3">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4 text-violet-600" /> Descripción del Puesto
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {vacante.descripcion}
                    </p>
                </div>

                {/* Sección 2: Requisitos y Salario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-violet-600" /> Habilidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {habilidades.length > 0 ? habilidades.map((h: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold border border-violet-100">
                                    {h}
                                </span>
                            )) : <p className="text-xs text-gray-400 italic">No especificadas</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-violet-600" /> Remuneración
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                            {vacante.sueldo_min || vacante.sueldo_max ? (
                                <p className="text-lg font-black text-gray-900">
                                    ${(vacante.sueldo_min || 0).toLocaleString()} - ${(vacante.sueldo_max || 0).toLocaleString()}
                                    <span className="text-xs text-gray-400 ml-2">MXN Mensuales</span>
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400">Sueldo no mostrado</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sección 3: Idiomas e Info Extra */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Languages className="w-4 h-4 text-violet-600" /> Idiomas
                        </h3>
                        <div className="space-y-2">
                            {idiomas.length > 0 ? idiomas.map((idioma: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full" />
                                    {idioma}
                                </div>
                            )) : <p className="text-xs text-gray-400 italic">Ninguno requerido</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-600" /> Fechas Clave
                        </h3>
                        <div className="space-y-2">
                             <p className="text-xs text-gray-500 font-medium tracking-tight">Publicada el: {new Date(vacante.createdAt).toLocaleDateString()}</p>
                             {vacante.fecha_limite && (
                                <p className="text-xs text-amber-600 font-black">Límite de postulación: {new Date(vacante.fecha_limite).toLocaleDateString()}</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer de Acciones Administrativas */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {confirmarEliminar ? (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                            <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                <AlertTriangle className="w-4 h-4" /> ¿CONFIRMAS ELIMINAR?
                            </span>
                            <button 
                                onClick={handleEliminar}
                                disabled={isPending}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all font-mono"
                            >
                                SÍ, BORRAR
                            </button>
                            <button 
                                onClick={() => setConfirmarEliminar(false)}
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setConfirmarEliminar(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar Vacante
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleToggleEstatus}
                        disabled={isPending}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-md active:scale-95 disabled:opacity-50",
                            vacante.activa 
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        )}
                    >
                        {vacante.activa ? (
                            <><PauseCircle className="w-4 h-4" /> Pausar Vacante</>
                        ) : (
                            <><PlayCircle className="w-4 h-4" /> Reactivar</>
                        )}
                    </button>
                    <button onClick={onClose} className="px-6 py-2.5 text-gray-500 font-bold hover:text-violet-700 transition-colors text-sm">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
