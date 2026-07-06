"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, HelpCircle, FileText, Download, Loader2, Check, Send } from "lucide-react"
import PublicHelpCenter from "@/components/PublicHelpCenter"

// Downloadable Documents list
const documents = [
  { id: "carta", name: "Formato de Carta de Aceptación (Oficial UT)", size: "142 KB" },
  { id: "cronograma", name: "Formato de Cronograma de Actividades", size: "98 KB" },
  { id: "reporte", name: "Plantilla de Reporte Mensual de Estadía", size: "210 KB" }
]

export default function CentroAyudaPage() {
  // Track download loading status for each file
  const [downloading, setDownloading] = useState<{ [key: string]: "idle" | "loading" | "done" }>({})

  // Form states
  const [sendingForm, setSendingForm] = useState(false)

  // Simulated download action
  const handleDownload = (id: string, name: string) => {
    setDownloading(prev => ({ ...prev, [id]: "loading" }))

    // Simular un delay de descarga
    setTimeout(() => {
      setDownloading(prev => ({ ...prev, [id]: "done" }))
      toast.success("Descarga iniciada", {
        description: `Se ha descargado el archivo ${name} con éxito.`
      })

      // Volver a estado normal después de unos segundos
      setTimeout(() => {
        setDownloading(prev => ({ ...prev, [id]: "idle" }))
      }, 3000)
    }, 1500)
  }

  // Handle support message submission
  const handleSubmitSupport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSendingForm(true)
    const idCarga = toast.loading("Enviando tu consulta...")

    setTimeout(() => {
      toast.dismiss(idCarga)
      toast.success("Mensaje enviado", {
        description: "Recibirás respuesta en el correo proporcionado dentro de las próximas 24 horas."
      })
      setSendingForm(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1800)
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background transition-colors duration-300">
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold italic bg-primary">UT</div>
          <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Button>
        </Link>
      </header>

      {/* HERO / CABECERA VISUAL */}
      <section className="py-16 bg-gradient-to-tr from-teal-50/20 via-background to-indigo-50/20 border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <HelpCircle className="w-4 h-4" />
            CENTRO DE SOPORTE Y AYUDA
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
            ¿Tienes dudas antes de registrarte?
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Estamos aquí para guiarte en el proceso de vinculación. Selecciona tu perfil a continuación para resolver todas tus dudas operativas.
          </p>
        </div>
      </section>

      {/* SELECTOR DE CAMINOS Y ACORDEÓN DINÁMICO */}
      <section className="py-12 bg-white">
        <PublicHelpCenter />
      </section>

     
      {/* FOOTER */}
      <footer className="border-t border-border bg-card py-10 mt-auto">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col items-center justify-center text-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white font-bold text-xs italic">UT</div>
            <span className="font-bold text-foreground">Joby</span>
            <span>&middot; UT Chetumal</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/acerca-de" className="hover:text-primary transition-colors font-semibold">Acerca de</Link>
            <Link href="/centro-de-ayuda" className="hover:text-primary transition-colors font-semibold">Centro de ayuda</Link>
          </div>
          <p className="text-xs text-muted-foreground/80">
            © 2026 Joby &middot; Universidad Tecnológica de Chetumal
          </p>
        </div>
      </footer>
    </div>
  )
}
