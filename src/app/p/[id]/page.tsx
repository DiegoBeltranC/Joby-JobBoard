import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decryptId } from "@/lib/utils/encryption";
import { 
    FileText, 
    Mail, 
    MapPin, 
    Calendar, 
    Briefcase, 
    Cpu, 
    Globe, 
    Download, 
    UserCircle, 
    GraduationCap, 
    ExternalLink, 
    Lock 
} from "lucide-react";

interface PublicProfileProps {
    params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
    const { id } = await params;
    
    // 1. Intentamos desencriptar el ID (AES-256-CBC)
    const estudianteId = decryptId(decodeURIComponent(id));
    
    if (!estudianteId) {
        notFound();
    }

    // 2. Buscamos al estudiante con todas sus relaciones profesionales
    const estudiante = await prisma.estudiante.findUnique({
        where: { id: estudianteId },
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
    });

    // 3. Si no existe o no tiene habilitado el perfil público, mostramos pantalla de perfil privado
    if (!estudiante || !estudiante.perfil_publico) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="bg-white max-w-2xl w-full rounded-[40px] p-8 md:p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-64 h-64 relative mb-8 drop-shadow-xl">
                            <img
                                src="/tlacuache-404.png"
                                alt="Tlacuache confundido"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-6">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Perfil Privado</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                            Acceso Restringido
                        </h1>
                        
                        <p className="text-slate-500 font-medium text-lg max-w-md leading-relaxed">
                            Este perfil se encuentra configurado como privado por el estudiante o el enlace de compartición es incorrecto.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Filtros de secciones con base en la configuración del estudiante y datos reales
    const showExperiencias = estudiante.compartir_experiencia && estudiante.experiencias.length > 0;
    const showProyectos = estudiante.compartir_proyectos && estudiante.proyectos.length > 0;
    const showHabilidades = estudiante.compartir_habilidades && estudiante.habilidades.length > 0;
    const showIdiomas = estudiante.compartir_idiomas && estudiante.idiomas.length > 0;
    const showEducacion = estudiante.compartir_educacion && estudiante.educacion_extra.length > 0;

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 pb-20">
            {/* Header del Perfil Público */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shadow-slate-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black italic text-sm shadow-md shadow-primary/20">UT</div>
                        <span className="font-black text-base tracking-tight text-slate-800">Joby</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                        Currículum Digital verificado
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 pt-8 w-full space-y-6">
                
                {/* Tarjeta Principal de Identidad */}
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
                {estudiante.bio && (
                    <div className="bg-white rounded-[24px] p-8 border border-slate-200/80 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-primary" />
                            Acerca de Mí
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{estudiante.bio}</p>
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
                                    {estudiante.habilidades.map((h, i) => (
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
                                    {estudiante.idiomas.map((l, i) => (
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
                                                <li key={idx} className="text-xs text-slate-650 leading-relaxed">{logro}</li>
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
                                                <li key={idx} className="text-xs text-slate-650 leading-relaxed">{pt}</li>
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

                {/* Enlace de Descarga de CV en PDF si está cargado */}
                {estudiante.cv_url && (
                    <div className="bg-slate-900 rounded-[24px] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-black text-base">Currículum PDF Adicional</h4>
                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">Cargado por el estudiante</p>
                            </div>
                        </div>
                        <a 
                            href={estudiante.cv_url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-primary hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-md shadow-primary/20 hover:shadow-lg flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Descargar Archivo CV
                        </a>
                    </div>
                )}

            </main>
        </div>
    );
}
