"use client";

import { useTransition, useRef, useState } from "react";
import { uploadCVAction, deleteCVAction } from "@/actions/cv";
import { generarCVAction } from "@/actions/cvGenerator";
import { FileText, Trash2, ExternalLink, Loader2, UploadCloud, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const MagicCVBuilder = dynamic(() => import('./MagicCVBuilder'), { 
    ssr: false 
});

export default function GestionCV({ cvUrl }: { cvUrl?: string | null }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);

    const processFile = async (file: File) => {
        if (file.type !== "application/pdf") {
            toast.error("Solo se permiten archivos PDF");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("El archivo no debe superar los 5MB");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("cv", file);

        startTransition(async () => {
            const idToast = toast.loading("Subiendo Currículum...");
            const res = await uploadCVAction(formData);
            if (res?.error) {
                toast.error(res.error, { id: idToast });
            } else {
                toast.success("Currículum subido correctamente", { id: idToast });
                router.refresh();
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isPending && !isGenerating && !cvUrl) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (isPending || isGenerating || cvUrl) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleDelete = () => {
        if (!confirm("¿Estás seguro de que quieres eliminar tu Currículum? Esta acción no se puede deshacer.")) return;

        startTransition(async () => {
            setIsDeleting(true);
            const idToast = toast.loading("Eliminando Currículum...");
            const res = await deleteCVAction();
            if (res?.error) {
                toast.error(res.error, { id: idToast });
            } else {
                toast.success("Currículum eliminado", { id: idToast });
                router.refresh();
            }
            setIsDeleting(false);
        });
    };

    const handleGenerate = () => {
        // En vez de generar ciegamente, abrimos el Live Preview Builder
        setShowBuilder(true);
    };

    const isLocked = isPending || isGenerating || isDeleting || showBuilder;

    return (
        <div className="w-full">
            <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isLocked}
            />

            {showBuilder && <MagicCVBuilder onClose={() => setShowBuilder(false)} />}

            {cvUrl ? (
                // Vista Cuando Ya Existe Archivo
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 p-3.5 bg-teal-50 border border-teal-100 rounded-xl w-full overflow-hidden transition-all hover:bg-teal-100/50 shadow-sm">
                      
                      {/* Fila Superior: Icono y Detalles (A prueba de desbordes) */}
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <div className="shrink-0 bg-teal-100 text-teal-700 p-2.5 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5" /> 
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate" title={cvUrl.includes("magic") ? "📄 Mi Magic Resume (Joby)" : "📄 Mi Currículum Subido"}>
                            {cvUrl.includes("magic") ? "📄 Mi Magic Resume (Joby)" : "📄 Mi Currículum Subido"}
                          </p>
                          <p className="text-xs text-teal-600 truncate">
                            Listo para impresionar
                          </p>
                        </div>
                      </div>

                      {/* Fila Inferior: Botones de Acción */}
                      <div className="flex flex-wrap items-center gap-2 w-full pt-1 border-t border-teal-100/50 mt-1">
                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 h-8 px-3 text-xs flex-1 sm:flex-none border border-teal-200 bg-white shadow-sm text-teal-700 font-medium rounded-md hover:bg-teal-50 hover:text-teal-800 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" /> Ver PDF
                        </a>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLocked}
                            className="flex items-center justify-center h-8 w-8 shrink-0 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-md transition-colors shadow-sm disabled:opacity-50"
                            title="Eliminar CV"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Boton Regenerar si ya tiene CV */}
                    {cvUrl.includes("magic") && (
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isLocked}
                                className="text-xs flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                ✨ Editar Magic Resume
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Boton Magic Generador */}
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLocked}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 text-teal-800 font-bold transition-all shadow-sm group disabled:opacity-75"
                    >
                        <Sparkles className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
                        <span>✨ Generar CV con mis datos de Joby</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <hr className="flex-1 border-gray-200" />
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">O sube el tuyo</span>
                        <hr className="flex-1 border-gray-200" />
                    </div>

                    {/* Drag and Drop Area */}
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isLocked && fileInputRef.current?.click()}
                        className={`w-full group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                            isDragging 
                            ? "border-teal-400 bg-teal-50" 
                            : "border-gray-300 hover:border-teal-300 hover:bg-gray-50 bg-white"
                        } ${isLocked ? "opacity-70 pointer-events-none" : ""}`}
                    >
                        <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? "bg-teal-100 text-teal-600" : "bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500"}`}>
                            {isPending ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : (
                                <UploadCloud className="w-8 h-8" />
                            )}
                        </div>
                        <p className={`text-sm font-semibold ${isDragging ? "text-teal-700" : "text-gray-700 group-hover:text-teal-600"}`}>
                            {isPending ? "Subiendo archivo..." : (isDragging ? "¡Suelta el archivo aquí!" : "Haz clic para subir o arrastra tu PDF")}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Máximo 5MB (solo formato .pdf)</p>
                    </div>
                </div>
            )}
        </div>
    );
}
