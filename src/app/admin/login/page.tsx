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
    <div className="min-h-screen flex items-center justify-center font-sans bg-slate-950 px-4">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-primary/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-[0_0_15px_rgba(0,147,116,0.3)]">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Acceso Restringido</h1>
            <p className="text-slate-400 text-sm text-center">
              Panel Administrativo de Vinculación y Prácticas UT Chetumal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Correo Institucional</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@utchetumal.edu.mx"
                  className="pl-10 h-12 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-primary"
                  required
                />
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Clave de Seguridad</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                className="h-12 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-primary tracking-widest"
                required
              />
            </div>

            <Button
              disabled={loading}
              className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(0,147,116,0.2)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,147,116,0.4)]"
            >
              {loading ? "Autenticando..." : "Ingresar al Sistema"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
              Volver al portal público
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
