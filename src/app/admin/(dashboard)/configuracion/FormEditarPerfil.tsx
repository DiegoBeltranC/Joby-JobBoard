"use client"

import { useState } from "react"
import { toast } from "sonner"
import { completarPerfilAdmin } from "@/actions/adminConfig"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"

function capitalizar(texto: string) {
    if (!texto) return "";
    return texto.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
}

export default function FormEditarPerfil({ adminActual }: { adminActual: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [nombre, setNombre] = useState(adminActual?.nombre || "");
    const [paterno, setPaterno] = useState(adminActual?.apellidoPaterno || "");
    const [materno, setMaterno] = useState(adminActual?.apellidoMaterno || "");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const loadId = toast.loading("Actualizando datos personales...");
        const result = await completarPerfilAdmin(formData);
        
        if (result?.error) {
            toast.dismiss(loadId);
            toast.error(result.error);
        } else {
            toast.dismiss(loadId);
            toast.success("Perfil actualizado con éxito");
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Nombre(s) *</label>
                    <input 
                        type="text" 
                        name="nombre" 
                        required
                        value={nombre}
                        onChange={(e) => setNombre(capitalizar(e.target.value))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Apellido Paterno *</label>
                    <input 
                        type="text" 
                        name="apellidoPaterno" 
                        required
                        value={paterno}
                        onChange={(e) => setPaterno(capitalizar(e.target.value))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Apellido Materno</label>
                    <input 
                        type="text" 
                        name="apellidoMaterno" 
                        value={materno}
                        onChange={(e) => setMaterno(capitalizar(e.target.value))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Teléfono (opcional)</label>
                    <input 
                        type="tel" 
                        name="telefono" 
                        defaultValue={adminActual?.telefono || ""}
                        pattern="^[0-9]{10}$"
                        title="Ingrese exactamente 10 dígitos numéricos"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
        </form>
    )
}
