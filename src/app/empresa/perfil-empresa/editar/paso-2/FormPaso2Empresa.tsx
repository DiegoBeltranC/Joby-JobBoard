"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, ArrowLeft, UserCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso2Empresa } from "@/actions/perfilEmpresa";
import { cn } from "@/lib/utils";

const telefonoRegex = /^[0-9]{10}$/;

const paso2EmpresaSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "Máximo 100 caracteres"),
    apellidoPaterno: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "Máximo 100 caracteres"),
    apellidoMaterno: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
    cargo_contacto: z.string()
        .min(2, "El cargo debe tener al menos 2 caracteres")
        .max(150, "Máximo 150 caracteres"),
    telefono_contacto: z.string()
        .regex(telefonoRegex, "Ingresa un teléfono válido de 10 dígitos")
        .optional()
        .or(z.literal("")),
});

type FormValues = z.infer<typeof paso2EmpresaSchema>;

export default function FormPaso2Empresa({ valoresIniciales }: { valoresIniciales: FormValues }) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso2EmpresaSchema),
        defaultValues: valoresIniciales,
    });

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Guardando datos del reclutador...");
        const result = await guardarPaso2Empresa(data);

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Datos del reclutador guardados!");
            router.push("/empresa/perfil-empresa/editar/paso-3");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* SECCIÓN 1: DATOS PERSONALES DEL RECLUTADOR */}
            <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-5">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-indigo-600" /> Persona de Contacto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NOMBRE */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Nombre(s) *</label>
                        <input
                            {...register("nombre")}
                            type="text"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                                errors.nombre && "border-red-500"
                            )}
                            placeholder="Ej: María Elena"
                        />
                        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>

                    {/* APELLIDO PATERNO */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Apellido Paterno *</label>
                        <input
                            {...register("apellidoPaterno")}
                            type="text"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                                errors.apellidoPaterno && "border-red-500"
                            )}
                            placeholder="Ej: González"
                        />
                        {errors.apellidoPaterno && <p className="text-xs text-red-500">{errors.apellidoPaterno.message}</p>}
                    </div>

                    {/* APELLIDO MATERNO */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Apellido Materno <span className="text-gray-400">(opcional)</span></label>
                        <input
                            {...register("apellidoMaterno")}
                            type="text"
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ej: López"
                        />
                    </div>

                    {/* CARGO */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Cargo *</label>
                        <input
                            {...register("cargo_contacto")}
                            type="text"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                                errors.cargo_contacto && "border-red-500"
                            )}
                            placeholder="Ej: Gerente de Recursos Humanos"
                        />
                        {errors.cargo_contacto && <p className="text-xs text-red-500">{errors.cargo_contacto.message}</p>}
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: TELÉFONO */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" /> Contacto Directo
                </h3>

                <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Teléfono de contacto <span className="text-gray-400">(10 dígitos)</span></label>
                    <input
                        {...register("telefono_contacto")}
                        type="tel"
                        className={cn(
                            "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none max-w-sm",
                            errors.telefono_contacto && "border-red-500"
                        )}
                        placeholder="9831234567"
                        maxLength={10}
                    />
                    {errors.telefono_contacto && <p className="text-xs text-red-500">{errors.telefono_contacto.message}</p>}
                    <p className="text-[11px] text-gray-400">Solo dígitos, sin espacios ni guiones.</p>
                </div>
            </div>

            {/* NAVEGACIÓN */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
                <button type="button" onClick={() => router.push("/empresa/perfil-empresa/editar/paso-1")} className="flex items-center text-sm font-medium text-gray-600 hover:bg-gray-100 px-4 py-2.5 rounded-xl transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? "Guardando..." : "Guardar y Continuar"} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </form>
    );
}
