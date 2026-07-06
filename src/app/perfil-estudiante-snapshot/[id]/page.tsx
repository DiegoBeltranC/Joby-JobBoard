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
    UserCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CandidatoSnapshot {
    bio: string;
    habilidades: string[];
    idiomas: string[];
}

export default async function PerfilSnapshotPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const postulacionId = parseInt(id);

    if (isNaN(postulacionId)) notFound();

    const session = await getSession();
    if (!session) redirect("/login");

    const postulacion = await prisma.postulacion.findUnique({
        where: { id: postulacionId },
        include: {
            estudiante: true,
            vacante: {
                include: {
                    empresa: true
                }
            }
        }
    });

    if (!postulacion) notFound();

    // Seguridad: Solo admin, la empresa dueña o el estudiante dueño pueden ver esto
    const isAdmin = session.rol === "ADMIN";
    const isEmpresaDueña = session.rol === "EMPRESA" && postulacion.vacante.empresa.usuarioId === session.userId;
    const isEstudianteDueño = session.rol === "ESTUDIANTE" && postulacion.estudiante.usuarioId === session.userId;

    if (!isAdmin && !isEmpresaDueña && !isEstudianteDueño) {
        notFound();
    }

    const snapshot = (postulacion.perfil_snapshot as unknown as CandidatoSnapshot) || {};
    const estudiante = postulacion.estudiante;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20">
            {/* Header / Nav */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={isAdmin ? "/admin/vacantes" : isEmpresaDueña ? `/empresa/candidatos/${postulacion.vacanteId}` : "/mis-postulaciones"} 
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-none">Snapshot del Candidato</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Información Congelada</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold italic text-xs">UT</div>
                        <span className="font-bold text-sm tracking-tight text-slate-800">Joby</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pt-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Izquierda: Info Candidato & Estatus */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        {/* Decoración Superior */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                        
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-[32px] flex items-center justify-center mb-6 relative border-4 border-white shadow-xl">
                                <UserCircle className="w-12 h-12 text-primary" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                {estudiante.nombre} <br />
                                {estudiante.apellidoPaterno}
                            </h2>
                            <p className="text-sm font-bold text-slate-400 mt-2 flex items-center gap-1.5 justify-center">
                                <Mail className="w-4 h-4 text-primary" />
                                {estudiante.matricula}
                            </p>
                            
                            <div className="w-full h-px bg-slate-100 my-8"></div>
                            
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Estatus Envío</span>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full font-black uppercase tracking-widest border text-[10px]",
                                        postulacion.estatus === "ENVIADA" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                        postulacion.estatus === "ACEPTADA" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-slate-50 text-slate-400 border-slate-200"
                                    )}>
                                        {postulacion.estatus}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Postulado el</span>
                                    <span className="font-black text-slate-900 uppercase">
                                        {new Date(postulacion.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vacante Relacionada */}
                    <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Briefcase className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Vacante de Aplicación</span>
                        </div>
                        <h4 className="font-black text-lg leading-tight mb-2">{postulacion.vacante.titulo}</h4>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
                            {postulacion.vacante.empresa.nombre_comercial}
                        </p>
                    </div>
                </div>

                {/* Columna Derecha: El Snapshot (Contenido) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Alerta de Inmutabilidad */}
                    <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100 flex items-start gap-4">
                        <div className="p-3 bg-amber-100 rounded-2xl">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h5 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">Cápsula de Tiempo del Perfil</h5>
                            <p className="text-[11px] font-medium text-amber-700/80 leading-snug">
                                La información que se muestra a continuación fue capturada en el momento exacto de la postulación. 
                                Aunque el estudiante actualice su perfil más adelante, estos datos permanecerán inalterados para asegurar la integridad del proceso de selección.
                            </p>
                        </div>
                    </div>

                    {/* Biografía Snapshot */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <FileText className="w-4 h-4" />
                            Elevator Pitch (Biografía)
                        </h3>
                        <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm border-l-8 border-l-primary">
                            <p className="text-xl font-medium leading-relaxed italic text-slate-600">
                                "{snapshot.bio || "No se capturó biografía en el momento de la postulación."}"
                            </p>
                        </div>
                    </div>

                    {/* Habilidades e Idiomas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                                <Cpu className="w-4 h-4" />
                                Habilidades Congeladas
                            </h3>
                            <div className="bg-white rounded-[32px] p-6 border border-slate-200 flex flex-wrap gap-2">
                                {snapshot.habilidades?.length > 0 ? (
                                    snapshot.habilidades.map((h, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm uppercase tracking-tighter">
                                            {h}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Sin habilidades registradas.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                                <Globe className="w-4 h-4" />
                                Idiomas Registrados
                            </h3>
                            <div className="bg-white rounded-[32px] p-6 border border-slate-200 space-y-3">
                                {snapshot.idiomas?.length > 0 ? (
                                    snapshot.idiomas.map((l, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-xs font-black text-primary uppercase tracking-tight">{l}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Sin idiomas registrados.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Currículum Snapshot */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <ShieldCheck className="w-4 h-4" />
                            Currículum Inmutable
                        </h3>
                        <div className="bg-primary rounded-[40px] p-10 text-white shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 group">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                    <FileText className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-2xl font-black leading-none mb-1">Snapshot_CV.pdf</p>
                                    <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Copia de Seguridad del Envío</p>
                                </div>
                            </div>
                            
                            {postulacion.cv_url_snapshot ? (
                                <a 
                                    href={postulacion.cv_url_snapshot} 
                                    target="_blank"
                                    className="w-full md:w-auto px-8 py-5 bg-white text-primary hover:bg-slate-100 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 font-black text-sm group-hover:px-10"
                                >
                                    <Download className="w-5 h-5" />
                                    DESCARGAR ARCHIVO PDF
                                </a>
                            ) : (
                                <div className="px-6 py-4 bg-white/10 rounded-2xl border border-white/20">
                                    <p className="text-xs font-bold text-white/80">No se adjuntó archivo PDF.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
