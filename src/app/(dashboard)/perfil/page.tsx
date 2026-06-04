import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ModalProyecto from "@/app/perfil/components/ModalProyecto";
import ListaProyectos from "@/app/perfil/components/ListaProyectos";
import ListaExperiencias from "@/app/perfil/components/ListaExperiencias";
import AvatarEditor from "@/app/perfil/components/AvatarEditor";
import GestionCV from "@/app/perfil/components/GestionCV";
import { MapPin, ArrowLeft } from "lucide-react";

export default async function PerfilPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            estudiante: {
                include: {
                    universidad: true,
                    carrera: true,
                    experiencias: true,
                    proyectos: true,
                    educacion_extra: true,
                }
            }
        }
    });

    if (!usuarioInfo || !usuarioInfo.estudiante) {
        return <div>Error: Perfil no encontrado</div>;
    }

    const estudiante = usuarioInfo.estudiante;
    const enlaces = estudiante.enlaces ? (estudiante.enlaces as { linkedin?: string, github?: string, portafolio?: string }) : {};

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-6 pb-12">

            {/* BOTÓN VOLVER */}
            <div>
                <Link href="/inicio" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a inicio
                </Link>
            </div>

            {/* ENCABEZADO Y ACCIONES */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Mi Perfil Profesional</h1>
                    <p className="text-gray-500">Así es como te ven las empresas reclutadoras.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/perfil/editar/paso-1" className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar Perfil
                    </Link>
                    <Link href="/configuracion" className="bg-white border text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Configuración
                    </Link>
                </div>
            </div>

            {/* TARJETA PRINCIPAL (Resumen) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-teal-50/50 to-teal-100/50 border-b border-gray-100"></div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
                        <AvatarEditor fotoActualUrl={estudiante.foto_perfil_url} iniciales={estudiante.nombre.charAt(0)} />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {estudiante.nombre} {estudiante.apellidoPaterno} {estudiante.apellidoMaterno || ""}
                            </h2>
                            <p className="text-teal-700 font-medium">{estudiante.carrera.nombre}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {estudiante.municipio ? `${estudiante.municipio}, ${estudiante.estado}` : "Ubicación pendiente"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                    {estudiante.universidad.siglas}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {estudiante.reubicacion !== "NO_DISPONIBLE" && (
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase border border-blue-100">
                                        Reubicación: {estudiante.reubicacion.replace(/_/g, ' ')}
                                    </span>
                                )}
                                {estudiante.tipos_contrato.map(tipo => (
                                    <span key={tipo} className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold uppercase border border-teal-100">
                                        {tipo.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-2">Acerca de mí</h3>
                        {estudiante.bio ? (
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{estudiante.bio}</p>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Aún no tienes una biografía. Un buen <i>elevator pitch</i> atrae más miradas.</p>
                                <Link href="/perfil/editar/paso-1" className="text-teal-600 text-sm font-medium hover:underline">
                                    + Añadir descripción
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <ListaExperiencias experiencias={estudiante.experiencias} />
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <ListaProyectos proyectos={estudiante.proyectos} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <Link href="/perfil/editar/paso-2" className="group flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">Habilidades</h3>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Link>
                        </div>
                        {estudiante.habilidades.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {estudiante.habilidades.map((hab, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{hab}</span>
                                ))}
                            </div>
                        ) : (
                            <Link href="/perfil/editar/paso-2" className="text-sm text-teal-600 hover:underline">+ Añadir herramientas</Link>
                        )}
                        {/* Idiomas */}
                        <div className="flex justify-between items-center mt-6 mb-3">
                            <Link href="/perfil/editar/paso-2" className="group flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">Idiomas</h3>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Link>
                        </div>
                        {estudiante.idiomas.length > 0 ? (
                            <div className="space-y-2">
                                {estudiante.idiomas.map((idioma, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-2 h-2 bg-teal-400 rounded-full"></span> {idioma}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Sin idiomas especificados.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">Documentos y Redes</h3>
                        <div className="space-y-4">
                            <GestionCV cvUrl={estudiante.cv_url} />
                            
                            {/* ... Redes ... */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}