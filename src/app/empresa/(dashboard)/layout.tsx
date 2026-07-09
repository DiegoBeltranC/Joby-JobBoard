import DashboardShellEmpresa from '@/components/DashboardShellEmpresa';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { calcularProgresoEmpresa } from '@/lib/perfilEmpresa';

export default async function EmpresaLayout({ children }: { children: React.ReactNode; }) {
    const session = await getSession();

    if (!session) {
        redirect('/login?tipo=empresa');
    }

    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            empresa: true
        }
    });

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
        <DashboardShellEmpresa perfil={perfilReal}>
            {children}
        </DashboardShellEmpresa>
    );
}
