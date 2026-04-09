import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, FileText, Users, TrendingUp, ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function EmpresaInicioPage() {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            empresa: {
                include: {
                    vacantes: true,
                }
            }
        }
    });

    if (!usuarioInfo || !usuarioInfo.empresa) {
        redirect("/login?tipo=empresa");
    }

    const empresa = usuarioInfo.empresa;
    const enlaces = (empresa.enlaces as { linkedin?: string; facebook?: string }) || {};
    const tieneEnlace = !!(empresa.sitio_web || enlaces.linkedin || enlaces.facebook);

    // Cálculo de métricas
    const totalVacantes = empresa.vacantes.length;
    const vacantesActivas = empresa.vacantes.filter(v => v.activa).length;

    // Progreso del perfil (mismo algoritmo que el layout)
    let progreso = 10;
    if (empresa.razon_social && empresa.rfc) progreso += 15;
    if (empresa.estado && empresa.municipio) progreso += 10;
    if (empresa.telefono_contacto) progreso += 10;
    if (empresa.descripcion) progreso += 15;
    if (tieneEnlace) progreso += 10;
    if (empresa.logo_url) progreso += 15;
    if (empresa.fotos_empresa.length > 0) progreso += 15;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* BANNER: SIN ENVIAR (< 100%) */}
            {empresa.estatus_verificacion === "SIN_ENVIAR" && progreso < 100 && (
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
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                            >
                                Completar Perfil ({progreso}%)
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* BANNER: SIN ENVIAR (100% LISTO) */}
            {empresa.estatus_verificacion === "SIN_ENVIAR" && progreso === 100 && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-indigo-900 text-lg">¡Tu perfil está al 100%!</h3>
                        <p className="text-sm text-indigo-800/80 mt-1 leading-relaxed">
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

            {/* BANNER: RECHAZADA */}
            {empresa.estatus_verificacion === "RECHAZADA" && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-900 text-lg">Solicitud Rechazada</h3>
                        <p className="text-sm text-red-800/80 mt-1 leading-relaxed">
                            Tu solicitud fue revisada y no fue aprobada. Revisa los comentarios del administrador, corrige la información y envía de nuevo.
                        </p>
                        {empresa.motivo_rechazo && (
                            <div className="bg-white border border-red-200 rounded-xl p-3 mt-3">
                                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Motivo del rechazo:</p>
                                <p className="text-sm text-red-800">{empresa.motivo_rechazo}</p>
                            </div>
                        )}
                        <Link 
                            href="/empresa/perfil-empresa/editar/paso-1" 
                            className="inline-flex items-center px-4 py-2 mt-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                        >
                            Corregir Perfil
                        </Link>
                    </div>
                </div>
            )}

            {/* BANNER: APROBADA */}
            {empresa.estatus_verificacion === "APROBADA" && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-800 font-medium">
                        Tu cuenta está <b>verificada</b>. Puedes publicar vacantes y ser visible para los candidatos.
                    </p>
                </div>
            )}

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
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600" />
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

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Perfil</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">{progreso}%</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progreso}%` }}></div>
                    </div>
                </div>
            </div>

            {/* ACCIONES RÁPIDAS */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Acciones rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link 
                        href="/empresa/perfil-empresa" 
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors group"
                    >
                        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Ver Perfil</p>
                            <p className="text-[11px] text-gray-400">Revisa tu información</p>
                        </div>
                    </Link>

                    <Link 
                        href="/empresa/perfil-empresa/editar/paso-1" 
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors group"
                    >
                        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{progreso === 100 ? "Editar Perfil" : "Completar Perfil"}</p>
                            <p className="text-[11px] text-gray-400">Edita tu información</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl opacity-50 cursor-not-allowed">
                        <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Crear Vacante</p>
                            <p className="text-[11px] text-gray-400">Próximamente</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
