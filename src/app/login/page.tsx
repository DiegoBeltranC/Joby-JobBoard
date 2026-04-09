"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Briefcase, GraduationCap, Building2 } from "lucide-react"
import { loginAction } from "@/actions/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [tipoLogin, setTipoLogin] = useState<"estudiante" | "empresa">(
    searchParams.get("tipo") === "empresa" ? "empresa" : "estudiante"
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isEmpresa = tipoLogin === "empresa"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const idCarga = toast.loading("Verificando credenciales...")
    const formData = new FormData(event.currentTarget)
    formData.set("tipo", tipoLogin)
    const result = await loginAction(formData)

    if (result?.error) {
      toast.dismiss(idCarga)
      toast.error("Error de inicio de sesión", {
        description: result.error
      })
      setLoading(false)
    } else if (result?.success) {
      toast.success("¡Bienvenido a Joby!", { id: idCarga })
      if (result.rol === "EMPRESA") {
        router.push("/empresa/inicio")
      } else {
        router.push("/inicio")
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold italic ${isEmpresa ? 'bg-indigo-600' : 'bg-primary'}`}>UT</div>
          <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* COLUMNA IZQUIERDA (Formulario) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center max-w-xl mx-auto">

          {/* TOGGLE ESTUDIANTE / EMPRESA */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex bg-gray-100 rounded-2xl p-1 w-full max-w-sm">
              <button
                type="button"
                onClick={() => setTipoLogin("estudiante")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  !isEmpresa
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => setTipoLogin("empresa")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isEmpresa
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Empresa
              </button>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className={`text-4xl font-bold mb-3 ${isEmpresa ? 'text-indigo-600' : 'text-primary'}`}>Iniciar sesión</h1>
            <p className="text-muted-foreground">
              {isEmpresa
                ? 'Ingresa con tu cuenta empresarial para gestionar vacantes.'
                : 'Ingresa con tu cuenta institucional para acceder a las vacantes.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{isEmpresa ? 'Correo Electrónico' : 'Correo Institucional'}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={isEmpresa ? "contacto@tuempresa.com" : "usuario@utchetumal.edu.mx"}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="#" className={`text-sm font-medium hover:underline ${isEmpresa ? 'text-indigo-600' : 'text-primary'}`}>
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
              className={`w-full h-12 text-lg font-bold shadow-lg ${isEmpresa ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
            >
              {loading ? "Verificando..." : isEmpresa ? "Ingresar como Empresa" : "Ingresar a Joby"}
            </Button>
          </form>

          <div className="mt-10 text-center text-sm text-muted-foreground border-t border-border pt-6">
            ¿Aún no tienes cuenta?{" "}
            <Link href={isEmpresa ? "/registro?tipo=empresa" : "/registro"} className={`font-bold hover:underline ${isEmpresa ? 'text-indigo-600' : 'text-primary'}`}>
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* COLUMNA DERECHA (Decorativa) */}
        <div className={`hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden ${isEmpresa ? 'bg-indigo-50' : 'bg-secondary'}`}>
          {/* Elementos decorativos */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 ${isEmpresa ? 'bg-indigo-200/30' : 'bg-primary/5'}`}></div>
          <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 ${isEmpresa ? 'bg-indigo-200/30' : 'bg-primary/5'}`}></div>

          <div className="relative z-10 max-w-md text-center space-y-8 bg-white/50 backdrop-blur-sm p-10 rounded-3xl border border-white/20 shadow-xl">
            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-inner rotate-3 ${isEmpresa ? 'bg-indigo-600' : 'bg-primary'}`}>
              {isEmpresa
                ? <Building2 className="w-10 h-10 text-white" />
                : <Briefcase className="w-10 h-10 text-primary-foreground" />}
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                {isEmpresa ? (
                  <>Encuentra el <span className="text-indigo-600">talento ideal</span>.</>
                ) : (
                  <>Tu futuro profesional empieza <span className="text-primary">hoy</span>.</>
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isEmpresa
                  ? 'Publica vacantes, filtra candidatos y conecta con los mejores estudiantes de la UT Chetumal.'
                  : 'Únete a la plataforma exclusiva de vinculación donde el talento de la UT Chetumal conecta con las mejores empresas de la región.'}
              </p>
            </div>

            <div className={`flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-full w-fit mx-auto ${
              isEmpresa
                ? 'text-indigo-600 bg-indigo-100'
                : 'text-primary bg-primary/10'
            }`}>
              {isEmpresa
                ? <><Building2 className="w-4 h-4" /> Portal empresarial</>
                : <><ShieldCheck className="w-4 h-4" /> Acceso exclusivo UT</>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}