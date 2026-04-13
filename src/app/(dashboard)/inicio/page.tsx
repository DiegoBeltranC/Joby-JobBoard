import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { 
    Search, 
    Briefcase
} from "lucide-react";
import VacantesSearchClient from "@/components/VacantesSearchClient";

// FASE 2: Forzar Datos Frescos (Anti-Stale Cache)
export const dynamic = 'force-dynamic';

export default async function InicioPage() {
    const session = await getSession();
    let ubicacionSugerida = "tu zona";

    // 1. Obtener contexto del estudiante para personalización visual
    if (session) {
        const usuarioInfo = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });
        if (usuarioInfo?.estudiante?.municipio) {
            ubicacionSugerida = usuarioInfo.estudiante.municipio;
        }
    }

    // FASE 1: Consulta Prisma Blindada (Anti Over-fetching & Zero Trust)
    const vacantes = await prisma.vacante.findMany({
        take: 30, // Anti-DoS
        where: {
            activa: true,
            empresa: {
                estatus_verificacion: "APROBADA" // Solo empresas validadas por UTCH
            },
            OR: [
                { fecha_limite: null },
                { fecha_limite: { gte: new Date() } }
            ]
        },
        select: {
            id: true,
            titulo: true,
            descripcion: true, // Necesario para el modal
            municipio: true,
            estado: true,
            modalidad: true,
            tipo_contrato: true,
            horario: true,
            createdAt: true,
            empresa: {
                select: {
                    id: true, // Necesario para el link
                    nombre_comercial: true,
                    logo_url: true,
                    descripcion: true // Opcional pero util
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            
            {/* Header de Sección */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                    <Search className="w-8 h-8 text-teal-600" />
                    Buscar Vacantes
                </h1>
                <p className="text-gray-500 font-medium">
                    Oportunidades recomendadas para ti cerca de <span className="text-teal-600 font-bold underline decoration-teal-200 underline-offset-4">{ubicacionSugerida}</span>.
                </p>
            </div>

            {/* FASE 3: Renderizado UI Dinámico */}
            {vacantes && vacantes.length > 0 ? (
                <VacantesSearchClient vacantes={vacantes} />
            ) : (
                /* Empty State: Requisito de Diseño */
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[32px] border-2 border-dashed border-gray-100 text-center animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                        <Briefcase className="w-10 h-10 text-teal-600 opacity-40" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">Sin vacantes por el momento</h3>
                    <p className="text-gray-500 max-w-sm font-medium">
                        Por el momento no hay vacantes disponibles. Nuestro equipo está validando nuevas oportunidades para ti.
                    </p>
                    <button className="mt-8 px-6 py-2 bg-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-teal-100">
                        Notificarme de nuevas vacantes
                    </button>
                </div>
            )}
        </div>
    );
}