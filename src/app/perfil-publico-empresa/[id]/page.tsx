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
import { decodeId, encodeId } from "@/lib/hash";
import { getSession } from "@/lib/session";
import PostularButton from "@/components/PostularButton";
import { cn } from "@/lib/utils";
import GallerySection from "@/components/GallerySection";
import { headers } from "next/headers";

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
                where: { activa: true },
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

    if (session && highlightedVacanteId) {
        const usuarioInfo = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });
        
        if (usuarioInfo?.estudiante) {
            tieneCVPerfil = !!usuarioInfo.estudiante.cv_url;
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

    const getSocialIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
        if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
        if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
        if (p.includes('twitter') || p.includes('x.com')) return <Twitter className="w-5 h-5" />;
        if (p.includes('github')) return <Github className="w-5 h-5" />;
        return <ExternalLink className="w-5 h-5" />;
    };

    const enlaces = empresa.enlaces as Record<string, string> || {};

    const host = (await headers()).get("host");
    // Detectar si es un entorno local (localhost, 127.0.0.1, o IPs de red local 192.168.x.x)
    const isLocal = host?.includes("localhost") || 
                   host?.includes("127.0.0.1") || 
                   host?.startsWith("192.168.") || 
                   host?.startsWith("172.") || 
                   host?.startsWith("10.");
                   
    const protocol = isLocal ? "http" : "https";
    const shortUrl = `${protocol}://${host}/e/${hashId}`;

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
                                <img 
                                    src={empresa.logo_url} 
                                    alt={empresa.nombre_comercial} 
                                    className="w-full h-full object-cover rounded-[32px]"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center rounded-[32px]">
                                    <span className="text-6xl font-black text-white uppercase">{empresa.nombre_comercial.charAt(0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                                <span className="px-4 py-1.5 bg-teal-500/20 text-teal-300 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-teal-500/30">
                                    Empresa Verificada
                                </span>
                                <span className="px-4 py-1.5 bg-white/10 text-gray-300 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
                                    {empresa.municipio}, {empresa.estado}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
                                {empresa.nombre_comercial}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                                {empresa.sitio_web && (
                                    <a href={empresa.sitio_web} target="_blank" className="flex items-center gap-2 hover:text-white transition-colors font-bold">
                                        <Globe className="w-5 h-5 text-teal-400" />
                                        {new URL(empresa.sitio_web).hostname}
                                    </a>
                                )}
                                <div className="flex gap-4">
                                    {Object.entries(enlaces).map(([platform, url]) => (
                                        <a key={platform} href={url} target="_blank" className="p-2 bg-white/5 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition-all">
                                            {getSocialIcon(platform)}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* COLUMNA IZQUIERDA (CONTENIDO) */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* VACANTE DESTACADA */}
                        {highlightedVacante && (
                            <section className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-teal-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Vacante Seleccionada
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                            {highlightedVacante.titulo}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Presupuesto Bruto</p>
                                        <p className="text-3xl font-black text-teal-600">
                                            {highlightedVacante.sueldo_min ? `$${highlightedVacante.sueldo_min.toLocaleString()}` : "---"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: "Modalidad", value: highlightedVacante.modalidad },
                                        { label: "Horario", value: highlightedVacante.horario || "No especificado" },
                                        { label: "Contrato", value: highlightedVacante.tipo_contrato?.replace('_', ' ') },
                                        { label: "Ubicación", value: highlightedVacante.municipio },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{item.label}</p>
                                            <p className="text-sm font-bold text-gray-800 truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                                    <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                        {highlightedVacante.descripcion}
                                    </p>
                                </div>

                                <PostularButton 
                                    vacanteId={highlightedVacante.id} 
                                    vacanteTitulo={highlightedVacante.titulo}
                                    empresaNombre={empresa.nombre_comercial}
                                    tieneCVPerfil={tieneCVPerfil}
                                    yaPostulado={yaPostulado} 
                                />
                            </section>
                        )}

                        {/* SOBRE NOSOTROS */}
                        <section className="bg-white rounded-[48px] p-12 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                                <span className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-teal-600" />
                                </span>
                                Nuestra Cultura y Misión
                            </h2>
                            <p className="text-gray-600 text-xl leading-relaxed whitespace-pre-line">
                                {empresa.descripcion || "Esta empresa aún no ha proporcionado una descripción detallada."}
                            </p>
                        </section>

                        {/* GALERÍA DE INSTALACIONES (INTERACTIVA CON LIGHTBOX) */}
                        {empresa.fotos_empresa && empresa.fotos_empresa.length > 0 && (
                            <GallerySection fotos={empresa.fotos_empresa} />
                        )}

                        {/* OTRAS VACANTES */}
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                                <span className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-teal-600" />
                                </span>
                                Otras posiciones abiertas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {otrasVacantes.map((v) => (
                                    <Link 
                                        key={v.id} 
                                        href={`/perfil-publico-empresa/${hashId}?vacante=${encodeId(v.id)}`}
                                        className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-teal-100 hover:shadow-xl transition-all group"
                                    >
                                        <h3 className="text-xl font-black text-gray-800 mb-4 group-hover:text-teal-700 transition-colors">
                                            {v.titulo}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{v.modalidad}</span>
                                            {v.horario && <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{v.horario}</span>}
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{v.tipo_contrato?.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <MapPin className="w-4 h-4" />
                                                {v.municipio}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transform group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
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
                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
                                        <ExternalLink className="w-3 h-3" />
                                        Sigue a {empresa.nombre_comercial} en redes
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(enlaces).map(([platform, url]) => (
                                            <a key={platform} href={url} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-teal-50 rounded-xl text-gray-500 hover:text-teal-700 transition-colors text-xs font-bold uppercase tracking-tighter">
                                                {platform}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
