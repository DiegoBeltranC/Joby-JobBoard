import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Building2, FileText, Users, TrendingUp, ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import AlertsInterceptor from "./AlertsInterceptor";
import BienvenidaAprobado from "./BienvenidaAprobado";
import TimelineComunicaciones from "./TimelineComunicaciones";
import { Suspense } from "react";
import { calcularProgresoEmpresa, debeMostrarBarraProgreso, empresaAprobada } from "@/lib/perfilEmpresa";

export default async function EmpresaInicioPage() {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            empresa: {
                include: {
                    vacantes: true,
                    comunicaciones: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            }
        }
    });

    if (!usuarioInfo || !usuarioInfo.empresa) {
        redirect("/login?tipo=empresa");
    }

    const empresa = usuarioInfo.empresa;

    // Cálculo de métricas
    const totalVacantes = empresa.vacantes.length;
    const vacantesActivas = empresa.vacantes.filter((v: any) => v.estado === "ACTIVA").length;
    const vacantesBorrador = empresa.vacantes.filter((v: any) => v.estado === "BORRADOR").length;

    const { progreso, faltantesAlerta } = calcularProgresoEmpresa(empresa);
    const estatus = empresa.estatus_verificacion;
    const mostrarBarra = debeMostrarBarraProgreso(estatus);
    const aprobada = empresaAprobada(estatus);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Pop-up De Un Sola Vez Para Cuentas 100% Aprobadas */}
            {empresa.estatus_verificacion === "APROBADA" && (
                <BienvenidaAprobado empresaId={empresa.id} />
            )}

            {/* Interceptor de URL via Suspend */}
            <Suspense fallback={null}>
                <AlertsInterceptor />
            </Suspense>

            {/* BANNER: perfil aprobado pero falta información recomendada */}
            {aprobada && faltantesAlerta.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-amber-900 text-lg">Tu perfil necesita atención</h3>
                        <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
                            Tu cuenta está verificada, pero falta información importante para los candidatos:
                        </p>
                        <ul className="text-sm text-red-700/90 list-disc list-inside mt-2 space-y-0.5">
                            {faltantesAlerta.map((falta, i) => (
                                <li key={i}>{falta}</li>
                            ))}
                        </ul>
                        <Link
                            href="/empresa/perfil-empresa/editar/paso-3"
                            className="inline-flex items-center px-4 py-2 mt-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Completar información
                        </Link>
                    </div>
                </div>
            )}

            {/* BANNER: onboarding / correcciones (< 100%) */}
            {mostrarBarra && progreso < 100 && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">Completa tu Perfil</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            Para que tu cuenta sea visible a los candidatos de la UTCH, necesitas completar tu perfil al <b>100%</b> y enviar tu solicitud de verificación.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link
                                href="/empresa/perfil-empresa/editar/paso-1"
                                className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                            >
                                Completar Perfil ({progreso}%)
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* BANNER: onboarding / correcciones (100% LISTO) */}
            {mostrarBarra && progreso === 100 && (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-violet-900 text-lg">¡Tu perfil está al 100%!</h3>
                        <p className="text-sm text-violet-800/80 mt-1 leading-relaxed">
                            Ya tienes toda la información requerida. Para que el equipo de la UTCH revise y apruebe tu cuenta, presiona el botón <b>Enviar Solicitud</b> que se encuentra en el menú lateral.
                        </p>
                    </div>
                </div>
            )}

            {/* BANNER: PENDIENTE */}
            {empresa.estatus_verificacion === "PENDIENTE" && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-amber-900 text-lg">Solicitud en Revisión</h3>
                        <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
                            Tu solicitud de verificación fue enviada. El equipo de la UTCH está revisando tu información.
                            Te notificaremos cuando tu cuenta sea aprobada.
                        </p>
                        <span className="inline-flex items-center px-4 py-2 mt-3 bg-white border border-amber-200 text-amber-700 text-sm font-medium rounded-xl">
                            <Clock className="w-4 h-4 mr-1.5" />
                            Revisión en proceso
                        </span>
                    </div>
                </div>
            )}

            {/* BANNER: REQUIERE CAMBIOS */}
            {empresa.estatus_verificacion === "REQUIERE_CAMBIOS" && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 w-full">
                        <h3 className="font-bold text-orange-900 text-lg">Se requieren correcciones</h3>
                        <p className="text-sm text-orange-800/80 mt-1 leading-relaxed">
                            Hemos revisado tu perfil y encontramos algunos detalles técnicos que necesitas ajustar para cumplir con las normativas.
                        </p>

                        {/* Timeline De Respuestas Ping-Pong Inyectado */}
                        <TimelineComunicaciones comunicaciones={empresa.comunicaciones} />

                        <Link
                            href="/empresa/perfil-empresa/editar/paso-1"
                            className="inline-flex items-center px-5 py-2.5 mt-4 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Corregir mi información
                        </Link>
                    </div>
                </div>
            )}

            {/* BANNER: RECHAZADA */}
            {empresa.estatus_verificacion === "RECHAZADA" && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-900 text-lg">Solicitud Rechazada</h3>
                        <p className="text-sm text-red-800/80 mt-1 leading-relaxed">
                            Tu solicitud ha sido declinada. Si consideras que se trata de un error o deseas aclarar tus datos corporativos, comunícate con la administración de UTCH.
                        </p>
                        {empresa.motivo_rechazo && (
                            <div className="bg-white border border-red-200 rounded-xl p-3 mt-3">
                                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Motivo del rechazo:</p>
                                <p className="text-sm text-red-800">{empresa.motivo_rechazo}</p>
                            </div>
                        )}
                        {/* Se suprime el botón de arreglar */}
                    </div>
                </div>
            )}

            {/* BANNER: SUSPENDIDA */}
            {empresa.estatus_verificacion === "SUSPENDIDA" && (
                <div className="bg-zinc-800 border-2 border-red-900/50 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-lg">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0 border border-red-500/30">
                        <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1 w-full">
                        <h3 className="font-bold text-white text-lg">Cuenta Suspendida Temporalmente</h3>
                        <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                            Se han detectado infracciones recientes y tu cuenta ha sido suspendida. Tus vacantes no son visibles.
                        </p>

                        {empresa.comunicaciones && empresa.comunicaciones.length > 0 && (
                            <div className="bg-zinc-900/50 border border-red-900/30 rounded-xl p-4 mt-4 w-full">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-700/50">
                                    <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                                        Motivo Institucional
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-200 text-sm mb-1">{empresa.comunicaciones[0].asunto}</h4>
                                <p className="text-sm text-gray-400 whitespace-pre-wrap">{empresa.comunicaciones[0].mensaje}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BANNER: APROBADA (Eliminado, sustituido por Modal de Primera Visita LocalStorage) */}

            {/* ENCABEZADO */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                    Bienvenido, {empresa.nombre_comercial}
                </h1>
                <p className="text-gray-500 mt-1">Panel de control de tu cuenta empresarial.</p>
            </div>

            {/* MÉTRICAS RÁPIDAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-violet-600" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Activas</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">{vacantesActivas}</p>
                    <p className="text-xs text-gray-500 mt-1">Vacantes publicadas</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">{totalVacantes}</p>
                    <p className="text-xs text-gray-500 mt-1">Vacantes creadas</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Candidatos</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">0</p>
                    <p className="text-xs text-gray-500 mt-1">Postulaciones recibidas</p>
                </div>

                {mostrarBarra ? (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-violet-600" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Perfil</span>
                        </div>
                        <p className="text-3xl font-black text-gray-800">{progreso}%</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-400 to-violet-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progreso}%` }}></div>
                        </div>
                    </div>
                ) : aprobada ? (
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Verificada</span>
                        </div>
                        <p className="text-lg font-black text-emerald-800 leading-tight">Cuenta activa</p>
                        <p className="text-xs text-gray-500 mt-1">Aprobada por UTCH</p>
                    </div>
                ) : estatus === "PENDIENTE" ? (
                    <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Estatus</span>
                        </div>
                        <p className="text-lg font-black text-amber-900 leading-tight">En revisión</p>
                        <p className="text-xs text-gray-500 mt-1">Solicitud enviada</p>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Estatus</span>
                        </div>
                        <p className="text-lg font-black text-red-900 leading-tight">
                            {estatus === "SUSPENDIDA" ? "Suspendida" : estatus === "RECHAZADA" ? "Rechazada" : "Sin enviar"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Contacta a UTCH si aplica</p>
                    </div>
                )}
            </div>

            {/* ACCIONES RÁPIDAS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Acciones rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                        href="/empresa/perfil-empresa"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-violet-50 rounded-xl transition-colors group"
                    >
                        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                            <Building2 className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Ver Perfil</p>
                            <p className="text-[11px] text-gray-400">Revisa tu información</p>
                        </div>
                    </Link>

                    <Link
                        href="/empresa/perfil-empresa/editar/paso-1"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-violet-50 rounded-xl transition-colors group"
                    >
                        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                {aprobada || (mostrarBarra && progreso === 100) ? "Editar Perfil" : "Completar Perfil"}
                            </p>
                            <p className="text-[11px] text-gray-400">Edita tu información</p>
                        </div>
                    </Link>

                    {/* Botón de Crear Vacante dinámico */}
                    {empresa.estatus_verificacion === "APROBADA" ? (
                        <Link
                            href="/empresa/vacantes"
                            className="flex items-center gap-3 p-4 bg-white hover:bg-violet-50 border border-violet-100 hover:border-violet-200 rounded-xl transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                                <FileText className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Crear Vacante</p>
                                <p className="text-[10px] text-violet-700 font-bold uppercase tracking-tight">Publicar ahora</p>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl opacity-60 cursor-not-allowed">
                            <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Crear Vacante</p>
                                <p className="text-[11px] text-gray-400">Requiere aprobación</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
