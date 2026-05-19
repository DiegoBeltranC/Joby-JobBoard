import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
    Search
} from "lucide-react";
import Link from "next/link";
import PostulacionCard from "./PostulacionCard";

export default async function MisPostulacionesPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const usuario = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            estudiante: {
                include: {
                    postulaciones: {
                        include: {
                            vacante: {
                                include: { empresa: true }
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    }
                }
            }
        }
    });

    if (!usuario?.estudiante) redirect("/");

    const postulaciones = usuario.estudiante.postulaciones;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto px-6 py-12">
            <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4 flex items-center gap-4">
                            <span className="p-3 bg-teal-100 rounded-[24px] text-teal-600 shadow-xl shadow-teal-100/50">
                                <Search className="w-10 h-10" />
                            </span>
                            Mis Postulaciones
                        </h1>
                        <p className="text-gray-500 font-bold max-w-2xl text-lg leading-snug">
                            Gestiona tus solicitudes de empleo en tiempo real. Recuerda el período de <span className="text-teal-600 font-black">5 minutos de gracia</span> para ajustes rápidos.
                        </p>
                    </div>
                </div>
            </div>

            {postulaciones.length === 0 ? (
                <div className="bg-white rounded-[48px] p-20 border-4 border-dashed border-gray-50 flex flex-col items-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                        <Search className="w-12 h-12 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Aún no hay movimientos</h3>
                    <p className="text-gray-500 font-bold mb-10 max-w-sm">Explora las vacantes disponibles y postúlate para comenzar tu historial profesional.</p>
                    <Link 
                        href="/inicio" 
                        className="px-10 py-5 bg-gray-900 hover:bg-teal-600 text-white font-black rounded-3xl transition-all shadow-2xl shadow-gray-200 hover:shadow-teal-200 active:scale-95"
                    >
                        Buscar Vacantes
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {postulaciones.map((p) => (
                        <PostulacionCard key={p.id} postulacion={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
