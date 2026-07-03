import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    Globe,
    MapPin,
    Building2,
    Briefcase,
    ChevronRight,
    Search,
    Instagram,
    Linkedin,
    Twitter,
    Facebook,
    Github,
    ExternalLink,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { Metadata } from "next";
import { decodeId } from "@/lib/utils/hash";
import { getSession } from "@/lib/session";
import PostularButton from "@/components/PostularButton";
import { cn } from "@/lib/utils";
import GallerySection from "@/components/GallerySection";
import { headers } from "next/headers";
import { calcularProgresoEstudiante } from "@/lib/perfilEstudiante";

interface Params {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ vacante?: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { id: hashId } = await params;
    const empresaId = decodeId(hashId);

    if (!empresaId) return { title: "Empresa no encontrada" };

    const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: {
            nombre_comercial: true,
            descripcion: true,
            logo_url: true
        }
    });

    if (!empresa) return { title: "Empresa no encontrada" };

    return {
        title: `${empresa.nombre_comercial} | Perfil Corporativo`,
        description: empresa.descripcion?.substring(0, 160),
        openGraph: {
            title: empresa.nombre_comercial,
            description: empresa.descripcion?.substring(0, 160),
            images: empresa.logo_url ? [empresa.logo_url] : [],
        }
    };
}

