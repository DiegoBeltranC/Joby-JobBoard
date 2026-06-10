"use client";

import { useState, useTransition, useEffect } from "react";
import { 
    MapPin, 
    Clock, 
    Building2, 
    Calendar, 
    ChevronRight, 
    X,
    ExternalLink,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import Link from "next/link";
import { postularVacanteAction, verificarPostulacionExistente } from "@/actions/postulaciones";
import { toast } from "sonner";
import { encodeId } from "@/lib/utils/hash";

interface Vacante {
    id: number;
    titulo: string;
    municipio: string | null;
    estado: string | null;
    modalidad: string;
    tipo_contrato: string;
    horario: string | null;
    createdAt: Date;
    descripcion?: string;
    sueldo_min?: number | null;
    sueldo_max?: number | null;
    empresa: {
        id: number;
        nombre_comercial: string;
        logo_url: string | null;
        descripcion?: string | null;
    };
}

interface VacantesSearchClientProps {
    vacantes: any[];
}

function calcularTiempoRelativo(fecha: Date) {
    const ahora = new Date();
    const diferenciaMs = ahora.getTime() - new Date(fecha).getTime();
    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    if (horas > 0) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (minutos > 0) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    return 'Recién publicado';
}

export default function VacantesSearchClient({ vacantes }: VacantesSearchClientProps) {
    const [selectedVacante, setSelectedVacante] = useState<any | null>(null);
    const [isPending, startTransition] = useTransition();
    const [yaPostulado, setYaPostulado] = useState(false);

    useEffect(() => {
        if (selectedVacante) {
            verificarPostulacionExistente(selectedVacante.id).then(setYaPostulado);
        } else {
            setYaPostulado(false);
        }
    }, [selectedVacante]);

    const handlePostular = () => {
        if (!selectedVacante) return;
        
        startTransition(async () => {
            const result = await postularVacanteAction(selectedVacante.id);
            if (result.success) {
                toast.success(result.message);
                setYaPostulado(true);
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleViewDetails = () => {
        if (!selectedVacante) return;
        const companyHash = encodeId(selectedVacante.empresa.id);
        const vacancyHash = encodeId(selectedVacante.id);
        const url = `/perfil-publico-empresa/${companyHash}?vacante=${vacancyHash}`;
        window.open(url, '_blank');
        setSelectedVacante(null);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
                {vacantes.map((v) => (
                    <div 
                        key={v.id} 
                        onClick={() => setSelectedVacante(v)}
                        className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300 group relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50/50 rounded-full blur-2xl group-hover:bg-teal-100/50 transition-colors"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex gap-2">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                        v.tipo_contrato === 'ESTADIA' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                        v.tipo_contrato === 'MEDIO_TIEMPO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        'bg-teal-50 text-teal-700 border border-teal-100'
                                    )}>
                                        {v.tipo_contrato.replace('_', ' ')}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                        {v.modalidad}
                                    </span>
                                    {v.horario && (
                                        <span className="px-3 py-1 bg-violet-50 text-violet-600 border border-violet-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {v.horario}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {calcularTiempoRelativo(v.createdAt)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                                    {v.empresa.logo_url ? (
                                        <img src={v.empresa.logo_url} alt={v.empresa.nombre_comercial} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-gray-300" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-teal-700 transition-colors">
                                        {v.titulo}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-500">{v.empresa.nombre_comercial}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-teal-500" />
                                    {v.municipio}, {v.estado}
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <Calendar className="w-4 h-4 text-teal-500" />
                                    Ver de un vistazo
                                </div>
                            </div>

                            <div className="mt-6">
                                <button className="w-full py-3.5 bg-gray-900 group-hover:bg-teal-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-gray-200 group-hover:shadow-teal-200 flex items-center justify-center gap-2 group/btn">
                                    Ver detalles
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedVacante && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative border border-white/20">
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedVacante(null); }}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full transition-all z-20 border border-white/30"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="h-48 bg-gradient-to-br from-teal-500 to-teal-800 relative p-8 flex items-end">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            
                            <div className="flex items-center gap-6 relative z-10 w-full">
                                <Link 
                                    href={`/perfil-publico-empresa/${encodeId(selectedVacante.empresa.id)}`}
                                    className="w-24 h-24 bg-white rounded-3xl p-2 shadow-xl border-4 border-white/20 hover:scale-105 transition-transform shrink-0"
                                >
                                    {selectedVacante.empresa.logo_url ? (
                                        <img 
                                            src={selectedVacante.empresa.logo_url} 
                                            alt={selectedVacante.empresa.nombre_comercial} 
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-2xl bg-gray-50 flex items-center justify-center">
                                            <Building2 className="w-10 h-10 text-gray-300" />
                                        </div>
                                    )}
                                </Link>
                                <div className="text-white overflow-hidden">
                                    <p className="text-teal-100 font-bold text-sm mb-1 uppercase tracking-widest truncate">
                                        {selectedVacante.empresa.nombre_comercial}
                                    </p>
                                    <h2 className="text-3xl font-black leading-tight truncate pr-8">
                                        {selectedVacante.titulo}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-teal-50/50 p-4 rounded-3xl border border-teal-100/50">
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Presupuesto Estimado</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none">
                                        {selectedVacante.sueldo_min ? (
                                            `$${(selectedVacante.sueldo_min / 1000).toFixed(1)}k - $${(selectedVacante.sueldo_max / 1000).toFixed(1)}k`
                                        ) : (
                                            "No especificado"
                                        )}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Sueldo mensual bruto</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col justify-center gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-white text-teal-700 border border-teal-100 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                            {selectedVacante.modalidad}
                                        </span>
                                        <span className="px-2 py-1 bg-white text-gray-600 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                            {selectedVacante.tipo_contrato?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <MapPin className="w-3.5 h-3.5 text-teal-500" />
                                            {selectedVacante.municipio}
                                        </div>
                                        {selectedVacante.horario && (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600">
                                                <Clock className="w-3.5 h-3.5 text-violet-500" />
                                                {selectedVacante.horario}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Acerca de esta posición
                                </h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {selectedVacante.descripcion || "Esta empresa busca talento con ganas de crecer. Revisa los detalles completos para conocer más sobre esta excelente oportunidad."}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleViewDetails}
                                    className="flex-1 py-4.5 bg-gray-900 hover:bg-teal-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 hover:shadow-teal-100 group"
                                >
                                    Ver Detalles
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                
                                <button 
                                    onClick={() => setSelectedVacante(null)}
                                    className="w-16 h-16 bg-gray-50 hover:bg-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center transition-all border border-gray-100"
                                    title="Cerrar"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-center text-[10px] font-bold text-gray-400 mt-6">
                                Al hacer clic, se abrirá el perfil oficial de la empresa para completar tu solicitud.
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
