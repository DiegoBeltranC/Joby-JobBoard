"use client";

import { 
    X, 
    FileText, 
    ShieldCheck, 
    Clock, 
    Download,
    Cpu,
    Globe,
    UserCheck,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalDetalleSnapshotProps {
    postulacion: {
        id: number;
        createdAt: Date;
        cv_url_snapshot: string | null;
        perfil_snapshot: any;
        vacante: {
            titulo: string;
            empresa: {
                nombre_comercial: string;
            };
        };
    };
    onClose: () => void;
}

export default function ModalDetalleSnapshot({ postulacion, onClose }: ModalDetalleSnapshotProps) {
    const snapshot = postulacion.perfil_snapshot || {};
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-200 flex flex-col relative z-[110]">
                
                {/* Header Limpio (Sin Gradientes) */}
                <div className="bg-slate-50 p-8 border-b border-slate-100 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all border border-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <ShieldCheck className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black leading-tight text-slate-900">Tu Snapshot de Postulación</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                Información congelada al {new Date(postulacion.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenido Scrollable */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 text-slate-700">
                    
                    {/* Sección CV */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Currículum Enviado
                        </h3>
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 leading-none mb-1">Snapshot_CV.pdf</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Archivo PDF Inmutable</p>
                                </div>
                            </div>
                            {postulacion.cv_url_snapshot && (
                                <a 
                                    href={postulacion.cv_url_snapshot} 
                                    target="_blank"
                                    className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-100 transition-all flex items-center gap-2 font-black text-xs"
                                >
                                    <Download className="w-4 h-4" />
                                    ABRIR
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Sección Perfil */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Tu Perfil en ese momento
                        </h3>
                        
                        {/* Bio */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">Tu biografía (Elevator Pitch)</p>
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <p className="text-sm leading-relaxed italic text-slate-600">
                                    "{snapshot.bio || "No proporcionaste una biografía en ese momento."}"
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Habilidades */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Cpu className="w-3.5 h-3.5" />
                                    Habilidades
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {snapshot.habilidades?.map((h: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                                            {h}
                                        </span>
                                    )) || <span className="text-xs text-slate-400 italic">Sin habilidades registradas</span>}
                                </div>
                            </div>

                            {/* Idiomas */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" />
                                    Idiomas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {snapshot.idiomas?.map((l: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-xl text-xs font-bold text-teal-700 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                            {l}
                                        </span>
                                    )) || <span className="text-xs text-slate-400 italic">Sin idiomas registrados</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nota aclaratoria */}
                    <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Información Inmutable</p>
                            <p className="text-[11px] font-medium text-amber-700/80 leading-snug">
                                Estos son los datos que la empresa está viendo actualmente. No se actualizan automáticamente si editas tu perfil general. Para cambiar esto, utiliza la opción "Editar" antes de que expire tu periodo de gracia de 5 minutos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all border border-slate-200 uppercase text-xs tracking-widest"
                    >
                        Cerrar Vista
                    </button>
                </div>
            </div>
        </div>
    );
}
