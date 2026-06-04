"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, Award, ArrowLeft, GraduationCap, Building2, Calendar, Target, Heart } from "lucide-react"

// Testimonials Data
const testimonials = {
  estudiantes: [
    {
      name: "Valeria Gómez",
      role: "Egresada de TSU en TI",
      company: "Chetumal Tech Solutions",
      text: "Gracias a Joby pude postularme para mi estadía en TI. Hoy en día formo parte del equipo de desarrollo permanente. La plataforma facilitó todo el proceso de vinculación.",
      image: "VG"
    },
    {
      name: "Carlos Puc",
      role: "Estudiante de Ingeniería en Desarrollo de Software",
      company: "Consorcio Peninsular",
      text: "El proceso de firma de convenio fue súper rápido. Mi asesor académico y mi tutor empresarial pudieron validar todo sin contratiempos.",
      image: "CP"
    }
  ],
  empresas: [
    {
      name: "Ing. Roberto Novelo",
      role: "Director de Recursos Humanos",
      company: "Grupo Sadasi Chetumal",
      text: "La UT Chetumal prepara estudiantes con una actitud y habilidades técnicas increíbles. Con Joby, logramos reclutar tres practicantes en menos de una semana.",
      image: "RN"
    },
    {
      name: "Lic. Andrea Alcocer",
      role: "Fundadora",
      company: "Caribe Digital Agency",
      text: "Publicar nuestras vacantes de estadías es sumamente sencillo. El perfil del estudiante es claro y la comunicación es directa.",
      image: "AA"
    }
  ]
}

export default function AcercaDePage() {
  const [activeTab, setActiveTab] = useState<"estudiantes" | "empresas">("estudiantes")
  const [stats, setStats] = useState({ alumnos: 0, empresas: 0, vacantes: 0 })

  // Animar los contadores cuando carga la página
  useEffect(() => {
    const targetAlumnos = 1200
    const targetEmpresas = 150
    const targetVacantes = 800

    const duration = 1500 // 1.5s
    const stepTime = 30
    const steps = duration / stepTime

    let step = 0

    const timer = setInterval(() => {
      step++
      setStats({
        alumnos: Math.min(Math.floor((targetAlumnos / steps) * step), targetAlumnos),
        empresas: Math.min(Math.floor((targetEmpresas / steps) * step), targetEmpresas),
        vacantes: Math.min(Math.floor((targetVacantes / steps) * step), targetVacantes)
      })

      if (step >= steps) {
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

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

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-tr from-secondary/40 via-background to-secondary/20">
        <div className="container mx-auto px-6 max-w-5xl text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide border border-primary/20 animate-in fade-in duration-500">
            <GraduationCap className="w-4 h-4" />
            VINCULACIÓN PROFESIONAL UT
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Impulsando el futuro profesional desde <span className="text-primary bg-clip-text">Chetumal</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Bolsa Educativa es el puente digital oficial entre el talento joven de la Universidad Tecnológica de Chetumal y las empresas líderes de la región.
          </p>
        </div>

        {/* Círculos decorativos de fondo */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* IMPACT STATS */}
      <section className="py-12 border-y border-border bg-card">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 space-y-2 rounded-2xl transition-all duration-300 hover:bg-secondary/20">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">+{stats.alumnos}</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Estudiantes Registrados</p>
            </div>
            <div className="p-6 space-y-2 rounded-2xl transition-all duration-300 hover:bg-secondary/20">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">+{stats.empresas}</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Empresas Aliadas</p>
            </div>
            <div className="p-6 space-y-2 rounded-2xl transition-all duration-300 hover:bg-secondary/20">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">+{stats.vacantes}</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Vacantes Publicadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE DE PROCESO */}
      <section className="py-16 md:py-24 container mx-auto px-6 max-w-5xl">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">¿Cómo funciona la vinculación?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Un proceso ágil y transparente diseñado para cumplir con los lineamientos académicos de estadías profesionales.
          </p>
        </div>

        <div className="relative border-l-2 border-primary/20 ml-4 md:ml-32 space-y-12">
          {/* Step 1 */}
          <div className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center text-primary text-xs font-bold shadow-md transition-transform group-hover:scale-110">
              1
            </div>
            <div className="space-y-2 max-w-2xl bg-card p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Publicación de Vacantes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Las empresas aprobadas por la administración de la UT Chetumal registran sus ofertas detallando el perfil técnico, horarios y apoyos económicos ofrecidos.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center text-primary text-xs font-bold shadow-md transition-transform group-hover:scale-110">
              2
            </div>
            <div className="space-y-2 max-w-2xl bg-card p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Postulación y Filtro</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Los alumnos de los últimos cuatrimestres aplican a las vacantes alineadas con su carrera. Las empresas evalúan los perfiles y coordinan entrevistas directo en el portal.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8 md:pl-12 group">
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center text-primary text-xs font-bold shadow-md transition-transform group-hover:scale-110">
              3
            </div>
            <div className="space-y-2 max-w-2xl bg-card p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Formalización y Estadía</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Al seleccionar al alumno, se genera digitalmente el pre-convenio de estadía, garantizando la cobertura del seguro facultativo y los objetivos de aprendizaje del estudiante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Casos de Éxito</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Descubre cómo ha impactado la plataforma en nuestra comunidad en Chetumal.
            </p>

            {/* Tab Switched Header */}
            <div className="inline-flex p-1 rounded-xl bg-background border border-border max-w-xs mx-auto">
              <button
                onClick={() => setActiveTab("estudiantes")}
                className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "estudiantes"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Estudiantes
              </button>
              <button
                onClick={() => setActiveTab("empresas")}
                className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "empresas"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Empresas
              </button>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials[activeTab].map((item, idx) => (
              <div
                key={idx}
                className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <p className="text-base text-foreground italic leading-relaxed">
                  "{item.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm tracking-tight border border-primary/20">
                    {item.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      {item.role} &middot; <span className="text-primary font-semibold">{item.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALORES E IDENTIDAD */}
      <section className="py-16 md:py-24 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Compromiso con el desarrollo regional</h2>
            <p className="text-muted-foreground leading-relaxed">
              La UT Chetumal tiene como misión formar profesionales competitivos y comprometidos con el desarrollo sustentable y económico de Quintana Roo. Bolsa Educativa automatiza el trámite administrativo de las prácticas laborales para que estudiantes y reclutadores se enfoquen únicamente en lo que importa: **crecer juntos**.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vinculación 100% formalizada y segura</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inclusión social y accesibilidad digital</span>
              </div>
            </div>
          </div>
          <div className="bg-secondary/40 border border-border rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <h3 className="font-bold text-xl">¿Listo para vincularte?</h3>
            <p className="text-sm text-muted-foreground">
              Regístrate ahora en Joby y accede a todas las vacantes de estadías validadas o encuentra el talento que tu empresa necesita.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/registro">
                <Button className="font-bold animate-pulse">Regístrate como Alumno</Button>
              </Link>
              <Link href="/registro?tipo=empresa">
                <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary/5">
                  Registrar mi Empresa
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
