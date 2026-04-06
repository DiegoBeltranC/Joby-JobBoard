import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ModalProyecto from "@/app/perfil/components/ModalProyecto";
import ListaProyectos from "@/app/perfil/components/ListaProyectos";
import ListaExperiencias from "@/app/perfil/components/ListaExperiencias";
import AvatarEditor from "@/app/perfil/components/AvatarEditor";

export default async function PerfilPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // Traemos toda la info del estudiante y sus relaciones
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

    // Parseamos los enlaces si existen
    const enlaces = estudiante.enlaces ? (estudiante.enlaces as { linkedin?: string, github?: string, portafolio?: string }) : {};

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-6 pb-12">

            {/* ENCABEZADO Y ACCIONES */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Mi Perfil Profesional</h1>
                    <p className="text-gray-500">Así es como te ven las empresas reclutadoras.</p>
                </div>
                <Link
                    href="/perfil/editar/paso-1"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Editar Perfil
                </Link>
            </div>

            {/* TARJETA PRINCIPAL (Resumen) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-teal-50/50 to-teal-100/50 border-b border-gray-100"></div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
                        {/* Avatar */}
                        <AvatarEditor
                            fotoActualUrl={estudiante.foto_perfil_url}
                            iniciales={estudiante.nombre.charAt(0)}
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {estudiante.nombre} {estudiante.apellidoPaterno} {estudiante.apellidoMaterno || ""}
                            </h2>
                            <p className="text-teal-700 font-medium">{estudiante.carrera.nombre}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {estudiante.ubicacion}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                    {estudiante.universidad.siglas}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Biografía */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-2">Acerca de mí</h3>
                        {estudiante.bio ? (
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{estudiante.bio}</p>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Aún no tienes una biografía. Un buen <i>elevator pitch</i> atrae más miradas.</p>
                                <Link href="/perfil/editar?paso=1" className="text-teal-600 text-sm font-medium hover:underline">
                                    + Añadir descripción (Ej. Estudiante de Ingeniería, desarrollador Next.js, etc.)
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA (Proyectos y Experiencia) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Experiencia Laboral */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <ListaExperiencias experiencias={estudiante.experiencias} />
                    </div>

                    {/* Proyectos Destacados */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <ListaProyectos proyectos={estudiante.proyectos} />
                    </div>
                </div>

                {/* COLUMNA DERECHA (Arsenal y Enlaces) */}
                <div className="space-y-6">

                    {/* Habilidades e Idiomas */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">Habilidades</h3>
                        {estudiante.habilidades.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {estudiante.habilidades.map((hab, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        {hab}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <Link href="/perfil/editar?paso=2" className="text-sm text-teal-600 hover:underline">+ Añadir herramientas y tecnologías</Link>
                        )}

                        <h3 className="font-bold text-gray-800 mt-6 mb-3">Idiomas</h3>
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

                    {/* Curriculum y Enlaces */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">Documentos y Redes</h3>

                        <div className="space-y-3">
                            {/* CV */}
                            {estudiante.cv_url ? (
                                <a href={estudiante.cv_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-teal-50 text-teal-800 rounded-xl hover:bg-teal-100 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span className="text-sm font-medium">Ver Currículum PDF</span>
                                </a>
                            ) : (
                                <Link href="/perfil/editar?paso=3" className="flex items-center gap-3 p-3 border border-dashed border-gray-300 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <span className="text-sm">Subir Currículum</span>
                                </Link>
                            )}

                            {/* Redes */}
                            {enlaces.linkedin && (
                                <a href={enlaces.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600 py-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.762-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                    LinkedIn
                                </a>
                            )}
                            {enlaces.github && (
                                <a href={enlaces.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 py-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    GitHub
                                </a>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}