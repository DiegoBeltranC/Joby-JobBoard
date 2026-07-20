"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from 'next/dynamic';
import { Loader2, X, Save, Eye, EyeOff, Edit2, Sparkles, Send, RotateCcw } from "lucide-react";
import { getEstudianteCVDataAction, saveMagicCVAction } from "@/actions/cvGenerator";
import { PlantillaCV } from "@/lib/pdf/PlantillaCV";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { pdf } from '@react-pdf/renderer';
import { useScrollLock } from "@/hooks/useScrollLock";

const BlobProvider = dynamic(() => import('@react-pdf/renderer').then(mod => mod.BlobProvider), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-gray-100"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
});

interface MagicCVBuilderProps {
  onClose: () => void;
}

const COLORS = [
  { name: 'Teal Institucional', hex: '#0F766E' },
  { name: 'Azul Profundo', hex: '#1E3A8A' },
  { name: 'Gris Carbón', hex: '#374151' },
  { name: 'Violeta Royal', hex: '#5B21B6' },
  { name: 'Rojo Carmesí', hex: '#991B1B' }
];

const PLANTILLAS_CONFIG = [
  { id: '1', nombre: 'Moderno Clásico', desc: 'A 2 columnas, balance', base: 'moderno', variante: 'classic' },
  { id: '2', nombre: 'Moderno Compacto', desc: 'Espacios reducidos', base: 'moderno', variante: 'compact' },
  { id: '3', nombre: 'Moderno Invertido', desc: 'Columna derecha', base: 'moderno', variante: 'inverted' },
  { id: '4', nombre: 'Ejecutivo Estándar', desc: 'Estructura formal', base: 'ejecutivo', variante: 'classic' },
  { id: '5', nombre: 'Ejecutivo Limpio', desc: 'Sin líneas rígidas', base: 'ejecutivo', variante: 'clean' },
  { id: '6', nombre: 'Ejecutivo Espacioso', desc: 'Alto margen', base: 'ejecutivo', variante: 'spacious' },
  { id: '7', nombre: 'Min. Centrado', desc: 'Foto al centro', base: 'minimalista', variante: 'centered' },
  { id: '8', nombre: 'Min. Izquierda', desc: 'Alineación pura', base: 'minimalista', variante: 'left' },
  { id: '9', nombre: 'Min. Bloques', desc: 'Encabezado sólido', base: 'minimalista', variante: 'block' },
  { id: '10', nombre: 'Joby Star', desc: 'Diseño asimétrico', base: 'moderno', variante: 'creative' },
  { id: '11', nombre: 'Creativo Visual', desc: 'Tarjetas encuadradas', base: 'creativo', variante: 'cards' },
  { id: '12', nombre: 'Minimalista Centrado', desc: 'Sofisticado y espacioso', base: 'minimalista_centrado', variante: 'clean' },
  { id: '13', nombre: 'Tradicional Acad.', desc: 'Serif puro sin foto', base: 'tradicional', variante: 'serif' }
];

function checkPerfilVacio(est: any) {
  const hasBio = !!est.bio?.trim();
  const hasHabilidades = est.habilidades && est.habilidades.length > 0;
  const hasIdiomas = est.idiomas && est.idiomas.length > 0;
  const hasExperiencias = est.experiencias && est.experiencias.length > 0;
  const hasProyectos = est.proyectos && est.proyectos.length > 0;
  const hasEducacion = est.educacion_extra && est.educacion_extra.length > 0;

  return !hasBio && !hasHabilidades && !hasIdiomas && !hasExperiencias && !hasProyectos && !hasEducacion;
}

