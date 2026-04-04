"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Building2 } from "lucide-react";
import { agregarExperiencia, editarExperiencia } from "@/actions/perfil";

export default function ModalExperiencia({ experienciaInicial, onClose }: { experienciaInicial: any, onClose: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatFecha = (fecha: Date | null) => fecha ? new Date(fecha).toISOString().split('T')[0] : "";
    const hoyStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const [puesto, setPuesto] = useState(experienciaInicial?.puesto || "");
    const [empresa, setEmpresa] = useState(experienciaInicial?.empresa || "");
    const [fechaInicio, setFechaInicio] = useState(formatFecha(experienciaInicial?.fechaInicio) || "");
    const [fechaFin, setFechaFin] = useState(formatFecha(experienciaInicial?.fechaFin) || "");
    const [enCurso, setEnCurso] = useState(!experienciaInicial?.fechaFin && experienciaInicial != null);

    const [logros, setLogros] = useState<string[]>(experienciaInicial?.logros || []);
    const [nuevoLogro, setNuevoLogro] = useState("");

    const handleAgregarLogro = (e: React.MouseEvent) => {
        e.preventDefault();
        if (nuevoLogro.trim().length > 0) {
            setLogros([...logros, nuevoLogro.trim()]);
            setNuevoLogro("");
        }
    };

    const handleQuitarLogro = (index: number) => {
        setLogros(logros.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!puesto.trim()) return toast.error("El puesto es obligatorio");
        if (!empresa.trim()) return toast.error("La empresa es obligatoria");
        if (!fechaInicio) return toast.error("Selecciona una fecha de inicio");
        if (!enCurso && !fechaFin) return toast.error("Selecciona una fecha de fin o marca 'Trabajo actual'");
        if (logros.length === 0) return toast.error("Agrega al menos un logro o responsabilidad");

        // Validaciones de fecha
        const inicio = new Date(fechaInicio + "T12:00:00Z");
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        if (inicio > hoy) return toast.error("La fecha de inicio no puede ser en el futuro");

        if (!enCurso && fechaFin) {
            const fin = new Date(fechaFin + "T12:00:00Z");
            if (fin < inicio) return toast.error("La fecha de fin no puede ser anterior al inicio");
            if (fin > hoy) return toast.error("Si sigues trabajando ahí, marca la casilla 'Trabajo actual'");
        }

        setIsSubmitting(true);
        const idCarga = toast.loading(experienciaInicial ? "Actualizando..." : "Guardando experiencia...");

        const payload = {
            puesto: puesto.trim(),
            empresa: empresa.trim(),
            logros,
            fechaInicio,
            fechaFin: enCurso ? null : fechaFin
        };

        const result = experienciaInicial
            ? await editarExperiencia(experienciaInicial.id, payload)
            : await agregarExperiencia(payload);

        setIsSubmitting(false);

        if (result.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success(experienciaInicial ? "Experiencia actualizada" : "Experiencia guardada");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-600" />
                        {experienciaInicial ? "Editar Experiencia" : "Nueva Experiencia"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Puesto *</label>
                            <input value={puesto} onChange={(e) => setPuesto(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ej. Desarrollador Frontend" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Empresa *</label>
                            <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ej. Tech Solutions" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Fecha de Inicio *</label>
                            <input type="date" max={hoyStr} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                Fecha de Fin
                                <label className="flex items-center gap-1.5 text-teal-600 font-bold text-xs cursor-pointer">
                                    <input type="checkbox" checked={enCurso} onChange={(e) => setEnCurso(e.target.checked)} className="accent-teal-600" />
                                    Trabajo actual
                                </label>
                            </label>
                            <input type="date" min={fechaInicio} max={hoyStr} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={enCurso} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-700">Logros y Responsabilidades *</label>
                        <div className="flex gap-2">
                            <input value={nuevoLogro} onChange={(e) => setNuevoLogro(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAgregarLogro(e as any) }} className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ej. Lideré la migración a Next.js..." />
                            <button 
                                type="button" 
                                onClick={handleAgregarLogro} 
                                disabled={!nuevoLogro.trim()}
                                className={`px-4 rounded-lg font-medium text-sm transition-all ${
                                    !nuevoLogro.trim() 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                        : "bg-teal-100 text-teal-800 hover:bg-teal-200 active:scale-95 shadow-sm"
                                }`}
                            >
                                Añadir
                            </button>
                        </div>
                        {logros.length > 0 && (
                            <ul className="space-y-2 mt-2">
                                {logros.map((logro, index) => (
                                    <li key={index} className="flex justify-between bg-teal-50 text-teal-800 p-2.5 rounded-lg text-sm border border-teal-100">
                                        <span className="flex gap-2"><span className="text-teal-400">•</span> {logro}</span>
                                        <button type="button" onClick={() => handleQuitarLogro(index)} className="text-teal-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50">
                            {isSubmitting ? "Guardando..." : experienciaInicial ? "Guardar Cambios" : "Guardar Experiencia"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}