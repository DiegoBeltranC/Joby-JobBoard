import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, UserPlus, Search, MessageSquare, Users, Briefcase } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-white">
      {/* 1. HEADER */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 bg-emerald-700 rounded flex items-center justify-center text-white font-bold">J</div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">Joby</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="text-emerald-700 border-emerald-700 hover:bg-emerald-50 hidden md:flex">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Regístrate
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="container mx-auto px-6 py-12 md:py-24 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-800">
              <span className="text-emerald-600">¡Te damos la bienvenida</span> a tu comunidad estudiantil profesional!
            </h1>
            <p className="text-lg text-slate-600 max-w-md">
              Aquí podrás encontrar trabajos que se ajusten a tus necesidades y que estén avalados por una institución académica.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-emerald-200">
              Ver vacantes
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center relative">
            {/* Círculo principal / Imagen Placeholder */}
            <div className="w-full max-w-md aspect-square bg-slate-100 rounded-full relative flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              <Image src="/logos/landing/chico_en_computadora.png" alt="JobBy" fill className="object-cover" />
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
                "Servicio social y prácticas profesionales",
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
                <span className="text-4xl font-bold text-emerald-600 mb-2">+1200</span>
                <span className="text-slate-600 font-medium">Estudiantes registrados</span>
              </div>
              <div className="flex flex-col items-center">
                <Briefcase className="w-12 h-12 text-emerald-500 mb-4" />
                <span className="text-4xl font-bold text-emerald-600 mb-2">+150</span>
                <span className="text-slate-600 font-medium">Empresas afiliadas</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageSquare className="w-12 h-12 text-emerald-500 mb-4" />
                <span className="text-4xl font-bold text-emerald-600 mb-2">+800</span>
                <span className="text-slate-600 font-medium">Vacantes publicadas</span>
              </div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 text-lg rounded-full shadow-lg">
              Regístrate
            </Button>
          </div>
        </section>

        {/* 7. CTA EMPRESAS */}
        <section className="py-16 bg-white text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-600 mb-4">
              ¿Eres una empresa / institución y buscas jóvenes con talento?
            </h2>
            <p className="text-slate-500 mb-8">
              Conecta con estudiantes de la UT con ganas de aprender, trabajar y crecer profesionalmente.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-full">
              Afiliar mi empresa
            </Button>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-700 rounded flex items-center justify-center text-white font-bold text-xs">J</div>
            <span className="font-bold">Joby</span>
            <span className="hidden md:inline">| Plataforma de vacantes UT Chetumal</span>
          </div>

          <div className="flex gap-4">
            <Link href="#" className="hover:text-emerald-600">Acerca de</Link>
            <Link href="#" className="hover:text-emerald-600">Accesibilidad</Link>
            <Link href="#" className="hover:text-emerald-600">Centro de ayuda</Link>
          </div>

          <div>
            © 2026 Joby - UT Chetumal
          </div>
        </div>
      </footer>
    </div>
  )
}