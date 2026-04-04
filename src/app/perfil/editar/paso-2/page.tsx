import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormPaso2 from "./FormPaso2";

export default async function Paso2Page() {
    const session = await getSession();
    if (!session) redirect("/login");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { estudiante: true }
    });

    if (!usuario?.estudiante) redirect("/inicio");

    // Convertimos los arrays de la BD a texto separado por comas para mostrarlos en los inputs
    const valoresIniciales = {
        habilidades: usuario.estudiante.habilidades?.join(", ") || "",
        idiomas: usuario.estudiante.idiomas?.join(", ") || "",
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Tus Armas</h2>
            <FormPaso2 valoresIniciales={valoresIniciales} />
        </div>
    );
}