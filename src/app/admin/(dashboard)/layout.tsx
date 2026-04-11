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
