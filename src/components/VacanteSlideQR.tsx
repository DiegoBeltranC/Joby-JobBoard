import { useEffect, useState } from "react";
import { urlPerfilPublicoVacante } from "@/lib/vacanteUrls";
import { MapPin, DollarSign, Briefcase, Building2, Clock } from "lucide-react";

interface VacanteSlideQRProps {
    vacante: {
        id: number;
        titulo: string;
        descripcion?: string;
        sueldo_min?: number | null;
        sueldo_max?: number | null;
        municipio?: string | null;
        estado?: string | null;
        modalidad?: string | null;
        tipo_contrato?: string | null;
        empresa?: {
            id: number;
            nombre_comercial: string;
            logo_url?: string | null;
        } | null;
        empresaId?: number | null;
    };
}

export default function VacanteSlideQR({ vacante }: VacanteSlideQRProps) {
    const [urlApiQr, setUrlApiQr] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const origin = "https://bolsa-trabajo-teal.vercel.app";
            const empresaId = vacante.empresaId || vacante.empresa?.id;
            const urlDestino = urlPerfilPublicoVacante(empresaId, vacante.id, origin);
            
            setUrlApiQr(`${origin}/api/qr?data=${encodeURIComponent(urlDestino)}&dark=009374`);
            setMounted(true);
        }
    }, [vacante]);

    if (!mounted) {
        return (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const formatSueldo = () => {
        if (!vacante.sueldo_min && !vacante.sueldo_max) return "Sueldo no especificado";
        if (vacante.sueldo_min && vacante.sueldo_max) {
            return `$${vacante.sueldo_min.toLocaleString()} - $${vacante.sueldo_max.toLocaleString()} MXN`;
        }
        return `$${(vacante.sueldo_min || vacante.sueldo_max)?.toLocaleString()} MXN`;
    };

    const formatContrato = (tipo: string | null | undefined) => {
        if (!tipo) return "No especificado";
        return tipo.replace("_", " ").toUpperCase();
    };

    return (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden relative select-none">
            
            {/* Banner superior de la Empresa (Altura compacta para evitar desbordamientos en TV) */}
            <div className="relative h-[22vh] min-h-[140px] max-h-[180px] bg-gradient-to-r from-slate-950 via-slate-900 to-[#009374] flex items-end p-6 md:p-8 pb-10 shrink-0">
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Logo de la Empresa Superpuesto (Proporcional) */}
                <div className="absolute -bottom-6 left-8 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white rounded-[24px] p-2 shadow-xl border-4 border-slate-100 flex items-center justify-center overflow-hidden z-10">
                    {vacante.empresa?.logo_url ? (
                        <img 
                            src={vacante.empresa.logo_url} 
                            alt={vacante.empresa.nombre_comercial} 
                            className="w-full h-full object-cover rounded-[16px]"
                        />
                    ) : (
                        <Building2 className="w-12 h-12 text-slate-300" />
                    )}
                </div>

                {/* Textos y Badges de la Empresa */}
                <div className="ml-32 md:ml-36 lg:ml-40 z-10 text-white flex flex-col gap-1.5 mb-1">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#009374] text-white text-[9px] font-black rounded-md uppercase tracking-wider shadow-sm">
                            Empresa Verificada
                        </span>
                        {(vacante.municipio || vacante.estado) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 text-white text-[9px] font-extrabold rounded-md backdrop-blur-sm">
                                <MapPin className="w-3 h-3 text-teal-300" />
                                {vacante.municipio ? `${vacante.municipio}, ` : ""}{vacante.estado || ""}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight uppercase leading-none drop-shadow-md">
                        {vacante.empresa?.nombre_comercial || "Empresa Destacada"}
                    </h1>
                </div>
            </div>

            {/* Cuerpo del Slide (Usa Flexbox para ajuste perfecto de altura) */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 pt-10 md:pt-12 gap-6 md:gap-8 bg-white min-h-0 overflow-hidden">
                
                {/* Columna Izquierda: Información de la Vacante (Col-span 7) */}
                <div className="col-span-7 flex flex-col justify-between h-full min-h-0 overflow-hidden pb-2">
                    <div>
                        {/* Etiqueta de Vacante Destacada */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#009374] text-[10px] md:text-xs font-black rounded-lg border border-teal-100/80 mb-3 uppercase tracking-wider shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#009374] animate-pulse"></span>
                            Vacante Destacada
                        </span>

                        {/* Título de la Vacante */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight line-clamp-2">
                            {vacante.titulo}
                        </h2>

                        {/* Descripción (Ajustada a 2 líneas para dar espacio) */}
                        {vacante.descripcion && (
                            <div className="mt-4 p-4 bg-[#f8fafc] border border-slate-100 rounded-2xl shadow-sm">
                                <p className="text-slate-600 font-medium text-xs md:text-sm lg:text-base leading-relaxed line-clamp-2">
                                    "{vacante.descripcion}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Especificaciones Clave (Fichas Grandes de Datos) */}
                    <div className="grid grid-cols-3 gap-3.5 mt-4">
                        <div className="bg-[#f8fafc] border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center shadow-sm">
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-[#009374]" />
                                Modalidad
                            </span>
                            <span className="text-xs md:text-sm lg:text-base font-black text-slate-800 uppercase mt-1 truncate">
                                {vacante.modalidad || "Presencial"}
                            </span>
                        </div>

                        <div className="bg-[#f8fafc] border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center shadow-sm">
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#009374]" />
                                Contrato
                            </span>
                            <span className="text-xs md:text-sm lg:text-base font-black text-slate-800 uppercase mt-1.5 truncate">
                                {formatContrato(vacante.tipo_contrato)}
                            </span>
                        </div>

                        <div className="bg-[#f8fafc] border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center shadow-sm">
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-[#009374]" />
                                Sueldo
                            </span>
                            <span className="text-xs md:text-sm lg:text-base font-black text-slate-800 uppercase mt-1.5 truncate">
                                {formatSueldo()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Código QR Ampliado (Col-span 5) */}
                <div className="col-span-5 flex flex-col items-center justify-center bg-[#f8fafc] border border-slate-100 rounded-[32px] p-5 md:p-6 text-center shadow-sm h-full min-h-0">
                    {/* Caja del QR optimizada */}
                    <div className="bg-white p-3.5 rounded-[24px] shadow-md border border-slate-100/60 flex items-center justify-center">
                        {urlApiQr ? (
                            <img 
                                src={urlApiQr} 
                                alt="Código QR de la Vacante" 
                                className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
                            />
                        ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-slate-100 animate-pulse rounded-[18px]"></div>
                        )}
                    </div>
                    
                    <div className="mt-4 px-2">
                        <span className="text-[#009374] text-xs md:text-sm lg:text-base font-black tracking-wider uppercase block">
                            Escanea para Postularte
                        </span>
                        <p className="text-slate-500 text-[10px] md:text-xs font-semibold leading-normal mt-1.5">
                            Apunta tu cámara aquí para aplicar instantáneamente desde tu celular en Joby
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
