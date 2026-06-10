import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { ShieldCheck, Plus, UserCircle2, Settings2 } from "lucide-react"
import FormEditarPerfil from "./FormEditarPerfil"
import { obtenerAdminDeSesion } from "@/lib/session-admin"

export default async function AdminConfiguracionPage() {
    const session = await getSession();
    if (!session) return null;

    // Verificamos SuperAdmin
    const usuarioInfo = await obtenerAdminDeSesion(session.userId);

    const isSuperAdmin = !!usuarioInfo?.admin?.esSuperAdmin;

    const administradores = await prisma.admin.findMany({
        include: { usuario: true },
        orderBy: { esSuperAdmin: 'desc' }
    });

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto font-sans">
            <header className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Configuración y Personal</h1>
                    <p className="text-gray-500 text-sm">Gestiona quién tiene acceso de nivel administrativo a Joby.</p>
                </div>
                {!isSuperAdmin && (
                    <div className="bg-orange-50 text-orange-700 px-4 py-2 border border-orange-100 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                        <ShieldCheck className="w-4 h-4" /> Modo Visualización
                    </div>
                )}
            </header>

            <div className="max-w-3xl space-y-8">
                
                {/* Mi Perfil / Edición */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-gray-500" />
                            Mis Datos de Administrador
                        </h2>
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <FormEditarPerfil adminActual={usuarioInfo?.admin} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Administradores Actuales</h2>
                    
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <ul className="divide-y divide-gray-100">
                            {administradores.map((adm) => (
                                <li key={adm.id} className="p-4 sm:px-6 hover:bg-gray-50 transition flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
                                            ${adm.esSuperAdmin ? 'bg-primary border-4 border-primary/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {adm.nombre ? adm.nombre.charAt(0) : <UserCircle2 className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 flex items-center gap-2">
                                                {adm.nombre ? `${adm.nombre} ${adm.apellidoPaterno}` : "Perfil Incompleto"}
                                                {adm.esSuperAdmin && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-black">SuperAdmin</span>}
                                            </p>
                                            <p className="text-xs text-gray-500">{adm.usuario?.correo}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    </div>
            </div>
        </div>
    )
}
