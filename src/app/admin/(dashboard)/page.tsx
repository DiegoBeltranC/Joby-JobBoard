import { prisma } from "@/lib/prisma";
import { Users, Building2, Briefcase, FileWarning, Ban } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
    // Consultas concurrentes para métricas
    const [
        empresasPendientes,
        empresasCorreccion,
        empresasActivas,
        empresasSuspendidas,
        empresasRechazadas,
        vacantesActivas
    ] = await Promise.all([
        prisma.empresa.count({ where: { estatus_verificacion: "PENDIENTE" } }),
        prisma.empresa.count({ where: { estatus_verificacion: "REQUIERE_CAMBIOS" } }),
        prisma.empresa.count({ where: { estatus_verificacion: "APROBADA" } }),
        prisma.empresa.count({ where: { estatus_verificacion: "SUSPENDIDA" } }),
        prisma.empresa.count({ where: { estatus_verificacion: "RECHAZADA" } }),
        prisma.vacante.count({ where: { activa: true } })
    ]);

    const stats = [
        {
            title: "Empresas Pendientes",
            value: empresasPendientes,
            description: "Requieren revisión inmediata",
            icon: Users,
            href: "/admin/empresas?tab=PENDIENTE",
            color: "text-amber-600",
            bg: "bg-amber-100/50"
        },
        {
            title: "Esperando Corrección",
            value: empresasCorreccion,
            description: "Empresas arreglando sus datos",
            icon: FileWarning,
            href: "/admin/empresas?tab=REQUIERE_CAMBIOS",
            color: "text-orange-600",
            bg: "bg-orange-100/50"
        },
        {
            title: "Empresas Activas",
            value: empresasActivas,
            description: "Plataformas activas",
            icon: Building2,
            href: "/admin/empresas?tab=APROBADA",
            color: "text-emerald-600",
            bg: "bg-emerald-100/50"
        },
        {
            title: "Cuentas Suspendidas",
            value: empresasSuspendidas,
            description: "Penalizadas sin acceso",
            icon: Ban,
            href: "/admin/empresas?tab=SUSPENDIDA",
            color: "text-red-600",
            bg: "bg-red-100/50"
        },
        {
            title: "Cuentas Rechazadas",
            value: empresasRechazadas,
            description: "No pasaron verificación",
            icon: FileWarning,
            href: "/admin/empresas?tab=RECHAZADA",
            color: "text-gray-600",
            bg: "bg-gray-200/50"
        },
        {
            title: "Vacantes Activas",
            value: vacantesActivas,
            description: "Ofertas de empleo hoy",
            icon: Briefcase,
            href: "#", // Futuro módulo de vacantes general
            color: "text-primary",
            bg: "bg-primary/10"
        }
    ];

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Panel Administrativo</h1>
                <p className="text-gray-500">Resumen y control de vinculación.</p>
            </header>

            {/* Grid Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <Link href={stat.href} key={idx} className="block group">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:blur-xl transition-all duration-300 opacity-50`}></div>
                            
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                    <h3 className="text-4xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 relative z-10">{stat.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions (Accesos Rápidos opcionales para llenar la página) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/admin/empresas" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-sm shadow-primary/20 flex items-center gap-2">
                        <Users className="w-5 h-5"/> Ver todas las empresas
                    </Link>
                    <Link href="/admin/configuracion" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center gap-2">
                        <Building2 className="w-5 h-5"/> Configurar sistema
                    </Link>
                </div>
            </div>
        </div>
    );
}
