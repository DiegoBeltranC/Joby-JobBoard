import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormConfiguracion from "./FormConfiguracion";

export default async function ConfiguracionPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            estudiante: true,
        },
    });

    if (!usuarioInfo || !usuarioInfo.estudiante) {
        redirect("/inicio");
    }

    const carreras = await prisma.carrera.findMany({
        orderBy: {
            nombre: "asc",
        },
    });

    const estudiante = usuarioInfo.estudiante;

    const estudianteData = {
        nombre: estudiante.nombre,
        apellidoPaterno: estudiante.apellidoPaterno,
        apellidoMaterno: estudiante.apellidoMaterno,
        matricula: estudiante.matricula,
        carreraId: estudiante.carreraId,
        nombre_modificado_at: estudiante.nombre_modificado_at,
        cambio_carrera_usado: estudiante.cambio_carrera_usado,
        periodo_academico: estudiante.periodo_academico,
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-6 pb-12">
            <FormConfiguracion estudiante={estudianteData} carreras={carreras} />
        </div>
    );
}
