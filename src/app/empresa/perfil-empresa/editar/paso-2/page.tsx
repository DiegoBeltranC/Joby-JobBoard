import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormPaso2Empresa from "./FormPaso2Empresa";

export default async function Paso2EmpresaPage() {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    if (!usuario?.empresa) redirect("/empresa/inicio");

    const valoresIniciales = {
        nombre: usuario.empresa.nombre || "",
        apellidoPaterno: usuario.empresa.apellidoPaterno || "",
        apellidoMaterno: usuario.empresa.apellidoMaterno || "",
        cargo_contacto: usuario.empresa.cargo_contacto || "",
        telefono_contacto: usuario.empresa.telefono_contacto || "",
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Datos del Reclutador</h2>
            <FormPaso2Empresa valoresIniciales={valoresIniciales} />
        </div>
    );
}
