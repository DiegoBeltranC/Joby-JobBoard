import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { 
    FileText, 
    ShieldCheck, 
    Clock, 
    Download,
    Cpu,
    Globe,
    ArrowLeft,
    Briefcase,
    Calendar,
    Mail,
    UserCircle,
    MapPin,
    GraduationCap,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { encodeId, decodeId } from "@/lib/utils/hash";

interface CandidatoSnapshot {
    bio: string;
    habilidades: string[];
    idiomas: string[];
}

export default async function PerfilSnapshotPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const postulacionId = decodeId(id);

    if (!postulacionId) notFound();

    const session = await getSession();
    if (!session) redirect("/login");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId }
    });

    if (!usuarioInfo) redirect("/login");

    const postulacion = await prisma.postulacion.findUnique({
        where: { id: postulacionId },
        include: {
            estudiante: {
                include: {
                    universidad: true,
                    carrera: true,
                    experiencias: {
                        orderBy: { fechaInicio: 'desc' }
                    },
                    proyectos: {
                        orderBy: { fechaInicio: 'desc' }
                    },
                    educacion_extra: {
                        orderBy: { año: 'desc' }
                    }
                }
            },
            vacante: {
                include: {
                    empresa: true
                }
            }
        }
    });

    if (!postulacion || !postulacion.estudiante) notFound();

    // Seguridad: Solo admin o la empresa dueña pueden ver esto
    const isAdmin = usuarioInfo.rol === "ADMIN";
    const isEmpresaDueña = usuarioInfo.rol === "EMPRESA" && postulacion.vacante.empresa.usuarioId === session.userId;

    if (!isAdmin && !isEmpresaDueña) {
        notFound();
    }

    const snapshot = (postulacion.perfil_snapshot as unknown as CandidatoSnapshot) || { bio: "", habilidades: [], idiomas: [] };
    const estudiante = postulacion.estudiante;

    const backUrl = isAdmin 
        ? "/admin/vacantes" 
        : isEmpresaDueña 
            ? `/empresa/candidatos/${encodeId(postulacion.vacanteId)}` 
            : "/mis-postulaciones";

    // Mostramos las secciones si existen y tienen elementos
    const showExperiencias = estudiante.experiencias.length > 0;
    const showProyectos = estudiante.proyectos.length > 0;
    const showHabilidades = (snapshot.habilidades && snapshot.habilidades.length > 0) || (estudiante.habilidades && estudiante.habilidades.length > 0);
    const showIdiomas = (snapshot.idiomas && snapshot.idiomas.length > 0) || (estudiante.idiomas && estudiante.idiomas.length > 0);
    const showEducacion = estudiante.educacion_extra.length > 0;

    const habilidadesAMostrar = snapshot.habilidades && snapshot.habilidades.length > 0 ? snapshot.habilidades : estudiante.habilidades;
    const idiomasAMostrar = snapshot.idiomas && snapshot.idiomas.length > 0 ? snapshot.idiomas : estudiante.idiomas;
    const bioAMostrar = snapshot.bio !== undefined ? snapshot.bio : estudiante.bio;

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 pb-20">
            {/* Header / Nav similar al de QR pero adaptado a la empresa */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shadow-slate-100">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={backUrl} 
                            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 border border-slate-100 hover:border-slate-200 flex items-center justify-center shadow-sm"
                            title="Volver"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-sm md:text-base font-black tracking-tight leading-none text-slate-800">Expediente de Postulación</h1>
                            <p className="text-[9px] md:text-[10px] text-slate-450 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Historial de Candidato
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black italic text-xs shadow-sm">UT</div>
                        <span className="font-black text-sm tracking-tight text-slate-800 hidden sm:inline">Joby</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 pt-8 w-full space-y-6">
                
                {/* Registro de la Postulación / Histórica Info */}
                <div className="bg-slate-100/60 rounded-[24px] p-6 border border-slate-200/70 flex items-start gap-4 shadow-sm">
                    <div className="p-2.5 bg-slate-200/70 rounded-xl shrink-0">
                        <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Información Histórica de la Postulación</h5>
                        <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                            Los datos de contacto, habilidades, idiomas y biografía presentados corresponden al momento exacto en el que el candidato se postuló. Los cambios posteriores a la postulación en estos campos no afectarán este expediente para garantizar la transparencia del proceso.
                        </p>
                    </div>
                </div>

                {/* Detalles de la postulación (Vacante, estatus y fecha de envío) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Vacante Asociada</p>
                        <p className="text-sm font-black text-slate-800 leading-snug">{postulacion.vacante.titulo}</p>
                        <p className="text-[11px] font-bold text-primary uppercase">{postulacion.vacante.empresa.nombre_comercial}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Estatus de Postulación</p>
                        <div className="pt-0.5">
                            <span className={cn(
                                "px-3 py-1 rounded-full font-black uppercase tracking-widest border text-[10px]",
                                postulacion.estatus === "ENVIADA" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                postulacion.estatus === "ACEPTADA" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                "bg-slate-50 text-slate-400 border-slate-200"
                            )}>
                                {postulacion.estatus}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fecha de Envío</p>
                        <p className="text-sm font-black text-slate-850 pt-0.5 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-450" />
                            {new Date(postulacion.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Tarjeta Principal de Identidad (igual a la del QR) */}
                <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 rounded-[36px] flex items-center justify-center relative shadow-md overflow-hidden shrink-0">
                        {estudiante.foto_perfil_url ? (
                            <img 
                                src={estudiante.foto_perfil_url} 
                                alt={`${estudiante.nombre} ${estudiante.apellidoPaterno}`} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCircle className="w-20 h-20 text-slate-300" />
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {estudiante.nombre} {estudiante.apellidoPaterno} {estudiante.apellidoMaterno || ""}
                            </h1>
                            <p className="text-primary font-black text-base mt-1 uppercase tracking-tight">
                                {estudiante.carrera.nombre}
                            </p>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                                {estudiante.universidad.nombre} ({estudiante.universidad.siglas})
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-semibold">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {estudiante.municipio ? `${estudiante.municipio}, ${estudiante.estado}` : "Ubicación"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {estudiante.matricula}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                            {estudiante.reubicacion !== "NO_DISPONIBLE" && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    Movilidad: {estudiante.reubicacion.replace(/_/g, ' ')}
                                </span>
                            )}
                            {estudiante.tipos_contrato.map(tipo => (
                                <span key={tipo} className="px-3 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {tipo.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Biografía / Acerca de */}
                {bioAMostrar && (
                    <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-primary" />
                            Acerca de Mí (Carta de Presentación)
                        </h3>
                        <p className="text-slate-650 leading-relaxed text-sm whitespace-pre-wrap italic">"{bioAMostrar}"</p>
                    </div>
                )}

                {/* Grid de Habilidades e Idiomas */}
                {(showHabilidades || showIdiomas) && (
                    <div className={`grid grid-cols-1 ${showHabilidades && showIdiomas ? 'md:grid-cols-2' : ''} gap-6`}>
                        {/* Habilidades */}
                        {showHabilidades && (
                            <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-primary" />
                                    Habilidades Técnicas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {habilidadesAMostrar.map((h, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-600 shadow-sm uppercase tracking-tight">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Idiomas */}
                        {showIdiomas && (
                            <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary" />
                                    Idiomas
                                </h3>
                                <div className="space-y-2.5">
                                    {idiomasAMostrar.map((l, i) => (
                                        <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{l}</span>
                                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Experiencia Laboral */}
                {showExperiencias && (
                    <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            Trayectoria Laboral
                        </h3>
                        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {estudiante.experiencias.map((exp) => (
                                <div key={exp.id} className="relative pl-8 space-y-1.5">
                                    <div className="absolute left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-white shadow-sm ring-1 ring-primary/20"></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <h4 className="font-bold text-slate-800 text-sm">{exp.puesto}</h4>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-300" />
                                            {new Date(exp.fechaInicio).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.fechaFin ? new Date(exp.fechaFin).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Actualidad'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">{exp.empresa}</p>
                                    {exp.logros && exp.logros.length > 0 && (
                                        <ul className="list-disc pl-4 space-y-1 mt-2">
                                            {exp.logros.map((logro, idx) => (
                                                <li key={idx} className="text-xs text-slate-600 leading-relaxed">{logro}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Proyectos */}
                {showProyectos && (
                    <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Proyectos Destacados
                        </h3>
                        <div className="space-y-6">
                            {estudiante.proyectos.map((proy) => (
                                <div key={proy.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 text-sm">{proy.nombre}</h4>
                                            {proy.url_enlace && (
                                                <a 
                                                    href={proy.url_enlace} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-emerald-700 transition-colors"
                                                    title="Ver proyecto en vivo"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1 shrink-0">
                                            <Calendar className="w-3 h-3 text-slate-300" />
                                            {new Date(proy.fechaInicio).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {proy.fechaFin ? new Date(proy.fechaFin).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'En Desarrollo'}
                                        </span>
                                    </div>
                                    {proy.puntos_clave && proy.puntos_clave.length > 0 && (
                                        <ul className="list-disc pl-4 space-y-1">
                                            {proy.puntos_clave.map((pt, idx) => (
                                                <li key={idx} className="text-xs text-slate-600 leading-relaxed">{pt}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Educación Adicional / Certificados */}
                {showEducacion && (
                    <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            Educación Complementaria y Certificados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {estudiante.educacion_extra.map((edu) => (
                                <div key={edu.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl space-y-1">
                                    <h4 className="font-bold text-slate-800 text-xs leading-snug">{edu.titulo}</h4>
                                    <p className="text-[10px] text-slate-450 font-bold uppercase">{edu.institucion}</p>
                                    {edu.año && (
                                        <span className="inline-block text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black mt-1">
                                            AÑO {edu.año}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Currículum Adjunto (Vista Previa Integrada) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Currículum Adjunto
                    </h3>
                    {postulacion.cv_url_snapshot ? (
                        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-200/60 rounded-xl">
                                        <FileText className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 leading-none">CV_{estudiante.nombre}_{estudiante.apellidoPaterno}.pdf</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Archivo de Postulación (Inmutable)</p>
                                    </div>
                                </div>
                                <a 
                                    href={postulacion.cv_url_snapshot} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-black text-xs"
                                >
                                    <Download className="w-4 h-4" />
                                    DESCARGAR PDF
                                </a>
                            </div>
                            <div className="w-full bg-slate-100 flex items-center justify-center">
                                <iframe 
                                    src={`${postulacion.cv_url_snapshot}#toolbar=0&navpanes=0`}
                                    className="w-full h-[800px] border-0"
                                    title="Vista previa del CV"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-100 rounded-[24px] p-12 text-slate-500 border border-dashed border-slate-200/80 flex flex-col items-center justify-center text-center shadow-inner">
                            <div className="w-16 h-16 bg-slate-200/50 rounded-2xl flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="font-black text-slate-700 text-base mb-1">Sin Currículum en PDF</h4>
                            <p className="text-xs font-bold text-slate-400 max-w-xs leading-normal">
                                El estudiante no adjuntó un archivo PDF de currículum en el momento de realizar la postulación.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
