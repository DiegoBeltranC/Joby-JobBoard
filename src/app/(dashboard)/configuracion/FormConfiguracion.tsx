"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarConfiguracionEstudiante, actualizarPasswordEstudiante, suspenderCuentaEstudiante } from "@/actions/perfil";
import { logoutAction } from "@/actions/auth";
import { User, GraduationCap, IdCard, Loader2, ArrowLeft, Lock, Shield, AlertTriangle, ChevronDown, Settings, Trash2 } from "lucide-react";
import Link from "next/link";

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
}

export default function FormConfiguracion({ estudiante, carreras }: FormConfiguracionProps) {
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
    const [openSection, setOpenSection] = useState<"profile" | "security" | "settings" | "">("");

    // Modal de Suspensión
    const [showSuspensionModal, setShowSuspensionModal] = useState(false);
    const [suspensionPassword, setSuspensionPassword] = useState("");
    const [suspensionConfirmText, setSuspensionConfirmText] = useState("");
    const [showFarewellModal, setShowFarewellModal] = useState(false);
    const [deletingProgress, setDeletingProgress] = useState(false);
    const [deactivationStep, setDeactivationStep] = useState(0);

    // Modal de Carrera
    const [showCarreraModal, setShowCarreraModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    // Formulario de Seguridad
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNuevo, setPasswordNuevo] = useState("");
    const [confirmarPasswordNuevo, setConfirmarPasswordNuevo] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

    // Calcular cooldown de 30 días
    const isCooldownActive = () => {
        if (!estudiante.nombre_modificado_at) return false;
        const diffMs = Date.now() - new Date(estudiante.nombre_modificado_at).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays < 30;
    };

    const getCooldownReleaseDate = () => {
        if (!estudiante.nombre_modificado_at) return "";
        const releaseDate = new Date(estudiante.nombre_modificado_at);
        releaseDate.setDate(releaseDate.getDate() + 30);
        return releaseDate.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const cooldownActive = isCooldownActive();

    const validar = () => {
        const nuevosErrores: { [key: string]: string } = {};
        if (!nombre.trim()) nuevosErrores.nombre = "El nombre es requerido";
        if (!apellidoPaterno.trim()) nuevosErrores.apellidoPaterno = "El apellido paterno es requerido";
        if (!carreraId) nuevosErrores.carreraId = "Selecciona tu carrera";

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

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: { [key: string]: string } = {};
        if (!passwordActual) errs.passwordActual = "La contraseña actual es requerida";
        if (!passwordNuevo) {
            errs.passwordNuevo = "La nueva contraseña es requerida";
        } else if (passwordNuevo.length < 8) {
            errs.passwordNuevo = "Debe tener al menos 8 caracteres";
        }
        if (passwordNuevo !== confirmarPasswordNuevo) {
            errs.confirmarPasswordNuevo = "Las contraseñas no coinciden";
        }

        setPasswordErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setPasswordLoading(true);
        try {
            const res = await actualizarPasswordEstudiante({
                passwordActual,
                passwordNuevo
            });

            if (res.error) {
                toast.error("Error al cambiar contraseña", { description: res.error });
            } else {
                toast.success("¡Contraseña actualizada!", {
                    description: "Tu contraseña ha sido cambiada y se envió una alerta de seguridad por correo.",
                });
                setPasswordActual("");
                setPasswordNuevo("");
                setConfirmarPasswordNuevo("");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado al cambiar la contraseña.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSuspensionSubmit = async () => {
        if (!suspensionPassword || suspensionConfirmText.toUpperCase() !== "CONFIRMAR") {
            toast.error("Por favor, llena los campos correctamente.");
            return;
        }

        setLoading(true);
        try {
            const res = await suspenderCuentaEstudiante({ passwordActual: suspensionPassword });
            if (res.error) {
                toast.error(res.error);
                setLoading(false);
            } else {
                // 1. Ocultar modal de confirmación
                setShowSuspensionModal(false);
                // 2. Mostrar modal de despedida durante 5 segundos
                setShowFarewellModal(true);
                
                setTimeout(() => {
                    setShowFarewellModal(false);
                    // 3. Mostrar pantalla de desintegración y progreso
                    setDeletingProgress(true);
                    setDeactivationStep(1);
                    
                    setTimeout(() => setDeactivationStep(2), 700);
                    setTimeout(() => setDeactivationStep(3), 1400);
                    setTimeout(() => setDeactivationStep(4), 2100);
                    setTimeout(async () => {
                        toast.success("Tu cuenta ha sido suspendida correctamente.");
                        await logoutAction();
                    }, 2800);
                }, 5000);
            }
        } catch (err) {
            toast.error("Ocurrió un error al procesar tu solicitud.");
            setLoading(false);
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
                                        Modificado recientemente. Podrás volver a editarlo el {getCooldownReleaseDate()}.
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
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                    <button
                        type="button"
                        onClick={() => setOpenSection(openSection === "security" ? "" as any : "security")}
                        className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-gray-50/50 transition-colors focus:outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Seguridad (Contraseña)</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Actualiza tus credenciales de acceso</p>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === "security" ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openSection === "security"
                            ? "max-h-[800px] opacity-100 border-t border-gray-100"
                            : "max-h-0 opacity-0 pointer-events-none"
                        }`}>
                        <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="passwordActual">Contraseña actual *</Label>
                                    <Input
                                        id="passwordActual"
                                        type="password"
                                        value={passwordActual}
                                        onChange={(e) => setPasswordActual(e.target.value)}
                                        placeholder="••••••••"
                                        className={passwordErrors.passwordActual ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {passwordErrors.passwordActual && <p className="text-xs text-red-500 font-semibold">{passwordErrors.passwordActual}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="passwordNuevo">Nueva contraseña *</Label>
                                    <Input
                                        id="passwordNuevo"
                                        type="password"
                                        value={passwordNuevo}
                                        onChange={(e) => setPasswordNuevo(e.target.value)}
                                        placeholder="Mín. 8 caracteres"
                                        className={passwordErrors.passwordNuevo ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {passwordErrors.passwordNuevo && <p className="text-xs text-red-500 font-semibold">{passwordErrors.passwordNuevo}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmarPasswordNuevo">Confirmar nueva contraseña *</Label>
                                    <Input
                                        id="confirmarPasswordNuevo"
                                        type="password"
                                        value={confirmarPasswordNuevo}
                                        onChange={(e) => setConfirmarPasswordNuevo(e.target.value)}
                                        placeholder="Repite la contraseña"
                                        className={passwordErrors.confirmarPasswordNuevo ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {passwordErrors.confirmarPasswordNuevo && <p className="text-xs text-red-500 font-semibold">{passwordErrors.confirmarPasswordNuevo}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-gray-100 mt-6">
                                <Button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="font-bold px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Actualizando...
                                        </>
                                    ) : (
                                        "Actualizar contraseña"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sección 3: Ajustes (Suspender Cuenta) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                    <button
                        type="button"
                        onClick={() => setOpenSection(openSection === "settings" ? "" : "settings")}
                        className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-gray-50/50 transition-colors focus:outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Ajustes</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Opciones avanzadas y suspensión de cuenta</p>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === "settings" ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openSection === "settings" 
                            ? "max-h-[800px] opacity-100 border-t border-gray-100" 
                            : "max-h-0 opacity-0 pointer-events-none"
                    }`}>
                        <div className="p-6 sm:p-8 space-y-6">
                            
                            <div className="bg-red-50/30 border border-red-100 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <Trash2 className="w-5 h-5 shrink-0" />
                                    <h3 className="text-base font-bold">Suspender mi cuenta</h3>
                                </div>
                                <p className="text-sm text-gray-650 leading-relaxed font-medium">
                                    Si decides suspender tu cuenta, se cerrará tu sesión de inmediato y se eliminarán permanentemente todas tus postulaciones activas. Tu perfil ya no será visible para las empresas. Tendrás un plazo de **15 días de gracia** para reactivar tu cuenta simplemente volviendo a iniciar sesión. Si transcurre este periodo, tu cuenta se eliminará por completo.
                                </p>
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={() => setShowSuspensionModal(true)}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold border border-red-200 px-6 py-2.5 rounded-xl shadow-none transition-all cursor-pointer"
                                    >
                                        Suspender cuenta
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

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

            {/* Modal de Confirmación de Suspensión de Cuenta */}
            {showSuspensionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 border border-gray-100 animate-in zoom-in-95 duration-200 space-y-6">
                        <div className="flex items-center gap-3 text-red-650">
                            <AlertTriangle className="w-8 h-8 animate-pulse text-red-600" />
                            <h3 className="text-xl font-black text-red-600">Suspender Cuenta</h3>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            Esta acción desactivará tu perfil y eliminará permanentemente todas tus postulaciones activas de inmediato. Para confirmar la suspensión, por favor ingresa tu contraseña y escribe <span className="font-bold text-gray-900">CONFIRMAR</span>.
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="suspensionPassword">Contraseña Actual *</Label>
                                <Input
                                    id="suspensionPassword"
                                    type="password"
                                    value={suspensionPassword}
                                    onChange={(e) => setSuspensionPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="border-gray-200 focus-visible:ring-red-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="suspensionConfirmText">Escribe CONFIRMAR *</Label>
                                <Input
                                    id="suspensionConfirmText"
                                    type="text"
                                    value={suspensionConfirmText}
                                    onChange={(e) => setSuspensionConfirmText(e.target.value)}
                                    placeholder="CONFIRMAR"
                                    className="border-gray-200 focus-visible:ring-red-500 text-center font-bold tracking-widest uppercase"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuspensionModal(false);
                                    setSuspensionPassword("");
                                    setSuspensionConfirmText("");
                                }}
                                className="w-1/2 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold transition-all border border-gray-100 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={!suspensionPassword || suspensionConfirmText.toUpperCase() !== "CONFIRMAR" || loading}
                                onClick={handleSuspensionSubmit}
                                className="w-1/2 h-12 rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-bold transition-all shadow-lg shadow-red-150 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Suspender cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Despedida de 5 segundos */}
            {showFarewellModal && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white/95 rounded-3xl w-full max-w-md shadow-2xl p-8 border border-white/20 text-center space-y-6 animate-in zoom-in-95 duration-350">
                        <div className="inline-flex p-4 bg-teal-50 text-teal-600 rounded-full animate-bounce">
                            <User className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Lamentamos que tengas que irte</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Tu cuenta ha sido desactivada temporalmente y tus postulaciones han sido dadas de baja. Esperamos que vuelvas pronto.
                        </p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-600 h-full animate-[progress_5s_linear_forwards]"></div>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider animate-pulse">Cerrando sesión...</p>
                    </div>
                </div>
            )}

            {/* Overlay de Desintegración y Progreso */}
            {deletingProgress && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                            <Loader2 className="w-6 h-6 animate-spin shrink-0" />
                            <h3 className="text-lg font-bold">Procesando baja de la cuenta</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className={`w-2.5 h-2.5 rounded-full ${deactivationStep >= 1 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-gray-700"}`}></div>
                                <span className={deactivationStep >= 1 ? "text-gray-200 font-bold" : "text-gray-500"}>
                                    Eliminando postulaciones activas...
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className={`w-2.5 h-2.5 rounded-full ${deactivationStep >= 2 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-gray-700"}`}></div>
                                <span className={deactivationStep >= 2 ? "text-gray-200 font-bold" : "text-gray-500"}>
                                    Desactivando visibilidad de perfil...
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className={`w-2.5 h-2.5 rounded-full ${deactivationStep >= 3 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-gray-700"}`}></div>
                                <span className={deactivationStep >= 3 ? "text-gray-200 font-bold" : "text-gray-500"}>
                                    Programando fecha de purga (15 días)...
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className={`w-2.5 h-2.5 rounded-full ${deactivationStep >= 4 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-700"}`}></div>
                                <span className={deactivationStep >= 4 ? "text-green-400 font-bold" : "text-gray-500"}>
                                    Sesión cerrada y cuenta suspendida con éxito.
                                </span>
                            </div>
                        </div>

                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-red-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                style={{ width: `${(deactivationStep / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
