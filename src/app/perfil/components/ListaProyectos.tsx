"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { eliminarProyecto } from "@/actions/perfil";
import ModalProyecto from "./ModalProyecto";

type Proyecto = {
    id: number; nombre: string; url_enlace: string | null; puntos_clave: string[]; fechaInicio: Date; fechaFin: Date | null;
};

export default function ListaProyectos({ proyectos }: { proyectos: Proyecto[] }) {
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);

    // 👇 NUEVO: Estado para el modal de eliminación
    const [proyectoAEliminar, setProyectoAEliminar] = useState<number | null>(null);

    const proyectosVisibles = mostrarTodos ? proyectos : proyectos.slice(0, 2);

    // 👇 NUEVA: Función de eliminación rediseñada
    const confirmarEliminacion = async () => {
        if (!proyectoAEliminar) return;

        const idCarga = toast.loading("Eliminando proyecto...");
        const res = await eliminarProyecto(proyectoAEliminar);

        if (res.error) {
            toast.error(res.error, { id: idCarga });
        } else {
            toast.success("Proyecto eliminado", { id: idCarga });
        }
        setProyectoAEliminar(null); // Cerramos el modal
    };

    const abrirParaCrear = () => {
        setProyectoEditando(null);
        setModalAbierto(true);
    };

    const abrirParaEditar = (proyecto: Proyecto) => {
        setProyectoEditando(proyecto);
        setModalAbierto(true);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-gray-800 text-lg flex items-center justify-between">
                Proyectos Destacados
                {proyectos.length > 0 && (
                    <button onClick={abrirParaCrear} className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Añadir
                    </button>
                )}
            </h3>

            {proyectos.length === 0 ? (
                <div onClick={abrirParaCrear} className="cursor-pointer text-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                    <span className="text-gray-500 text-sm group-hover:text-teal-700 font-medium">+ Añadir tu primer proyecto</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {proyectosVisibles.map(proyecto => (
                        <div key={proyecto.id} className="relative group p-5 border border-gray-100 bg-white rounded-xl shadow-sm hover:border-teal-200 transition-all">

                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => abrirParaEditar(proyecto)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {/* 👇 Cambiamos el onClick para que abra el modal en lugar del window.confirm */}
                                <button onClick={() => setProyectoAEliminar(proyecto.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h4 className="font-bold text-gray-800 pr-16">{proyecto.nombre}</h4>

                            <div className="flex flex-wrap items-center gap-4 mt-2 mb-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(proyecto.fechaInicio).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })} -
                                    {proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : " Actual"}
                                </span>
                                {proyecto.url_enlace && (
                                    <a href={proyecto.url_enlace} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline">
                                        <LinkIcon className="w-3.5 h-3.5" /> Ver proyecto
                                    </a>
                                )}
                            </div>

                            <ul className="space-y-1.5 pl-1">
                                {proyecto.puntos_clave.map((punto, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex gap-2 items-start">
                                        <span className="text-teal-400 mt-0.5">•</span> <span>{punto}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {proyectos.length > 2 && (
                <button onClick={() => setMostrarTodos(!mostrarTodos)} className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                    {mostrarTodos ? "Mostrar menos" : `Ver todos los proyectos (${proyectos.length})`}
                </button>
            )}

            {modalAbierto && (
                <ModalProyecto proyectoInicial={proyectoEditando} onClose={() => setModalAbierto(false)} />
            )}

            {/* 👇 NUEVO: MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {proyectoAEliminar && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar proyecto?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer. Perderás la información y los puntos clave que escribiste.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setProyectoAEliminar(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminacion}
                                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}