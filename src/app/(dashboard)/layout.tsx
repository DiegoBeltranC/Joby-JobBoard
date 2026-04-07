import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // 1. Traemos TODOS los datos necesarios para calcular el progreso
    const usuarioInfo = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            estudiante: {
                include: {
                    universidad: true,
                    carrera: true,
                    experiencias: true, // Necesario para el progreso
                    proyectos: true,    // Necesario para el progreso
                }
            }
        }
    });

    if (!usuarioInfo || !usuarioInfo.estudiante) {
        return <div>Error cargando perfil</div>;
    }

    const estudiante = usuarioInfo.estudiante;

    // 2. ALGORITMO DE PROGRESO DEL PERFIL
    let progresoCalculado = 20; // 20% Base por haberse registrado (Nombre, Carrera, Universidad)
    
    if (estudiante.estado && estudiante.municipio && estudiante.bio) progresoCalculado += 20; // Ubicación y Bio completas
    if (estudiante.habilidades && estudiante.habilidades.length > 0) progresoCalculado += 20; // Habilidades añadidas
    if (estudiante.foto_perfil_url) progresoCalculado += 15; // Tiene foto
    if (estudiante.cv_url) progresoCalculado += 15; // Subió CV
    if (estudiante.experiencias.length > 0 || estudiante.proyectos.length > 0) progresoCalculado += 10; // Tiene portafolio/experiencia

    // 3. Extracción inteligente de idiomas y modalidades
    const nivelIngles = estudiante.idiomas?.find(i => i.toLowerCase().includes('inglés')) || null;
    const buscando = estudiante.tipos_contrato?.length > 0 
        ? estudiante.tipos_contrato.map(t => t.replace(/_/g, ' ')).join(', ') 
        : null;

    // 4. Objeto final para el Sidebar
    const perfilReal = {
        nombre: `${estudiante.nombre} ${estudiante.apellidoPaterno}`,
        carrera: estudiante.carrera.nombre,
        universidad: estudiante.universidad.siglas, // Mejor las siglas para no romper el diseño si es muy largo
        ubicacion: estudiante.municipio ? `${estudiante.municipio}, ${estudiante.estado}` : null,
        progreso: progresoCalculado,
        nivelIngles: nivelIngles,
        fotoUrl: estudiante.foto_perfil_url,
        buscando: buscando // 👈 ¡Nuevo dato ultra valioso!
    };

    return (
        <DashboardShell perfil={perfilReal}>
            {children}
        </DashboardShell>
    );
}