"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { Camera, Trash2, Upload, X, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";
import { actualizarBannerEmpresa, eliminarBannerEmpresa } from "@/actions/perfilEmpresa";
import { cn } from "@/lib/utils";

interface BannerUploadProps {
    bannerActualUrl: string | null;
}

export default function BannerUpload({ bannerActualUrl }: BannerUploadProps) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para el recorte
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (!file.type.includes('image/')) {
                return toast.error("Solo se permiten imágenes");
            }
            if (file.size > 3 * 1024 * 1024) {
                return toast.error("La imagen no debe pesar más de 3MB");
            }

            const imageDataUrl = URL.createObjectURL(file);
            setImageSrc(imageDataUrl);
            setModalAbierto(true);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleGuardarBanner = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsSubmitting(true);
        const idCarga = toast.loading("Procesando y guardando banner...");

        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

            const formData = new FormData();
            formData.append("banner", croppedFile);

            const result = await actualizarBannerEmpresa(formData);

            if (result.error) {
                toast.error(result.error, { id: idCarga });
            } else {
                toast.success("Banner actualizado con éxito", { id: idCarga });
                setModalAbierto(false);
                setImageSrc(null);
            }
        } catch (e) {
            toast.error("Error al procesar la imagen", { id: idCarga });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEliminar = async () => {
        const idCarga = toast.loading("Eliminando banner...");
        const result = await eliminarBannerEmpresa();
        if (result.error) toast.error(result.error, { id: idCarga });
        else {
            toast.success("Banner eliminado", { id: idCarga });
            setModalEliminar(false);
        }
    };

    return (
        <div className="w-full h-full">
            <div className={cn(
                "relative group w-full h-full rounded-3xl overflow-hidden transition-colors border-2 border-dashed border-transparent hover:border-violet-300",
                !bannerActualUrl && "bg-gradient-to-r from-teal-900 to-teal-700 border-gray-200"
            )}>
                {bannerActualUrl ? (
                    <img src={bannerActualUrl} alt="Banner de empresa" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                        <ImageIcon className="w-12 h-12" />
                    </div>
                )}

                {/* Overlay de Edición */}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-black uppercase tracking-tighter">Cambiar Imagen de Fondo</span>
                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} />
                </label>

                {/* Botón Eliminar */}
                {bannerActualUrl && (
                    <button
                        onClick={() => setModalEliminar(true)}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-red-500 backdrop-blur-md text-white p-2 rounded-xl transition-all border border-white/20 shadow-lg"
                        title="Eliminar banner"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* MODAL DE RECORTE (PANORÁMICO 3:1) */}
            {modalAbierto && imageSrc && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="font-black text-xl text-gray-900">Ajustar Banner</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Formato Panorámico (3:1)</p>
                            </div>
                            <button onClick={() => { setModalAbierto(false); setImageSrc(null); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="relative h-[400px] bg-gray-900 w-full">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={3 / 1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="p-6 bg-gray-50 flex items-center justify-between">
                            <div className="flex-1 max-w-xs">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Zoom de Imagen</label>
                                <input
                                    type="range"
                                    value={zoom} min={1} max={3} step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-violet-600"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setModalAbierto(false); setImageSrc(null); }} className="px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-2xl transition-all">Cancelar</button>
                                <button onClick={handleGuardarBanner} disabled={isSubmitting} className="flex items-center px-8 py-3 text-sm font-black bg-gray-900 text-white hover:bg-violet-600 rounded-2xl disabled:opacity-50 shadow-xl shadow-gray-200 transition-all">
                                    <Upload className="w-4 h-4 mr-2" /> {isSubmitting ? "Procesando..." : "Guardar Banner"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ELIMINAR */}
            {modalEliminar && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">¿Eliminar Banner?</h3>
                        <p className="text-sm text-gray-500 font-medium mb-8">Tu perfil volverá a mostrar el gradiente premium por defecto.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setModalEliminar(false)} className="flex-1 px-4 py-3 text-sm font-bold bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">Cancelar</button>
                            <button onClick={handleEliminar} className="flex-1 px-4 py-3 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg shadow-red-100 transition-all">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
