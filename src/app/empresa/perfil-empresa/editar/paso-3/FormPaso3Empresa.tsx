"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Check, ArrowLeft, Globe, Megaphone, ImagePlus, X, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso3Empresa, agregarFotoEmpresa, eliminarFotoEmpresa } from "@/actions/perfilEmpresa";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import AvatarEmpresa from "./AvatarEmpresa";

const paso3EmpresaSchema = z.object({
    descripcion: z.string()
        .max(1000, "Máximo 1000 caracteres")
        .optional()
        .or(z.literal("")),
    sitio_web: z.string()
        .url("Ingresa una URL válida (ej: https://...)")
        .optional()
        .or(z.literal("")),
    linkedin: z.string()
        .url("Ingresa una URL válida")
        .optional()
        .or(z.literal("")),
    facebook: z.string()
        .url("Ingresa una URL válida")
        .optional()
        .or(z.literal("")),
});

type FormValues = z.infer<typeof paso3EmpresaSchema>;

interface FormPaso3Props {
    valoresIniciales: FormValues;
    logoActualUrl: string | null;
    fotosActuales: string[];
    nombreComercial: string;
}

export default function FormPaso3Empresa({ valoresIniciales, logoActualUrl, fotosActuales, nombreComercial }: FormPaso3Props) {
    const router = useRouter();
    const [fotos, setFotos] = useState<string[]>(fotosActuales);
    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso3EmpresaSchema),
        defaultValues: valoresIniciales,
    });

    const descripcionActual = watch("descripcion") || "";

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Finalizando actualización...");
        const result = await guardarPaso3Empresa(data);

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Perfil empresarial actualizado!");
            router.push("/empresa/perfil-empresa");
        }
    };

    // Manejar subida de foto de instalaciones
    const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        if (!file.type.includes("image/")) {
            toast.error("Solo se permiten imágenes (PNG, JPG, WebP)");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen no debe pesar más de 2MB");
            return;
        }
        if (fotos.length >= 5) {
            toast.error("Máximo 5 fotos. Elimina una para subir otra.");
            return;
        }

        setSubiendoFoto(true);
        const idCarga = toast.loading("Subiendo foto...");

        const formData = new FormData();
        formData.append("foto", file);

        const result = await agregarFotoEmpresa(formData);

        if (result?.error) {
            toast.error(result.error, { id: idCarga });
        } else {
            toast.success("Foto subida correctamente", { id: idCarga });
            if (result.url) {
                setFotos(prev => [...prev, result.url!]);
            }
        }

        setSubiendoFoto(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Eliminar foto
    const handleEliminarFoto = async (url: string) => {
        const idCarga = toast.loading("Eliminando foto...");
        const result = await eliminarFotoEmpresa(url);

        if (result?.error) {
            toast.error(result.error, { id: idCarga });
        } else {
            toast.success("Foto eliminada", { id: idCarga });
            setFotos(prev => prev.filter(f => f !== url));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* SECCIÓN 0: LOGO DE LA EMPRESA */}
            <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-4">
                <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-violet-600" /> Logo de la Empresa
                </h3>
                <p className="text-xs text-gray-500">Sube el logo de tu empresa. Los candidatos lo verán en tu perfil y en tus vacantes.</p>
                <div className="flex justify-center">
                    <AvatarEmpresa logoActualUrl={logoActualUrl} iniciales={nombreComercial.charAt(0)} />
                </div>
            </div>

            {/* SECCIÓN 1: DESCRIPCIÓN DE LA EMPRESA */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-violet-600" /> ¿A qué se dedica tu empresa?
                </h3>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Descripción <span className="text-amber-500 text-xs">(necesaria para completar perfil)</span></label>
                    <textarea
                        {...register("descripcion")}
                        className={cn(
                            "w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none h-32 resize-none",
                            errors.descripcion && "border-red-500"
                        )}
                        placeholder="Cuéntale a los candidatos sobre tu empresa: giro, cultura, valores..."
                    />
                    <div className="flex justify-between">
                        {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion.message}</p>}
                        <p className={cn("text-[11px] ml-auto", descripcionActual.length > 900 ? "text-amber-500 font-medium" : "text-gray-400")}>
                            {descripcionActual.length} / 1000
                        </p>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: PRESENCIA DIGITAL */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-600" /> Presencia en Internet
                </h3>
                <p className="text-xs text-gray-500">Al menos un enlace es necesario para completar tu perfil al 100%.</p>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Sitio Web</label>
                        <input
                            {...register("sitio_web")}
                            type="url"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none",
                                errors.sitio_web && "border-red-500"
                            )}
                            placeholder="https://www.tuempresa.com"
                        />
                        {errors.sitio_web && <p className="text-xs text-red-500">{errors.sitio_web.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                        <input
                            {...register("linkedin")}
                            type="url"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none",
                                errors.linkedin && "border-red-500"
                            )}
                            placeholder="https://www.linkedin.com/company/tu-empresa"
                        />
                        {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Facebook</label>
                        <input
                            {...register("facebook")}
                            type="url"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none",
                                errors.facebook && "border-red-500"
                            )}
                            placeholder="https://www.facebook.com/tu-empresa"
                        />
                        {errors.facebook && <p className="text-xs text-red-500">{errors.facebook.message}</p>}
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: FOTOS DE INSTALACIONES */}
            <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-4">
                <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-violet-600" /> Fotos de Instalaciones
                </h3>
                <p className="text-xs text-gray-500">
                    Adjunta fotos de las oficinas, local o instalaciones de tu empresa. Esto genera confianza en los candidatos. 
                    <span className="text-amber-600 font-medium"> Mínimo 1 foto para completar tu perfil.</span>
                </p>

                {/* Grid de fotos existentes */}
                {(fotos || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(fotos || []).map((url, idx) => (
                            <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                {/* Botón X para eliminar */}
                                <button
                                    type="button"
                                    onClick={() => handleEliminarFoto(url)}
                                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                    title="Eliminar esta foto"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bot\u00f3n para subir nueva foto */}
                {fotos.length < 5 && (
                    <label className={cn(
                        "flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                        subiendoFoto 
                            ? "border-violet-300 bg-violet-50 cursor-wait" 
                            : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50"
                    )}>
                        {subiendoFoto ? (
                            <>
                                <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span className="text-sm text-violet-600 font-medium">Subiendo...</span>
                            </>
                        ) : (
                            <>
                                <ImagePlus className="w-8 h-8 text-gray-400" />
                                <span className="text-sm text-gray-600 font-medium">Subir foto ({fotos.length}/5)</span>
                                <span className="text-[11px] text-gray-400">PNG, JPG o WebP • Máximo 2MB</span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            onChange={handleSubirFoto}
                            disabled={subiendoFoto}
                        />
                    </label>
                )}

                {fotos.length >= 5 && (
                    <p className="text-xs text-amber-600 font-medium text-center">Has alcanzado el límite de 5 fotos. Elimina una para subir otra.</p>
                )}
            </div>

            {/* NAVEGACIÓN */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.push("/empresa/perfil-empresa/editar/paso-2")}
                    className="flex items-center text-sm font-medium text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center bg-gray-900 text-white text-sm font-bold px-8 py-2.5 rounded-xl hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : "Finalizar y Ver Perfil"} <Check className="w-4 h-4 ml-2" />
                </button>
            </div>
        </form>
    );
}
