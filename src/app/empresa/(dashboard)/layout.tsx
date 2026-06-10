import DashboardShell from '@/components/DashboardShell';
import SidebarEmpresa from '@/components/SidebarEmpresa';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { calcularProgresoEmpresa } from '@/lib/perfilEmpresa';
import { obtenerEmpresaDeSesion } from '@/lib/session-empresa';

export default async function EmpresaLayout({ children }: { children: React.ReactNode; }) {
    const session = await getSession();

    if (!session) {
        redirect('/login?tipo=empresa');
    }

    const usuarioInfo = await obtenerEmpresaDeSesion(session.userId);

    if (!usuarioInfo || !usuarioInfo.empresa) {
        redirect('/inicio');
    }

    // --- PROTECCIÓN: VERIFICACIÓN DE CORREO (WALL) ---
    if (!usuarioInfo.verifiedAt) {
        redirect(`/verificar-correo?email=${encodeURIComponent(usuarioInfo.correo)}`);
    }

    const empresa = usuarioInfo.empresa;
    const { progreso, faltantes, faltantesAlerta } = calcularProgresoEmpresa(empresa);

    const perfilReal = {
        nombre_comercial: empresa.nombre_comercial,
        nombre_contacto: `${empresa.nombre} ${empresa.apellidoPaterno}`,
        cargo_contacto: empresa.cargo_contacto,
        ubicacion: empresa.municipio ? `${empresa.municipio}, ${empresa.estado}` : null,
        progreso,
        faltantes,
        faltantesAlerta,
        logoUrl: empresa.logo_url,
        estatus: empresa.estatus_verificacion,
    };

    return (
        <DashboardShell
            sidebar={<SidebarEmpresa perfil={perfilReal} />}
            brandColorClass="text-indigo-700"
        >
            {children}
        </DashboardShell>
    );
}
