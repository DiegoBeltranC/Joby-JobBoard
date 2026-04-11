"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Loader2, X, Save, Eye, Edit2 } from "lucide-react";
import { getEstudianteCVDataAction, saveMagicCVAction } from "@/actions/cvGenerator";
import { PlantillaCV } from "@/lib/pdf/PlantillaCV";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { pdf } from '@react-pdf/renderer';

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
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

export default function MagicCVBuilder({ onClose }: MagicCVBuilderProps) {
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
  
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const res = await getEstudianteCVDataAction();
      if (res?.success) {
        setData(res.data);
        if (res.data.draftConfig) {
            setAccentColor(res.data.draftConfig.colorAcento || COLORS[0].hex);
            setSelectedTemplate(res.data.draftConfig.templateId || '1');
            setShowPhoto(res.data.draftConfig.showPhoto ?? true);
            if (res.data.draftConfig.sections) {
                setSections(res.data.draftConfig.sections);
            }
        }
      } else {
        toast.error("Error al cargar datos del estudiante");
        onClose();
      }
      setLoading(false);
    }
    loadData();
  }, [onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          <p className="font-medium text-gray-700">Preparando tu Magic Builder...</p>
        </div>
      </div>
    );
  }

  const currentTemplateObj = PLANTILLAS_CONFIG.find(t => t.id === selectedTemplate) || PLANTILLAS_CONFIG[0];

  const handleSave = async () => {
    setSaving(true);
    const idToast = toast.loading("Sincronizando Joby y renderizando PDF...");

    try {
      const doc = <PlantillaCV data={data} accentColor={accentColor} showPhoto={showPhoto} templateInfo={{ base: currentTemplateObj.base, variante: currentTemplateObj.variante, sections }} />;
      const blob = await pdf(doc).toBlob();

      const formData = new FormData();
      formData.append("pdfBlob", blob, "magic-cv.pdf");
      
      // Enviamos también la data mutada (experiencias y bio) y configuración de borrador
      formData.append("updatedData", JSON.stringify({ 
          bio: data.bio,
          carrera: data.carrera,
          experiencias: data.experiencias,
          draftConfig: {
              templateId: selectedTemplate,
              accentColor,
              showPhoto,
              sections
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
    } catch (e) {
      toast.error("Ocurrió un error general de guardado", { id: idToast });
    } finally {
      setSaving(false);
    }
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const draggedIndexStr = e.dataTransfer.getData("draggedIndex");
    if (!draggedIndexStr) return;
    const draggedIndex = parseInt(draggedIndexStr, 10);
    if (draggedIndex === dropIndex) return;

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);
    setSections(newSections);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necesario para permitir onDrop nativamente
  };

  const toggleSection = (id: string) => {
      setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  return (
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
        <div className="flex-1 flex overflow-hidden">
          
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

                        <div className="flex-1 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Avatar PDF</p>
                                <p className="text-[10px] text-gray-500">¿Inyectar foto?</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={showPhoto} onChange={(e) => setShowPhoto(e.target.checked)} />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
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
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                    </div>
                                    <span className={`text-sm font-semibold ${sec.visible ? 'text-gray-700' : 'text-gray-400 line-through'}`}>{sec.label}</span>
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
                            <label className="text-xs font-bold text-gray-700 block mb-1">Título de Carrera / Cargo</label>
                            <input 
                                name="carrera"
                                value={data.carrera} 
                                onChange={handleChange}
                                className="w-full text-sm p-2 bg-gray-50 rounded-md border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors" 
                            />
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
                                <div key={exp.id} className="bg-white border text-left border-gray-200 p-4 rounded-xl relative hover:border-teal-300 transition-colors">
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
                <div className="pb-8"></div>
            </div>
            
            {/* Action Bar */}
            <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-75"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  <span>{saving ? "Procesando DB y PDF..." : "Guardar Diseño y Sincronizar Datos"}</span>
                </button>
            </div>
          </div>

          {/* Panel Derecho: Preview Dinámico */}
          <div className={`flex-1 bg-gray-200 relative ${activeTab !== 'preview' && 'hidden xl:block'}`}>
             <PDFViewer width="100%" height="100%" className="border-none bg-gray-50">
                 <PlantillaCV data={data} accentColor={accentColor} showPhoto={showPhoto} templateInfo={{ base: currentTemplateObj.base, variante: currentTemplateObj.variante, sections }} />
             </PDFViewer>
          </div>

        </div>
      </div>
    </div>
  );
}
