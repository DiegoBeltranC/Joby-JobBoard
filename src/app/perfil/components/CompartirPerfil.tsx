"use client";

import { useState, useEffect } from "react";
import { QrCode, Copy, Check, Download, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { updateOpcionesCompartir } from "@/actions/perfil";
import { toast } from "sonner";

interface CompartirPerfilProps {
    idEncriptado: string;
    publicoInicial: boolean;
    compartirExperienciaInicial: boolean;
    compartirProyectosInicial: boolean;
    compartirHabilidadesInicial: boolean;
    compartirIdiomasInicial: boolean;
    compartirEducacionInicial: boolean;
}

export default function CompartirPerfil({ 
    idEncriptado, 
    publicoInicial,
    compartirExperienciaInicial,
    compartirProyectosInicial,
    compartirHabilidadesInicial,
    compartirIdiomasInicial,
    compartirEducacionInicial
}: CompartirPerfilProps) {
    const [perfilPublico, setPerfilPublico] = useState(publicoInicial);
    const [compartirExperiencia, setCompartirExperiencia] = useState(compartirExperienciaInicial);
    const [compartirProyectos, setCompartirProyectos] = useState(compartirProyectosInicial);
    const [compartirHabilidades, setCompartirHabilidades] = useState(compartirHabilidadesInicial);
    const [compartirIdiomas, setCompartirIdiomas] = useState(compartirIdiomasInicial);
    const [compartirEducacion, setCompartirEducacion] = useState(compartirEducacionInicial);
    
    const [loading, setLoading] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    const urlPublica = `${origin}/p/${encodeURIComponent(idEncriptado)}`;
    const urlApiQr = `/api/qr?data=${encodeURIComponent(urlPublica)}`;

    // Maneja el toggle principal del Perfil Público
    const handleTogglePublico = async () => {
        setLoading(true);
        const nuevoEstado = !perfilPublico;
        try {
            await updateOpcionesCompartir({ perfil_publico: nuevoEstado });
            setPerfilPublico(nuevoEstado);
            toast.success(
                nuevoEstado 
                    ? "Tu perfil ahora es público. Puedes compartirlo con empresas." 
                    : "Tu perfil ahora es privado."
            );
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la privacidad de tu perfil.");
        } finally {
            setLoading(false);
        }
    };

    // Maneja los toggles granulares individuales
    const handleToggleOption = async (
        campo: "compartir_experiencia" | "compartir_proyectos" | "compartir_habilidades" | "compartir_idiomas" | "compartir_educacion",
        valorActual: boolean,
        setter: (val: boolean) => void
    ) => {
        setLoading(true);
        const nuevoValor = !valorActual;
        try {
            await updateOpcionesCompartir({ [campo]: nuevoValor });
            setter(nuevoValor);
            toast.success("Preferencia de visibilidad actualizada.");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo actualizar la preferencia.");
        } finally {
            setLoading(false);
        }
    };

    const fallbackCopiar = (text: string) => {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.left = "0";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            const exitoso = document.execCommand("copy");
            document.body.removeChild(textarea);
            
            if (exitoso) {
                setCopiado(true);
                toast.success("Enlace copiado al portapapeles");
                setTimeout(() => setCopiado(false), 2000);
            } else {
                toast.error("No se pudo copiar el enlace automáticamente.");
            }
        } catch (err) {
            console.error("Error en fallback de copia:", err);
            toast.error("No se pudo copiar el enlace.");
        }
    };

    const handleCopiarEnlace = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(urlPublica)
                .then(() => {
                    setCopiado(true);
                    toast.success("Enlace copiado al portapapeles");
                    setTimeout(() => setCopiado(false), 2000);
                })
                .catch((err) => {
                    console.error("Error al usar clipboard API, intentando fallback:", err);
                    fallbackCopiar(urlPublica);
                });
        } else {
            fallbackCopiar(urlPublica);
        }
    };

    const handleDownloadQR = async () => {
        try {
            const res = await fetch(urlApiQr);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `QR_MiPerfil_Joby.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            toast.success("Código QR descargado con éxito");
        } catch (error) {
            console.error("Error al descargar QR:", error);
            toast.error("Ocurrió un error al descargar el QR.");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 rounded-xl">
                    <QrCode className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Compartir Currículum</h3>
                    <p className="text-gray-400 text-xs">Comparte tu perfil verificado por código QR o enlace.</p>
                </div>
            </div>

            {/* Switch de Privacidad Principal */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-150">
                <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-700 block">Perfil Público</span>
                    <span className="text-[10px] text-gray-400 block max-w-[200px]">
                        Permite que reclutadores vean tu CV sin iniciar sesión.
                    </span>
                </div>
                
                <button 
                    onClick={handleTogglePublico}
                    disabled={loading}
                    className="focus:outline-none transition-all duration-250 cursor-pointer disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-9 h-9 text-teal-600 animate-spin" />
                    ) : perfilPublico ? (
                        <ToggleRight className="w-10 h-10 text-teal-600" />
                    ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-300" />
                    )}
                </button>
            </div>

            {/* Opciones de Privacidad Granulares */}
            {perfilPublico && (
                <div className="space-y-3.5 pl-4 border-l-2 border-teal-500/20 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2.5">
                        Secciones a compartir en tu CV
                    </span>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Trayectoria Laboral</span>
                        <button 
                            onClick={() => handleToggleOption("compartir_experiencia", compartirExperiencia, setCompartirExperiencia)} 
                            disabled={loading}
                            className="focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                        >
                            {compartirExperiencia ? <ToggleRight className="w-8 h-8 text-teal-600" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Proyectos Destacados</span>
                        <button 
                            onClick={() => handleToggleOption("compartir_proyectos", compartirProyectos, setCompartirProyectos)} 
                            disabled={loading}
                            className="focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                        >
                            {compartirProyectos ? <ToggleRight className="w-8 h-8 text-teal-600" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Habilidades Técnicas</span>
                        <button 
                            onClick={() => handleToggleOption("compartir_habilidades", compartirHabilidades, setCompartirHabilidades)} 
                            disabled={loading}
                            className="focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                        >
                            {compartirHabilidades ? <ToggleRight className="w-8 h-8 text-teal-600" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Idiomas Registrados</span>
                        <button 
                            onClick={() => handleToggleOption("compartir_idiomas", compartirIdiomas, setCompartirIdiomas)} 
                            disabled={loading}
                            className="focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                        >
                            {compartirIdiomas ? <ToggleRight className="w-8 h-8 text-teal-600" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Educación Complementaria</span>
                        <button 
                            onClick={() => handleToggleOption("compartir_educacion", compartirEducacion, setCompartirEducacion)} 
                            disabled={loading}
                            className="focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                        >
                            {compartirEducacion ? <ToggleRight className="w-8 h-8 text-teal-600" /> : <ToggleLeft className="w-8 h-8 text-gray-300" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Sección del QR y Copiar Enlace si está activo */}
            {perfilPublico ? (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-white shadow-inner">
                        <img 
                            src={urlApiQr} 
                            alt="Código QR de Acceso al Perfil"
                            className="w-44 h-44 object-contain rounded-lg border border-gray-100 shadow-sm"
                        />
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                            Escanear para ver CV
                        </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={handleCopiarEnlace}
                            className="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-teal-100 shadow-sm cursor-pointer"
                        >
                            {copiado ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copiar Enlace
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDownloadQR}
                            className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            Descargar QR PNG
                        </button>
                    </div>
                </div>
            ) : (
                <div className="py-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-xs text-gray-400">Activa la visibilidad pública para habilitar el código QR de tu perfil.</p>
                </div>
            )}
        </div>
    );
}
