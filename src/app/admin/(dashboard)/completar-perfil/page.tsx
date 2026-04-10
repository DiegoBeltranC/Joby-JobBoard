"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ShieldCheck } from "lucide-react"

// Importaremos la accion que crearemos después.
import { completarPerfilAdmin } from "@/actions/adminConfig"

export default function CompletarPerfilAdminPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const idCarga = toast.loading("Guardando datos...")
        const formData = new FormData(event.currentTarget)
        const result = await completarPerfilAdmin(formData)

        if (result?.error) {
            toast.dismiss(idCarga)
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success("¡Perfil actualizado!", { id: idCarga })
            // Redirigir al inicio del panel
            router.push("/admin")
            router.refresh()
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 font-sans">
            <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center">Bienvenido al Sistema</h1>
                    <p className="text-gray-500 text-sm text-center mt-2">
                        Por razones de seguridad e integridad del historial, requerimos que ingreses tu nombre completo.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre(s) <span className="text-red-500">*</span></Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            placeholder="Ej. Juan Carlos"
                            className="h-12 border-gray-200 focus-visible:ring-primary"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="apellidoPaterno">Apellido Paterno <span className="text-red-500">*</span></Label>
                            <Input
                                id="apellidoPaterno"
                                name="apellidoPaterno"
                                placeholder="Pérez"
                                className="h-12 border-gray-200 focus-visible:ring-primary"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                            <Input
                                id="apellidoMaterno"
                                name="apellidoMaterno"
                                placeholder="Gómez"
                                className="h-12 border-gray-200 focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                        <Input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            placeholder="983 000 0000"
                            className="h-12 border-gray-200 focus-visible:ring-primary"
                        />
                    </div>

                    <Button
                        disabled={loading}
                        className="w-full h-12 mt-6 text-md font-bold bg-primary hover:bg-primary/90 text-white"
                    >
                        {loading ? "Guardando..." : "Comenzar a Administrar"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
