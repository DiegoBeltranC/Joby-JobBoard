import DashboardShellAdmin from '@/components/DashboardShellAdmin';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CompletarPerfilAdminPage from './completar-perfil/page';

export default async function AdminLayout({ children }: { children: React.ReactNode; }) {
    const session = await getSession();

    if (!session) {
        redirect('/admin/login');
    }

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            admin: true
        }
    });

    if (!usuarioInfo || usuarioInfo.rol !== "ADMIN" || !usuarioInfo.admin) {
        redirect('/inicio');
    }

    const admin = usuarioInfo.admin;

    // Redirigir a completar perfil si es su primer inicio de sesión
    // y no tiene sus datos personales registrados
    // IMPORTANTE: Evitamos redirección infinita en layout asegurándonos
    // de que esto sólo afecte la UI compartida, o mejor, usando headers o manejándolo a nivel middleware o página real.
    // Dado que NextJS layouts envuelven todas las rutas hijas (incluso /admin/completar-perfil),
    // no podemos hacer la validación aquí si la ruta hija está dentro.
    // Solución correcta: el layout.tsx envuelve la base con el Sidebar y el "completar-perfil" 
    // debería estar fuera si no queremos Sidebar allí, O lo validamos y montamos otra shell.
    
    // Interceptamos la renderizacion de los children que iba a solicitar (Dashboard, Empresas, etc)
    // presentándole forzosamente el formulario del Componente. 
    // Dado que es un layout de ServerComponent, anular su children bloquea la UI sin hacks de middleware.
    const isProfileIncomplete = !admin.nombre || admin.nombre.trim() === "";

    if (isProfileIncomplete) {
        return (
            <div className="min-h-screen bg-slate-50 relative z-50">
               <CompletarPerfilAdminPage />
            </div>
        )
    }

    // Datos simplificados para el sidebar
    const adminData = {
        nombre: admin.nombre,
        apellido: admin.apellidoPaterno,
        esSuperAdmin: admin.esSuperAdmin
    };

    return (
        <DashboardShellAdmin admin={adminData}>
            {children}
        </DashboardShellAdmin>
    );
}
