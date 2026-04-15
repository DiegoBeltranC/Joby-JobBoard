import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Building2, UserCircle, Globe, Phone, ExternalLink, Image as ImageIcon } from "lucide-react";
import ProfileHeaderEditor from "@/components/ProfileHeaderEditor";

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
                    Editar Perfil Completo
                </Link>
            </div>

            {/* HEADER INTERACTIVO (BANNER Y LOGO - EDICIÓN DIRECTA) */}
            <ProfileHeaderEditor empresa={{
                id: empresa.id,
                nombre_comercial: empresa.nombre_comercial,
                logo_url: empresa.logo_url,
                banner_url: empresa.banner_url,
                estatus_verificacion: empresa.estatus_verificacion
            }} />

            {/* DATOS DE CONTACTO RÁPIDOS */}
            <div className="bg-white px-8 pb-8 rounded-3xl border border-gray-200">
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-6">
                    <span className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-4 h-4 text-violet-500" />
                        {empresa.municipio ? `${empresa.municipio}, ${empresa.estado}` : "Ubicación pendiente"}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold">
                        <UserCircle className="w-4 h-4 text-violet-500" />
                        {empresa.nombre} {empresa.apellidoPaterno}
                    </span>
                    {empresa.sitio_web && (
                        <a href={empresa.sitio_web} target="_blank" className="flex items-center gap-1.5 text-indigo-600 hover:underline font-bold">
                            <Globe className="w-4 h-4" />
                            Sitio Web Oficial
                        </a>
                    )}
                </div>

                {/* Descripción */}
                <div className="pt-8 mt-8 border-t border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                        Acerca de {empresa.nombre_comercial}
                    </h3>
                    {empresa.descripcion ? (
                        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{empresa.descripcion}</p>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                            <p className="text-sm text-gray-500 mb-3">Aún no tienes una descripción. Cuéntale a los candidatos sobre tu empresa.</p>
                            <Link href="/empresa/perfil-empresa/editar/paso-3" className="text-indigo-600 text-sm font-black hover:underline">
                                + Añadir descripción
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* GRID DE INFORMACIÓN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMNA IZQUIERDA */}
                <div className="lg:col-span-2 space-y-6">
                    {/* DATOS LEGALES */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                            <Building2 className="w-5 h-5 text-indigo-600" /> Datos Legales
                        </h3>
                        {empresa.rfc || empresa.razon_social ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RFC</p>
                                    <p className="text-sm font-bold text-gray-700">{empresa.rfc || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Razón Social</p>
                                    <p className="text-sm font-bold text-gray-700">{empresa.razon_social || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                                    <p className="text-sm font-bold text-gray-700">{empresa.estado || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Municipio</p>
                                    <p className="text-sm font-bold text-gray-700">{empresa.municipio || "—"}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Completa tus datos legales para acelerar la verificación.</p>
                                <Link href="/empresa/perfil-empresa/editar/paso-1" className="text-indigo-600 text-sm font-black hover:underline">
                                    + Añadir datos legales
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* FOTOS DE INSTALACIONES */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                            <ImageIcon className="w-5 h-5 text-violet-600" /> Fotos de Instalaciones
                        </h3>
                        {(empresa.fotos_empresa || []).length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(empresa.fotos_empresa || []).map((url, idx) => (
                                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Sube fotos de tu equipo o lugar de trabajo.</p>
                                <Link href="/empresa/perfil-empresa/editar/paso-3" className="text-indigo-600 text-sm font-black hover:underline">
                                    + Subir fotos
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: PRESENCIA DIGITAL */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                            <ExternalLink className="w-5 h-5 text-indigo-600" /> Presencia Digital
                        </h3>
                        <div className="space-y-4">
                            {empresa.sitio_web ? (
                                <a href={empresa.sitio_web} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-800 rounded-2xl hover:bg-indigo-100 transition-colors font-bold text-sm">
                                    <Globe className="w-5 h-5" />
                                    Sitio Web
                                </a>
                            ) : (
                                <Link href="/empresa/perfil-empresa/editar/paso-3" className="flex items-center gap-3 p-4 border border-dashed border-gray-300 text-gray-400 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium italic">
                                    Sin sitio web
                                </Link>
                            )}

                            {enlaces.linkedin && (
                                <a href={enlaces.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-2xl hover:bg-blue-100 transition-colors font-bold text-sm">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    LinkedIn
                                </a>
                            )}

                            {enlaces.facebook && (
                                <a href={enlaces.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-2xl hover:bg-blue-100 transition-colors font-bold text-sm">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Facebook
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
