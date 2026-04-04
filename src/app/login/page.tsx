"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Briefcase } from "lucide-react"
import { loginAction } from "@/actions/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const idCarga = toast.loading("Verificando credenciales...")
    const formData = new FormData(event.currentTarget)
    const result = await loginAction(formData)

    if (result?.error) {
      toast.dismiss(idCarga)
      toast.error("Error de inicio de sesión", {
        description: result.error
      })
      setLoading(false)
    } else if (result?.success) {
      toast.success("¡Bienvenido a Joby!", { id: idCarga })
      router.push("/inicio")
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      {/* HEADER: Con enlace al inicio */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold italic">UT</div>
          <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* COLUMNA IZQUIERDA (Formulario) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center max-w-xl mx-auto">

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-primary mb-3">Iniciar sesión</h1>
            <p className="text-muted-foreground">Ingresa con tu cuenta institucional para acceder a las vacantes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="usuario@utchetumal.edu.mx"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                {/* Detalle UX: Link para recuperar contraseña */}
                <Link href="#" className="text-sm text-primary font-medium hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-12"
                required
              />
            </div>

            <Button
              disabled={loading}
              className="w-full h-12 text-lg font-bold shadow-lg"
            >
              {loading ? "Verificando..." : "Ingresar a Joby"}
            </Button>
          </form>

          <div className="mt-10 text-center text-sm text-muted-foreground border-t border-border pt-6">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="text-primary font-bold hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* COLUMNA DERECHA (Decorativa Institucional) */}
        <div className="hidden lg:flex w-1/2 bg-secondary items-center justify-center p-12 relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 max-w-md text-center space-y-8 bg-white/50 backdrop-blur-sm p-10 rounded-3xl border border-white/20 shadow-xl">
            <div className="w-20 h-20 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-inner rotate-3">
              <Briefcase className="w-10 h-10 text-primary-foreground" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Tu futuro profesional empieza <span className="text-primary">hoy</span>.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Únete a la plataforma exclusiva de vinculación donde el talento de la UT Chetumal conecta con las mejores empresas de la región.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/10 py-2 px-4 rounded-full w-fit mx-auto">
              <ShieldCheck className="w-4 h-4" />
              Acceso exclusivo UT
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}