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
    AlertTriangle,
} from "lucide-react"
import { cambiarEstatusVacanteAction, eliminarVacanteAction } from "@/actions/vacantes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch {
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
        } catch {
            toast.error("Error al eliminar la vacante")
        } finally {
            setIsPending(false)
            setConfirmarEliminar(false)
        }
    }

    const habilidades = (vacante.habilidades_req || []).filter((h: string) => !h.includes(" - "))
    const idiomas = (vacante.habilidades_req || []).filter((h: string) => h.includes(" - "))

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col w-full max-w-2xl">
            <div className="relative z-10 flex flex-col gap-4 p-5 bg-violet-50/40 border-b border-violet-100 shrink-0">
                <div className="flex items-start justify-between gap-3">
                    <span
                        className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold",
                            vacante.activa
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-900 border border-amber-200"
                        )}
                    >
                        {vacante.activa ? "Publicación Activa" : "Publicación Pausada"}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="shrink-0 text-gray-500 hover:text-violet-800"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-violet-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-violet-600 shrink-0" />
                        {vacante.titulo}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                            <span>
                                {vacante.municipio}, {vacante.estado}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-violet-600 shrink-0" />
                            <span>
                                {vacante.tipo_contrato} • {vacante.modalidad}
                                {vacante.horario && ` • ${vacante.horario}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-3">
                    <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                        <Info className="w-4 h-4 text-violet-600" />
                        Descripción del Puesto
                    </h3>
                    <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {vacante.descripcion}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-violet-600" />
                            Habilidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {habilidades.length > 0 ? (
                                habilidades.map((h: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold border border-violet-100"
                                    >
                                        {h}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">No especificadas</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-4">
                        <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-violet-600" />
                            Remuneración
                        </h3>
                        <div className="rounded-xl border border-violet-100 bg-white p-4 italic">
                            {vacante.sueldo_min || vacante.sueldo_max ? (
                                <p className="text-lg font-black text-gray-900">
                                    ${(vacante.sueldo_min || 0).toLocaleString()} - $
                                    {(vacante.sueldo_max || 0).toLocaleString()}
                                    <span className="text-xs font-normal text-gray-500 ml-2">
                                        MXN Mensuales
                                    </span>
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500">Sueldo no mostrado</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Languages className="w-4 h-4 text-violet-600" />
                            Idiomas
                        </h3>
                        <div className="space-y-2">
                            {idiomas.length > 0 ? (
                                idiomas.map((idioma: string, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-700"
                                    >
                                        <div className="w-2 h-2 bg-violet-400 rounded-full" />
                                        {idioma}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">Ninguno requerido</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-4">
                        <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-600" />
                            Fechas Clave
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-xs text-gray-500 font-medium tracking-tight">
                                Publicada el: {new Date(vacante.createdAt).toLocaleDateString()}
                            </p>
                            {vacante.fecha_limite && (
                                <p className="text-xs text-amber-600 font-black">
                                    Límite de postulación:{" "}
                                    {new Date(vacante.fecha_limite).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                    {confirmarEliminar ? (
                        <div className="flex flex-wrap items-center gap-2 animate-in slide-in-from-left-2">
                            <span className="text-xs font-semibold text-red-700 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                ¿CONFIRMAS ELIMINAR?
                            </span>
                            <Button
                                type="button"
                                onClick={handleEliminar}
                                disabled={isPending}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-lg tracking-tight"
                            >
                                SÍ, BORRAR
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmarEliminar(false)}
                                className="text-xs text-gray-600"
                            >
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmarEliminar(true)}
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar Vacante
                        </Button>
                    )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-600 hover:text-violet-900"
                    >
                        Cerrar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleToggleEstatus}
                        disabled={isPending}
                        className={cn(
                            "font-semibold rounded-xl shadow-sm disabled:opacity-50",
                            vacante.activa
                                ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200"
                                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-200"
                        )}
                    >
                        {vacante.activa ? (
                            <>
                                <PauseCircle className="w-4 h-4 mr-2" />
                                Pausar Vacante
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Reactivar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
