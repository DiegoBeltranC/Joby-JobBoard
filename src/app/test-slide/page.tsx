import { prisma } from "@/lib/prisma";
import VacantesCarousel from "@/components/VacantesCarousel";

export const dynamic = 'force-dynamic';

export default async function TestSlidePage() {
    // Obtener todas las vacantes abiertas y vigentes de empresas aprobadas
    const vacantes = await prisma.vacante.findMany({
        where: {
            estatus: "ABIERTA",
            empresa: {
                estatus_verificacion: "APROBADA",
            },
        },
        include: {
            empresa: {
                select: {
                    id: true,
                    nombre_comercial: true,
                    logo_url: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    if (vacantes.length === 0) {
        return (
            <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
                <h3 className="text-xl font-bold mb-2">No hay vacantes abiertas activas</h3>
                <p className="text-slate-400">
                    Asegúrate de tener vacantes activas con estatus ABIERTA y su empresa correspondiente APROBADA en tu base de datos local.
                </p>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-white overflow-hidden">
            <VacantesCarousel vacantes={vacantes} />
        </div>
    );
}
