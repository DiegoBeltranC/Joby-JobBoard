import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Building2, UserCircle, Globe, Shield, Phone, ExternalLink, Image as ImageIcon } from "lucide-react";

export default async function PerfilEmpresaPage() {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    if (!usuarioInfo || !usuarioInfo.empresa) {
        return <div>Error: Perfil de empresa no encontrado</div>;
    }

    const empresa = usuarioInfo.empresa;
    const enlaces = empresa.enlaces ? (empresa.enlaces as { linkedin?: string; facebook?: string }) : {};

    // Configuración de badge por estatus
    const estatusStyles: Record<string, { bg: string; text: string; label: string }> = {
        SIN_ENVIAR: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", label: "Perfil sin enviar" },
        PENDIENTE: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", label: "En revisión" },
        APROBADA: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Cuenta Verificada" },
        RECHAZADA: { bg: "bg-red-50 border-red-100", text: "text-red-700", label: "Solicitud Rechazada" },
    };
    const estatus = estatusStyles[empresa.estatus_verificacion] || estatusStyles.SIN_ENVIAR;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-6 pb-12">

            {/* BOTÓN VOLVER */}
            <div>
                <Link href="/empresa/inicio" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a inicio
                </Link>
            </div>

            {/* ENCABEZADO Y ACCIONES */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Perfil Empresarial</h1>
                    <p className="text-gray-500">Así es como te ven los candidatos de Joby.</p>
                </div>
                <Link
                    href="/empresa/perfil-empresa/editar/paso-1"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Editar Perfil
                </Link>
            </div>

            {/* TARJETA PRINCIPAL */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-indigo-50/50 to-indigo-100/50 border-b border-gray-100"></div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
                        {/* Avatar/Logo */}
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-md relative shrink-0">
                            {empresa.logo_url ? (
                                <img src={empresa.logo_url} alt="Logo empresa" className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                                <span className="text-3xl text-violet-700 font-bold">{empresa.nombre_comercial.charAt(0)}</span>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full z-10 ${
                                empresa.estatus_verificacion === "APROBADA" ? 'bg-emerald-500' :
                                empresa.estatus_verificacion === "PENDIENTE" ? 'bg-amber-400' :
                                empresa.estatus_verificacion === "RECHAZADA" ? 'bg-red-400' :
                                'bg-gray-300'
                            }`}></div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800">{empresa.nombre_comercial}</h2>
                            <p className="text-violet-700 font-medium">{empresa.cargo_contacto}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {empresa.municipio ? `${empresa.municipio}, ${empresa.estado}` : "Ubicación pendiente"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserCircle className="w-4 h-4" />
                                    {empresa.nombre} {empresa.apellidoPaterno} {empresa.apellidoMaterno || ""}
                                </span>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border flex items-center gap-1 ${estatus.bg} ${estatus.text}`}>
                                    <Shield className="w-3 h-3" />
                                    {estatus.label}
                                </span>
                                {empresa.rfc && (
                                    <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-[10px] font-bold uppercase border border-violet-100">
                                        RFC registrado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-2">Acerca de la empresa</h3>
                        {empresa.descripcion ? (
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{empresa.descripcion}</p>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Aún no tienes una descripción. Cuéntale a los candidatos sobre tu empresa.</p>
                                <Link href="/empresa/perfil-empresa/editar/paso-3" className="text-indigo-600 text-sm font-medium hover:underline">
                                    + Añadir descripción
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* GRID DE INFORMACIÓN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA */}
                <div className="lg:col-span-2 space-y-6">

                    {/* DATOS LEGALES */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-600" /> Datos Legales
                        </h3>
                        {empresa.rfc || empresa.razon_social ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">RFC</p>
                                    <p className="text-sm font-medium text-gray-700">{empresa.rfc || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Razón Social</p>
                                    <p className="text-sm font-medium text-gray-700">{empresa.razon_social || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                                    <p className="text-sm font-medium text-gray-700">{empresa.estado || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Municipio</p>
                                    <p className="text-sm font-medium text-gray-700">{empresa.municipio || "—"}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Completa tus datos legales para acelerar la verificación.</p>
                                <Link href="/empresa/perfil-empresa/editar/paso-1" className="text-indigo-600 text-sm font-medium hover:underline">
                                    + Añadir datos legales
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* DATOS DEL RECLUTADOR */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-indigo-600" /> Persona de Contacto
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</p>
                                <p className="text-sm font-medium text-gray-700">
                                    {empresa.nombre} {empresa.apellidoPaterno} {empresa.apellidoMaterno || ""}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Cargo</p>
                                <p className="text-sm font-medium text-gray-700">{empresa.cargo_contacto}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                                <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    {empresa.telefono_contacto ? (
                                        <><Phone className="w-3.5 h-3.5 text-gray-400" /> {empresa.telefono_contacto}</>
                                    ) : (
                                        <span className="italic text-gray-400">No registrado</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                        {/* FOTOS DE INSTALACIONES */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-violet-600" /> Fotos de Instalaciones
                            </h3>
                            {(empresa.fotos_empresa || []).length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(empresa.fotos_empresa || []).map((url, idx) => (
                                        <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-gray-100">
                                            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Sube fotos de tus instalaciones para generar confianza.</p>
                                <Link href="/empresa/perfil-empresa/editar/paso-3" className="text-indigo-600 text-sm font-medium hover:underline">
                                    + Subir fotos
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: PRESENCIA DIGITAL */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-600" /> Presencia Digital
                        </h3>
                        <div className="space-y-3">
                            {empresa.sitio_web ? (
                                <a href={empresa.sitio_web} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-800 rounded-xl hover:bg-indigo-100 transition-colors">
                                    <Globe className="w-5 h-5" />
                                    <span className="text-sm font-medium truncate flex-1">Sitio Web</span>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                </a>
                            ) : (
                                <Link href="/empresa/perfil-empresa/editar/paso-3" className="flex items-center gap-3 p-3 border border-dashed border-gray-300 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
                                    <Globe className="w-5 h-5" />
                                    <span className="text-sm">Añadir sitio web</span>
                                </Link>
                            )}

                            {enlaces.linkedin && (
                                <a href={enlaces.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-xl hover:bg-blue-100 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    <span className="text-sm font-medium truncate flex-1">LinkedIn</span>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                </a>
                            )}

                            {enlaces.facebook && (
                                <a href={enlaces.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-xl hover:bg-blue-100 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    <span className="text-sm font-medium truncate flex-1">Facebook</span>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                </a>
                            )}

                            {!empresa.sitio_web && !enlaces.linkedin && !enlaces.facebook && (
                                <p className="text-sm text-gray-400 text-center py-2">Sin redes registradas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
