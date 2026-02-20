'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/actions/auth" 

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await loginAction(formData)

    if (result?.error) {
      setError(result.error) 
      setLoading(false)
    } else {
      alert(`✅ ¡LOGIN EXITOSO!\n\nConectado a PostgreSQL.\nBienvenido: ${result?.userName}\nRol: ${result?.role}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      {/* HEADER SIMPLE */}
      <header className="px-8 py-4 border-b border-gray-100 flex items-center">
        <div className="flex items-center gap-2">
            <div className="bg-emerald-700 text-white p-1 rounded font-bold text-xl">JobBy</div>
            <span className="font-bold text-xl tracking-tight text-gray-700">UT Chetumal</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* COLUMNA IZQUIERDA (Formulario) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-emerald-700 mb-8">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="matricula@utchetumal.edu.mx" 
                className="bg-gray-50 border-gray-200 h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                className="bg-gray-50 border-gray-200 h-12"
                required
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200 font-medium">
                ⚠ {error}
              </div>
            )}

            <Button 
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 text-lg font-bold shadow-lg shadow-emerald-100 transition-all"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </Button>
          </form>

            <div className="mt-8 text-center text-sm text-gray-500">
                ¿No tienes cuenta? <Link href="#" className="text-emerald-700 font-bold hover:underline">Regístrate aquí</Link>
            </div>
        </div>

        {/* COLUMNA DERECHA (Decorativa) */}
        <div className="hidden lg:flex w-1/2 bg-slate-50 items-center justify-center p-12 relative border-l border-gray-100">
            <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-4xl">
                    🎓
                </div>
                <h2 className="text-2xl font-bold text-slate-700">Plataforma de Vinculación</h2>
                <p className="text-gray-500">Conectando talento universitario con el sector productivo.</p>
            </div>
        </div>
      </main>
    </div>
  )
}