export default function MagicCVBuilder({ onClose }: MagicCVBuilderProps) {
  useScrollLock();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  
  const [accentColor, setAccentColor] = useState(COLORS[0].hex);
  const [showPhoto, setShowPhoto] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [sections, setSections] = useState([
    { id: 'bio', label: 'Perfil Profesional', visible: true },
    { id: 'habilidades', label: 'Habilidades (Keywords)', visible: true },
    { id: 'experiencias', label: 'Trayectoria Laboral', visible: true },
    { id: 'proyectos', label: 'Proyectos', visible: true },
    { id: 'educacion_extra', label: 'Formación Académica', visible: true }
  ]);

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [lineSpacing, setLineSpacing] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'Times-Roman' | 'Courier'>('Helvetica');
  const [singlePage, setSinglePage] = useState<boolean>(false);
  const [isProfileEmpty, setIsProfileEmpty] = useState(false);
  const [debouncedData, setDebouncedData] = useState<any>(null);
  const [showCarrera, setShowCarrera] = useState(true);
  const [hiddenExperiences, setHiddenExperiences] = useState<number[]>([]);
  const [hiddenProjects, setHiddenProjects] = useState<number[]>([]);
  const [hiddenEducations, setHiddenEducations] = useState<number[]>([]);

  // Estados del Asistente de IA
  const [showAssistant, setShowAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; propuestaCambio?: any; propuestaAplicada?: boolean }>>([
    { role: 'assistant', text: '¡Hola! Soy tu Asistente de Perfil Joby. Selecciona una sección arriba y pregúntame cómo mejorarla o corregirla. ¡Puedo sugerir cambios redactados y ayudarte a aplicarlos en un clic!' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [focusSection, setFocusSection] = useState<'bio' | 'habilidades' | 'experiencias' | 'proyectos'>('bio');
  const [backups, setBackups] = useState<Record<string, any>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, sendingChat]);

  useEffect(() => {
    if (!data) return;
    
    if (!debouncedData) {
      setDebouncedData(data);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedData(data);
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [data]);
  
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const res = await getEstudianteCVDataAction();
      if (res?.success) {
        if (checkPerfilVacio(res.data)) {
          setIsProfileEmpty(true);
          setLoading(false);
          return;
        }
        setData(res.data);
        if (res.data.draftConfig) {
            setAccentColor(res.data.draftConfig.colorAcento || COLORS[0].hex);
            setSelectedTemplate(res.data.draftConfig.templateId || '1');
            setShowPhoto(res.data.draftConfig.showPhoto ?? true);
            setFontSize(res.data.draftConfig.fontSize || 'md');
            setLineSpacing(res.data.draftConfig.lineSpacing || 'normal');
            setFontFamily(res.data.draftConfig.fontFamily || 'Helvetica');
            setSinglePage(res.data.draftConfig.singlePage ?? false);
            if (res.data.draftConfig.sections) {
                setSections(res.data.draftConfig.sections);
            }
            setShowCarrera(res.data.draftConfig.showCarrera ?? true);
            setHiddenExperiences(res.data.draftConfig.hiddenExperiences || []);
            setHiddenProjects(res.data.draftConfig.hiddenProjects || []);
            setHiddenEducations(res.data.draftConfig.hiddenEducations || []);
        }
      } else {
        toast.error("Error al cargar datos del estudiante");
        onClose();
      }
      setLoading(false);
    }
    loadData();
  }, [onClose]);

  const currentTemplateObj = PLANTILLAS_CONFIG.find(t => t.id === selectedTemplate) || PLANTILLAS_CONFIG[0];

  const documentoCV = useMemo(() => {
    if (!debouncedData) return null;
    const orderKey = sections.map(s => s.id + (s.visible ? '1' : '0')).join('-');
    return (
      <PlantillaCV 
        key={orderKey}
        data={debouncedData} 
        accentColor={accentColor} 
        showPhoto={showPhoto} 
        templateInfo={{ base: currentTemplateObj.base, variante: currentTemplateObj.variante, sections }} 
        styling={{ 
          fontSize, 
          lineSpacing, 
          fontFamily, 
          singlePage, 
          showCarrera,
          hiddenExperiences,
          hiddenProjects,
          hiddenEducations
        }}
      />
    );
  }, [debouncedData, accentColor, showPhoto, currentTemplateObj, sections, fontSize, lineSpacing, fontFamily, singlePage, showCarrera, hiddenExperiences, hiddenProjects, hiddenEducations]);

  const previewPanel = useMemo(() => {
    if (!debouncedData || !documentoCV) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm font-medium text-gray-500">Generando vista previa...</p>
          </div>
        </div>
      );
    }

    return (
      <BlobProvider document={documentoCV as any}>
        {({ url }) => {
          if (!url) {
            return (
              <div className="flex items-center justify-center h-full w-full bg-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <p className="text-sm font-medium text-gray-500">Preparando vista previa...</p>
                </div>
              </div>
            );
          }
          return (
            <iframe 
              key={url}
              src={url} 
              className="w-full h-full border-none bg-gray-50"
            />
          );
        }}
      </BlobProvider>
    );
  }, [debouncedData, documentoCV]);

  const moveSection = (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return;
      
      setSections(prev => {
          const newSections = [...prev];
          const temp = newSections[index];
          newSections[index] = newSections[newIndex];
          newSections[newIndex] = temp;
          return newSections;
      });
  };

  if (loading) {
    if (!mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          <p className="font-medium text-gray-700">Preparando tu Magic Builder...</p>
        </div>
      </div>,
      document.body
    );
  }

  if (isProfileEmpty) {
    if (!mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" stroke="#E11D48" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Tu perfil está muy vacío!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Para poder generar tu currículum, necesitas tener al menos uno de los siguientes apartados completos en tu perfil de Joby:
            </p>
            <div className="w-full text-left space-y-2 bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Biografía / Acerca de mí</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Habilidades clave</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Proyectos destacados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Formación académica adicional</span>
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/perfil/editar/paso-1");
                }}
                className="flex-1 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors text-sm shadow-md"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const handleSave = async () => {
    // Validar si el borrador está completamente vacío
    const hasBio = !!data.bio?.trim();
    const hasHabilidades = data.habilidades && data.habilidades.length > 0;
    const hasIdiomas = data.idiomas && data.idiomas.length > 0;
    const hasExperiencias = data.experiencias && data.experiencias.length > 0;
    const hasProyectos = data.proyectos && data.proyectos.length > 0;
    const hasEducacion = data.educacion_extra && data.educacion_extra.length > 0;

    if (!hasBio && !hasHabilidades && !hasIdiomas && !hasExperiencias && !hasProyectos && !hasEducacion) {
      toast.error("No puedes guardar un currículum vacío. Por favor, añade información a tu perfil primero (como biografía, habilidades o experiencia laboral).");
      return;
    }

    setSaving(true);
    const idToast = toast.loading("Sincronizando Joby y renderizando PDF...");

    try {
      const doc = <PlantillaCV 
        data={data} 
        accentColor={accentColor} 
        showPhoto={showPhoto} 
        templateInfo={{ base: currentTemplateObj.base, variante: currentTemplateObj.variante, sections }} 
        styling={{ 
          fontSize, 
          lineSpacing, 
          fontFamily, 
          singlePage, 
          showCarrera,
          hiddenExperiences,
          hiddenProjects,
          hiddenEducations
        }}
      />;
      const blob = await pdf(doc).toBlob();

      const formData = new FormData();
      formData.append("pdfBlob", blob, "magic-cv.pdf");
      
      // Enviamos también la data mutada y configuración de borrador
      formData.append("updatedData", JSON.stringify({ 
          bio: data.bio,
          carrera: data.carrera,
          experiencias: data.experiencias,
          proyectos: data.proyectos,
          educacion_extra: data.educacion_extra,
          habilidades: data.habilidades,
          idiomas: data.idiomas,
          draftConfig: {
              templateId: selectedTemplate,
              accentColor,
              showPhoto,
              sections,
              fontSize,
              lineSpacing,
              fontFamily,
              singlePage,
              showCarrera,
              hiddenExperiences,
              hiddenProjects,
              hiddenEducations
          }
      }));

      const res = await saveMagicCVAction(formData);

      if (res.error) {
        toast.error(res.error, { id: idToast });
      } else {
        toast.success("¡Documento guardado y sincronizado!", { id: idToast });
        router.refresh();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };



  const handleSendChatMessage = async () => {
    if (!userInput.trim() || sendingChat) return;

    const userMsg = userInput.trim();
    setUserInput('');
    
    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(updatedMessages);
    setSendingChat(true);

    let activeSectionData: any = null;
    let activeSectionName = '';

    if (focusSection === 'bio') {
      activeSectionData = { bio: data.bio };
      activeSectionName = 'Perfil Profesional (Biografía)';
    } else if (focusSection === 'habilidades') {
      activeSectionData = { habilidades: data.habilidades };
      activeSectionName = 'Habilidades clave';
    } else if (focusSection === 'experiencias') {
      activeSectionData = { experiencias: data.experiencias };
      activeSectionName = 'Trayectoria y Experiencia Laboral';
    } else if (focusSection === 'proyectos') {
      activeSectionData = { proyectos: data.proyectos };
      activeSectionName = 'Proyectos destacados';
    }

    try {
      const response = await fetch('/api/cv-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          activeSectionData,
          activeSectionName
        })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el asistente');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: result.data.mensaje,
          propuestaCambio: result.data.propuestaCambio
        }]);
      } else {
        throw new Error(result.error || 'Respuesta inválida');
      }
    } catch (err: any) {
      toast.error('Ocurrió un error al consultar al asistente');
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Lo siento, he tenido problemas para conectarme con el asistente. Por favor, intenta de nuevo.'
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  const guardarBackup = (key: string, value: any) => {
    setBackups(prev => ({ ...prev, [key]: value }));
  };

  const aplicarPropuesta = (propuesta: any, messageIndex: number) => {
    const { campo, targetIndex, subIndex, valor } = propuesta;

    setData((prev: any) => {
      if (!prev) return prev;
      const nuevoEstado = JSON.parse(JSON.stringify(prev));

      if (campo === 'bio') {
        guardarBackup(`bio_${messageIndex}`, prev.bio || '');
        nuevoEstado.bio = valor;
      } 
      else if (campo === 'habilidades') {
        if (!nuevoEstado.habilidades || targetIndex === undefined || targetIndex < 0 || targetIndex >= nuevoEstado.habilidades.length) {
          toast.error("Índice de habilidad inválido devuelto por la IA.");
          return prev;
        }
        guardarBackup(`habilidad_${targetIndex}_${messageIndex}`, prev.habilidades[targetIndex]);
        nuevoEstado.habilidades[targetIndex] = valor;
      }
      else if (campo === 'experiencia_logro') {
        if (targetIndex === undefined || subIndex === undefined) return prev;
        if (!nuevoEstado.experiencias?.[targetIndex]) {
          toast.error("Índice de experiencia inválido devuelto por la IA.");
          return prev;
        }
        if (!nuevoEstado.experiencias[targetIndex].logros || subIndex < 0 || subIndex >= nuevoEstado.experiencias[targetIndex].logros.length) {
          toast.error("Sub-índice de logro inválido devuelto por la IA.");
          return prev;
        }
        const valorOriginal = nuevoEstado.experiencias[targetIndex].logros[subIndex];
        guardarBackup(`exp_${targetIndex}_${subIndex}_${messageIndex}`, valorOriginal);
        nuevoEstado.experiencias[targetIndex].logros[subIndex] = valor;
      }
      else if (campo === 'proyecto_punto') {
        if (targetIndex === undefined || subIndex === undefined) return prev;
        if (!nuevoEstado.proyectos?.[targetIndex]) {
          toast.error("Índice de proyecto inválido devuelto por la IA.");
          return prev;
        }
        if (!nuevoEstado.proyectos[targetIndex].puntos_clave || subIndex < 0 || subIndex >= nuevoEstado.proyectos[targetIndex].puntos_clave.length) {
          toast.error("Sub-índice de punto clave inválido devuelto por la IA.");
          return prev;
        }
        const valorOriginal = nuevoEstado.proyectos[targetIndex].puntos_clave[subIndex];
        guardarBackup(`proj_${targetIndex}_${subIndex}_${messageIndex}`, valorOriginal);
        nuevoEstado.proyectos[targetIndex].puntos_clave[subIndex] = valor;
      }

      toast.success("¡Propuesta aplicada correctamente!");
      return nuevoEstado;
    });

    setChatMessages(prev => prev.map((msg, idx) => 
      idx === messageIndex ? { ...msg, propuestaAplicada: true } : msg
    ));
  };

  const deshacerPropuesta = (propuesta: any, messageIndex: number) => {
    const { campo, targetIndex, subIndex } = propuesta;

    setData((prev: any) => {
      if (!prev) return prev;
      const nuevoEstado = JSON.parse(JSON.stringify(prev));

      if (campo === 'bio') {
        const backupVal = backups[`bio_${messageIndex}`];
        if (backupVal !== undefined) nuevoEstado.bio = backupVal;
      } 
      else if (campo === 'habilidades') {
        const backupVal = backups[`habilidad_${targetIndex}_${messageIndex}`];
        if (backupVal !== undefined) nuevoEstado.habilidades[targetIndex] = backupVal;
      }
      else if (campo === 'experiencia_logro') {
        const backupVal = backups[`exp_${targetIndex}_${subIndex}_${messageIndex}`];
        if (backupVal !== undefined) nuevoEstado.experiencias[targetIndex].logros[subIndex] = backupVal;
      }
      else if (campo === 'proyecto_punto') {
        const backupVal = backups[`proj_${targetIndex}_${subIndex}_${messageIndex}`];
        if (backupVal !== undefined) nuevoEstado.proyectos[targetIndex].puntos_clave[subIndex] = backupVal;
      }

      toast.success("Cambio revertido con éxito.");
      return nuevoEstado;
    });

    setChatMessages(prev => prev.map((msg, idx) => 
      idx === messageIndex ? { ...msg, propuestaAplicada: false } : msg
    ));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleExperienciaChange = (index: number, field: string, value: string) => {
    setData((prev: any) => {
        const newExps = [...prev.experiencias];
        newExps[index] = { ...newExps[index], [field]: value };
        return { ...prev, experiencias: newExps };
    });
  };

  const handleLogroChange = (expIndex: number, logroIndex: number, value: string) => {
    setData((prev: any) => {
        const newExps = [...prev.experiencias];
        const newLogros = [...newExps[expIndex].logros];
        newLogros[logroIndex] = value;
        newExps[expIndex] = { ...newExps[expIndex], logros: newLogros };
        return { ...prev, experiencias: newExps };
    });
  };

  const handleProyectoChange = (index: number, field: string, value: string) => {
    setData((prev: any) => {
        const newProjs = [...prev.proyectos];
        newProjs[index] = { ...newProjs[index], [field]: value };
        return { ...prev, proyectos: newProjs };
    });
  };

  const handleProyectoPuntoChange = (projIndex: number, puntoIndex: number, value: string) => {
    setData((prev: any) => {
        const newProjs = [...prev.proyectos];
        const newPuntos = [...newProjs[projIndex].puntos_clave];
        newPuntos[puntoIndex] = value;
        newProjs[projIndex] = { ...newProjs[projIndex], puntos_clave: newPuntos };
        return { ...prev, proyectos: newProjs };
    });
  };

  const handleEducacionChange = (index: number, field: string, value: any) => {
    setData((prev: any) => {
        const newEdus = [...prev.educacion_extra];
        newEdus[index] = { ...newEdus[index], [field]: value };
        return { ...prev, educacion_extra: newEdus };
    });
  };

  const toggleItemVisibility = (section: 'experiencias' | 'proyectos' | 'educacion', id: number) => {
    if (section === 'experiencias') {
      setHiddenExperiences(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else if (section === 'proyectos') {
      setHiddenProjects(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else if (section === 'educacion') {
      setHiddenEducations(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    e.dataTransfer.setData("draggedIndex", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedIndexStr = e.dataTransfer.getData("draggedIndex");
    if (!draggedIndexStr) return;
    const draggedIndex = parseInt(draggedIndexStr, 10);
    if (draggedIndex === dropIndex) return;

    setSections(prev => {
      const newSections = [...prev];
      if (draggedIndex < 0 || draggedIndex >= newSections.length || dropIndex < 0 || dropIndex >= newSections.length) {
        return prev;
      }
      const [draggedItem] = newSections.splice(draggedIndex, 1);
      newSections.splice(dropIndex, 0, draggedItem);
      return newSections;
    });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necesario para permitir onDrop nativamente
      e.stopPropagation();
  };

  const toggleSection = (id: string) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[1400px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <span className="text-teal-600">✨</span> Motor Joby Resume Builder
            </h2>
            <p className="text-xs text-gray-500">Diseña, Sincroniza y Genera en un solo lugar.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAssistant(!showAssistant)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${showAssistant ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 border-dashed'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAssistant ? "Cerrar Consejos" : "Consultar Asistente"}
            </button>
            <button 
                onClick={onClose}
                disabled={saving}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex xl:hidden bg-gray-50 border-b border-gray-200">
           <button onClick={() => setActiveTab('edit')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'edit' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Edit2 className="w-4 h-4" /> Configuración General
           </button>
           <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Eye className="w-4 h-4" /> Live Preview
           </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Panel Izquierdo: Editor Profundo */}
          <div className={`w-full xl:w-[500px] 2xl:w-[600px] bg-gray-50 border-r border-gray-200 flex flex-col ${activeTab !== 'edit' && 'hidden xl:flex'}`}>
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8">
                
                {/* 1. Selector de Plantillas (GRID) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Librería de Plantillas</h3>
                       <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">13 Diseños</span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {PLANTILLAS_CONFIG.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={`text-left p-2.5 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-teal-600 bg-teal-50 shadow-sm ring-1 ring-teal-600' : 'border-gray-200 hover:border-teal-300 hover:bg-white bg-white'}`}
                            >
                                <p className={`text-xs font-bold truncate ${selectedTemplate === t.id ? 'text-teal-800' : 'text-gray-700'}`}>{t.nombre}</p>
                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 2. Color y Foto */}
                <section>
                    <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Ajustes Visuales</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <label className="text-xs font-bold text-gray-700 block mb-2">Color de Acento</label>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map(c => (
                                    <button 
                                        key={c.hex}
                                        onClick={() => setAccentColor(c.hex)}
                                        className={`w-7 h-7 rounded-full border-2 transition-transform ${accentColor === c.hex ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                                <div>
                                    <p className="text-xs font-bold text-gray-800">Avatar PDF</p>
                                    <p className="text-[9px] text-gray-500">¿Inyectar foto?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={showPhoto} onChange={(e) => setShowPhoto(e.target.checked)} />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between bg-teal-50/30 p-2.5 rounded-xl border border-teal-200/80 shadow-sm">
                                <div>
                                    <p className="text-xs font-bold text-teal-900 flex items-center gap-1">✨ Ajustar a 1 hoja</p>
                                    <p className="text-[9px] text-teal-600">Compacta márgenes y fuentes</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={singlePage} onChange={(e) => setSinglePage(e.target.checked)} />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <label className="text-xs font-bold text-gray-700 block mb-2">Tipografía</label>
                            <select 
                                value={fontFamily} 
                                onChange={(e) => setFontFamily(e.target.value as any)}
                                className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700"
                            >
                                <option value="Helvetica">Sans-serif (Helvetica)</option>
                                <option value="Times-Roman">Serif (Times)</option>
                                <option value="Courier">Monospace (Courier)</option>
                            </select>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <label className="text-xs font-bold text-gray-700 block mb-2">Tamaño de Fuente</label>
                            <select 
                                value={fontSize} 
                                disabled={singlePage}
                                onChange={(e) => setFontSize(e.target.value as any)}
                                className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700 disabled:opacity-50"
                            >
                                <option value="sm">Pequeño</option>
                                <option value="md">Mediano</option>
                                <option value="lg">Grande</option>
                            </select>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <label className="text-xs font-bold text-gray-700 block mb-2">Espaciado de Líneas</label>
                            <select 
                                value={lineSpacing} 
                                disabled={singlePage}
                                onChange={(e) => setLineSpacing(e.target.value as any)}
                                className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 font-medium text-gray-700 disabled:opacity-50"
                            >
                                <option value="compact">Compacto</option>
                                <option value="normal">Normal</option>
                                <option value="spacious">Espacioso</option>
                            </select>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 3. Estructura Dinámica (Drag And Drop HTML5) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Estructura del PDF</h3>
                        <span className="text-[10px] text-gray-500">(Arrastra para reordenar)</span>
                    </div>
                    
                    <div className="space-y-2">
                        {sections.map((sec, index) => (
                             <div 
                                key={sec.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:bg-gray-50 hover:border-teal-300 transition-colors"
                             >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="text-gray-400 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                    </div>
                                    
                                    {/* Botones de Control de Movimiento Arriba/Abajo */}
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => moveSection(index, 'up')}
                                            disabled={index === 0}
                                            className="p-0.5 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                            title="Subir sección"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => moveSection(index, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="p-0.5 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
                                            title="Bajar sección"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </button>
                                    </div>

                                    <span className={`text-sm font-semibold truncate ${sec.visible ? 'text-gray-700' : 'text-gray-400 line-through'}`}>{sec.label}</span>
                                </div>
                                <button 
                                    onClick={() => toggleSection(sec.id)}
                                    className={`text-xs px-2 py-1 rounded w-16 text-center font-bold transition-colors ${sec.visible ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {sec.visible ? 'ON' : 'OFF'}
                                </button>
                             </div>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* 4. Base Sync Data */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Datos Básicos</h3>
                        <span className="text-[10px] bg-teal-100/50 text-teal-700 px-2 py-0.5 rounded flex items-center font-bold">🔁 Sincroniza con Perfil</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-gray-700 block">Título de Carrera / Cargo</label>
                                <button
                                    type="button"
                                    onClick={() => setShowCarrera(!showCarrera)}
                                    className={`text-xs px-2 py-0.5 rounded font-bold transition-colors ${showCarrera ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}
                                    title="Alternar visibilidad del título de carrera en el PDF"
                                >
                                    {showCarrera ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <input 
                                name="carrera"
                                value={data.carrera} 
                                disabled
                                className="w-full text-sm p-2 bg-gray-100 rounded-md border border-gray-200 text-gray-500 cursor-not-allowed outline-none font-medium" 
                            />
                            <p className="text-[9px] text-gray-400 mt-1">Este dato es oficial y no es editable. Usa el botón ON/OFF para ocultarlo o mostrarlo en el PDF.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <label className="text-xs font-bold text-gray-700 block mb-1">Extracto / Perfil (Bio)</label>
                            <textarea 
                                name="bio"
                                value={data.bio} 
                                onChange={handleChange}
                                rows={4}
                                className="w-full text-sm p-2 bg-gray-50 rounded-md border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" 
                            />
                        </div>
                    </div>
                </section>

                {/* 4. Trayectoria */}
                <section>
                    <div className="flex items-center justify-between mb-4 mt-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Experiencia Laboral</h3>
                        <span className="text-[10px] text-gray-500">(Sobreescritura interactiva)</span>
                    </div>

                    {data.experiencias?.length === 0 ? (
                        <p className="text-xs text-gray-500 italic p-4 bg-gray-100 rounded-lg text-center">No hay experiencias laborales para este alumno. Añádelas desde el perfil general.</p>
                    ) : (
                        <div className="space-y-4">
                            {data.experiencias?.map((exp: any, i: number) => (
                                <div key={exp.id} className={`bg-white border text-left border-gray-200 p-4 rounded-xl relative hover:border-teal-300 transition-colors ${hiddenExperiences.includes(exp.id) ? 'opacity-60 bg-gray-50 border-dashed' : ''}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-gray-400"># {i + 1} {hiddenExperiences.includes(exp.id) && <span className="ml-2 text-red-500 font-bold uppercase text-[9px]">(Oculto en PDF)</span>}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleItemVisibility('experiencias', exp.id)}
                                            className={`p-1 rounded transition-colors ${hiddenExperiences.includes(exp.id) ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                                            title={hiddenExperiences.includes(exp.id) ? "Mostrar en el PDF" : "Ocultar en el PDF"}
                                        >
                                            {hiddenExperiences.includes(exp.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="mb-3 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Puesto</label>
                                            <input 
                                                value={exp.puesto}
                                                onChange={(e) => handleExperienciaChange(i, 'puesto', e.target.value)}
                                                className="w-full text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-teal-500 bg-transparent font-medium text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Empresa</label>
                                            <input 
                                                value={exp.empresa}
                                                onChange={(e) => handleExperienciaChange(i, 'empresa', e.target.value)}
                                                className="w-full text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-teal-500 bg-transparent text-gray-700"
                                            />
                                        </div>
                                    </div>
                                    
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-2 block">Viñetas / Logros</label>
                                    <div className="space-y-2 mt-1">
                                        {(exp.logros || []).map((logro: string, idx: number) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <span className="text-gray-400 mt-1">•</span>
                                                <textarea 
                                                    value={logro}
                                                    onChange={(e) => handleLogroChange(i, idx, e.target.value)}
                                                    rows={2}
                                                    className="flex-1 text-[11px] p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:bg-white focus:border-teal-300 resize-none leading-relaxed text-gray-600"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 5. Proyectos */}
                <section>
                    <div className="flex items-center justify-between mb-4 mt-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Proyectos Destacados</h3>
                        <span className="text-[10px] text-gray-500">(Sobreescritura interactiva)</span>
                    </div>

                    {!data.proyectos || data.proyectos.length === 0 ? (
                        <p className="text-xs text-gray-500 italic p-4 bg-gray-100 rounded-lg text-center">No hay proyectos para este alumno. Añádelas desde el perfil general.</p>
                    ) : (
                        <div className="space-y-4">
                            {data.proyectos?.map((proj: any, i: number) => (
                                <div key={proj.id} className={`bg-white border text-left border-gray-200 p-4 rounded-xl relative hover:border-teal-300 transition-colors ${hiddenProjects.includes(proj.id) ? 'opacity-60 bg-gray-50 border-dashed' : ''}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-gray-400"># {i + 1} {hiddenProjects.includes(proj.id) && <span className="ml-2 text-red-500 font-bold uppercase text-[9px]">(Oculto en PDF)</span>}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleItemVisibility('proyectos', proj.id)}
                                            className={`p-1 rounded transition-colors ${hiddenProjects.includes(proj.id) ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                                            title={hiddenProjects.includes(proj.id) ? "Mostrar en el PDF" : "Ocultar en el PDF"}
                                        >
                                            {hiddenProjects.includes(proj.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nombre del Proyecto</label>
                                        <input 
                                            value={proj.nombre}
                                            onChange={(e) => handleProyectoChange(i, 'nombre', e.target.value)}
                                            className="w-full text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-teal-500 bg-transparent font-medium text-gray-800"
                                        />
                                    </div>
                                    
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-2 block">Puntos Clave / Logros</label>
                                    <div className="space-y-2 mt-1">
                                        {(proj.puntos_clave || []).map((punto: string, idx: number) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <span className="text-gray-400 mt-1">•</span>
                                                <textarea 
                                                    value={punto}
                                                    onChange={(e) => handleProyectoPuntoChange(i, idx, e.target.value)}
                                                    rows={2}
                                                    className="flex-1 text-[11px] p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:bg-white focus:border-teal-300 resize-none leading-relaxed text-gray-600"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 6. Formación Académica */}
                <section>
                    <div className="flex items-center justify-between mb-4 mt-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Formación Académica</h3>
                        <span className="text-[10px] text-gray-500">(Sobreescritura interactiva)</span>
                    </div>

                    {!data.educacion_extra || data.educacion_extra.length === 0 ? (
                        <p className="text-xs text-gray-500 italic p-4 bg-gray-100 rounded-lg text-center">No hay educación extra para este alumno. Añádelas desde el perfil general.</p>
                    ) : (
                        <div className="space-y-4">
                            {data.educacion_extra?.map((edu: any, i: number) => (
                                <div key={edu.id} className={`bg-white border text-left border-gray-200 p-4 rounded-xl relative hover:border-teal-300 transition-colors ${hiddenEducations.includes(edu.id) ? 'opacity-60 bg-gray-50 border-dashed' : ''}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-gray-400"># {i + 1} {hiddenEducations.includes(edu.id) && <span className="ml-2 text-red-500 font-bold uppercase text-[9px]">(Oculto en PDF)</span>}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleItemVisibility('educacion', edu.id)}
                                            className={`p-1 rounded transition-colors ${hiddenEducations.includes(edu.id) ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                                            title={hiddenEducations.includes(edu.id) ? "Mostrar en el PDF" : "Ocultar en el PDF"}
                                        >
                                            {hiddenEducations.includes(edu.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="mb-3 grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Título / Certificación</label>
                                            <input 
                                                value={edu.titulo}
                                                onChange={(e) => handleEducacionChange(i, 'titulo', e.target.value)}
                                                className="w-full text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-teal-500 bg-transparent font-medium text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Año</label>
                                            <input 
                                                type="number"
                                                value={edu.año || ''}
                                                onChange={(e) => handleEducacionChange(i, 'año', e.target.value)}
                                                className="w-full text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-teal-500 bg-transparent font-medium text-gray-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Institución</label>
                                        <input 
                                            value={edu.institucion}
                                            onChange={(e) => handleEducacionChange(i, 'institucion', e.target.value)}
                                            className="w-full text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-teal-500 bg-transparent text-gray-700"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <div className="pb-8"></div>
            </div>
            
            {/* Action Bar */}
            <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0 flex flex-col gap-3">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-75 text-sm"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  <span>{saving ? "Procesando DB y PDF..." : "Guardar Diseño y Sincronizar Datos"}</span>
                </button>
            </div>
          </div>

          {/* Panel Derecho: Preview Dinámico */}
          <div className={`flex-1 bg-gray-200 relative ${activeTab !== 'preview' && 'hidden xl:block'}`}>
             {previewPanel}
          </div>

          {/* Panel Asistente de IA (Drawer Deslizable) */}
          {showAssistant && (
             <div className="absolute right-0 top-0 bottom-0 w-full md:w-[380px] bg-white border-l border-gray-200 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-250">
                {/* Cabecera del Asistente */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-violet-50/50">
                   <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
                      <div>
                         <h3 className="text-sm font-bold text-gray-800">Asistente Joby IA</h3>
                         <p className="text-[9px] font-medium text-gray-500">Mejora tu currículum de forma interactiva</p>
                      </div>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setShowAssistant(false)}
                      className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded transition-colors"
                   >
                      <X className="w-4 h-4" />
                   </button>
                </div>

                {/* Enfoque de Sección */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
                   <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Sección de Enfoque:</span>
                   <select 
                      value={focusSection}
                      onChange={(e: any) => setFocusSection(e.target.value)}
                      className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-violet-500 outline-none text-gray-700 font-semibold"
                   >
                      <option value="bio">Perfil Profesional (Bio)</option>
                      <option value="habilidades">Habilidades Clave</option>
                      <option value="experiencias">Trayectoria Laboral</option>
                      {data.proyectos && data.proyectos.length > 0 && (
                         <option value="proyectos">Proyectos Destacados</option>
                      )}
                   </select>
                </div>

                {/* Historial de Chat */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                   {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                         <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium shadow-sm ${msg.role === 'user' ? 'bg-teal-750 text-white rounded-tr-none bg-teal-700' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                            <p className="whitespace-pre-line">{msg.text}</p>
                            
                            {/* Proponer Cambio de IA */}
                            {msg.propuestaCambio && (
                               <div className="mt-3 p-2.5 bg-violet-50 border border-violet-100 rounded-xl text-left">
                                  <p className="text-[9px] font-bold text-violet-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                                     <Sparkles className="w-3 h-3 text-violet-600 animate-pulse" />
                                     Cambio Sugerido:
                                  </p>
                                  <p className="text-[11px] text-gray-700 italic bg-white p-2 rounded-lg border border-violet-50 leading-relaxed font-medium">
                                     "{msg.propuestaCambio.valor}"
                                  </p>
                                  <div className="mt-2.5 flex gap-2">
                                     {msg.propuestaAplicada ? (
                                        <button
                                           type="button"
                                           onClick={() => deshacerPropuesta(msg.propuestaCambio, idx)}
                                           className="flex-1 py-1.5 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1"
                                        >
                                           <RotateCcw className="w-3 h-3" /> Revertir Cambio
                                        </button>
                                     ) : (
                                        <button
                                           type="button"
                                           onClick={() => aplicarPropuesta(msg.propuestaCambio, idx)}
                                           className="flex-1 py-1.5 px-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg text-[10px] transition-all shadow-sm flex items-center justify-center gap-1"
                                        >
                                           <Sparkles className="w-3 h-3 animate-pulse" /> Aplicar a mi CV
                                        </button>
                                     )}
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                   ))}
                   {sendingChat && (
                      <div className="flex items-start">
                         <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                            <span className="text-[11px] font-medium text-gray-500">Analizando y redactando consejos...</span>
                         </div>
                      </div>
                   )}
                   <div ref={chatEndRef} />
                </div>

                {/* Input de Chat */}
                <form 
                   onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }} 
                   className="p-3 border-t border-gray-200 bg-white shrink-0"
                >
                   <div className="flex gap-2">
                      <input 
                         type="text" 
                         value={userInput}
                         onChange={(e) => setUserInput(e.target.value)}
                         placeholder="Ej: ¿Cómo mejoro mi extracto?"
                         disabled={sendingChat}
                         className="flex-1 text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 text-gray-800 font-medium disabled:opacity-50"
                      />
                      <button
                         type="submit"
                         disabled={sendingChat || !userInput.trim()}
                         className="p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
                      >
                         <Send className="w-4 h-4" />
                      </button>
                   </div>
                </form>
             </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
