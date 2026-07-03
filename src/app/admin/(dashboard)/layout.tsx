import DashboardShell from '@/components/DashboardShell';
import SidebarAdmin from '@/components/SidebarAdmin';
import AdminEventosWatcher from '@/components/admin/AdminEventosWatcher';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import CompletarPerfilAdminPage from './completar-perfil/page';
import { obtenerAdminDeSesion } from '@/lib/session-admin';

export default async function AdminLayout({ children }: { children: React.ReactNode; }) {
    const session = await getSession();

    if (!session) {
        redirect('/admin/login');
    }

    const usuarioInfo = await obtenerAdminDeSesion(session.userId);

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
        <DashboardShell
            sidebar={<SidebarAdmin admin={adminData} />}
            brandColorClass="text-primary"
            brandBadgeText="Admin"
            brandBadgeTextClass="text-primary"
            brandBadgeBgClass="bg-primary/10"
            breakpoint="lg"
            contentMaxWidth={false}
        >
            {children}
            <AdminEventosWatcher />
        </DashboardShell>
    );
}
