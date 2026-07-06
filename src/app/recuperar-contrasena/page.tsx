"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, KeyRound, Mail, ShieldAlert } from "lucide-react"
import { requestPasswordResetAction } from "@/actions/recovery"
import { toast } from "sonner"

export default function RecuperarContrasenaPage() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailIngresado, setEmailIngresado] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const idCarga = toast.loading("Enviando solicitud...")
    const formData = new FormData(event.currentTarget)
    const emailVal = formData.get("email") as string
    setEmailIngresado(emailVal)

    try {
      const result = await requestPasswordResetAction(formData)

      toast.dismiss(idCarga)

      if (result?.error) {
        setError(result.error)
        toast.error("Error", {
          description: result.error
        })
      } else if (result?.success) {
        toast.success("Solicitud procesada", {
          description: result.message
        })
        setEnviado(true)
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

  async function handleResend() {
    if (!emailIngresado) return

    setLoading(true)
    setError(null)
    const idCarga = toast.loading("Reenviando solicitud...")

    const formData = new FormData()
    formData.append("email", emailIngresado)

    try {
      const result = await requestPasswordResetAction(formData)
      toast.dismiss(idCarga)

      if (result?.error) {
        setError(result.error)
        toast.error("Error", {
          description: result.error
        })
      } else if (result?.success) {
        toast.success("Correo reenviado", {
          description: "Se ha enviado un nuevo enlace de recuperación."
        })
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
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">¿Olvidaste tu contraseña?</h1>
            <p className="text-muted-foreground text-sm">
              Introduce tu correo electrónico registrado y te enviaremos un enlace seguro para restablecerla.
            </p>
          </div>

          {!enviado ? (
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
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@utchetumal.edu.mx"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button disabled={loading} className="w-full h-12 text-base font-bold">
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm border border-destructive/20 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-left">Atención</p>
                    <p className="opacity-90 text-left">{error}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm border border-emerald-100 dark:border-emerald-950">
                Hemos procesado tu solicitud. 
                recibirás instrucciones en unos momentos.
              </div>
              <p className="text-muted-foreground text-xs">
                ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado.
              </p>
              
              <Button 
                type="button" 
                variant="outline" 
                disabled={loading} 
                onClick={handleResend}
                className="w-full h-12 text-sm font-semibold mt-2"
              >
                {loading ? "Reenviando..." : "Reenviar correo de recuperación"}
              </Button>
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
