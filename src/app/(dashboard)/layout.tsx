import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Verificamos si hay alguien logueado
    const session = await getSession();

    // Si intenta entrar a /inicio sin iniciar sesión, ¡patada al login!
    if (!session) {
        redirect('/login');
    }

    // 2. Traemos todos sus datos reales de Prisma
    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            estudiante: {
                include: {
                    universidad: true,
                    carrera: true
                }
            }
        }
    });

    if (!usuarioInfo || !usuarioInfo.estudiante) {
        // Manejo de errores por si es un admin u otra cosa
        return <div>Error cargando perfil</div>;
    }

    const estudiante = usuarioInfo.estudiante;

    // 3. Calculamos un progreso falso (por ahora) para que no se rompa la UI
    // En el futuro, sumaremos 20% si tiene foto, 20% si tiene bio, etc.
    const progresoCalculado = 20;

    // 4. Preparamos el objeto para inyectarlo en el Sidebar
    const perfilReal = {
        nombre: `${estudiante.nombre} ${estudiante.apellidoPaterno}`,
        carrera: estudiante.carrera.nombre,
        universidad: estudiante.universidad.nombre,
        ubicacion: estudiante.ubicacion || "Ubicación no especificada",
        progreso: progresoCalculado,
        nivelIngles: estudiante.idiomas?.find(i => i.toLowerCase().includes('inglés')) || "No especificado",
    };


    return (
        <DashboardShell perfil={perfilReal}>
            {children}
        </DashboardShell>
    );
}
