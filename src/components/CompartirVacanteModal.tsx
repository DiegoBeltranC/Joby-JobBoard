"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, QrCode, Copy, Check, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/utils";

interface CompartirVacanteModalProps {
    isOpen: boolean;
    onClose: () => void;
    tituloVacante: string;
    nombreEmpresa: string;
    publicUrl: string;
    colorTheme?: "teal" | "violet";
}

export default function CompartirVacanteModal({
    isOpen,
    onClose,
    tituloVacante,
    nombreEmpresa,
    publicUrl,
    colorTheme = "teal"
}: CompartirVacanteModalProps) {
    useScrollLock(isOpen);
    const [copiado, setCopiado] = useState(false);
    const [qrCargando, setQrCargando] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Definir colores según el tema
    const isTeal = colorTheme === "teal";
    const qrColorDark = isTeal ? "009374" : "7c3aed"; // Verde UT Joby o Violeta corporativo
    const urlApiQr = `/api/qr?data=${encodeURIComponent(publicUrl)}&dark=${qrColorDark}`;

    useEffect(() => {
        if (isOpen) {
            setQrCargando(true);
        }
    }, [isOpen, publicUrl]);

    if (!isOpen || !mounted) return null;

    const fallbackCopiar = (text: string) => {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.left = "0";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            const exitoso = document.execCommand("copy");
            document.body.removeChild(textarea);
            
            if (exitoso) {
                setCopiado(true);
                toast.success("Enlace copiado al portapapeles");
                setTimeout(() => setCopiado(false), 2000);
            } else {
                toast.error("No se pudo copiar el enlace automáticamente.");
            }
        } catch (err) {
            console.error("Error en fallback de copia:", err);
            toast.error("No se pudo copiar el enlace.");
        }
    };

    const handleCopiarEnlace = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(publicUrl)
                .then(() => {
                    setCopiado(true);
                    toast.success("Enlace copiado al portapapeles");
                    setTimeout(() => setCopiado(false), 2000);
                })
                .catch((err) => {
                    console.error("Error al usar clipboard API, intentando fallback:", err);
                    fallbackCopiar(publicUrl);
                });
        } else {
            fallbackCopiar(publicUrl);
        }
    };

    const handleDownloadQR = async () => {
        try {
            toast.loading("Generando archivo de descarga...", { id: "descarga-qr" });
            const res = await fetch(urlApiQr);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            
            // Reemplazar espacios y caracteres no válidos para el nombre de archivo
            const nombreArchivo = `QR_Vacante_${tituloVacante.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
            link.download = nombreArchivo;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            toast.success("Código QR descargado con éxito", { id: "descarga-qr" });
        } catch (error) {
            console.error("Error al descargar QR:", error);
            toast.error("Ocurrió un error al descargar el QR.", { id: "descarga-qr" });
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div 
                className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-200 flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón de cerrar superior */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all border border-slate-100 z-10 cursor-pointer"
                    aria-label="Cerrar modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    {/* Icono Badge decorado */}
                    <div className={cn(
                        "p-4 rounded-3xl mt-2 shadow-sm border animate-pulse",
                        isTeal ? "bg-teal-50 border-teal-100 text-teal-600" : "bg-violet-50 border-violet-100 text-violet-600"
                    )}>
                        <QrCode className="w-8 h-8" />
                    </div>

                    {/* Información de la Vacante */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">
                            Compartir Vacante por QR
                        </span>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">
                            {tituloVacante}
                        </h3>
                        <p className={cn(
                            "text-sm font-extrabold",
                            isTeal ? "text-teal-600" : "text-violet-600"
                        )}>
                            {nombreEmpresa}
                        </p>
                    </div>

                    {/* Contenedor del Código QR */}
                    <div className="relative w-48 h-48 flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 shadow-inner overflow-hidden">
                        {qrCargando && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/85">
                                <Loader2 className={cn(
                                    "w-8 h-8 animate-spin",
                                    isTeal ? "text-teal-600" : "text-violet-600"
                                )} />
                            </div>
                        )}
                        <img 
                            src={urlApiQr} 
                            alt={`Código QR para la vacante ${tituloVacante}`}
                            className={cn(
                                "w-full h-full object-contain rounded-xl transition-all duration-300",
                                qrCargando ? "opacity-0 scale-90" : "opacity-100 scale-100"
                            )}
                            onLoad={() => setQrCargando(false)}
                        />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest -mt-2 block">
                        Escanear para postularse en Joby
                    </span>

                    {/* Botones de acción rápidos */}
                    <div className="w-full flex flex-col gap-3 pt-2">
                        <button
                            onClick={handleCopiarEnlace}
                            className={cn(
                                "w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 border shadow-sm cursor-pointer",
                                isTeal 
                                    ? "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100" 
                                    : "bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-100"
                            )}
                        >
                            {copiado ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copiar Enlace Directo
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDownloadQR}
                            className={cn(
                                "w-full py-3.5 px-4 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer",
                                isTeal 
                                    ? "bg-teal-600 hover:bg-teal-700 shadow-teal-100" 
                                    : "bg-violet-600 hover:bg-violet-700 shadow-violet-100"
                            )}
                        >
                            <Download className="w-4 h-4" />
                            Descargar QR PNG
                        </button>
                    </div>
                </div>

                {/* Footer del Modal */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
