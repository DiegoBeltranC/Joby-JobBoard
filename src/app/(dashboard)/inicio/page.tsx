import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function InicioPage() {
    // 1. Buscamos la sesión del usuario para saber de dónde es
    const session = await getSession();
    let ubicacionFiltro = "tu zona"; // Valor por defecto

    if (session) {
        const usuarioInfo = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { estudiante: true }
        });
        if (usuarioInfo?.estudiante?.municipio) {
            ubicacionFiltro = usuarioInfo.estudiante.municipio;
        }
    }

    // Datos falsos por ahora, luego los traeremos de Prisma buscando por `ubicacionFiltro`
    const vacantesPrueba = [
        { id: 1, titulo: "Desarrollador Frontend React", empresa: "Tech Chetumal", tipo: "Estadía", ubicacion: "Remoto / Chetumal", tiempo: "Hace 2 días" },
        { id: 2, titulo: "Auxiliar Administrativo", empresa: "Grupo Hotelero Maya", tipo: "Medio Tiempo", ubicacion: "Tulum, Q. Roo", tiempo: "Hace 5 horas" },
        { id: 3, titulo: "Prácticas en Marketing Digital", empresa: "Agencia Creativa Roo", tipo: "Servicio Social", ubicacion: "Cancún, Q. Roo", tiempo: "Hace 1 semana" },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Buscar vacantes</h1>
            
            {/* 👇 Aplicamos la personalización aquí */}
            <p className="text-gray-500 mb-8">
                Oportunidades recomendadas para ti cerca de <span className="font-semibold text-teal-600">{ubicacionFiltro}</span>.
            </p>

            {/* Grid de Vacantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vacantesPrueba.map((vacante) => (
                    <div key={vacante.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                vacante.tipo === 'Estadía' ? 'bg-blue-100 text-blue-700' :
                                vacante.tipo === 'Medio Tiempo' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-purple-100 text-purple-700'
                            }`}>
                                {vacante.tipo}
                            </span>
                            <span className="text-xs text-gray-400">{vacante.tiempo}</span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">{vacante.titulo}</h3>
                        <p className="text-sm font-medium text-gray-600 mt-1">{vacante.empresa}</p>

                        <div className="mt-4 flex items-center text-sm text-gray-500 gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {vacante.ubicacion}
                        </div>

                        <div className="mt-6">
                            <button className="w-full py-2.5 bg-gray-50 hover:bg-teal-50 text-teal-700 font-semibold rounded-xl border border-gray-200 transition-colors">
                                Ver detalles
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}