export default async function EmpresaPublicPage({ params, searchParams }: Params) {
    const { id: hashId } = await params;
    const { vacante: vacanteHash } = await searchParams;

    const empresaId = decodeId(hashId);
    if (!empresaId) notFound();

    const highlightedVacanteId = vacanteHash ? decodeId(vacanteHash) : null;

    const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: {
            id: true,
            nombre_comercial: true,
            descripcion: true,
            logo_url: true,
            banner_url: true,
            sitio_web: true,
            municipio: true,
            estado: true,
            enlaces: true,
            fotos_empresa: true,
            vacantes: {
                where: {
                    estatus: "ABIERTA",
                    OR: [{ fecha_limite: null }, { fecha_limite: { gte: new Date() } }],
                },
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    tipo_contrato: true,
                    modalidad: true,
                    municipio: true,
                    sueldo_min: true,
                    sueldo_max: true,
                    horario: true,
                    createdAt: true
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!empresa) notFound();

    const highlightedVacante = highlightedVacanteId
        ? empresa.vacantes.find(v => v.id === highlightedVacanteId)
        : null;

    const otrasVacantes = highlightedVacante
        ? empresa.vacantes.filter(v => v.id !== highlightedVacanteId)
        : empresa.vacantes;

    const session = await getSession();
    let yaPostulado = false;
    let tieneCVPerfil = false;
    let esPerfilCompleto = false;

    if (session) {
        const usuarioInfo = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                estudiante: {
                    include: {
                        experiencias: true,
                        proyectos: true
                    }
                }
            }
        });

        if (usuarioInfo?.estudiante) {
            tieneCVPerfil = !!usuarioInfo.estudiante.cv_url;
            const { progreso } = calcularProgresoEstudiante(usuarioInfo.estudiante);
            esPerfilCompleto = progreso >= 100 || !!usuarioInfo.estudiante.perfil_completado_at;

            if (highlightedVacanteId) {
                const postulacion = await prisma.postulacion.findUnique({
                    where: {
                        estudianteId_vacanteId: {
                            estudianteId: usuarioInfo.estudiante.id,
                            vacanteId: highlightedVacanteId
                        }
                    }
                });
                yaPostulado = !!postulacion;
            }
        }
    }

    const getSocialIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
        if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
        if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
        if (p.includes('twitter') || p.includes('x.com')) return <Twitter className="w-5 h-5" />;
        if (p.includes('github')) return <Github className="w-5 h-5" />;
        return <ExternalLink className="w-5 h-5" />;
    };

    const enlaces = Object.entries(empresa.enlaces as Record<string, string> || {})
        .filter(([_, url]) => url && url.trim() !== "");

    const host = (await headers()).get("host");
    // Detectar si es un entorno local (localhost, 127.0.0.1, o IPs de red local 192.168.x.x)
    const isLocal = host?.includes("localhost") ||
        host?.includes("127.0.0.1") ||
        host?.startsWith("192.168.") ||
        host?.startsWith("172.") ||
        host?.startsWith("10.");

    const protocol = isLocal ? "http" : "https";
    const shortUrl = `${protocol}://${host}/e/${hashId}${vacanteHash ? `?vacante=${vacanteHash}` : ""}`;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* HERO SECTION DE IMPACTO */}
            <div className="relative h-[480px] w-full overflow-hidden bg-gray-900">
                {/* Banner de Fondo Opcional */}
                {empresa.banner_url ? (
                    <div className="absolute inset-0">
                        <img src={empresa.banner_url} alt="Portada" className="w-full h-full object-cover opacity-70 scale-105" />
                        {/* Mejora de Contraste con Gradientes Multi-Capa */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 via-transparent to-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Fondo con Brillo/Gradiente Premium x Defecto */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-gray-900 to-black opacity-90"></div>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24"></div>
                    </>
                )}

                <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-16 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
                        <div className="w-48 h-48 bg-white rounded-[40px] p-2 shadow-2xl border-8 border-white/20 shrink-0 transform -rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                            {empresa.logo_url ? (
                                <img src={empresa.logo_url} alt={empresa.nombre_comercial} className="w-full h-full object-contain rounded-[32px]" />
                            ) : (
                                <div className="w-full h-full bg-teal-50 rounded-[32px] flex items-center justify-center">
                                    <Building2 className="w-16 h-16 text-teal-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-500/20 text-teal-300 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider border border-teal-500/30">
                                    Empresa Verificada
                                </span>
                                {(empresa.municipio || empresa.estado) && (
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 text-white backdrop-blur-md rounded-full text-xs font-bold">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {empresa.municipio && `${empresa.municipio}, `}{empresa.estado}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-sm">
                                {empresa.nombre_comercial}
                            </h1>

                            {empresa.sitio_web && (
                                <a
                                    href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors font-bold text-sm"
                                >
                                    <Globe className="w-4 h-4" />
                                    Visitar sitio web oficial
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* COLUMNA IZQUIERDA (Principal) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Vacante Destacada / Seleccionada */}
                        {highlightedVacante && (
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border-2 border-teal-500 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-100">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Vacante Seleccionada
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Presupuesto Bruto
                                        </span>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-6">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                            {highlightedVacante.titulo}
                                        </h2>
                                        {highlightedVacante.sueldo_min || highlightedVacante.sueldo_max ? (
                                            <span className="text-3xl font-black text-teal-600">
                                                ${highlightedVacante.sueldo_min?.toLocaleString()}
                                                {highlightedVacante.sueldo_max && ` - $${highlightedVacante.sueldo_max.toLocaleString()}`}
                                            </span>
                                        ) : (
                                            <span className="text-3xl font-black text-gray-300">---</span>
                                        )}
                                    </div>

                                    {/* Atributos Clave */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Modalidad</span>
                                            <span className="text-xs font-bold text-gray-700">{highlightedVacante.modalidad}</span>
                                        </div>
                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Horario</span>
                                            <span className="text-xs font-bold text-gray-700">{highlightedVacante.horario || "No especificado"}</span>
                                        </div>
                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Contrato</span>
                                            <span className="text-xs font-bold text-gray-700">{highlightedVacante.tipo_contrato}</span>
                                        </div>
                                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ubicación</span>
                                            <span className="text-xs font-bold text-gray-700">{highlightedVacante.municipio || "Chetumal"}</span>
                                        </div>
                                    </div>

                                    {/* Descripción larga de la vacante */}
                                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 mb-8">
                                        <p className="text-gray-600 text-sm font-semibold leading-relaxed whitespace-pre-line">
                                            {highlightedVacante.descripcion}
                                        </p>
                                    </div>

                                    {/* Botón de Postulación de Estudiante */}
                                    <PostularButton
                                        vacanteId={highlightedVacante.id}
                                        vacanteTitulo={highlightedVacante.titulo}
                                        empresaNombre={empresa.nombre_comercial}
                                        tieneCVPerfil={tieneCVPerfil}
                                        yaPostulado={yaPostulado}
                                        isLoggedIn={!!session}
                                        esPerfilCompleto={esPerfilCompleto}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Descripción / Sobre Nosotros */}
                        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-teal-500" />
                                Descripción de la vacante
                            </h2>
                            <p className="text-gray-600 text-sm font-semibold leading-relaxed whitespace-pre-line">
                                {empresa.descripcion || "Sin descripción disponible."}
                            </p>
                        </div>

                        {/* Instalaciones y Equipo */}
                        {empresa.fotos_empresa && empresa.fotos_empresa.length > 0 && (
                            <GallerySection fotos={empresa.fotos_empresa} />
                        )}
                    </div>

                    {/* COLUMNA DERECHA (SIDEBAR) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex justify-center w-full -mt-24 mb-8">
                            <ShareButton
                                title={empresa.nombre_comercial}
                                text={`¡Mira las vacantes de ${empresa.nombre_comercial} en Joby!`}
                                url={shortUrl}
                                variant="premium"
                            />
                        </div>

                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                                <Search className="w-5 h-5 text-teal-500" />
                                Búsqueda Rápida
                            </h3>
                            <div className="space-y-4">
                                <Link
                                    href="/inicio"
                                    className="block w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl text-center transition-all"
                                >
                                    Ver todas las vacantes
                                </Link>
                                {session && (
                                    <Link
                                        href="/inicio"
                                        className="block w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-center transition-all shadow-md hover:shadow-lg"
                                    >
                                        Ir a mi Panel
                                    </Link>
                                )}
                                {enlaces.length > 0 && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
                                            <ExternalLink className="w-3 h-3" />
                                            Sigue a {empresa.nombre_comercial} en redes
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {enlaces.map(([platform, url]) => (
                                                <a key={platform} href={url} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-teal-50 rounded-xl text-gray-500 hover:text-teal-700 transition-colors text-xs font-bold uppercase tracking-tighter">
                                                    {platform}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
