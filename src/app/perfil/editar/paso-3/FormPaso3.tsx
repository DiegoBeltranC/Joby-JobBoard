"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Check, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso3 } from "@/actions/perfil";

const paso3Schema = z.object({
    linkedin: z.string().url("Ingresa una URL válida").optional().or(z.literal('')),
    github: z.string().url("Ingresa una URL válida").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof paso3Schema>;

export default function FormPaso3({ valoresIniciales }: { valoresIniciales: FormValues }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso3Schema),
        defaultValues: valoresIniciales,
    });

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Finalizando actualización...");
        const result = await guardarPaso3(data);

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Perfil completado!");
            router.push("/perfil");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enlace a LinkedIn (opcional)</label>
                <input
                    {...register("linkedin")}
                    type="url"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="https://www.linkedin.com/in/tu-usuario"
                />
                {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enlace a GitHub o Portafolio (opcional)</label>
                <input
                    {...register("github")}
                    type="url"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="https://github.com/tu-usuario"
                />
                {errors.github && <p className="text-xs text-red-500">{errors.github.message}</p>}
            </div>

            {/* AVISO DE SUBIDA DE ARCHIVOS */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                <div className="mt-0.5 text-amber-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                    <b>Próximamente:</b> Podrás subir tu Currículum en PDF y tu foto de perfil directamente. Por ahora, asegúrate de que tus redes sociales estén actualizadas.
                </p>
            </div>

            <div className="flex justify-between pt-4 mt-6">
                <button
                    type="button"
                    onClick={() => router.push("/perfil/editar/paso-2")}
                    className="flex items-center text-sm font-medium text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center bg-gray-900 text-white text-sm font-bold px-8 py-2.5 rounded-lg hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : "Finalizar y Ver Perfil"} <Check className="w-4 h-4 ml-2" />
                </button>
            </div>
        </form>
    );
}