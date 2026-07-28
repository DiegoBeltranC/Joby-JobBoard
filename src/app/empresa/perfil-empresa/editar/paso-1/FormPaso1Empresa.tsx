"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, MapPin, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso1Empresa } from "@/actions/perfilEmpresa";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import SelectorEstadoMunicipio from "@/components/SelectorEstadoMunicipio";

// Validación RFC mexicano: 3-4 letras + 6 dígitos + 3 alfanuméricos
const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i;

const paso1EmpresaSchema = z.object({
    rfc: z.string()
        .min(1, "El RFC es obligatorio")
        .regex(rfcRegex, "RFC inválido. Formato esperado: XAXX010101000"),
    razon_social: z.string()
        .min(3, "La razón social debe tener al menos 3 caracteres")
        .max(200, "Máximo 200 caracteres"),
    estado: z.string().min(1, "Selecciona un estado"),
    municipio: z.string().min(1, "Selecciona un municipio"),
});

type FormValues = z.infer<typeof paso1EmpresaSchema>;

export default function FormPaso1Empresa({ valoresIniciales }: { valoresIniciales: FormValues }) {
    const router = useRouter();

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso1EmpresaSchema),
        defaultValues: valoresIniciales,
    });

    const estadoActual = watch("estado");
    const municipioActual = watch("municipio");

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Guardando datos legales...");
        const result = await guardarPaso1Empresa(data);

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Datos legales guardados!");
            router.push("/empresa/perfil-empresa/editar/paso-2");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECCIÓN 1: DATOS DE FACTURACIÓN */}
            <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-5">
                <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-600" /> Datos de Facturación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* RFC */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">RFC *</label>
                        <input
                            {...register("rfc")}
                            type="text"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none uppercase",
                                errors.rfc && "border-red-500"
                            )}
                            placeholder="XAXX010101000"
                            maxLength={13}
                        />
                        {errors.rfc && <p className="text-xs text-red-500">{errors.rfc.message}</p>}
                    </div>

                    {/* RAZÓN SOCIAL */}
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Razón Social *</label>
                        <input
                            {...register("razon_social")}
                            type="text"
                            className={cn(
                                "w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none",
                                errors.razon_social && "border-red-500"
                            )}
                            placeholder="Ej: Grupo Experiencias Xcaret S.A.P.I. de C.V."
                        />
                        {errors.razon_social && <p className="text-xs text-red-500">{errors.razon_social.message}</p>}
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: UBICACIÓN */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-600" /> Ubicación de la Empresa
                </h3>
                
                <SelectorEstadoMunicipio
                    estado={estadoActual}
                    municipio={municipioActual}
                    onEstadoChange={(e) => setValue("estado", e, { shouldValidate: true })}
                    onMunicipioChange={(m) => setValue("municipio", m, { shouldValidate: true })}
                    errorEstado={errors.estado?.message}
                    errorMunicipio={errors.municipio?.message}
                />
            </div>

            {/* BOTÓN DE ENVÍO */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 px-8 rounded-xl shadow-sm">
                    {isSubmitting ? "Guardando..." : "Guardar y Continuar"} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </form>
    );
}
