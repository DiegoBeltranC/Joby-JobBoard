"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, UserPlus, Search, MessageSquare, Users, Briefcase, Menu, X } from "lucide-react"
import { AnimatedCounter } from "@/components/AnimatedCounter"
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      {/* 1. HEADER */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo UT */}
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold italic">UT</div>
          <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/registro?tipo=empresa" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary transition-colors">
            <Briefcase className="w-4 h-4" />
            ¿Eres Empresa?
          </Link>
          <Link href="/login">
            <Button variant="outline" className="text-emerald-700 border-emerald-700 hover:bg-emerald-50">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Regístrate
            </Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          id="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-50 transition-all focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Nav Dropdown & Backdrop (Outside the header to avoid stacking context issues) */}
      {isMenuOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 md:hidden animate-in fade-in"
            onClick={() => setIsMenuOpen(false)}
          />
          <div 
            id="mobile-menu-dropdown"
            className="fixed top-[73px] left-0 right-0 bg-white border-b border-gray-100 shadow-xl px-6 py-6 flex flex-col gap-4 md:hidden z-40 transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-top-2"
          >
            <Link 
              href="/registro?tipo=empresa" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-primary font-medium transition-all"
            >
              <Briefcase className="w-5 h-5 text-primary" />
              <span>¿Eres Empresa?</span>
            </Link>
            <hr className="border-gray-100 my-1" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full py-6 text-emerald-700 border-emerald-700 hover:bg-emerald-50 rounded-xl">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100">
                  Regístrate
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="container mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-slate-800">
              <span className="text-emerald-600 block md:inline">¡Te damos la bienvenida</span> a tu comunidad estudiantil profesional!
            </h1>

            {/* Mobile Image: displayed between Title and Subtitle on mobile, hidden on desktop */}
            <div 
              className="block md:hidden w-full mx-auto aspect-square bg-slate-100 rounded-full relative border-4 border-white shadow-md overflow-hidden my-2"
              style={{ maxWidth: '180px' }}
            >
              <Image 
                src="/logos/landing/chico_en_computadora.png" 
                alt="JobBy" 
                fill 
                className="object-cover" 
                priority 
              />
            </div>

            <p className="text-base md:text-lg text-slate-600 max-w-md mx-auto md:mx-0 text-center md:text-left">
              Aquí podrás encontrar trabajos que se ajusten a tus necesidades y que estén avalados por una institución académica.
            </p>
            <Link href="/registro" className="self-center md:self-start flex mx-auto md:mx-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-emerald-200">
                Ver vacantes
              </Button>
            </Link>
          </div>

          {/* Desktop Image Container: hidden on mobile, visible on desktop */}
          <div className="hidden md:flex md:w-1/2 justify-center relative">
            <div className="w-full max-w-md aspect-square bg-slate-100 rounded-full relative flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              <Image 
                src="/logos/landing/chico_en_computadora.png" 
                alt="JobBy" 
                fill 
                sizes="384px"
                className="object-cover" 
              />
            </div>
          </div>
        </section>

        {/* 3. CÓMO FUNCIONA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-12">¿Cómo funciona <span className="text-emerald-600">Joby</span>?</h2>

            <div className="flex flex-col md:flex-row justify-center items-center gap-8 relative">
              {/* Paso 1 */}
              <div className="flex flex-col items-center text-center max-w-xs z-10 bg-white">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <UserPlus className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="font-bold"><span className="text-emerald-600">1.-</span> Regístrate</h3>
                <p className="text-sm text-slate-500 mt-2">Como estudiante o como empresa</p>
              </div>

              {/* Flecha (Oculta en móviles) */}
              <ChevronRight className="hidden md:block w-8 h-8 text-slate-300" />

              {/* Paso 2 */}
              <div className="flex flex-col items-center text-center max-w-xs z-10 bg-white">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <Search className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="font-bold"><span className="text-emerald-600">2.-</span> Busca o publica oportunidades</h3>
              </div>

              {/* Flecha (Oculta en móviles) */}
              <ChevronRight className="hidden md:block w-8 h-8 text-slate-300" />

              {/* Paso 3 */}
              <div className="flex flex-col items-center text-center max-w-xs z-10 bg-white">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <MessageSquare className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="font-bold"><span className="text-emerald-600">3.-</span> Postúlate y recibe respuesta</h3>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ¿POR QUÉ USAR JOBBY? */}
        <section className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">¿Por qué usar <span className="text-emerald-600">Joby</span>?</h2>
              {/* Imagen Placeholder */}
              <div className="w-full max-w-sm aspect-square bg-slate-200 rounded-3xl flex items-center justify-center mx-auto relative overflow-hidden">
                <Image src="/logos/landing/monaChinaPulgar.png" alt="JobBy" fill className="object-cover" />
              </div>
            </div>

            <div className="md:w-1/2 space-y-4">
              {[
                "Fácil de postular",
                "Vacantes validadas por la UT",
                "Prácticas profesionales",
                "Prioridad para los estudiantes",
                "Empresas confiables"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6 flex-shrink-0" />
                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. A QUIÉN VA DIRIGIDA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-block bg-slate-100 px-6 py-2 rounded-full font-bold text-slate-700 mb-4">
                ¿A quién va dirigida la plataforma <span className="text-emerald-600">Joby</span>?
              </div>

              <div className="space-y-4">
                {[
                  "Encuentra tu servicio social",
                  "Encuentra tus próximas prácticas",
                  "Encuentra tu primer empleo de medio tiempo"
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-5 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-slate-600">{item}</span>
                    <ChevronRight className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Imagen Placeholder */}
              <div className="w-full max-w-sm aspect-[4/3] bg-slate-100 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <Image src="/logos/landing/jovenes_estudiando.png" alt="JobBy" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. ESTADÍSTICAS */}
        <section className="py-20 bg-slate-100 text-center">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <Users className="w-12 h-12 text-emerald-500 mb-4" />
                <span className="text-4xl font-bold text-emerald-600 mb-2">
                  +<AnimatedCounter target={1200} />
                </span>
                <span className="text-slate-600 font-medium">Estudiantes registrados</span>
              </div>
              <div className="flex flex-col items-center">
                <Briefcase className="w-12 h-12 text-emerald-500 mb-4" />
                <span className="text-4xl font-bold text-emerald-600 mb-2">
                  +<AnimatedCounter target={150} />
                </span>
                <span className="text-slate-600 font-medium">Empresas afiliadas</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageSquare className="w-12 h-12 text-emerald-500 mb-4" />
                <span className="text-4xl font-bold text-emerald-600 mb-2">
                  +<AnimatedCounter target={800} />
                </span>
                <span className="text-slate-600 font-medium">Vacantes publicadas</span>
              </div>
            </div>
            <Link href="/registro">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 text-lg rounded-full shadow-lg">
                Regístrate
              </Button>
            </Link>
          </div>
        </section>

        {/* 7. CTA EMPRESAS */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-blue-50 text-center border-y border-indigo-100">
          <div className="container mx-auto px-6 max-w-2xl">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              ¿Eres una empresa y buscas jóvenes con talento?
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm md:text-base">
              Regístrate hoy mismo y publica tus ofertas laborales. Conéctate con los mejores estudiantes y egresados de la UT.
            </p>
            <Link href="/registro?tipo=empresa">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg rounded-full shadow-lg shadow-indigo-100">
                Regístrate como empresa
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
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