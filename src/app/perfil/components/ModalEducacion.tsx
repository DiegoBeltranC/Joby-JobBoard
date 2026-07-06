"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, GraduationCap } from "lucide-react";
import { agregarEducacion, editarEducacion } from "@/actions/perfil";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/hooks/useScrollLock";

type EducacionExtra = {
    id: number;
    titulo: string;
    institucion: string;
    año: number | null;
};

export default function ModalEducacion({
    educacionInicial,
    onClose
}: {
    educacionInicial: EducacionExtra | null;
    onClose: () => void;
}) {
    useScrollLock();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [titulo, setTitulo] = useState(educacionInicial?.titulo || "");
    const [institucion, setInstitucion] = useState(educacionInicial?.institucion || "");
    const [año, setAño] = useState<string>(educacionInicial?.año?.toString() || "");

    const currentYear = new Date().getFullYear();
    const añosOptions = Array.from({ length: 41 }, (_, i) => currentYear - i);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo.trim()) return toast.error("El título/carrera es obligatorio");
        if (!institucion.trim()) return toast.error("La institución es obligatoria");

        setIsSubmitting(true);
        const idCarga = toast.loading(educacionInicial ? "Actualizando..." : "Guardando educación...");

        const parsedAño = año ? parseInt(año, 10) : null;

        const payload = {
            titulo: titulo.trim(),
            institucion: institucion.trim(),
            año: parsedAño
        };

        const result = educacionInicial
            ? await editarEducacion(educacionInicial.id, payload)
            : await agregarEducacion(payload);

        setIsSubmitting(false);

        if (result.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success(educacionInicial ? "Educación actualizada" : "Educación guardada");
            router.refresh();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-teal-600" />
                        {educacionInicial ? "Editar Educación" : "Nueva Educación"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Título / Carrera / Curso / Certificación *</label>
                        <input
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="Ej. TSU en Desarrollo de Software Multiplataforma"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Institución / Centro Educativo / Emisor *</label>
                        <input
                            value={institucion}
                            onChange={(e) => setInstitucion(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="Ej. Universidad Tecnológica de Chetumal"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Año de finalización / obtención (opcional)</label>
                        <select
                            value={año}
                            onChange={(e) => setAño(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                        >
                            <option value="">No especificado / En curso</option>
                            {añosOptions.map((yr) => (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? "Guardando..." : educacionInicial ? "Guardar Cambios" : "Guardar Educación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
