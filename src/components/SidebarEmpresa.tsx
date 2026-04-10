"use client";

import { logoutAction } from "@/actions/auth";
import { enviarSolicitudVerificacion } from "@/actions/perfilEmpresa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface SidebarEmpresaProps {
    perfil?: {
        nombre_comercial: string;
        nombre_contacto: string;
        cargo_contacto: string;
        ubicacion: string | null;
        progreso: number;
        logoUrl?: string | null;
        estatus: "SIN_ENVIAR" | "PENDIENTE" | "APROBADA" | "RECHAZADA";
    };
    onClose?: () => void;
}

export default function SidebarEmpresa({ perfil, onClose }: SidebarEmpresaProps) {
    const pathname = usePathname();
    const [enviando, setEnviando] = useState(false);
    const [modalSalir, setModalSalir] = useState(false);

    const handleEnviarSolicitud = async () => {
        setEnviando(true);
        const idCarga = toast.loading("Enviando solicitud de verificación...");
        const result = await enviarSolicitudVerificacion();

        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("¡Solicitud enviada! El equipo de la UTCH revisará tu cuenta.");
        }
        setEnviando(false);
    };

    // Colores del badge según estatus
    const estatusConfig = {
        SIN_ENVIAR: { text: "Perfil sin enviar", color: "text-gray-500" },
        PENDIENTE: { text: "En revisión", color: "text-amber-600" },
        APROBADA: { text: "Cuenta verificada", color: "text-emerald-600" },
        RECHAZADA: { text: "Solicitud rechazada", color: "text-red-600" },
    };

    const estatusActual = perfil ? estatusConfig[perfil.estatus] : null;

    return (
        <>
            <aside className="flex flex-col w-80 bg-white border-r border-gray-200 h-screen sticky top-0 rounded-r-[20px] drop-shadow-sm z-40">
            <div className="p-6">
                <span className="font-bold text-indigo-700 text-xl tracking-tight">Joby</span>
                <span className="ml-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">Empresa</span>
                {onClose && (
                    <button onClick={onClose} className="md:hidden float-right text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Información del Perfil */}
            <div className="px-6 pb-6 border-b border-gray-100 flex flex-col items-center">

                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-sm relative">
                    {perfil?.logoUrl ? (
                        <img src={perfil.logoUrl} alt="Logo empresa" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-2xl text-indigo-700 font-bold">
                            {perfil ? perfil.nombre_comercial.charAt(0) : "E"}
                        </span>
                    )}
                    {/* Badge de estado */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full z-10 ${
                        perfil?.estatus === "APROBADA" ? 'bg-emerald-500' :
                        perfil?.estatus === "PENDIENTE" ? 'bg-amber-400' :
                        perfil?.estatus === "RECHAZADA" ? 'bg-red-400' :
                        'bg-gray-300'
                    }`} title={estatusActual?.text || ""}></div>
                </div>

                <h3 className="font-bold text-gray-800 text-center text-lg leading-tight">
                    {perfil ? perfil.nombre_comercial : "Cargando..."}
                </h3>
                <p className="text-xs font-medium text-indigo-700/80 text-center mt-1.5 px-2">
                    {perfil ? perfil.cargo_contacto : "Cargando datos"}
                </p>

                {/* Datos de la empresa */}
                {perfil && (
                    <div className="w-full mt-5 bg-gray-50 rounded-2xl p-4 space-y-3.5 border border-gray-100/50">
                        
                        {/* Contacto */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="font-medium text-gray-700">{perfil.nombre_contacto}</span>
                        </div>

                        {/* Ubicación */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className={perfil.ubicacion ? "font-medium text-gray-700" : "italic text-gray-400"}>
                                {perfil.ubicacion || "Ubicación pendiente"}
                            </span>
                        </div>

                        {/* Estado verificación */}
                        <div className="flex items-start gap-3 text-xs">
                            <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <span className={`font-medium ${estatusActual?.color}`}>
                                {estatusActual?.text}
                            </span>
                        </div>
                    </div>
                )}

                {/* Barra de progreso (solo si < 100%) */}
                {perfil && perfil.progreso < 100 && (
                    <div className="w-full mt-6 px-1.5">
                        <div className="flex justify-between items-end text-xs mb-2">
                            <span className="text-gray-500 font-medium tracking-tight">Completar perfil</span>
                            <span className="text-indigo-600 font-black">{perfil.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex mb-2">
                            <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${perfil.progreso}%` }}>
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">Un perfil completo genera más confianza en los candidatos.</p>
                    </div>
                )}

                {/* Al 100%: Botón de enviar solicitud o estado */}
                {perfil && perfil.progreso === 100 && perfil.estatus === "SIN_ENVIAR" && (
                    <button
                        onClick={handleEnviarSolicitud}
                        disabled={enviando}
                        className="w-full mt-6 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        {enviando ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                )}
                {perfil && perfil.progreso === 100 && perfil.estatus === "RECHAZADA" && (
                    <button
                        onClick={handleEnviarSolicitud}
                        disabled={enviando}
                        className="w-full mt-6 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {enviando ? "Enviando..." : "Reenviar Solicitud"}
                    </button>
                )}
                {perfil && perfil.progreso === 100 && perfil.estatus === "PENDIENTE" && (
                    <div className="w-full mt-6 px-1.5 flex items-center justify-center gap-1.5 text-amber-600 bg-amber-50 py-2.5 rounded-xl border border-amber-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs font-bold tracking-tight">Solicitud Enviada</span>
                    </div>
                )}
                {perfil && perfil.progreso === 100 && perfil.estatus === "APROBADA" && (
                    <div className="w-full mt-6 px-1.5 flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 py-2.5 rounded-xl border border-emerald-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs font-bold tracking-tight">Cuenta Verificada</span>
                    </div>
                )}
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
                <Link href="/empresa/inicio" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname === '/empresa/inicio' ? 'text-indigo-800 bg-indigo-50 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                    <svg className={`w-5 h-5 ${pathname === '/empresa/inicio' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Inicio
                </Link>

                <Link href="/empresa/perfil-empresa" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname?.startsWith('/empresa/perfil-empresa') ? 'text-indigo-800 bg-indigo-50 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                    <svg className={`w-5 h-5 ${pathname?.startsWith('/empresa/perfil-empresa') ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Perfil Empresarial
                </Link>

                <Link href="#" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-medium transition-all group">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Mis Vacantes
                </Link>

                <Link href="#" className="flex items-center gap-3 p-3.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl font-medium transition-all group">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Candidatos
                </Link>
            </nav>

            {/* Cerrar Sesión */}
            <div className="p-4 border-t border-gray-100">
                <button onClick={() => setModalSalir(true)} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Cerrar sesión
                </button>
            </div>
        </aside>

        {/* MODAL DE CONFIRMACIÓN PARA CERRAR SESIÓN */}
        {modalSalir && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">¿Cerrar sesión?</h3>
                    <p className="text-sm text-gray-500 mb-6">Tendrás que volver a ingresar tus credenciales para acceder a tu cuenta.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setModalSalir(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                        <button onClick={() => logoutAction()} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">Sí, cerrar sesión</button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        </>
    );
}
