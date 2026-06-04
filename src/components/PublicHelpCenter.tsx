"use client";

import { useState, useRef } from "react";
import { 
  GraduationCap, 
  Building2, 
  ChevronDown, 
  ArrowRight, 
  BookOpen, 
  FileCheck, 
  Sparkles,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
}

const alumnoFAQs: FAQItem[] = [
  {
    question: "¿Qué necesito para registrar mi matrícula en Joby?",
    answer: "Debes estar inscrito oficialmente en la UT Chetumal, cursando el último cuatrimestre de tu programa educativo (TSU, Licenciatura o Ingeniería) y tener activo tu Seguro Social Facultativo (IMSS). Si cumples con esto, podrás completar tu perfil e iniciar tu búsqueda."
  },
  {
    question: "¿Qué es la Carta de Aceptación y cómo la obtengo?",
    answer: "Es el documento oficial emitido por la empresa receptora donde confirman que realizarás tu estadía con ellos. Al ser aceptado en una vacante a través de Joby, la plataforma genera de manera automática los formatos de vinculación pre-llenados para su firma."
  },
  {
    question: "¿Puedo postularme a más de una vacante a la vez?",
    answer: "Sí, puedes enviar tu postulación a diferentes vacantes afines a tu área de estudio. Sin embargo, en cuanto una empresa acepte formalmente tu postulación para iniciar estadía, el sistema pausará de forma automática tus otras solicitudes activas para asegurar la exclusividad del acuerdo."
  },
  {
    question: "¿Las estadías profesionales son remuneradas?",
    answer: "El esquema de apoyo económico depende enteramente de la empresa aliada. Muchas organizaciones ofrecen becas de transporte, ayuda de alimentación o apoyo económico mensual, detalles que podrás visualizar de forma transparente en la ficha de cada oferta publicada."
  }
];

const empresaFAQs: FAQItem[] = [
  {
    question: "¿Cómo valido el perfil fiscal de mi empresa en el portal?",
    answer: "Durante el registro inicial, deberás proporcionar la razón social, RFC y adjuntar tu Constancia de Situación Fiscal actualizada (no mayor a 3 meses). El departamento de Vinculación de la UT validará tu información en un lapso de 24 a 48 horas hábiles para habilitar tu cuenta."
  },
  {
    question: "¿Tiene algún costo publicar ofertas de prácticas en Joby?",
    answer: "No, la vinculación a través de Joby es 100% gratuita para todas las empresas. El único compromiso es proporcionar un proyecto formal de estadía que tenga valor educativo real para el desarrollo del estudiante."
  },
  {
    question: "¿Cómo funciona la firma del Convenio de Estadías?",
    answer: "Una vez que selecciones a un alumno, Joby genera de forma digital el borrador del pre-convenio de estadías. La universidad supervisa la viabilidad técnica y se procede con la firma formal (física o digital a través de los representantes legales)."
  },
  {
    question: "¿Cómo publico una vacante y selecciono candidatos?",
    answer: "Al ingresar a tu panel de control, tendrás acceso al módulo de vacantes donde podrás crear ofertas detallando el perfil técnico deseado. Recibirás postulaciones directas de alumnos aptos, visualizarás sus currículums académicos oficiales y podrás agendar entrevistas desde la misma plataforma."
  }
];

