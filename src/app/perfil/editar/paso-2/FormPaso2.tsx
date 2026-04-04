"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso2 } from "@/actions/perfil"; // Asegúrate de que la ruta coincida

// Validamos simples strings (textos)
const paso2Schema = z.object({
    habilidades: z.string().min(2, "Ingresa al menos una habilidad"),
    idiomas: z.string().optional(),
});

type FormValues = z.infer<typeof paso2Schema>;

export default function FormPaso2({ valoresIniciales }: { valoresIniciales: FormValues }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso2Schema),
        defaultValues: valoresIniciales,
    });

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Guardando herramientas...");

        // Transformamos el texto (Ej. "React, Node") en un arreglo (["React", "Node"])
        const payloadLimpio = {
            habilidades: data.habilidades.split(',').map(s => s.trim()).filter(Boolean),
            idiomas: data.idiomas ? data.idiomas.split(',').map(s => s.trim()).filter(Boolean) : []
        };

        const result = await guardarPaso2(payloadLimpio);

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Habilidades guardadas!");
            router.push("/perfil/editar/paso-3");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Habilidades Técnicas</label>
                <input
                    {...register("habilidades")}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ej. Next.js, Laravel, Ciberseguridad, Figma"
                />
                {errors.habilidades && <p className="text-xs text-red-500">{errors.habilidades.message}</p>}
                <p className="text-xs text-gray-500">Separa cada herramienta con una coma (,). Estas son las palabras clave con las que te encontrarán.</p>
            </div>

            <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Idiomas (Opcional)</label>
                <input
                    {...register("idiomas")}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ej. Inglés B2, Español Nativo"
                />
                <p className="text-xs text-gray-500">Separa los idiomas con una coma (,).</p>
            </div>

            {/* CONTROLES DE NAVEGACIÓN */}
            <div className="flex justify-between pt-4 mt-6">
                <button
                    type="button"
                    onClick={() => router.push("/perfil/editar/paso-1")}
                    className="flex items-center text-sm font-medium text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center bg-teal-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : "Guardar y Continuar"} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </form>
    );
}