import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormPaso1 from "./FormPaso1";

export default async function Paso1Page() {
    const session = await getSession();
    if (!session) redirect("/login");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { estudiante: true }
    });

    if (!usuario?.estudiante) redirect("/inicio");

    // Extraemos los datos actuales para que el formulario no aparezca vacío si ya los había llenado
    const valoresIniciales = {
        bio: usuario.estudiante.bio || "",
        ubicacion: usuario.estudiante.ubicacion || "Chetumal, Quintana Roo",
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Sobre ti</h2>
            <FormPaso1 valoresIniciales={valoresIniciales} />
        </div>
    );
}