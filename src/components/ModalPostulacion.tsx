"use client";

import { useState, useTransition } from "react";
import { 
    X, 
    FileText, 
    Upload, 
    ShieldCheck, 
    Clock, 
    AlertTriangle,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { postularVacanteAction } from "@/actions/postulaciones";
import { toast } from "sonner";

interface ModalPostulacionProps {
    vacanteId: number;
    vacanteTitulo: string;
    empresaNombre: string;
    tieneCVPerfil: boolean;
    isEdit?: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalPostulacion({ 
    vacanteId, 
    vacanteTitulo, 
    empresaNombre, 
    tieneCVPerfil,
    isEdit = false,
    onClose,
    onSuccess 
}: ModalPostulacionProps) {
    const [isPending, startTransition] = useTransition();
    const [opcionCV, setOpcionCV] = useState<"perfil" | "nuevo">(tieneCVPerfil ? "perfil" : "nuevo");
    const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("vacanteId", vacanteId.toString());
        formData.append("opcionCV", opcionCV);
        
        if (opcionCV === "nuevo") {
            if (!archivoNuevo) {
                return toast.error("Por favor selecciona un archivo PDF.");
            }
            formData.append("nuevo_cv", archivoNuevo);
        }

        startTransition(async () => {
            const result = await postularVacanteAction(formData);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onClose();
            } else {
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20">
                {/* Header */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white relative h-32 flex flex-col justify-end">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-black leading-tight">
                        {isEdit ? "Editar Postulación" : "Postularse a Vacante"}
                    </h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 truncate">
                        {vacanteTitulo} @ {empresaNombre}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {/* Selección de CV */}
                    <div className="space-y-4 mb-8">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                            Selecciona tu Currículum Vitae (PDF)
                        </label>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {/* Opción A: Perfil */}
                            <button
                                type="button"
                                disabled={!tieneCVPerfil}
                                onClick={() => setOpcionCV("perfil")}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all text-left group",
                                    opcionCV === "perfil" 
                                        ? "border-teal-500 bg-teal-50/50" 
                                        : "border-gray-100 hover:border-gray-200 bg-white",
                                    !tieneCVPerfil && "opacity-50 grayscale cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                    opcionCV === "perfil" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                )}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className={cn("text-sm font-black", opcionCV === "perfil" ? "text-teal-900" : "text-gray-700")}>
                                        Usar mi CV del perfil
                                    </p>
                                    <p className="text-xs font-bold text-gray-400">
                                        {tieneCVPerfil ? "Snapshoot de tu archivo guardado" : "No tienes un CV guardado"}
                                    </p>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                    opcionCV === "perfil" ? "border-teal-500 bg-teal-500" : "border-gray-200"
                                )}>
                                    {opcionCV === "perfil" && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>

                            {/* Opción B: Nuevo */}
                            <div
                                onClick={() => setOpcionCV("nuevo")}
                                className={cn(
                                    "p-5 rounded-[24px] border-2 transition-all cursor-pointer group",
                                    opcionCV === "nuevo" 
                                        ? "border-teal-500 bg-teal-50/50" 
                                        : "border-gray-100 hover:border-gray-200 bg-white"
                                )}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        opcionCV === "nuevo" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                    )}>
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-sm font-black", opcionCV === "nuevo" ? "text-teal-900" : "text-gray-700")}>
                                            Subir un CV específico
                                        </p>
                                        <p className="text-xs font-bold text-gray-400">Sólo archivos PDF (máx. 5MB)</p>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                        opcionCV === "nuevo" ? "border-teal-500 bg-teal-500" : "border-gray-200"
                                    )}>
                                        {opcionCV === "nuevo" && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </div>

                                {opcionCV === "nuevo" && (
                                    <div className="mt-4 animate-in slide-in-from-top-2">
                                        <input 
                                            type="file" 
                                            accept=".pdf"
                                            onChange={(e) => setArchivoNuevo(e.target.files?.[0] || null)}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Advertencias */}
                    <div className="bg-gray-50 rounded-[28px] p-6 space-y-4 mb-8 border border-gray-100">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">Snapshoot Inmutable</p>
                                <p className="text-[10px] font-bold text-gray-500 leading-tight">
                                    Tu perfil y CV se "congelarán" para esta empresa. Si editas tu perfil general después de postularte, la empresa seguirá viendo esta versión.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">Período de Gracia</p>
                                <p className="text-[10px] font-bold text-gray-500 leading-tight">
                                    Tendrás **5 minutos** para cancelar o modificar tu solicitud. Pasado ese tiempo, el envío será definitivo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4.5 bg-gray-900 hover:bg-teal-600 text-white font-black rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 hover:shadow-teal-100 disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                {isEdit ? "Actualizar Postulación" : "Confirmar y Enviar Postulación"}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="w-full text-center mt-6 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                    >
                        Cancelar y volver
                    </button>
                </form>
            </div>
        </div>
    );
}
