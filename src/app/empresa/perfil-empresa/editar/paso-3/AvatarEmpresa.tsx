"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import { Camera, Trash2, Upload, X, AlertTriangle } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";
import { actualizarLogoEmpresa, eliminarLogoEmpresa } from "@/actions/perfilEmpresa";

interface AvatarEmpresaProps {
    logoActualUrl: string | null;
    iniciales: string;
}

export default function AvatarEmpresa({ logoActualUrl, iniciales }: AvatarEmpresaProps) {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para el recorte
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // 1. Cuando el usuario selecciona un archivo
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (!file.type.includes('image/')) {
                return toast.error("Solo se permiten imágenes");
            }
            if (file.size > 2 * 1024 * 1024) {
                return toast.error("La imagen no debe pesar más de 2MB");
            }

            const imageDataUrl = URL.createObjectURL(file);
            setImageSrc(imageDataUrl);
            setModalAbierto(true);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 2. Guardar el logo recortado
    const handleGuardarLogo = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsSubmitting(true);
        const idCarga = toast.loading("Procesando y guardando logo...");

        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

            const formData = new FormData();
            formData.append("logo", croppedFile);

            const result = await actualizarLogoEmpresa(formData);

            if (result.error) {
                toast.error(result.error, { id: idCarga });
            } else {
                toast.success("Logo de empresa actualizado", { id: idCarga });
                setModalAbierto(false);
                setImageSrc(null);
            }
        } catch (e) {
            toast.error("Error al procesar la imagen", { id: idCarga });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Eliminar logo
    const handleEliminar = async () => {
        const idCarga = toast.loading("Eliminando logo...");
        const result = await eliminarLogoEmpresa();
        if (result.error) toast.error(result.error, { id: idCarga });
        else {
            toast.success("Logo eliminado", { id: idCarga });
            setModalEliminar(false);
        }
    };

    return (
        <>
            {/* EL AVATAR EN LA PÁGINA */}
            <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {logoActualUrl ? (
                            <img src={logoActualUrl} alt="Logo de empresa" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-indigo-400">{iniciales}</span>
                        )}
                    </div>

                    {/* Overlay que aparece al hacer hover */}
                    <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-2xl m-1">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Cambiar</span>
                        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} />
                    </label>
                </div>

                {/* Botón flotante para eliminar (Solo si hay logo) */}
                {logoActualUrl && (
                    <button
                        onClick={() => setModalEliminar(true)}
                        className="absolute -bottom-2 -right-2 bg-white border border-red-100 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        title="Eliminar logo"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* MODAL DE RECORTE */}
            {modalAbierto && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">

                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">Ajustar logo de empresa</h3>
                            <button onClick={() => { setModalAbierto(false); setImageSrc(null); }} className="text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenedor del Cropper */}
                        <div className="relative h-64 bg-gray-900 w-full">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="rect"
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        {/* Controles de Zoom */}
                        <div className="p-4 border-b border-gray-100">
                            <label className="text-xs font-medium text-gray-500 mb-2 block">Zoom</label>
                            <input
                                type="range"
                                value={zoom} min={1} max={3} step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                        </div>

                        <div className="flex justify-end gap-3 p-4 bg-gray-50">
                            <button onClick={() => { setModalAbierto(false); setImageSrc(null); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Cancelar</button>
                            <button onClick={handleGuardarLogo} disabled={isSubmitting} className="flex items-center px-4 py-2 text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 rounded-lg disabled:opacity-50">
                                <Upload className="w-4 h-4 mr-2" /> {isSubmitting ? "Guardando..." : "Guardar logo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
            {modalEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar logo actual?</h3>
                        <p className="text-sm text-gray-500 mb-6">Tu perfil volverá a mostrar las iniciales de tu empresa.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setModalEliminar(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl">Cancelar</button>
                            <button onClick={handleEliminar} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
