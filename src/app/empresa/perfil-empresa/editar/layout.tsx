import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StepperEdicionCliente from "./StepperEdicionCliente"

import Link from "next/link";
import { X } from "lucide-react";

export default async function EditarPerfilEmpresaLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login?tipo=empresa");

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { empresa: true }
    });

    if (!usuarioInfo || !usuarioInfo.empresa) redirect("/empresa/inicio");

    const estatus = usuarioInfo.empresa.estatus_verificacion;

    // Protección principal de rutas de guardado/edición
    if (estatus === "PENDIENTE" || estatus === "RECHAZADA" || estatus === "SUSPENDIDA") {
        redirect("/empresa/inicio?error=locked");
    }

    // Nota: El Paso 1 estará protegido explícitamente en su propio componente si estatus === 'APROBADA'

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Completa tu Perfil Empresarial</h1>
                <Link 
                    href="/empresa/perfil-empresa" 
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Cerrar y volver a mi perfil"
                >
                    <X className="w-6 h-6" />
                </Link>
            </div>

            <StepperEdicionCliente />

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                {children}
            </div>
        </div>
    );
}
