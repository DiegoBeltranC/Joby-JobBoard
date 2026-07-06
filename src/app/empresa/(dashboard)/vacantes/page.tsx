"use client"

import { useState, useEffect } from "react"
import { obtenerVacantesEmpresa, cerrarVacanteAction } from "@/actions/vacantes"
import FormularioVacante from "@/components/empresa/FormularioVacante"
import DetalleVacanteModal from "@/components/empresa/DetalleVacanteModal"
import { toast } from "sonner"
import { 
    Plus, 
    Briefcase, 
    Lock, 
    ShieldCheck, 
    Clock, 
    MapPin, 
    Pencil,
    AlertCircle,
    Users,
    CalendarClock,
} from "lucide-react"
import { encodeId } from "@/lib/utils/hash"
import Link from "next/link"
import ExtenderVacanteModal from "@/components/empresa/ExtenderVacanteModal"
import {
    esEditableCompleta,
    clasesBadgeEstatus,
    clasesTarjetaVacanteEstatus,
    etiquetaEstatusVacante,
} from "@/lib/vacanteEstatus"

type FiltroVacantes = "activas" | "vencidas" | "cerradas"

export default function VacantesPage() {
    // Nota: El estatus real debería venir de la sesión o layout, 
    // pero para este prototipo lo simulamos o lo obtenemos de la UI.
    // Como Tech Lead, asumo que el layout ya pasó el "perfil" pero aquí es una client page.
    // Usaremos un fetcher para las vacantes que también validará.
    
    const [vacantes, setVacantes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [mostrarForm, setMostrarForm] = useState(false)
    const [vacanteSeleccionada, setVacanteSeleccionada] = useState<any | null>(null)
    const [vacanteAEditar, setVacanteAEditar] = useState<any | null>(null)
    const [vacanteParaExtender, setVacanteParaExtender] = useState<any | null>(null)
    const [filtroTab, setFiltroTab] = useState<FiltroVacantes>("activas")
    const [estatusEmpresa, setEstatusEmpresa] = useState<string>("PENDIENTE")
    const [confirmarCerrarId, setConfirmarCerrarId] = useState<number | null>(null)
    const [cerrandoId, setCerrandoId] = useState<number | null>(null)

    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            // 1. Forzamos lectura fresca de la DB (Bypass Cache)
            const estatus = await import("@/actions/vacantes").then(m => m.getEstatusEmpresaAction())
            setEstatusEmpresa(estatus)
            
            // 2. Cargamos las vacantes
            const data = await obtenerVacantesEmpresa()
            setVacantes(data)
            setIsLoading(false)
        }
        init()
    }, [])

    const cargarVacantes = async () => {
        const data = await obtenerVacantesEmpresa()
        setVacantes(data)
    }

    const abrirCrearForm = () => {
        setVacanteAEditar(null)
        setMostrarForm(true)
    }

    const abrirEditarForm = (vacante: any) => {
        setVacanteSeleccionada(null)
        setVacanteAEditar(vacante)
        setMostrarForm(true)
    }

    const handleCerrarConvocatoria = async (vacanteId: number) => {
        setCerrandoId(vacanteId)
        try {
            const res = await cerrarVacanteAction(vacanteId)
            if (res.success) {
                toast.success(res.message)
                setConfirmarCerrarId(null)
                await cargarVacantes()
            } else {
                toast.error(res.error)
            }
        } catch {
            toast.error("Error al cerrar la convocatoria")
        } finally {
            setCerrandoId(null)
        }
    }

    const estaAprobada = estatusEmpresa === "APROBADA"

    const vacantesFiltradas = (vacantes || []).filter((v) => {
        if (filtroTab === "activas") {
            return v.estatus === "ABIERTA" || v.estatus === "PAUSADA"
        }
        if (filtroTab === "vencidas") return v.estatus === "VENCIDA"
        return v.estatus === "CERRADA"
    })

    const tabs: { id: FiltroVacantes; label: string }[] = [
        { id: "activas", label: "Activas" },
        { id: "vencidas", label: "Vencidas" },
        { id: "cerradas", label: "Cerradas" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Creativo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Mis Vacantes</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Gestiona tus ofertas laborales y encuentra talento.
                    </p>
                </div>
                
                <button
                    onClick={abrirCrearForm}
                    disabled={!estaAprobada}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${
                        estaAprobada 
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200 text-sm' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none text-sm'
                    }`}
                >
                    <Plus className="w-5 h-5 font-black" />
                    Crear Nueva Vacante
                </button>
            </div>

            {/* BANNER DE ADVERTENCIA (PROTECCIÓN VISUAL) */}
            {!estaAprobada && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 relative overflow-hidden group">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
                        <Lock className="w-7 h-7 text-amber-600" />
                    </div>
                    <div className="text-center md:text-left relative z-10">
                        <h3 className="text-amber-900 font-black text-lg mb-1">Módulo de Vacantes Bloqueado</h3>
                        <p className="text-amber-700 font-medium leading-relaxed max-w-2xl">
                            Tu cuenta corporativa está siendo revisada por la administración de la UTCH. 
                            Esta opción se desbloqueará en cuanto tu perfil sea validado por nuestro equipo.
                        </p>
                    </div>
                    <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-32 h-32 text-amber-950" />
                    </div>
                </div>
            )}

            {/* Filtros por estatus */}
            {(vacantes || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFiltroTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                filtroTab === tab.id
                                    ? "bg-violet-600 text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-violet-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Listado de Vacantes */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm animate-pulse">
                        <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Sincronizando con el servidor...</p>
                    </div>
                ) : (vacantes || []).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes vacantes publicadas</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                            Comienza a publicar para que los alumnos de la UTCH puedan postularse.
                        </p>
                        {estaAprobada && (
                            <button
                                onClick={abrirCrearForm}
                                className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-md active:scale-95"
                            >
                                Publicar mi primera vacante
                            </button>
                        )}
                    </div>
                ) : vacantesFiltradas.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-500 font-medium">No hay vacantes en esta categoría.</p>
                    </div>
                ) : (
                    vacantesFiltradas.map((v) => (
                        <div
                            key={v.id}
                            className={`relative bg-white p-6 rounded-3xl border transition-all group ${clasesTarjetaVacanteEstatus(v.estatus)}`}
                        >
                            {esEditableCompleta(v) && (
                                <button
                                    type="button"
                                    onClick={() => abrirEditarForm(v)}
                                    title="Editar vacante"
                                    aria-label="Editar vacante"
                                    className="absolute top-4 right-4 md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className={`space-y-1 min-w-0 flex-1 ${esEditableCompleta(v) ? "pr-10 md:pr-0" : ""}`}>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-black text-gray-800 group-hover:text-violet-600 transition-colors tracking-tight">
                                            {v.titulo}
                                        </h3>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider border ${clasesBadgeEstatus(v.estatus)}`}
                                        >
                                            {etiquetaEstatusVacante(v.estatus)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {v.municipio}, {v.estado}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {v.modalidad} • {v.tipo_contrato}{" "}
                                            {v.horario && `• ${v.horario}`}
                                        </div>
                                        {v.fecha_limite && (
                                            <div
                                                className={`flex items-center gap-1.5 ${
                                                    v.estatus === "VENCIDA"
                                                        ? "text-red-600 font-semibold"
                                                        : "text-amber-500"
                                                }`}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                Cierra el{" "}
                                                {new Date(v.fecha_limite).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                                    {v.estatus === "VENCIDA" &&
                                        (confirmarCerrarId === v.id ? (
                                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCerrarConvocatoria(v.id)}
                                                    disabled={cerrandoId === v.id}
                                                    className="inline-flex items-center justify-center h-10 px-4 flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap disabled:opacity-50"
                                                >
                                                    {cerrandoId === v.id ? "Cerrando…" : "Confirmar cierre"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmarCerrarId(null)}
                                                    disabled={cerrandoId === v.id}
                                                    className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-2 w-full md:w-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => setVacanteParaExtender(v)}
                                                    title="Extender convocatoria"
                                                    className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-all whitespace-nowrap md:flex-1"
                                                >
                                                    <CalendarClock className="w-4 h-4 shrink-0" />
                                                    Extender
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmarCerrarId(v.id)}
                                                    className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-xl border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all whitespace-nowrap md:flex-1"
                                                >
                                                    Cerrar convocatoria
                                                </button>
                                            </div>
                                        ))}
                                    <div className="grid grid-cols-2 md:flex md:flex-row md:items-center gap-2">
                                        <Link
                                            href={`/empresa/candidatos/${encodeId(v.id)}`}
                                            className="inline-flex items-center justify-center gap-2 h-10 px-3 md:px-4 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all group/cand shadow-sm whitespace-nowrap"
                                        >
                                            <Users className="w-4 h-4 shrink-0" />
                                            <span className="truncate">Candidatos</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setVacanteSeleccionada(v)}
                                            className="inline-flex items-center justify-center h-10 px-3 md:px-4 text-sm font-semibold text-gray-600 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:text-violet-700 hover:border-violet-200 transition-all whitespace-nowrap"
                                        >
                                            Ver detalles
                                        </button>
                                        {esEditableCompleta(v) && (
                                            <button
                                                type="button"
                                                onClick={() => abrirEditarForm(v)}
                                                title="Editar vacante"
                                                aria-label="Editar vacante"
                                                className="hidden md:inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL DEL FORMULARIO */}
            {mostrarForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-4xl my-8">
                        <FormularioVacante 
                            vacanteAEditar={vacanteAEditar}
                            onSuccess={() => { setMostrarForm(false); setVacanteAEditar(null); cargarVacantes(); }}
                            onCancel={() => { setMostrarForm(false); setVacanteAEditar(null); }}
                        />
                    </div>
                </div>
            )}

            {/* MODAL DE DETALLE DE VACANTE */}
            {vacanteSeleccionada && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <DetalleVacanteModal 
                        vacante={vacanteSeleccionada}
                        onClose={() => setVacanteSeleccionada(null)}
                        onUpdate={cargarVacantes}
                        onExtender={
                            vacanteSeleccionada.estatus === "VENCIDA"
                                ? () => {
                                      setVacanteParaExtender(vacanteSeleccionada)
                                      setVacanteSeleccionada(null)
                                  }
                                : undefined
                        }
                    />
                </div>
            )}

            {vacanteParaExtender && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <ExtenderVacanteModal
                        vacante={vacanteParaExtender}
                        onSuccess={() => {
                            setVacanteParaExtender(null)
                            cargarVacantes()
                        }}
                        onCancel={() => setVacanteParaExtender(null)}
                    />
                </div>
            )}
        </div>
    )
}
