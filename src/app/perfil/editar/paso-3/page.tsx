import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormPaso3 from "./FormPaso3";

export default async function Paso3Page() {
    const session = await getSession();
    if (!session) redirect("/login");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { 
            estudiante: {
                include: {
                    carrera: true
                }
            } 
        }
    });

    if (!usuario?.estudiante) redirect("/inicio");

    // Extraemos los links del objeto Json
    const enlaces = (usuario.estudiante.enlaces as { linkedin?: string; github?: string }) || {};

    const valoresIniciales = {
        linkedin: enlaces.linkedin || "",
        github: enlaces.github || "",
    };

    const isTech = /software|sistema|tecnolog[ií]a|redes|inform[aá]tica|computa|desarrollo/i.test(usuario.estudiante.carrera.nombre);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Escaparate Digital</h2>
            <FormPaso3 valoresIniciales={valoresIniciales} isTech={isTech} cvUrl={usuario.estudiante.cv_url} />
        </div>
    );
}