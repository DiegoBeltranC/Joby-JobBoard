"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarConfiguracionEstudiante } from "@/actions/perfil";
import {
    estaEnCooldownNombre,
    fechaFinCooldownNombre,
    validarDatosPersonales,
} from "@/lib/configuracionEstudiante";
import { User, GraduationCap, IdCard, Loader2, ArrowLeft, Lock, AlertTriangle, ChevronDown } from "lucide-react";
import Link from "next/link";
import SeccionSmartwatch from "./SeccionSmartwatch";
import SeccionSeguridad from "./SeccionSeguridad";
import SeccionSuspension from "./SeccionSuspension";

interface FormConfiguracionProps {
    estudiante: {
        nombre: string;
        apellidoPaterno: string;
        apellidoMaterno: string | null;
        matricula: string;
        carreraId: number;
        nombre_modificado_at: Date | string | null;
        cambio_carrera_usado: boolean;
        periodo_academico: number | null;
    };
    carreras: {
        id: number;
        nombre: string;
    }[];
    relojVinculado?: boolean;
}

export default function FormConfiguracion({ estudiante, carreras, relojVinculado = false }: FormConfiguracionProps) {
    const router = useRouter();

    // Configuración general
    const [nombre, setNombre] = useState(estudiante.nombre);
    const [apellidoPaterno, setApellidoPaterno] = useState(estudiante.apellidoPaterno);
    const [apellidoMaterno, setApellidoMaterno] = useState(estudiante.apellidoMaterno || "");
    const [matricula] = useState(estudiante.matricula);
    const [carreraId, setCarreraId] = useState(estudiante.carreraId);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Acordeón control
    const [openSection, setOpenSection] = useState<"profile" | "security" | "smartwatch" | "settings" | "">("");

    // Modal de Carrera
    const [showCarreraModal, setShowCarreraModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    // Cooldown de 30 días para volver a editar el nombre
    const cooldownActive = estaEnCooldownNombre(estudiante.nombre_modificado_at);
    const fechaFinCooldown = fechaFinCooldownNombre(estudiante.nombre_modificado_at);

    const validar = () => {
        const nuevosErrores = validarDatosPersonales({ nombre, apellidoPaterno, carreraId });
        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const checkAndSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validar()) return;

        // Si cambió la carrera y no se ha usado el cambio, mostrar el modal de confirmación
        if (carreraId !== estudiante.carreraId && !estudiante.cambio_carrera_usado) {
            setShowCarreraModal(true);
        } else {
            ejecutarSubmit();
        }
    };

    const ejecutarSubmit = async () => {
        setLoading(true);
        try {
            const res = await actualizarConfiguracionEstudiante({
                nombre,
                apellidoPaterno,
                apellidoMaterno: apellidoMaterno || undefined,
                matricula,
                carreraId: Number(carreraId),
            });

            if (res.error) {
                toast.error("Error al actualizar", { description: res.error });
            } else {
                toast.success("¡Configuración actualizada!", {
                    description: "Tus datos personales y académicos se han guardado con éxito.",
                });
                router.refresh();
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado al guardar los cambios.");
        } finally {
            setLoading(false);
            setShowCarreraModal(false);
            setConfirmText("");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Botón Volver */}
            <div>
                <Link
                    href="/perfil"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a mi perfil
                </Link>
            </div>

            {/* Encabezado */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Configuración de la Cuenta</h1>
                <p className="text-gray-500 mt-1">Gestiona tu identidad, datos escolares y contraseña.</p>
            </div>

            {/* Acordeón de Secciones */}
            <div className="space-y-4">

                {/* Sección 1: Datos Personales y Academia */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                    <button
                        type="button"
                        onClick={() => setOpenSection(openSection === "profile" ? "" as any : "profile")}
                        className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-gray-50/50 transition-colors focus:outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Datos Personales y Academia</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Nombre, matrícula, cuatrimestre y carrera universitaria</p>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === "profile" ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSection === "profile"
                            ? "max-h-[1400px] opacity-100 border-t border-gray-100"
                            : "max-h-0 opacity-0 pointer-events-none"
                        }`}>
                        <form onSubmit={checkAndSubmit} className="p-6 sm:p-8 space-y-6">

                            {/* Datos Personales */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                                    <User className="w-4 h-4 text-teal-600" />
                                    <h3 className="text-sm font-bold text-gray-700">Datos Personales</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre(s) *</Label>
                                        <Input
                                            id="nombre"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej. Diego"
                                            disabled={cooldownActive}
                                            className={`${errors.nombre ? "border-red-500 focus-visible:ring-red-500" : ""
                                                } ${cooldownActive ? "bg-gray-50 text-gray-400 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 select-none cursor-not-allowed" : ""}`}
                                        />
                                        {errors.nombre && <p className="text-xs text-red-500 font-semibold">{errors.nombre}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                                        <Input
                                            id="apellidoPaterno"
                                            value={apellidoPaterno}
                                            onChange={(e) => setApellidoPaterno(e.target.value)}
                                            placeholder="Ej. Beltran"
                                            disabled={cooldownActive}
                                            className={`${errors.apellidoPaterno ? "border-red-500 focus-visible:ring-red-500" : ""
                                                } ${cooldownActive ? "bg-gray-50 text-gray-400 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 select-none cursor-not-allowed" : ""}`}
                                        />
                                        {errors.apellidoPaterno && <p className="text-xs text-red-500 font-semibold">{errors.apellidoPaterno}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apellidoMaterno">Apellido Materno (Opcional)</Label>
                                        <Input
                                            id="apellidoMaterno"
                                            value={apellidoMaterno}
                                            onChange={(e) => setApellidoMaterno(e.target.value)}
                                            placeholder="Ej. Can"
                                            disabled={cooldownActive}
                                            className={cooldownActive ? "bg-gray-50 text-gray-400 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 select-none cursor-not-allowed" : ""}
                                        />
                                    </div>
                                </div>

                                {cooldownActive && (
                                    <p className="text-xs text-amber-600 font-medium bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        Modificado recientemente. Podrás volver a editarlo el {fechaFinCooldown}.
                                    </p>
                                )}
                            </div>

                            {/* Academia */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
                                    <GraduationCap className="w-4 h-4 text-teal-600" />
                                    <h3 className="text-sm font-bold text-gray-700">Academia</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="matricula" className="flex items-center gap-1">
                                            <IdCard className="w-4 h-4 text-gray-400" />
                                            Matrícula *
                                        </Label>

                                        <div className="relative group">
                                            <Input
                                                id="matricula"
                                                value={matricula}
                                                readOnly
                                                className="bg-gray-50 text-gray-400 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 select-none pr-10 focus:outline-none focus:ring-0 cursor-not-allowed"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs font-semibold py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg z-10 text-center">
                                                Dato institucional bloqueado por seguridad.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="periodo_academico" className="flex items-center gap-1">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            Cuatrimestre
                                        </Label>
                                        <Input
                                            id="periodo_academico"
                                            value={estudiante.periodo_academico ? `${estudiante.periodo_academico}° Cuatrimestre` : "No especificado"}
                                            readOnly
                                            className="bg-gray-50 text-gray-400 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 select-none cursor-not-allowed focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="carreraId">Carrera *</Label>
                                        {estudiante.cambio_carrera_usado ? (
                                            <select
                                                id="carreraId"
                                                value={carreraId}
                                                disabled
                                                className="flex h-10 w-full rounded-md border bg-gray-50 text-gray-400 border-gray-200 px-3 py-2 text-sm select-none cursor-not-allowed focus-visible:outline-none focus:outline-none focus:ring-0"
                                            >
                                                {carreras.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <select
                                                id="carreraId"
                                                value={carreraId}
                                                onChange={(e) => setCarreraId(Number(e.target.value))}
                                                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.carreraId ? "border-red-500" : "border-input"
                                                    }`}
                                            >
                                                <option value="">Selecciona tu carrera...</option>
                                                {carreras.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {errors.carreraId && <p className="text-xs text-red-500 font-semibold">{errors.carreraId}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Botón de envío */}
                            <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-6">
                                <Button
                                    type="submit"
                                    disabled={loading || (cooldownActive && carreraId === estudiante.carreraId)}
                                    className="font-bold px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Guardar cambios"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sección 2: Seguridad (Contraseña) */}
                <SeccionSeguridad
                    isOpen={openSection === "security"}
                    onToggle={() => setOpenSection(openSection === "security" ? "" : "security")}
                />

                {/* Sección 3: Reloj Inteligente */}
                <SeccionSmartwatch
                    isOpen={openSection === "smartwatch"}
                    onToggle={() => setOpenSection(openSection === "smartwatch" ? "" : "smartwatch")}
                    relojVinculado={relojVinculado}
                />

                {/* Sección 4: Ajustes (Suspender Cuenta) */}
                <SeccionSuspension
                    isOpen={openSection === "settings"}
                    onToggle={() => setOpenSection(openSection === "settings" ? "" : "settings")}
                />

            </div>

            {/* Modal de Advertencia de Carrera */}
            {showCarreraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 border border-gray-100 animate-in zoom-in-95 duration-200 space-y-6">
                        <div className="flex items-center gap-3 text-amber-600">
                            <AlertTriangle className="w-8 h-8" />
                            <h3 className="text-xl font-black">Advertencia de Cambio</h3>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            Estás a punto de cambiar tu carrera a{" "}
                            <span className="font-bold text-gray-900">
                                {carreras.find(c => c.id === carreraId)?.nombre}
                            </span>
                            . Toma en cuenta que el sistema solo permite 1 cambio en la plataforma.
                        </p>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Para confirmar esta acción, escribe la palabra CONFIRMAR:
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder="Escribe CONFIRMAR"
                                className="border-gray-200 focus-visible:ring-teal-500 text-center font-bold tracking-widest uppercase"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCarreraModal(false);
                                    setConfirmText("");
                                }}
                                className="w-1/2 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold transition-all border border-gray-100 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={confirmText.toUpperCase() !== "CONFIRMAR" || loading}
                                onClick={ejecutarSubmit}
                                className="w-1/2 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-bold transition-all shadow-lg shadow-teal-100 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirmar cambio
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
