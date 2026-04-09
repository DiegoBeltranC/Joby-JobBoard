import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormPaso1Empresa from "./FormPaso1Empresa";

export default async function Paso1EmpresaPage() {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    if (!usuario?.empresa) redirect("/empresa/inicio");

    const valoresIniciales = {
        rfc: usuario.empresa.rfc || "",
        razon_social: usuario.empresa.razon_social || "",
        estado: usuario.empresa.estado || "",
        municipio: usuario.empresa.municipio || "",
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Datos Legales y Ubicación</h2>
            <FormPaso1Empresa valoresIniciales={valoresIniciales} />
        </div>
    );
}
