import DashboardShellEmpresa from '@/components/DashboardShellEmpresa';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

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

    const empresa = usuarioInfo.empresa;
    const enlaces = (empresa.enlaces as { linkedin?: string; facebook?: string }) || {};
    const tieneEnlace = !!(empresa.sitio_web || enlaces.linkedin || enlaces.facebook);

    // ALGORITMO DE PROGRESO DEL PERFIL EMPRESARIAL (8 criterios = 100%)
    let progresoCalculado = 10; // 10% Base por haberse registrado

    if (empresa.razon_social && empresa.rfc) progresoCalculado += 15;       // Datos legales
    if (empresa.estado && empresa.municipio) progresoCalculado += 10;       // Ubicación
    if (empresa.telefono_contacto) progresoCalculado += 10;                 // Teléfono
    if (empresa.descripcion) progresoCalculado += 15;                       // Descripción
    if (tieneEnlace) progresoCalculado += 10;                               // Al menos 1 enlace
    if (empresa.logo_url) progresoCalculado += 15;                          // Logo
    if (empresa.fotos_empresa.length > 0) progresoCalculado += 15;          // Al menos 1 foto

    // Objeto final para el Sidebar
    const perfilReal = {
        nombre_comercial: empresa.nombre_comercial,
        nombre_contacto: `${empresa.nombre} ${empresa.apellidoPaterno}`,
        cargo_contacto: empresa.cargo_contacto,
        ubicacion: empresa.municipio ? `${empresa.municipio}, ${empresa.estado}` : null,
        progreso: progresoCalculado,
        logoUrl: empresa.logo_url,
        estatus: empresa.estatus_verificacion,
    };

    return (
        <DashboardShellEmpresa perfil={perfilReal}>
            {children}
        </DashboardShellEmpresa>
    );
}
