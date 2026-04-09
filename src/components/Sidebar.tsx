"use client";

import { logoutAction } from "@/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation"; 

interface SidebarProps {
    perfil?: {
        nombre: string;
        carrera: string;
        universidad: string;
        ubicacion: string | null;
        progreso: number;
        nivelIngles: string | null;
        fotoUrl?: string | null;
        buscando: string | null;
    };
    onClose?: () => void;
}

export default function Sidebar({ perfil, onClose }: SidebarProps) {
    const pathname = usePathname(); 

    return (
        <aside className="flex flex-col w-80 bg-white border-r border-gray-200 h-screen sticky top-0 rounded-r-[20px] drop-shadow-sm z-40">
            <div className="p-6">
                <span className="font-bold text-teal-700 text-xl tracking-tight">Joby</span>
                {onClose && (
                    <button onClick={onClose} className="md:hidden float-right text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Información del Perfil */}
            <div className="px-6 pb-6 border-b border-gray-100 flex flex-col items-center">

                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-sm relative">
                    {perfil?.fotoUrl ? (
                        <img src={perfil.fotoUrl} alt="Foto de perfil" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-2xl text-teal-700 font-bold">
                            {perfil ? perfil.nombre.charAt(0) : "U"}
                        </span>
                    )}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-10" title="En línea"></div>
                </div>

                <h3 className="font-bold text-gray-800 text-center text-lg leading-tight">
                    {perfil ? perfil.nombre : "Cargando..."}
                </h3>
                <p className="text-xs font-medium text-teal-700/80 text-center mt-1.5 px-2">
                    {perfil ? perfil.carrera : "Cargando datos"}
                </p>

                {/* 👇 CONTENEDOR DE DATOS CON LÓGICA DE VACÍOS */}
                {perfil && (
                    <div className="w-full mt-5 bg-gray-50 rounded-2xl p-4 space-y-3.5 border border-gray-100/50">
                        
                        {/* Universidad */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                            <span className="font-medium text-gray-700">{perfil.universidad}</span>
                        </div>

                        {/* Ubicación */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className={perfil.ubicacion ? "font-medium text-gray-700" : "italic text-gray-400"}>
                                {perfil.ubicacion || "Ubicación pendiente"}
                            </span>
                        </div>

                        {/* Qué busca (Tipos de contrato) */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className={perfil.buscando ? "font-medium text-gray-700 capitalize" : "italic text-gray-400"}>
                                Busca: {perfil.buscando ? perfil.buscando.toLowerCase() : "No especificado"}
                            </span>
                        </div>

                        {/* Inglés */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className={perfil.nivelIngles ? "font-medium text-gray-700 capitalize" : "italic text-gray-400"}>
                                {perfil.nivelIngles ? perfil.nivelIngles : "Inglés no añadido"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Barra de progreso interactiva */}
                {perfil && perfil.progreso < 100 && (
                    <div className="w-full mt-6 px-1.5">
                        <div className="flex justify-between items-end text-xs mb-2">
                            <span className="text-gray-500 font-medium tracking-tight">Completar perfil</span>
                            <span className="text-teal-600 font-black">{perfil.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex mb-2">
                            <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${perfil.progreso}%` }}>
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">Un perfil completo recibe 3x más ofertas.</p>
                    </div>
                )}
                {perfil && perfil.progreso === 100 && (
                    <div className="w-full mt-6 px-1.5 flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs font-bold tracking-tight">Perfil Completo</span>
                    </div>
                )}
            </div>

            {/* Navegación (Igual que antes) */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
                <Link href="/inicio" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname === '/inicio' ? 'text-teal-800 bg-teal-50 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                    <svg className={`w-5 h-5 ${pathname === '/inicio' ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Buscar Vacantes
                </Link>

                <Link href="#" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-medium transition-all group">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Mis Postulaciones
                </Link>

                <Link href="/perfil" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname?.startsWith('/perfil') ? 'text-teal-800 bg-teal-50 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                    <svg className={`w-5 h-5 ${pathname?.startsWith('/perfil') ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Mi Perfil
                </Link>
            </nav>

            {/* Cerrar Sesión */}
            <div className="p-4 border-t border-gray-100">
                <button onClick={() => logoutAction()} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}