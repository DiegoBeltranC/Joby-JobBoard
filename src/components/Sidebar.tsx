"use client";

import { logoutAction } from "@/actions/auth"; // 👈 Ajusta esta ruta según donde pusiste la función

interface SidebarProps {
    perfil?: {
        nombre: string;
        carrera: string;
        universidad: string;
        ubicacion: string;
        progreso: number;
        nivelIngles: string;
    };
    onClose?: () => void;
}

export default function Sidebar({ perfil, onClose }: SidebarProps) {
    return (
        <aside className="flex flex-col w-80 bg-white border-r border-gray-200 h-screen sticky top-0 rounded-r-[20px] drop-shadow-sm">
            <div className="p-6">
                <span className="font-bold text-teal-700 text-xl">Joby</span>

                {onClose && (
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Información del Perfil */}
            <div className="px-6 pb-6 border-b border-gray-100 flex flex-col items-center">

                {/* Avatar con toques de color de la marca y un punto verde de "conectado" */}
                <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-sm relative">
                    <span className="text-2xl text-teal-700 font-bold">
                        {perfil ? perfil.nombre.charAt(0) : "U"}
                    </span>
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                <h3 className="font-bold text-gray-800 text-center text-lg leading-tight">
                    {perfil ? perfil.nombre : "Cargando..."}
                </h3>
                <p className="text-xs font-medium text-teal-700/80 text-center mt-1.5 px-2">
                    {perfil ? perfil.carrera : "Cargando datos"}
                </p>

                {/* Datos extra en un pequeño contenedor gris limpio con íconos */}
                {perfil && (
                    <div className="w-full mt-5 bg-gray-50 rounded-2xl p-4 space-y-3.5 border border-gray-100/50">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                            <span className="truncate font-medium flex-1 cursor-help" title={perfil.universidad}>{perfil.universidad}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate font-medium">{perfil.ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="capitalize font-medium">Inglés: {perfil.nivelIngles}</span>
                        </div>
                    </div>
                )}

                {/* Barra de progreso mejorada con gradiente */}
                {perfil && (
                    <div className="w-full mt-6 px-1.5">
                        <div className="flex justify-between items-end text-xs mb-2">
                            <span className="text-gray-500 font-medium tracking-tight">Completar perfil</span>
                            <span className="text-teal-600 font-black">{perfil.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                            <div
                                className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-700 ease-out relative"
                                style={{ width: `${perfil.progreso}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navegación limpia con SVG en lugar de Emojis */}
            <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto mt-2">
                <a href="/inicio" className="flex items-center gap-3 p-3.5 text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl font-semibold transition-all shadow-sm">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Buscar Vacantes
                </a>
                <a href="/perfil" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-medium transition-all group">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Mi Perfil
                </a>
            </nav>

            {/* --- NUEVO: Botón de Cerrar Sesión --- */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => logoutAction()}
                    className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
