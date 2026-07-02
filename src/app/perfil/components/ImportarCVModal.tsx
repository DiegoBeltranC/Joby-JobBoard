"use client";

import React, { useState, useRef } from "react";
import { 
  X, Sparkles, UploadCloud, Loader2, Plus, Trash2, 
  Calendar, Briefcase, CheckCircle2, ChevronRight, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Experiencia {
  empresa: string;
  puesto: string;
  logros: string[];
  fechaInicio: string;
  fechaFin: string;
  esActual?: boolean;
}

interface Educacion {
  titulo: string;
  institucion: string;
  año: number | null;
}

interface CVData {
  resumen: string;
  habilidades: string[];
  idiomas: string[];
  experiencias: Experiencia[];
  educacion: Educacion[];
}

interface ImportarCVModalProps {
  onClose: () => void;
}

type Step = "UPLOAD" | "PROCESSING" | "PREVIEW" | "SUCCESS";

export default function ImportarCVModal({ onClose }: ImportarCVModalProps) {
  useScrollLock();
  const [step, setStep] = useState<Step>("UPLOAD");
  const [isDragging, setIsDragging] = useState(false);
  const [progressMsg, setProgressMsg] = useState("Iniciando análisis...");
  const [cvData, setCvData] = useState<CVData>({
    resumen: "",
    habilidades: [],
    idiomas: [],
    experiencias: [],
    educacion: []
  });
  const [newHabilidad, setNewHabilidad] = useState("");
  const [newIdioma, setNewIdioma] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cambiar mensajes del loader progresivamente para mejorar UX
  const startLoadingMessages = () => {
    const messages = [
      "Subiendo documento de forma segura...",
      "Extrayendo texto del archivo...",
      "Procesando y organizando la información...",
      "Analizando secciones y estructura del currículum...",
      "Identificando tu experiencia laboral...",
      "Estructurando habilidades e idiomas...",
      "Generando vista previa interactiva..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length - 1) {
        setProgressMsg(messages[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1200);
    return interval;
  };

  const uploadFile = async (file: File) => {
    // Validaciones
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato no soportado. Sube un PDF o una imagen (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("El archivo no debe pesar más de 3MB.");
      return;
    }

    setStep("PROCESSING");
    const intervalId = startLoadingMessages();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv-upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(intervalId);

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "PAYWALL_LIMIT") {
          toast.error("Límite de créditos alcanzado");
          setStep("UPLOAD");
          // Notificar paywall
          alert(result.message);
          onClose();
          return;
        }
        throw new Error(result.message || "Error procesando archivo");
      }

      // Estructurar el resultado inicial asegurando compatibilidad
      const rawData = result.data as CVData;
      const formattedData: CVData = {
        resumen: rawData.resumen || "",
        habilidades: Array.isArray(rawData.habilidades) ? rawData.habilidades : [],
        idiomas: Array.isArray(rawData.idiomas) ? rawData.idiomas : [],
        experiencias: (Array.isArray(rawData.experiencias) ? rawData.experiencias : []).map(exp => ({
          empresa: exp.empresa || "",
          puesto: exp.puesto || "",
          logros: Array.isArray(exp.logros) ? exp.logros : [],
          fechaInicio: exp.fechaInicio || "",
          fechaFin: exp.fechaFin || "",
          esActual: !exp.fechaFin
        })),
        educacion: (Array.isArray(rawData.educacion) ? rawData.educacion : []).map(edu => ({
          titulo: edu.titulo || "",
          institucion: edu.institucion || "",
          año: edu.año ? Number(edu.año) : null
        }))
      };

      setCvData(formattedData);
      setStep("PREVIEW");
      toast.success("Currículum analizado con éxito.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Ocurrió un error al procesar el archivo.");
      setStep("UPLOAD");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  // Manejo de edición de datos en la vista previa
  const updateResumen = (val: string) => {
    setCvData(prev => ({ ...prev, resumen: val }));
  };

  // Habilidades tags
  const addHabilidad = () => {
    if (!newHabilidad.trim()) return;
    if (cvData.habilidades.includes(newHabilidad.trim())) {
      toast.warning("Esta habilidad ya existe.");
      return;
    }
    setCvData(prev => ({
      ...prev,
      habilidades: [...prev.habilidades, newHabilidad.trim()]
    }));
    setNewHabilidad("");
  };

  const removeHabilidad = (index: number) => {
    setCvData(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, idx) => idx !== index)
    }));
  };

  // Idiomas tags
  const addIdioma = () => {
    if (!newIdioma.trim()) return;
    if (cvData.idiomas.includes(newIdioma.trim())) {
      toast.warning("Este idioma ya existe.");
      return;
    }
    setCvData(prev => ({
      ...prev,
      idiomas: [...prev.idiomas, newIdioma.trim()]
    }));
    setNewIdioma("");
  };

  const removeIdioma = (index: number) => {
    setCvData(prev => ({
      ...prev,
      idiomas: prev.idiomas.filter((_, idx) => idx !== index)
    }));
  };

  // Experiencia edición
  const updateExperienciaField = (index: number, field: keyof Experiencia, value: any) => {
    setCvData(prev => {
      const exps = [...prev.experiencias];
      exps[index] = { ...exps[index], [field]: value };
      
      // Si se marca esActual, la fechaFin debe limpiarse
      if (field === "esActual" && value === true) {
        exps[index].fechaFin = "";
      }
      return { ...prev, experiencias: exps };
    });
  };

  const addExperienciaManual = () => {
    const nuevaExp: Experiencia = {
      empresa: "Nueva Empresa",
      puesto: "Nuevo Puesto",
      logros: [],
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
      esActual: true
    };
    setCvData(prev => ({
      ...prev,
      experiencias: [nuevaExp, ...prev.experiencias]
    }));
  };

  const removeExperiencia = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experiencias: prev.experiencias.filter((_, idx) => idx !== index)
    }));
  };

  // Logros viñetas
  const updateLogro = (expIndex: number, logroIndex: number, value: string) => {
    setCvData(prev => {
      const exps = [...prev.experiencias];
      const logros = [...exps[expIndex].logros];
      logros[logroIndex] = value;
      exps[expIndex] = { ...exps[expIndex], logros };
      return { ...prev, experiencias: exps };
    });
  };

  const addLogro = (expIndex: number) => {
    setCvData(prev => {
      const exps = [...prev.experiencias];
      exps[expIndex] = { 
        ...exps[expIndex], 
        logros: [...exps[expIndex].logros, "Nueva tarea o logro relevante"] 
      };
      return { ...prev, experiencias: exps };
    });
  };

  const removeLogro = (expIndex: number, logroIndex: number) => {
    setCvData(prev => {
      const exps = [...prev.experiencias];
      exps[expIndex] = {
        ...exps[expIndex],
        logros: exps[expIndex].logros.filter((_, lIdx) => lIdx !== logroIndex)
      };
      return { ...prev, experiencias: exps };
    });
  };
  
  // Educación edición
  const updateEducacionField = (index: number, field: keyof Educacion, value: any) => {
    setCvData(prev => {
      const edus = [...(prev.educacion || [])];
      edus[index] = { ...edus[index], [field]: value };
      return { ...prev, educacion: edus };
    });
  };

  const addEducacionManual = () => {
    const nuevaEdu: Educacion = {
      titulo: "Nueva Carrera o Certificación",
      institucion: "Nueva Institución",
      año: new Date().getFullYear()
    };
    setCvData(prev => ({
      ...prev,
      educacion: [...(prev.educacion || []), nuevaEdu]
    }));
  };

  const removeEducacion = (index: number) => {
    setCvData(prev => ({
      ...prev,
      educacion: (prev.educacion || []).filter((_, idx) => idx !== index)
    }));
  };

  // Enviar a guardar en Base de Datos
  const handleSave = async () => {
    // Validar datos mínimos
    if (!cvData.resumen.trim()) {
      toast.error("El resumen profesional no puede estar vacío");
      return;
    }

    const expsIncompletas = cvData.experiencias.some(exp => !exp.empresa.trim() || !exp.puesto.trim() || !exp.fechaInicio);
    if (expsIncompletas) {
      toast.error("Por favor completa los campos obligatorios de todas las experiencias (Empresa, Puesto y Fecha de Inicio).");
      return;
    }

    const edusIncompletas = (cvData.educacion || []).some(edu => !edu.titulo.trim() || !edu.institucion.trim());
    if (edusIncompletas) {
      toast.error("Por favor completa los campos obligatorios de todas las educaciones (Título e Institución).");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/perfil/importar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumen: cvData.resumen,
          habilidades: cvData.habilidades,
          idiomas: cvData.idiomas,
          experiencias: cvData.experiencias.map(exp => ({
            empresa: exp.empresa,
            puesto: exp.puesto,
            logros: exp.logros,
            fechaInicio: exp.fechaInicio,
            fechaFin: exp.esActual ? null : exp.fechaFin
          })),
          educacion: (cvData.educacion || []).map(edu => ({
            titulo: edu.titulo,
            institucion: edu.institucion,
            año: edu.año ? Number(edu.año) : null
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al actualizar perfil");
      }

      setStep("SUCCESS");
      toast.success("¡Tu perfil ha sido actualizado!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Ocurrió un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = () => {
    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-6 text-white flex justify-between items-center relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Importador y Extractor de CV</h2>
              <p className="text-xs text-teal-100">Carga tu currículum para rellenar tu perfil automáticamente</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={step === "PROCESSING" || isSaving}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          
          {/* STEP 1: UPLOAD */}
          {step === "UPLOAD" && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">¡Atención!</span> La importación reemplazará tus experiencias laborales, habilidades e idiomas actuales en tu perfil por la información extraída de tu documento. Podrás editarla antes de confirmar el guardado.
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
              />

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] ${
                  isDragging 
                    ? "border-teal-500 bg-teal-50/50" 
                    : "border-gray-300 bg-white hover:border-teal-400 hover:bg-gray-50"
                }`}
              >
                <div className={`p-5 rounded-2xl mb-4 transition-colors ${
                  isDragging ? "bg-teal-100 text-teal-700" : "bg-teal-50 text-teal-600"
                }`}>
                  <UploadCloud className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Carga tu Currículum</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-4">
                  Arrastra tu archivo PDF o imagen (PNG, JPG, WEBP) o haz clic para buscar en tu dispositivo.
                </p>
                <span className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
                  Seleccionar Archivo
                </span>
                <span className="text-[11px] text-gray-400 mt-3">Tamaño máximo recomendado: 3MB</span>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === "PROCESSING" && (
            <div className="flex flex-col items-center justify-center p-12 space-y-6 min-h-[350px]">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-emerald-500 absolute animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-gray-800 animate-pulse">Analizando tu Currículum...</h3>
                <p className="text-sm text-gray-500 max-w-md">{progressMsg}</p>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & EDIT */}
          {step === "PREVIEW" && (
            <div className="space-y-8">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-xs flex gap-3 items-center">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Se han extraído los siguientes datos. Revisa la información y edita o agrega detalles en los campos si es necesario.</span>
              </div>

              {/* SECCIÓN: BIO/RESUMEN */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <label className="block text-sm font-bold text-gray-800">Acerca de Mí (Resumen Profesional)</label>
                <textarea 
                  value={cvData.resumen}
                  onChange={(e) => updateResumen(e.target.value)}
                  placeholder="Escribe un breve resumen de tu trayectoria..."
                  rows={4}
                  className="w-full border border-gray-200 focus:border-teal-500 rounded-xl p-3 text-sm focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none text-gray-700"
                />
                <span className="text-[10px] text-gray-400 block text-right">
                  {cvData.resumen.length}/400 caracteres recomendados.
                </span>
              </div>

              {/* SECCIÓN: HABILIDADES */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <label className="block text-sm font-bold text-gray-800">Habilidades Técnicas y Blandas</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newHabilidad}
                    onChange={(e) => setNewHabilidad(e.target.value)}
                    placeholder="Agregar habilidad (ej. React, Excel, Liderazgo)"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHabilidad())}
                    className="flex-1 border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={addHabilidad}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {cvData.habilidades.length > 0 ? (
                    cvData.habilidades.map((hab, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                        {hab}
                        <button 
                          type="button" 
                          onClick={() => removeHabilidad(idx)}
                          className="hover:bg-teal-100 text-teal-600 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Sin habilidades agregadas.</span>
                  )}
                </div>
              </div>

              {/* SECCIÓN: IDIOMAS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <label className="block text-sm font-bold text-gray-800">Idiomas</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newIdioma}
                    onChange={(e) => setNewIdioma(e.target.value)}
                    placeholder="Agregar idioma (ej. Inglés - B2, Alemán - Básico)"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIdioma())}
                    className="flex-1 border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={addIdioma}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {cvData.idiomas.length > 0 ? (
                    cvData.idiomas.map((idioma, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {idioma}
                        <button 
                          type="button" 
                          onClick={() => removeIdioma(idx)}
                          className="hover:bg-blue-100 text-blue-600 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Sin idiomas agregados.</span>
                  )}
                </div>
              </div>

              {/* SECCIÓN: EXPERIENCIAS LABORALES */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-800">Experiencias Laborales Extraídas</label>
                  <button 
                    type="button"
                    onClick={addExperienciaManual}
                    className="text-xs flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Experiencia
                  </button>
                </div>

                {cvData.experiencias.length > 0 ? (
                  cvData.experiencias.map((exp, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group space-y-4">
                      {/* Botón Eliminar Experiencia */}
                      <button 
                        type="button"
                        onClick={() => removeExperiencia(idx)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Eliminar Experiencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2">
                        <Briefcase className="w-4 h-4 text-teal-600" />
                        <span className="text-xs uppercase tracking-wider">Puesto #{idx + 1}</span>
                      </div>

                      {/* Inputs Principales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Empresa <span className="text-rose-500">*</span></label>
                          <input 
                            type="text" 
                            value={exp.empresa}
                            onChange={(e) => updateExperienciaField(idx, "empresa", e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all text-gray-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Puesto <span className="text-rose-500">*</span></label>
                          <input 
                            type="text" 
                            value={exp.puesto}
                            onChange={(e) => updateExperienciaField(idx, "puesto", e.target.value)}
                            placeholder="Cargo ocupado"
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all text-gray-700"
                          />
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Fecha Inicio <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="date" 
                            value={exp.fechaInicio ? exp.fechaInicio.substring(0, 10) : ""}
                            onChange={(e) => updateExperienciaField(idx, "fechaInicio", e.target.value)}
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs outline-none transition-all text-gray-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Fecha Fin
                          </label>
                          <input 
                            type="date" 
                            disabled={exp.esActual}
                            value={exp.fechaFin && !exp.esActual ? exp.fechaFin.substring(0, 10) : ""}
                            onChange={(e) => updateExperienciaField(idx, "fechaFin", e.target.value)}
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs outline-none transition-all text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                            <input 
                              type="checkbox" 
                              checked={exp.esActual}
                              onChange={(e) => updateExperienciaField(idx, "esActual", e.target.checked)}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                            />
                            Trabajo Actual
                          </label>
                        </div>
                      </div>

                      {/* Viñetas / Logros */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Actividades y Logros</label>
                          <button 
                            type="button"
                            onClick={() => addLogro(idx)}
                            className="text-[10px] text-teal-600 hover:text-teal-700 font-bold"
                          >
                            + Agregar viñeta
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {exp.logros.map((logro, lIdx) => (
                            <div key={lIdx} className="flex gap-2 items-center">
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full shrink-0"></span>
                              <input 
                                type="text"
                                value={logro}
                                onChange={(e) => updateLogro(idx, lIdx, e.target.value)}
                                className="flex-1 border-b border-gray-200 focus:border-teal-500 py-1 text-xs outline-none transition-all text-gray-600"
                              />
                              <button 
                                type="button"
                                onClick={() => removeLogro(idx, lIdx)}
                                className="text-gray-400 hover:text-rose-500 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {exp.logros.length === 0 && (
                            <p className="text-[11px] text-gray-400 italic">No se han ingresado viñetas de logros. Es altamente recomendable añadirlas.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500 text-sm">
                    No se detectaron experiencias laborales en el currículum. Agrega experiencias manualmente con el botón superior.
                  </div>
                )}
              </div>

              {/* SECCIÓN: EDUCACIÓN */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-800">Educación y Certificaciones Extraídas</label>
                  <button 
                    type="button"
                    onClick={addEducacionManual}
                    className="text-xs flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-bold bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Educación
                  </button>
                </div>

                {cvData.educacion && cvData.educacion.length > 0 ? (
                  cvData.educacion.map((edu, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group space-y-4">
                      {/* Botón Eliminar Educación */}
                      <button 
                        type="button"
                        onClick={() => removeEducacion(idx)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Eliminar Educación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 text-teal-700 font-semibold mb-2">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                        <span className="text-xs uppercase tracking-wider">Educación #{idx + 1}</span>
                      </div>

                      {/* Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Título / Carrera / Curso / Certificación <span className="text-rose-500">*</span></label>
                          <input 
                            type="text" 
                            value={edu.titulo}
                            onChange={(e) => updateEducacionField(idx, "titulo", e.target.value)}
                            placeholder="Ej. TSU en Desarrollo de Software"
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all text-gray-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Año de obtención/finalización</label>
                          <input 
                            type="number" 
                            value={edu.año || ""}
                            onChange={(e) => updateEducacionField(idx, "año", e.target.value ? parseInt(e.target.value, 10) : null)}
                            placeholder="Ej. 2025"
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all text-gray-700"
                          />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Institución <span className="text-rose-500">*</span></label>
                          <input 
                            type="text" 
                            value={edu.institucion}
                            onChange={(e) => updateEducacionField(idx, "institucion", e.target.value)}
                            placeholder="Ej. Universidad Tecnológica de Chetumal"
                            className="w-full border border-gray-200 focus:border-teal-500 rounded-xl px-3 py-2 text-sm outline-none transition-all text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500 text-sm">
                    No se detectó formación adicional en el currículum. Agrega cursos o certificados manualmente con el botón superior.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "SUCCESS" && (
            <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center min-h-[350px]">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">¡Perfil Importado con Éxito!</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Los datos de tu currículum se han guardado e integrado en tu perfil profesional de Joby. Las empresas ya pueden visualizar tu información actualizada.
                </p>
              </div>
              <button 
                onClick={handleFinalize}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-md"
              >
                Volver a Mi Perfil <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        {step === "PREVIEW" && (
          <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end items-center shrink-0">
            <button 
              type="button" 
              onClick={() => setStep("UPLOAD")}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Atrás (Cargar otro)
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando Cambios...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Confirmar e Importar Perfil
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
