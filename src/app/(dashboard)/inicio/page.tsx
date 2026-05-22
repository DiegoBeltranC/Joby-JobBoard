import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
    MapPin,
    Clock,
    Building2,
    Calendar,
    Search,
    Briefcase,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { encodeId } from "@/lib/hash";
import { calcularProgresoEstudiante } from "@/lib/perfilEstudiante";
import { obtenerEstudianteYSincronizarHito } from "@/lib/syncPerfilEstudiante";
import BienvenidaPerfilCompleto from "./BienvenidaPerfilCompleto";

// FASE 2: Forzar Datos Frescos (Anti-Stale Cache)
export const dynamic = 'force-dynamic';

// Helper local para fecha relativa (evita dependencias extra)
function calcularTiempoRelativo(fecha: Date) {
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - fecha.getTime();
    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    if (horas > 0) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (minutos > 0) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    return 'Recién publicado';
}

export default async function InicioPage() {
    const session = await getSession();
    let ubicacionSugerida = "tu zona";
    let perfilCompletado = false;
    let progreso = 0;
    let faltantesAlerta: string[] = [];
    let estudianteId: number | null = null;

    if (session) {
        const resultado = await obtenerEstudianteYSincronizarHito(session.userId);
        if (resultado?.estudiante) {
            const estudiante = resultado.estudiante;
            estudianteId = estudiante.id;
            perfilCompletado = !!estudiante.perfil_completado_at;
            if (estudiante.municipio) {
                ubicacionSugerida = estudiante.municipio;
            }
            const calculo = calcularProgresoEstudiante(estudiante);
            progreso = calculo.progreso;
            faltantesAlerta = calculo.faltantesAlerta;
        }
    }

    // FASE 1: Consulta Prisma Blindada (Anti Over-fetching & Zero Trust)
    const vacantes = await prisma.vacante.findMany({
        take: 30, // Anti-DoS
        where: {
            activa: true,
            empresa: {
                estatus_verificacion: "APROBADA" // Solo empresas validadas por UTCH
            },
            OR: [
                { fecha_limite: null },
                { fecha_limite: { gte: new Date() } }
            ]
        },
        select: {
            id: true,
            titulo: true,
            municipio: true,
            estado: true,
            modalidad: true,
            tipo_contrato: true,
            createdAt: true,
            empresa: {
                select: {
                    id: true,
                    nombre_comercial: true,
                    logo_url: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

            {perfilCompletado && estudianteId && (
                <BienvenidaPerfilCompleto estudianteId={estudianteId} />
            )}

            {/* Banner: perfil incompleto (antes del hito) */}
            {!perfilCompletado && progreso < 100 && (
                <div className="mb-8 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">Completa tu perfil</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            Un perfil completo te ayuda a destacar ante las empresas. Llévalo al <b>100%</b> para desbloquear tu mejor presentación profesional.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link
                                href="/perfil/editar/paso-1"
                                className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                            >
                                Completar perfil ({progreso}%)
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner: hito alcanzado pero falta información */}
            {perfilCompletado && faltantesAlerta.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-amber-900 text-lg">Tu perfil necesita atención</h3>
                        <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
                            Completaste tu perfil, pero falta información importante para las empresas:
                        </p>
                        <ul className="text-sm text-red-700/90 list-disc list-inside mt-2 space-y-0.5">
                            {faltantesAlerta.map((falta, i) => (
                                <li key={i}>{falta}</li>
                            ))}
                        </ul>
                        <Link
                            href="/perfil/editar/paso-1"
                            className="inline-flex items-center px-4 py-2 mt-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Actualizar mi perfil
                        </Link>
                    </div>
                </div>
            )}

            {/* Header de Sección */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                    <Search className="w-8 h-8 text-teal-600" />
                    Buscar Vacantes
                </h1>
                <p className="text-gray-500 font-medium">
                    Oportunidades recomendadas para ti cerca de <span className="text-teal-600 font-bold underline decoration-teal-200 underline-offset-4">{ubicacionSugerida}</span>.
                </p>
            </div>

            {/* FASE 3: Renderizado UI Dinámico */}
            {vacantes && vacantes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
                    {vacantes.map((v) => (
                        <div key={v.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300 group relative overflow-hidden">
                            {/* Decoración de fondo */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50/50 rounded-full blur-2xl group-hover:bg-teal-100/50 transition-colors"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex gap-2">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                            v.tipo_contrato === 'ESTADIA' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            v.tipo_contrato === 'MEDIO_TIEMPO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            'bg-teal-50 text-teal-700 border border-teal-100'
                                        )}>
                                            {v.tipo_contrato.replace('_', ' ')}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {v.modalidad}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {calcularTiempoRelativo(new Date(v.createdAt))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    {/* Logo de Empresa */}
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                                        {v.empresa.logo_url ? (
                                            <img src={v.empresa.logo_url} alt={v.empresa.nombre_comercial} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-teal-700 transition-colors">
                                            {v.titulo}
                                        </h3>
                                        <p className="text-sm font-bold text-gray-500">{v.empresa.nombre_comercial}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-teal-500" />
                                        {v.municipio}, {v.estado}
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <Calendar className="w-4 h-4 text-teal-500" />
                                        Publicado recientemente
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link
                                        href={`/perfil-publico-empresa/${encodeId(v.empresa.id)}?vacante=${encodeId(v.id)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 bg-gray-900 hover:bg-teal-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-gray-200 hover:shadow-teal-200 flex items-center justify-center gap-2 group/btn"
                                    >
                                        Postularme ahora
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State: Requisito de Diseño */
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[32px] border-2 border-dashed border-gray-100 text-center animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                        <Briefcase className="w-10 h-10 text-teal-600 opacity-40" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">Sin vacantes por el momento</h3>
                    <p className="text-gray-500 max-w-sm font-medium">
                        Por el momento no hay vacantes disponibles. Nuestro equipo está validando nuevas oportunidades para ti.
                    </p>
                    <button className="mt-8 px-6 py-2 bg-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-teal-100">
                        Notificarme de nuevas vacantes
                    </button>
                </div>
            )}
        </div>
    );
}