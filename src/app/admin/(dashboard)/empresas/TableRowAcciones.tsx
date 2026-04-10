"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Eye, Ban } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { suspenderEmpresa } from "@/actions/adminEmpresas"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function TableRowAcciones({ empresaId, estatus }: { empresaId: number, estatus: string }) {
    const [open, setOpen] = useState(false);
    const [modalSuspender, setModalSuspender] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Cerrar click outside (Manejado por Popover internamente)

    const handleSuspender = async () => {
        if (!motivo.trim()) return toast.error("El motivo es obligatorio");
        
        setLoading(true);
        const idCarga = toast.loading("Suspendiendo empresa...");
        const result = await suspenderEmpresa(empresaId, motivo);
        
        if (result?.error) {
            toast.dismiss(idCarga);
            toast.error(result.error);
        } else {
            toast.dismiss(idCarga);
            toast.success("Empresa suspendida exitosamente");
            setModalSuspender(false);
            setMotivo("");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="relative inline-block text-left">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-1 rounded-2xl shadow-xl min-w-48 bg-white border border-gray-100 relative z-[100]">
                    <Link 
                        href={`/admin/empresas/${empresaId}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition w-full text-left"
                    >
                        <Eye className="w-4 h-4" />
                        Ver Perfil Detallado
                    </Link>
                    
                    {estatus === "APROBADA" && (
                        <button 
                            onClick={() => {
                                setOpen(false);
                                setModalSuspender(true);
                            }}
                            className="flex mt-1 items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition w-full text-left border-t border-gray-50"
                        >
                            <Ban className="w-4 h-4" />
                            Suspender Empresa
                        </button>
                    )}
                </PopoverContent>
            </Popover>

            {/* Modal de Suspensión (Client side only logic) */}
            {modalSuspender && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-2xl mb-6 mx-auto">
                            <Ban className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-center mb-2">Suspender Empresa</h2>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Estás a punto de ocultar todas las vacantes de esta empresa. Esta acción quedará registrada en el sistema.
                        </p>
                        
                        <textarea 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none placeholder:text-gray-400 min-h-[100px] mb-6 resize-none"
                            placeholder="Motivo detallado de la suspensión (Ej. Reportes de fraude)..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setModalSuspender(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSuspender}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm shadow-red-200"
                                disabled={loading}
                            >
                                {loading ? "Procesando..." : "Sí, Suspender"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
