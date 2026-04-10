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

    if (usuario.empresa.estatus_verificacion === "APROBADA") {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Datos Legales y Ubicación</h2>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-6 text-sm text-center">
                    <svg className="w-8 h-8 mx-auto text-amber-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className="font-bold text-lg mb-1">Bloqueo de Seguridad</p>
                    <p>Por normativas de autenticidad, al ser una <b>Empresa Verificada</b>, no es posible alterar los rubros fiscales. Si necesitas una actualización profunda legal, por favor contacta a la administración.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 mb-6">Datos Legales y Ubicación</h2>
            <FormPaso1Empresa valoresIniciales={valoresIniciales} />
        </div>
    );
}
