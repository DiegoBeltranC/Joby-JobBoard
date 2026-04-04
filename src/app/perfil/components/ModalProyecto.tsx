"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Briefcase } from "lucide-react";
import { agregarProyecto, editarProyecto } from "@/actions/perfil";

export default function ModalProyecto({ proyectoInicial, onClose }: { proyectoInicial: any, onClose: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extraer fechas para los inputs type="date" (Formato YYYY-MM-DD)
    const formatFecha = (fecha: Date | null) => fecha ? new Date(fecha).toISOString().split('T')[0] : "";
    const hoyStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const [nombre, setNombre] = useState(proyectoInicial?.nombre || "");
    const [url, setUrl] = useState(proyectoInicial?.url_enlace || "");
    const [fechaInicio, setFechaInicio] = useState(formatFecha(proyectoInicial?.fechaInicio) || "");
    const [fechaFin, setFechaFin] = useState(formatFecha(proyectoInicial?.fechaFin) || "");
    const [enCurso, setEnCurso] = useState(!proyectoInicial?.fechaFin && proyectoInicial != null);

    const [puntos, setPuntos] = useState<string[]>(proyectoInicial?.puntos_clave || []);
    const [nuevoPunto, setNuevoPunto] = useState("");

    const handleAgregarPunto = (e: React.MouseEvent) => {
        e.preventDefault();
        if (nuevoPunto.trim().length > 0) {
            setPuntos([...puntos, nuevoPunto.trim()]);
            setNuevoPunto("");
        }
    };

    const handleQuitarPunto = (index: number) => {
        setPuntos(puntos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validaciones de campos vacíos
        if (!nombre.trim()) return toast.error("El nombre es obligatorio");
        if (!fechaInicio) return toast.error("Selecciona una fecha de inicio");
        if (!enCurso && !fechaFin) return toast.error("Selecciona una fecha de fin o marca 'En desarrollo'");
        if (puntos.length === 0) return toast.error("Agrega al menos un punto clave");

        // 👇 2. NUEVAS VALIDACIONES DE FECHA LÓGICA
        const inicio = new Date(fechaInicio + "T12:00:00Z"); // Evita problemas de UTC
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999); // Al final del día de hoy

        // A) El inicio no puede ser en el futuro
        if (inicio > hoy) {
            return toast.error("La fecha de inicio no puede ser en el futuro");
        }

        // Si el proyecto ya terminó, hacemos validaciones para la fecha final
        if (!enCurso && fechaFin) {
            const fin = new Date(fechaFin + "T12:00:00Z");

            // B) El fin no puede ser ANTES del inicio
            if (fin < inicio) {
                return toast.error("La fecha de fin no puede ser anterior al inicio");
            }

            // C) El fin no puede ser en el futuro (Mejor usar "En desarrollo")
            if (fin > hoy) {
                return toast.error("Si el proyecto termina en el futuro, marca 'En desarrollo'");
            }
        }

        // 3. Envío al servidor si todo está perfecto
        setIsSubmitting(true);
        const idCarga = toast.loading(proyectoInicial ? "Actualizando..." : "Guardando proyecto...");

        const payload = {
            nombre: nombre.trim(),
            url_enlace: url.trim(),
            puntos_clave: puntos,
            fechaInicio,
            fechaFin: enCurso ? null : fechaFin
        };

        const result = proyectoInicial
            ? await editarProyecto(proyectoInicial.id, payload)
            : await agregarProyecto(payload);

        setIsSubmitting(false);

        if (result.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success(proyectoInicial ? "Proyecto actualizado" : "Proyecto guardado");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-teal-600" />
                        {proyectoInicial ? "Editar Proyecto" : "Nuevo Proyecto"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Nombre y URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Nombre del Proyecto *</label>
                            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Enlace (URL)</label>
                            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="https://" />
                        </div>
                    </div>

                    {/* Fechas */}
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
                                    En desarrollo
                                </label>
                            </label>
                            <input type="date" min={fechaInicio} max={hoyStr} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={enCurso} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" />
                        </div>
                    </div>

                    {/* Viñetas Dinámicas */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-700">Puntos Clave (Tecnologías y Logros) *</label>
                        <div className="flex gap-2">
                            <input value={nuevoPunto} onChange={(e) => setNuevoPunto(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAgregarPunto(e as any) }} className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Escribe un punto y presiona Añadir" />
                            <button 
                                type="button" 
                                onClick={handleAgregarPunto} 
                                disabled={!nuevoPunto.trim()}
                                className={`px-4 rounded-lg font-medium text-sm transition-all ${
                                    !nuevoPunto.trim() 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                        : "bg-teal-100 text-teal-800 hover:bg-teal-200 active:scale-95 shadow-sm"
                                }`}
                            >
                                Añadir
                            </button>
                        </div>
                        {puntos.length > 0 && (
                            <ul className="space-y-2 mt-2">
                                {puntos.map((punto, index) => (
                                    <li key={index} className="flex justify-between bg-teal-50 text-teal-800 p-2.5 rounded-lg text-sm border border-teal-100">
                                        <span className="flex gap-2"><span className="text-teal-400">•</span> {punto}</span>
                                        <button type="button" onClick={() => handleQuitarPunto(index)} className="text-teal-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50">
                            {isSubmitting ? "Guardando..." : proyectoInicial ? "Guardar Cambios" : "Crear Proyecto"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}