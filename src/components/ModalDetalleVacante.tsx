"use client";

import { 
    X, 
    Briefcase, 
    Clock, 
    FileText, 
    DollarSign, 
    MapPin, 
    Building2,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalDetalleVacanteProps {
    vacante: any;
    onClose: () => void;
}

export default function ModalDetalleVacante({ vacante, onClose }: ModalDetalleVacanteProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-200 flex flex-col relative z-[110]">
                
                {/* Cabecera Estilo Banner */}
                <div className="bg-slate-50 p-8 border-b border-slate-100 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all border border-slate-100 z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                            {vacante.empresa.logo_url ? (
                                <img src={vacante.empresa.logo_url} className="w-full h-full object-cover" alt={vacante.empresa.nombre_comercial} />
                            ) : (
                                <Building2 className="w-10 h-10 text-slate-200" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight truncate">
                                {vacante.titulo}
                            </h2>
                            <p className="text-teal-600 font-bold flex items-center gap-1.5 mt-1">
                                {vacante.empresa.nombre_comercial}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cuerpo del Modal (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                    
                    {/* Grid de Detalles Rápidos */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> Modalidad
                            </p>
                            <p className="font-bold text-slate-700 capitalize text-sm">{vacante.modalidad?.toLowerCase()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Horario
                            </p>
                            <p className="font-bold text-slate-700 text-sm">{vacante.horario || "No especificado"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Contrato
                            </p>
                            <p className="font-bold text-slate-700 text-sm">{vacante.tipo_contrato?.replace('_', ' ')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> Sueldo
                            </p>
                            <p className="font-bold text-teal-700 text-sm">
                                {vacante.sueldo_min ? (
                                    `$${vacante.sueldo_min.toLocaleString()} ${vacante.sueldo_max ? `- $${vacante.sueldo_max.toLocaleString()}` : ""} MXN`
                                ) : "No especificado"}
                            </p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> Ubicación
                            </p>
                            <p className="font-bold text-slate-700 text-sm">{vacante.municipio}, {vacante.estado}</p>
                        </div>
                    </div>

                    {/* Descripción Completa */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-900 border-l-4 border-teal-500 pl-3 uppercase tracking-widest">
                            Descripción del Puesto
                        </h3>
                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                            "{vacante.descripcion}"
                        </div>
                    </div>

                    {/* Requisitos / Habilidades */}
                    <div className="space-y-4 pb-4">
                        <h3 className="text-xs font-black text-slate-900 border-l-4 border-teal-500 pl-3 uppercase tracking-widest">
                            Habilidades y Requisitos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(vacante.habilidades_req || []).map((req: string, idx: number) => (
                                <span key={idx} className="px-3.5 py-2 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-teal-400" />
                                    {req}
                                </span>
                            ))}
                            {(vacante.habilidades_req || []).length === 0 && (
                                <p className="text-xs text-slate-400 italic">No se especificaron requisitos técnicos.</p>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Publicación</p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date(vacante.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer del Modal */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all border border-slate-200 uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-sm"
                    >
                        <X className="w-4 h-4" />
                        Cerrar Detalles
                    </button>
                </div>
            </div>
        </div>
    );
}
