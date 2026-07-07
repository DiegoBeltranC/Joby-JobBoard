import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import RevisionWizardClient from "./RevisionWizardClient"

export default async function RevisionEmpresaPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const empresaId = parseInt(params.id);

    if (isNaN(empresaId)) return notFound();

    const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: {
            usuario: true,
            comunicaciones: {
                orderBy: { createdAt: "desc" },
                include: {
                    admin: true
                }
            }
        }
    });

    if (!empresa) return notFound();

    // Parse links safely
    let enlacesParsed = {};
    if (empresa.enlaces) {
        try {
           enlacesParsed = typeof empresa.enlaces === "string" ? JSON.parse(empresa.enlaces) : empresa.enlaces;
        } catch(e) {}
    }

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans">
            {/* Header + Regresar */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/admin/empresas" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-4">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Volver a Empresas
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                            {empresa.logo_url ? (
                                <img src={empresa.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-primary">{empresa.nombre_comercial.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{empresa.nombre_comercial}</h1>
                            <p className="text-gray-500 text-sm">RFC: <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{empresa.rfc || "N/A"}</span></p>
                        </div>
                    </div>
                </div>

                {/* Badge de Estatus Superior */}
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-sm 
                    ${empresa.estatus_verificacion === "APROBADA" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                    empresa.estatus_verificacion === "PENDIENTE" ? "bg-amber-50 border-amber-100 text-amber-700" :
                    empresa.estatus_verificacion === "REQUIERE_CAMBIOS" ? "bg-orange-50 border-orange-100 text-orange-700" :
                    empresa.estatus_verificacion === "RECHAZADA" ? "bg-red-50 border-red-100 text-red-700" :
                    "bg-gray-50 border-gray-200 text-gray-600"}`}>
                    <div className={`w-2 h-2 rounded-full ${
                        empresa.estatus_verificacion === "APROBADA" ? "bg-emerald-500" :
                        empresa.estatus_verificacion === "PENDIENTE" ? "bg-amber-500 animate-pulse" :
                        empresa.estatus_verificacion === "REQUIERE_CAMBIOS" ? "bg-orange-500 animate-pulse" :
                        empresa.estatus_verificacion === "RECHAZADA" ? "bg-red-500" : "bg-gray-500"
                    }`}></div>
                    <span className="font-bold text-sm tracking-tight">{empresa.estatus_verificacion.replace("_", " ")}</span>
                </div>
            </header>

            {/* Inyectamos el componente de Cliente que dominará la UI de Vista */}
            <RevisionWizardClient 
                empresa={empresa} 
                enlaces={enlacesParsed as Record<string, string>}
            />
        </div>
    )
}
