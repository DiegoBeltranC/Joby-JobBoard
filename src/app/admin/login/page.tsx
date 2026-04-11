"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldAlert, Fingerprint } from "lucide-react"
import { loginAction } from "@/actions/auth"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const idCarga = toast.loading("Verificando acceso de seguridad...")
    const formData = new FormData(event.currentTarget)
    formData.set("tipo", "admin")
    const result = await loginAction(formData)

    if (result?.error) {
      toast.dismiss(idCarga)
      toast.error("Acceso Denegado", {
        description: result.error
      })
      setLoading(false)
    } else if (result?.success) {
      toast.success("Verificación Exitosa", { id: idCarga })
      router.push("/admin")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-gray-50 px-4">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Acceso Restringido</h1>
            <p className="text-gray-500 text-sm text-center">
              Panel Administrativo de Vinculación y Prácticas UT Chetumal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Correo Institucional</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@utchetumal.edu.mx"
                  className="pl-10 h-12 bg-white border-gray-200 text-gray-900 focus-visible:ring-indigo-600"
                  required
                />
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Clave de Seguridad</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                className="h-12 bg-white border-gray-200 text-gray-900 focus-visible:ring-indigo-600 tracking-widest"
                required
              />
            </div>

            <Button
              disabled={loading}
              className="w-full h-12 text-md font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-300"
            >
              {loading ? "Autenticando..." : "Ingresar al Sistema"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              Volver al portal público
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
