import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormPaso3Empresa from "./FormPaso3Empresa";

export default async function Paso3EmpresaPage() {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    if (!usuario?.empresa) redirect("/empresa/inicio");

    const enlaces = (usuario.empresa.enlaces as { linkedin?: string; facebook?: string }) || {};

    const valoresIniciales = {
        descripcion: usuario.empresa.descripcion || "",
        sitio_web: usuario.empresa.sitio_web || "",
        linkedin: enlaces.linkedin || "",
        facebook: enlaces.facebook || "",
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Marketing y Presencia Digital</h2>
            <FormPaso3Empresa 
                valoresIniciales={valoresIniciales} 
                logoActualUrl={usuario.empresa.logo_url}
                fotosActuales={usuario.empresa.fotos_empresa}
                nombreComercial={usuario.empresa.nombre_comercial}
            />
        </div>
    );
}
