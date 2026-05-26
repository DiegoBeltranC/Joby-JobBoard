"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
    Clock, 
    Lock, 
    Building2, 
    Calendar, 
    ChevronRight, 
    FileText,
    CheckCircle2,
    Trash2,
    Loader2,
    X,
    Briefcase,
    MapPin,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clasesBadgeEstatus, etiquetaEstatusVacante } from "@/lib/vacanteEstatus";
import { cancelarPostulacionAction } from "@/actions/postulaciones";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { encodeId } from "@/lib/utils/hash";
import ModalDetalleSnapshot from "@/components/ModalDetalleSnapshot";
import ModalPostulacion from "@/components/ModalPostulacion";
import ModalDetalleVacante from "@/components/ModalDetalleVacante";

interface PostulacionCardProps {
    postulacion: any;
}

export default function PostulacionCard({ postulacion }: PostulacionCardProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState<number>(0);
    const [bloqueado, setBloqueado] = useState(false);
    const [showSnap, setShowSnap] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDetalleVacante, setShowDetalleVacante] = useState(false);
    const CINCO_MINUTOS_MS = 5 * 60 * 1000;

    useEffect(() => {
        const fechaCreacion = new Date(postulacion.createdAt).getTime();
        const tiempoExpiracion = fechaCreacion + CINCO_MINUTOS_MS;

        const actualizarReloj = () => {
            const ahora = Date.now();
            const restante = Math.max(0, tiempoExpiracion - ahora);

            if (restante <= 0 || postulacion.estatus !== 'ENVIADA') {
                setTiempoRestante(0);
                setBloqueado(true);
            } else {
                setTiempoRestante(restante);
                setBloqueado(false);
            }
        };

        actualizarReloj();
        const intervalo = setInterval(actualizarReloj, 1000);

        return () => clearInterval(intervalo);
    }, [postulacion.createdAt, postulacion.estatus]);

    const handleCancelar = async () => {
        if (!confirm("¿Estás seguro de que deseas cancelar esta postulación? Esta acción eliminará tu snapshot y no podrá deshacerse.")) return;
        
        setIsPending(true);
        const res = await cancelarPostulacionAction(postulacion.id);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setIsPending(false);
    };

    const segundosTotales = Math.floor(tiempoRestante / 1000);
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    const tiempoFormateado = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    const estatusVacante = postulacion.vacante?.estatus as string | undefined;
    const vacanteNoAbierta = estatusVacante && estatusVacante !== "ABIERTA";

    return (
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300 group">
            
            <div className="">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Logo Empresa */}
                    <div className="w-16 h-16 bg-gray-50 rounded-[20px] border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {postulacion.vacante.empresa.logo_url ? (
                            <img 
                                src={postulacion.vacante.empresa.logo_url} 
                                alt={postulacion.vacante.empresa.nombre_comercial} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <Building2 className="w-8 h-8 text-gray-200" />
                        )}
                    </div>

                    {/* Info Vacante */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                postulacion.estatus === "ENVIADA" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                postulacion.estatus === "ACEPTADA" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                postulacion.estatus === "VISTA" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-gray-50 text-gray-500 border-gray-200"
                            )}>
                                {postulacion.estatus}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-gray-50/50 px-2 py-1 rounded-lg">
                                <Calendar className="w-3 h-3" />
                                Enviada el {new Date(postulacion.createdAt).toLocaleDateString()}
                            </span>
                            {vacanteNoAbierta && estatusVacante && (
                                <span
                                    className={cn(
                                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                                        clasesBadgeEstatus(estatusVacante)
                                    )}
                                >
                                    Convocatoria {etiquetaEstatusVacante(estatusVacante).toLowerCase()}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight truncate pr-4">
                            {postulacion.vacante.titulo}
                        </h3>
                        <p className="text-gray-500 font-bold flex items-center gap-1.5 mt-0.5">
                            {postulacion.vacante.empresa.nombre_comercial}
                        </p>
                    </div>

                    {/* Bloque de Tiempo y Acciones */}
                    <div className="w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-50 md:pl-8 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                        {!bloqueado && (
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all bg-teal-50/50 text-teal-700 border-teal-100 animate-in fade-in zoom-in duration-500"
                            )}>
                                <Clock className="w-4 h-4 text-teal-600 animate-pulse" />
                                <span className="text-xs font-black tabular-nums tracking-tighter">
                                    EDITABLE: {tiempoFormateado}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSnap(true)}
                                className="px-4 py-3 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white font-black rounded-xl transition-all border border-teal-100 flex items-center gap-2 text-xs"
                            >
                                <FileText className="w-4 h-4" />
                                Ver mi Envío
                            </button>

                            {!bloqueado && (
                                <>
                                    <button
                                        onClick={() => setShowEdit(true)}
                                        className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 group/edit"
                                        title="Editar Postulación"
                                    >
                                        <FileText className="w-5 h-5 group-hover/edit:rotate-12 transition-transform" />
                                    </button>
                                    <button
                                        onClick={handleCancelar}
                                        disabled={isPending}
                                        className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 group/btn"
                                        title="Cancelar Envío"
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                        )}
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => setShowDetalleVacante(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-gray-900 hover:bg-teal-600 text-white font-black rounded-xl transition-all shadow-lg shadow-gray-200 hover:shadow-teal-100 group/link text-sm"
                            >
                                Ver Detalles
                                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales de Gestión (Renderizados vía Portales) */}
            {showSnap && typeof document !== 'undefined' && createPortal(
                <ModalDetalleSnapshot 
                    postulacion={postulacion}
                    onClose={() => setShowSnap(false)}
                />,
                document.body
            )}

            {showEdit && typeof document !== 'undefined' && createPortal(
                <ModalPostulacion 
                    vacanteId={postulacion.vacanteId}
                    vacanteTitulo={postulacion.vacante.titulo}
                    empresaNombre={postulacion.vacante.empresa.nombre_comercial}
                    tieneCVPerfil={true}
                    isEdit={true}
                    onClose={() => setShowEdit(false)}
                    onSuccess={() => router.refresh()}
                />,
                document.body
            )}

            {/* Modal de Detalles de la Vacante (Refactorizado a Componente) */}
            {showDetalleVacante && typeof document !== 'undefined' && createPortal(
                <ModalDetalleVacante 
                    vacante={postulacion.vacante}
                    onClose={() => setShowDetalleVacante(false)}
                />,
                document.body
            )}
        </div>
    );
}
