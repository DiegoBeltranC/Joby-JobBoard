"use client";

import { logoutAction } from "@/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, LogOut, Settings } from "lucide-react";

interface SidebarAdminProps {
    admin: {
        nombre: string;
        apellido: string;
        esSuperAdmin: boolean;
    };
    onClose?: () => void;
}

export default function SidebarAdmin({ admin, onClose }: SidebarAdminProps) {
    const pathname = usePathname();

    const iniciales = `${admin.nombre.charAt(0)}${admin.apellido.charAt(0)}`.toUpperCase() || "A";

    return (
        <aside className="flex flex-col w-80 bg-white border-r border-gray-200 h-screen sticky top-0 rounded-r-[20px] drop-shadow-sm z-40">
            <div className="p-6 flex items-center justify-between">
                <div>
                    <span className="font-bold text-primary text-xl tracking-tight">Joby</span>
                    <span className="ml-2 text-[10px] font-bold text-primary/70 uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">Admin</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Información del Perfil */}
            <div className="px-6 pb-6 border-b border-gray-100 flex flex-col items-center">
                {/* Avatar */}
                <div className="w-20 h-20 bg-primary/10 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-sm relative">
                    <span className="text-2xl text-primary font-bold">
                        {iniciales}
                    </span>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full z-10 bg-emerald-500" title="Online"></div>
                </div>

                <h3 className="font-bold text-gray-800 text-center text-lg leading-tight">
                    {admin.nombre} {admin.apellido}
                </h3>
                <p className="text-xs font-medium text-primary/80 text-center mt-1.5 px-2">
                    {admin.esSuperAdmin ? 'Super Administrador' : 'Administrativo'}
                </p>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
                <Link href="/admin" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname === '/admin' ? 'text-primary-foreground bg-primary shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                    <LayoutDashboard className={`w-5 h-5 ${pathname === '/admin' ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} />
                    Dashboard
                </Link>

                <Link href="/admin/empresas" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname?.startsWith('/admin/empresas') ? 'text-primary-foreground bg-primary shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                    <Building2 className={`w-5 h-5 ${pathname?.startsWith('/admin/empresas') ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} />
                    Gestión de Empresas
                </Link>

                {admin.esSuperAdmin && (
                    <Link href="/admin/configuracion" className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-all ${pathname?.startsWith('/admin/configuracion') ? 'text-primary-foreground bg-primary shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 group'}`}>
                        <Users className={`w-5 h-5 ${pathname?.startsWith('/admin/configuracion') ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} />
                        Personal y Config
                    </Link>
                )}
            </nav>

            {/* Cerrar Sesión */}
            <div className="p-4 border-t border-gray-100">
                <button onClick={() => logoutAction()} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}
