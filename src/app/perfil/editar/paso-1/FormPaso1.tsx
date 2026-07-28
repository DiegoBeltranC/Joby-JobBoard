"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, MapPin, UserCircle, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { guardarPaso1 } from "@/actions/perfil"; 
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import SelectorEstadoMunicipio from "@/components/SelectorEstadoMunicipio";

// 👇 Añadimos tipos_contrato al esquema
const paso1Schema = z.object({
    estado: z.string().min(1, "Selecciona un estado"),
    municipio: z.string().min(1, "Selecciona un municipio"),
    reubicacion: z.enum(["NO_DISPONIBLE", "DENTRO_DEL_ESTADO", "NACIONAL", "INTERNACIONAL"]),
    tipos_contrato: z.array(z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"])).min(1, "Selecciona al menos una opción"),
    bio: z.string().max(500, "Máximo 500 caracteres").optional().nullable(),
});

type FormValues = z.infer<typeof paso1Schema>;

export default function FormPaso1({ valoresIniciales }: { valoresIniciales: FormValues }) {
    const router = useRouter();

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(paso1Schema),
        defaultValues: valoresIniciales,
    });

    const estadoActual = watch("estado");
    const municipioActual = watch("municipio");
    const contratosActuales = watch("tipos_contrato") || []; // 👈 Vigilamos los contratos

    const onSubmit = async (data: FormValues) => {
        const idCarga = toast.loading("Guardando información...");
        const result = await guardarPaso1({
            ...data,
            bio: data.bio || ""
        });

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Información personal guardada!");
            router.push("/perfil/editar/paso-2");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECCIÓN 1: UBICACIÓN */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" /> Ubicación actual
                </h3>
                
                <SelectorEstadoMunicipio
                    estado={estadoActual}
                    municipio={municipioActual}
                    onEstadoChange={(e) => setValue("estado", e, { shouldValidate: true })}
                    onMunicipioChange={(m) => setValue("municipio", m, { shouldValidate: true })}
                    errorEstado={errors.estado?.message}
                    errorMunicipio={errors.municipio?.message}
                />

                <div className="space-y-1.5 pt-2">
                    <label className="text-sm font-medium text-gray-700">¿Hasta dónde te reubicarías por una buena oferta? *</label>
                    <select {...register("reubicacion")} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option value="NO_DISPONIBLE">No me mudo (Solo en mi ciudad)</option>
                        <option value="DENTRO_DEL_ESTADO">Nivel Estatal (Cualquier municipio de mi estado)</option>
                        <option value="NACIONAL">Nivel Nacional (Cualquier estado de México)</option>
                        <option value="INTERNACIONAL">Nivel Internacional (Dispuesto a salir del país)</option>
                    </select>
                </div>
            </div>

            {/* SECCIÓN 2: QUÉ BUSCAS */}
            <div className="bg-teal-50/40 p-5 rounded-2xl border border-teal-100 space-y-4">
                <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-teal-600" /> ¿Qué estás buscando?
                </h3>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipos de oportunidad que te interesan *</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: "ESTADIA", label: "Estadía Profesional" },
                            { id: "MEDIO_TIEMPO", label: "Medio Tiempo" },
                            { id: "TIEMPO_COMPLETO", label: "Tiempo Completo" }
                        ].map((tipo) => (
                            <button
                                key={tipo.id} type="button"
                                onClick={() => {
                                    const nuevos = contratosActuales.includes(tipo.id as any) 
                                        ? contratosActuales.filter(c => c !== tipo.id) 
                                        : [...contratosActuales, tipo.id as any];
                                    setValue("tipos_contrato", nuevos as any, { shouldValidate: true });
                                }}
                                className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all", 
                                    contratosActuales.includes(tipo.id as any) 
                                    ? "bg-teal-600 border-teal-600 text-white shadow-sm" 
                                    : "bg-white border-gray-200 text-gray-500 hover:border-teal-300")}
                            >
                                {tipo.label}
                            </button>
                        ))}
                    </div>
                    {errors.tipos_contrato && <p className="text-xs text-red-500 mt-1">{errors.tipos_contrato.message}</p>}
                </div>
            </div>

            {/* SECCIÓN 3: BIOGRAFÍA */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <UserCircle className="w-4 h-4 text-teal-600" /> Sobre ti
                </h3>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Tu Elevator Pitch (Biografía)</label>
                    <textarea 
                        {...register("bio")} 
                        className={cn("w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none h-32 resize-none", errors.bio && "border-red-500")}
                        placeholder="Cuéntale a las empresas qué estudias, qué te apasiona y qué estás buscando..." 
                    />
                </div>
            </div>

            {/* BOTÓN DE ENVÍO */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 px-8 rounded-xl shadow-sm">
                    Guardar y Continuar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </form>
    );
}