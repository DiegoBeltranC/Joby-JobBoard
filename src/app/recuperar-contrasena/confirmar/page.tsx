"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock, ShieldAlert, ShieldCheck } from "lucide-react"
import { resetPasswordAction } from "@/actions/recovery"
import { toast } from "sonner"

function ConfirmarRecuperarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(false)
  const [completado, setCompletado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError("Token inválido o ausente en el enlace.")
      toast.error("Error", {
        description: "Token inválido o ausente en el enlace."
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      toast.error("Contraseña débil", {
        description: "La contraseña debe tener al menos 8 caracteres."
      })
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      toast.error("Mismatch", {
        description: "Las contraseñas no coinciden."
      })
      return
    }

    setLoading(true)
    const idCarga = toast.loading("Actualizando contraseña...")

    try {
      const result = await resetPasswordAction(token, password)

      toast.dismiss(idCarga)

      if (result?.error) {
        setError(result.error)
        toast.error("Error", {
          description: result.error
        })
      } else if (result?.success) {
        toast.success("Contraseña actualizada", {
          description: "Tu contraseña ha sido restablecida con éxito. Redirigiendo..."
        })
        setCompletado(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err) {
      toast.dismiss(idCarga)
      setError("Ocurrió un error inesperado. Intenta de nuevo más tarde.")
      toast.error("Error", {
        description: "Ocurrió un error inesperado. Intenta de nuevo más tarde."
      })
    } finally {
      setLoading(false)
    }
  }

  // Si no hay token en el enlace, mostramos una pantalla de error
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
        <header className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-50">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold italic bg-primary">UT</div>
            <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-secondary/50 via-background to-secondary/30">
          <div className="w-full max-w-md bg-white dark:bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-destructive">Enlace inválido</h1>
            <p className="text-muted-foreground text-sm">
              Este enlace no contiene un token de seguridad válido. Por favor, solicita uno nuevo.
            </p>
            <div className="pt-4 border-t border-border">
              <Link
                href="/recuperar-contrasena"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold italic bg-primary">UT</div>
          <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-secondary/50 via-background to-secondary/30">
        <div className="w-full max-w-md bg-white dark:bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              {completado ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <Lock className="w-6 h-6" />}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {completado ? "¡Todo listo!" : "Nueva contraseña"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {completado
                ? "Tu contraseña ha sido actualizada. En un momento serás redirigido."
                : "Elige una nueva contraseña segura para acceder a tu cuenta."}
            </p>
          </div>

          {!completado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm border border-destructive/20 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-left">Atención</p>
                    <p className="opacity-90 text-left">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button disabled={loading} className="w-full h-12 text-base font-bold">
                {loading ? "Guardando..." : "Actualizar contraseña"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm border border-emerald-100 dark:border-emerald-950">
                Tu contraseña ha sido actualizada correctamente. Por favor inicia sesión con tus nuevas credenciales.
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmarRecuperarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
        <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-secondary/50 via-background to-secondary/30">
          <div className="w-full max-w-md bg-white dark:bg-card p-8 rounded-3xl border border-border shadow-xl text-center text-muted-foreground">
            Cargando sesión de seguridad...
          </div>
        </main>
      </div>
    }>
      <ConfirmarRecuperarForm />
    </Suspense>
  )
}
