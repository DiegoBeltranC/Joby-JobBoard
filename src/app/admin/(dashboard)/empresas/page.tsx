import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TableRowAcciones from "./TableRowAcciones";
import { Search } from "lucide-react";

export default async function GestionEmpresasPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string; q?: string }>;
}) {
    const rawParams = await searchParams;
    const tabActual = rawParams?.tab || "TODAS";
    const searchQuery = rawParams?.q || "";

    // Construimos el where de Prisma
    const whereClause: any = {};
    if (tabActual !== "TODAS") {
        whereClause.estatus_verificacion = tabActual;
    }
    if (searchQuery) {
        whereClause.OR = [
            { nombre_comercial: { contains: searchQuery, mode: "insensitive" } },
            { rfc: { contains: searchQuery, mode: "insensitive" } },
            { razon_social: { contains: searchQuery, mode: "insensitive" } }
        ];
    }

    const empresas = await prisma.empresa.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' }
    });

    // Pestañas (Tabs)
    const tabs = [
        { label: "Todas", value: "TODAS" },
        { label: "Pendientes", value: "PENDIENTE" },
        { label: "Requiere Cambios", value: "REQUIERE_CAMBIOS" },
        { label: "Aprobadas", value: "APROBADA" },
        { label: "Rechazadas", value: "RECHAZADA" },
        { label: "Suspendidas", value: "SUSPENDIDA" }
    ];

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Gestión de Empresas</h1>
                <p className="text-gray-500 text-sm">Administra y evalúa las plataformas empresariales inscritas al sistema.</p>
            </header>

            {/* Controles de Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 gap-4">
                
                {/* SearchBar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <form className="w-full">
                        {tabActual !== "TODAS" && <input type="hidden" name="tab" value={tabActual} />}
                        <input 
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="Buscar por Nombre o RFC..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        />
                    </form>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto w-full md:w-auto pb-1 md:pb-0 gap-2 shrink-0">
                    {tabs.map((tab) => {
                        const isActivo = tabActual === tab.value;
                        return (
                            <Link 
                                key={tab.value}
                                href={`/admin/empresas?tab=${tab.value}${searchQuery ? `&q=${searchQuery}` : ''}`}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                                    isActivo 
                                    ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Tabla Principal */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-3xl">Empresa</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">RFC</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha Act.</th>
                                <th className="px-6 py-4 text-right rounded-tr-3xl">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {empresas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron empresas con este filtro.
                                    </td>
                                </tr>
                            ) : (
                                empresas.map((empresa) => (
                                    <tr key={empresa.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold relative overflow-hidden border border-primary/20">
                                                    {empresa.logo_url ? (
                                                        <img src={empresa.logo_url} alt="Logo" className="w-full h-full object-cover"/>
                                                    ) : (
                                                        empresa.nombre_comercial.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{empresa.nombre_comercial}</p>
                                                    <p className="text-xs text-gray-500 truncate w-40">{empresa.razon_social || "Sin Razón Social"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-700">{empresa.nombre} {empresa.apellidoPaterno}</p>
                                            <p className="text-xs text-gray-500">{empresa.telefono_contacto || "Sin Teléfono"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                                                {empresa.rfc || "NO_REGISTRADO"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                empresa.estatus_verificacion === "APROBADA" ? "bg-emerald-100 text-emerald-700" :
                                                empresa.estatus_verificacion === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
                                                empresa.estatus_verificacion === "REQUIERE_CAMBIOS" ? "bg-orange-100 text-orange-700" :
                                                empresa.estatus_verificacion === "RECHAZADA" ? "bg-red-100 text-red-700" :
                                                empresa.estatus_verificacion === "SUSPENDIDA" ? "bg-gray-200 text-gray-700" :
                                                "bg-gray-100 text-gray-500"
                                            }`}>
                                                {empresa.estatus_verificacion.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {empresa.updatedAt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <TableRowAcciones empresaId={empresa.id} estatus={empresa.estatus_verificacion} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
