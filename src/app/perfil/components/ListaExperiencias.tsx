"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, Building2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { eliminarExperiencia } from "@/actions/perfil";
import ModalExperiencia from "./ModalExperiencia";

type Experiencia = {
    id: number; puesto: string; empresa: string; logros: string[]; fechaInicio: Date; fechaFin: Date | null;
};

export default function ListaExperiencias({ experiencias }: { experiencias: Experiencia[] }) {
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [experienciaEditando, setExperienciaEditando] = useState<Experiencia | null>(null);
    const [experienciaAEliminar, setExperienciaAEliminar] = useState<number | null>(null);

    const experienciasVisibles = mostrarTodos ? experiencias : experiencias.slice(0, 2);

    const confirmarEliminacion = async () => {
        if (!experienciaAEliminar) return;
        const idCarga = toast.loading("Eliminando experiencia...");
        const res = await eliminarExperiencia(experienciaAEliminar);
        if (res.error) toast.error(res.error, { id: idCarga });
        else toast.success("Experiencia eliminada", { id: idCarga });
        setExperienciaAEliminar(null);
    };

    const abrirParaCrear = () => {
        setExperienciaEditando(null);
        setModalAbierto(true);
    };

    const abrirParaEditar = (exp: Experiencia) => {
        setExperienciaEditando(exp);
        setModalAbierto(true);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center justify-between">
                Experiencia Laboral
                {experiencias.length > 0 && (
                    <button onClick={abrirParaCrear} className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Añadir
                    </button>
                )}
            </h3>

            {experiencias.length === 0 ? (
                <div onClick={abrirParaCrear} className="cursor-pointer text-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                    <span className="text-gray-500 text-sm group-hover:text-teal-700 font-medium">+ Añadir tu primera experiencia (o Estadía)</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {experienciasVisibles.map(exp => (
                        <div key={exp.id} className="relative group p-5 border border-gray-100 bg-white rounded-xl shadow-sm hover:border-teal-200 transition-all">

                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => abrirParaEditar(exp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setExperienciaAEliminar(exp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h4 className="font-bold text-gray-800 pr-16 text-lg">{exp.puesto}</h4>

                            <div className="flex flex-wrap items-center gap-4 mt-1.5 mb-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1 text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                                    <Building2 className="w-3.5 h-3.5" /> {exp.empresa}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(exp.fechaInicio).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })} -
                                    {exp.fechaFin ? new Date(exp.fechaFin).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : " Actual"}
                                </span>
                            </div>

                            <ul className="space-y-1.5 pl-1 mt-3 border-t border-gray-50 pt-3">
                                {exp.logros.map((logro, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex gap-2 items-start">
                                        <span className="text-teal-400 mt-0.5">•</span> <span>{logro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {experiencias.length > 2 && (
                <button onClick={() => setMostrarTodos(!mostrarTodos)} className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                    {mostrarTodos ? "Mostrar menos" : `Ver toda la experiencia (${experiencias.length})`}
                </button>
            )}

            {modalAbierto && (
                <ModalExperiencia experienciaInicial={experienciaEditando} onClose={() => setModalAbierto(false)} />
            )}

            {/* MODAL DE CONFIRMACIÓN */}
            {experienciaAEliminar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar experiencia?</h3>
                        <p className="text-sm text-gray-500 mb-6">Se borrará permanentemente este registro laboral y sus logros.</p>

                        <div className="flex gap-3">
                            <button onClick={() => setExperienciaAEliminar(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button onClick={confirmarEliminacion} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}