import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { decodeId } from "@/lib/utils/hash";
import { notFound, redirect } from "next/navigation";
import { 
    Users, 
    Download, 
    Eye, 
    Mail, 
    ChevronLeft,
    FileText,
    Calendar,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CandidatoSnapshot {
    bio: string;
    habilidades: string[];
    idiomas: string[];
}

export default async function CandidatosVacantePage({ params }: { params: Promise<{ vacanteHashId: string }> }) {
    const { vacanteHashId } = await params;
    const vacanteId = decodeId(vacanteHashId);
    
    if (!vacanteId) notFound();

    const session = await getSession();
    if (!session) redirect("/login");

    // Verificar que la vacante pertenezca a la empresa logueada
    const vacante = await prisma.vacante.findUnique({
        where: { id: vacanteId },
        include: {
            empresa: true,
            postulaciones: {
                include: {
                    estudiante: true
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!vacante || vacante.empresa.usuarioId !== session.userId) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <Link 
                href="/empresa/vacantes" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-600 font-bold mb-8 transition-colors group"
            >
                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-teal-50 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </div>
                Volver a mis vacantes
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-teal-100">
                            {vacante.postulaciones.length} Candidatos
                        </span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Publicado el {new Date(vacante.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                        Candidatos para: <span className="text-teal-600">{vacante.titulo}</span>
                    </h1>
                </div>
            </div>

            {vacante.postulaciones.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                        <Users className="w-12 h-12 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Aún no hay postulaciones</h3>
                    <p className="text-gray-500 font-bold max-w-sm">Tu vacante está activa y esperando por el mejor talento. Te notificaremos cuando alguien aplique.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidato / Info Snapshot</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Habilidades (Frozen)</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estatus</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vacante.postulaciones.map((post) => {
                                const snapshot = post.perfil_snapshot as unknown as CandidatoSnapshot;
                                return (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-teal-100">
                                                    {post.estudiante.nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-lg leading-tight">
                                                        {post.estudiante.nombre} {post.estudiante.apellidoPaterno}
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                                                        <Mail className="w-3.5 h-3.5 text-teal-500" />
                                                        {post.estudiante.matricula}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 max-w-xs">
                                                <p className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">
                                                    "{snapshot?.bio || "Sin biografia capturada"}"
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {snapshot?.habilidades?.slice(0, 5).map((h, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                                        {h}
                                                    </span>
                                                ))}
                                                {snapshot?.habilidades?.length > 5 && (
                                                    <span className="text-[10px] font-bold text-gray-400">+{snapshot.habilidades.length - 5}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                post.estatus === "ENVIADA" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                post.estatus === "ACEPTADA" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-gray-50 text-gray-400 border-gray-200"
                                            )}>
                                                {post.estatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link 
                                                    href={`/perfil-estudiante-snapshot/${post.id}`}
                                                    className="p-3 bg-white hover:bg-teal-50 text-gray-400 hover:text-teal-600 rounded-xl border border-gray-100 hover:border-teal-100 shadow-sm transition-all"
                                                    title="Ver Perfil Snapshot"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                {post.cv_url_snapshot && (
                                                    <a 
                                                        href={post.cv_url_snapshot} 
                                                        target="_blank"
                                                        className="p-3 bg-gray-900 hover:bg-teal-600 text-white rounded-xl shadow-lg shadow-gray-200 hover:shadow-teal-100 transition-all font-black flex items-center gap-2"
                                                        title="Descargar CV Inmutable"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        <span className="text-xs uppercase">CV</span>
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