export default function PublicHelpCenter() {
  const [activePath, setActivePath] = useState<"alumno" | "empresa" | null>(null);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const handlePathChange = (path: "alumno" | "empresa") => {
    setActivePath(path);
    setOpenFAQIndex(null); // Reset open FAQ when switching path

    // Auto-scroll on mobile to the FAQs section
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTimeout(() => {
        faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const activeFAQs = activePath === "alumno" ? alumnoFAQs : empresaFAQs;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* 1. SECTOR DE CAMINOS (TARJETAS GRANDES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tarjeta Soy Alumno */}
        <button
          onClick={() => handlePathChange("alumno")}
          className={`flex flex-col items-center justify-between text-center p-8 rounded-3xl border-2 transition-all duration-300 group cursor-pointer ${
            activePath === "alumno"
              ? "bg-emerald-50/70 border-emerald-500 shadow-xl shadow-emerald-100 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-100"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activePath === "alumno"
                ? "bg-emerald-500 text-white scale-110 shadow-md shadow-emerald-200"
                : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105"
            }`}>
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Soy Estudiante</h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Busco liberar mi estadía profesional, encontrar empresas locales y postularme de forma rápida.
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold mt-6 px-4 py-2 rounded-full transition-all ${
            activePath === "alumno"
              ? "bg-emerald-500 text-white"
              : "bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700"
          }`}>
            Ver mis dudas frecuentes
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        {/* Tarjeta Soy Empresa */}
        <button
          onClick={() => handlePathChange("empresa")}
          className={`flex flex-col items-center justify-between text-center p-8 rounded-3xl border-2 transition-all duration-300 group cursor-pointer ${
            activePath === "empresa"
              ? "bg-indigo-50/70 border-indigo-500 shadow-xl shadow-indigo-100 ring-2 ring-indigo-500/20"
              : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-100"
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activePath === "empresa"
                ? "bg-indigo-500 text-white scale-110 shadow-md shadow-indigo-200"
                : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-105"
            }`}>
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Soy Empresa / Reclutador</h3>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Quiero registrar mi organización, publicar vacantes, firmar convenios y evaluar perfiles UT.
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold mt-6 px-4 py-2 rounded-full transition-all ${
            activePath === "empresa"
              ? "bg-indigo-500 text-white"
              : "bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700"
          }`}>
            Ver mis dudas frecuentes
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </div>

      {/* 2. AREA DE RENDERIZADO DINAMICO (ACORDEÓN + CTA) */}
      {activePath ? (
        <div ref={faqRef} className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8 pt-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              <BookOpen className="w-3.5 h-3.5" />
              Preguntas de {activePath === "alumno" ? "Estudiantes" : "Empresas"}
            </div>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
              Preguntas Frecuentes
            </h4>
          </div>

          {/* Acordeón de FAQs */}
          <div className="max-w-3xl mx-auto space-y-4">
            {activeFAQs.map((faq, index) => {
              const isOpen = openFAQIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? activePath === "alumno"
                        ? "border-emerald-200 shadow-md shadow-emerald-50/50"
                        : "border-indigo-200 shadow-md shadow-indigo-50/50"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex items-center justify-between font-bold text-slate-700 hover:text-slate-900 gap-4"
                  >
                    <span className="text-sm md:text-base leading-snug">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-slate-600" : ""
                    }`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen 
                      ? "max-h-96 opacity-100 border-t border-slate-50 bg-slate-50/40" 
                      : "max-h-0 opacity-0"
                  }`}>
                    <p className="p-6 text-sm text-slate-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action (CTA) al Finalizar la Selección */}
          <div className={`max-w-2xl mx-auto p-8 rounded-3xl border text-center space-y-6 shadow-sm ${
            activePath === "alumno"
              ? "bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-100/60"
              : "bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border-indigo-100/60"
          }`}>
            <div className="space-y-2">
              <h5 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
                <Sparkles className={`w-5 h-5 ${activePath === "alumno" ? "text-emerald-500" : "text-indigo-500"}`} />
                ¿Listo para comenzar?
              </h5>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                {activePath === "alumno"
                  ? "Registra tu cuenta estudiantil en menos de 5 minutos y empieza a postularte a las mejores empresas de la región."
                  : "Crea el perfil de tu empresa, publica tus plazas de estadía y encuentra al candidato ideal de forma rápida y gratuita."}
              </p>
            </div>
            
            <div>
              <Link 
                href={activePath === "alumno" ? "/registro" : "/registro?tipo=empresa"}
              >
                <Button className={`px-8 py-5 h-auto text-sm font-bold rounded-xl shadow-lg transition-all duration-300 ${
                  activePath === "alumno"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                }`}>
                  {activePath === "alumno" ? "Crear mi Cuenta de Alumno" : "Registrar mi Empresa"}
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Estado Vacío / Indicador inicial */
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50/60 rounded-[32px] border-2 border-dashed border-slate-200/60 text-center animate-pulse">
          <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
          <h4 className="text-base font-bold text-slate-700 mb-1">Selecciona tu perfil</h4>
          <p className="text-slate-400 text-xs max-w-xs">
            Haz clic en uno de los accesos de arriba para ver las preguntas frecuentes correspondientes.
          </p>
        </div>
      )}
    </div>
  );
}
