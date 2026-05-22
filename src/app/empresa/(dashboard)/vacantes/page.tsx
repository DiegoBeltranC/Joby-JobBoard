"use client"

import { useState, useEffect } from "react"
import { obtenerVacantesEmpresa } from "@/actions/vacantes"
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
    ChevronRight,
    Pencil,
    AlertCircle,
    Users
} from "lucide-react"
import { encodeId } from "@/lib/utils/hash"
import Link from "next/link"

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
    const [estatusEmpresa, setEstatusEmpresa] = useState<string>("PENDIENTE") 

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

    const estaAprobada = estatusEmpresa === "APROBADA"

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
                ) : (
                    (vacantes || []).map((v) => (
                        <div key={v.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-gray-800 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{v.titulo}</h3>
                                        {v.activa ? (
                                             <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider">Activa</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-wider">Inactiva</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {v.municipio}, {v.estado}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {v.modalidad} • {v.tipo_contrato} {v.horario && `• ${v.horario}`}
                                        </div>
                                        {v.fecha_limite && (
                                            <div className="flex items-center gap-1.5 text-amber-500">
                                                <AlertCircle className="w-4 h-4" />
                                                Cierra el {new Date(v.fecha_limite).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => abrirEditarForm(v)}
                                        title="Editar vacante"
                                        aria-label="Editar vacante"
                                        className="p-3 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <Link 
                                        href={`/empresa/candidatos/${encodeId(v.id)}`}
                                        className="flex items-center gap-2 px-5 py-3 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-600 hover:text-white transition-all group/cand shadow-sm border border-teal-100"
                                    >
                                        <Users className="w-5 h-5 group-hover/cand:scale-110 transition-transform" />
                                        Candidatos
                                    </Link>
                                    <button 
                                        onClick={() => setVacanteSeleccionada(v)}
                                        className="flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-violet-600 hover:text-white transition-all group/btn shadow-sm"
                                    >
                                        Ver Detalles
                                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
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
                    />
                </div>
            )}
        </div>
    )
}
