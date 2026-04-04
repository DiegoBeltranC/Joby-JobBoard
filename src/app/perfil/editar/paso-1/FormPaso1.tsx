"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso1 } from "@/actions/perfil"; // Asegúrate de que la ruta sea correcta

const paso1Schema = z.object({
    ubicacion: z.string().min(3, "Ingresa una ubicación válida"),
    bio: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type FormValues = z.infer<typeof paso1Schema>;

export default function FormPaso1({ valoresIniciales }: { valoresIniciales: FormValues }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso1Schema),
        defaultValues: valoresIniciales,
    });

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Guardando información...");
        const result = await guardarPaso1(data);

        // Si hay error, lo mostramos. Si hay éxito, navegamos al siguiente paso manualmente.
        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Paso 1 guardado!");
            router.push("/perfil/editar/paso-2");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ubicación</label>
                <input
                    {...register("ubicacion")}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ej. Chetumal, Quintana Roo"
                />
                {errors.ubicacion && <p className="text-xs text-red-500">{errors.ubicacion.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tu Elevator Pitch (Biografía)</label>
                <textarea
                    {...register("bio")}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none h-32 resize-none"
                    placeholder="Cuéntale a las empresas qué estudias, qué te apasiona y qué estás buscando..."
                />
                {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            <div className="flex justify-end pt-4 mt-6">
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