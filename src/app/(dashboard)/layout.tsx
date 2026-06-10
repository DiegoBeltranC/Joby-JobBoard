import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { calcularProgresoEstudiante } from '@/lib/perfilEstudiante';
import { obtenerEstudianteYSincronizarHito } from '@/lib/syncPerfilEstudiante';
import { TipoContrato } from '@prisma/client';

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const resultado = await obtenerEstudianteYSincronizarHito(session.userId);

    if (!resultado) {
        return <div>Error cargando perfil</div>;
    }

    const estudiante = resultado.estudiante;
    const { progreso, faltantes, faltantesAlerta } = calcularProgresoEstudiante(estudiante);

    const idiomas = estudiante.idiomas || [];
    const buscando = estudiante.tipos_contrato?.length > 0
        ? estudiante.tipos_contrato.map((t: TipoContrato) => t.replace(/_/g, ' ')).join(', ')
        : null;

    const perfilReal = {
        estudianteId: estudiante.id,
        nombre: `${estudiante.nombre} ${estudiante.apellidoPaterno}`,
        carrera: estudiante.carrera.nombre,
        universidad: estudiante.universidad.siglas,
        ubicacion: estudiante.municipio ? `${estudiante.municipio}, ${estudiante.estado}` : null,
        progreso,
        faltantes,
        faltantesAlerta,
        perfilCompletado: !!estudiante.perfil_completado_at,
        idiomas,
        fotoUrl: estudiante.foto_perfil_url,
        buscando,
    };

    return (
        <DashboardShell
            sidebar={<Sidebar perfil={perfilReal} />}
            brandColorClass="text-teal-700"
        >
            {children}
        </DashboardShell>
    );
}
