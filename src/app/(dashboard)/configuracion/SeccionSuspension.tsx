"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Trash2, ChevronDown, AlertTriangle, User, Loader2 } from "lucide-react";
import { suspenderCuentaEstudiante } from "@/actions/perfil";
import { logoutAction } from "@/actions/auth";

interface SeccionSuspensionProps {
    isOpen: boolean;
    onToggle: () => void;
}

/**
 * Sección de acordeón "Ajustes" con el flujo de suspensión de cuenta (modal de
 * confirmación, despedida y overlay de desactivación). Extraída de
 * FormConfiguracion; la lógica del servidor (suspenderCuentaEstudiante,
 * logoutAction) no se modifica.
 */
export default function SeccionSuspension({ isOpen, onToggle }: SeccionSuspensionProps) {
    const [loading, setLoading] = useState(false);
    const [showSuspensionModal, setShowSuspensionModal] = useState(false);
    const [suspensionPassword, setSuspensionPassword] = useState("");
    const [suspensionConfirmText, setSuspensionConfirmText] = useState("");
    const [showFarewellModal, setShowFarewellModal] = useState(false);
    const [deletingProgress, setDeletingProgress] = useState(false);
    const [deactivationStep, setDeactivationStep] = useState(0);

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
        } catch {
            toast.error("Ocurrió un error al procesar tu solicitud.");
            setLoading(false);
        }
    };

    return (
        <>
            {/* Sección 4: Ajustes (Suspender Cuenta) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    type="button"
                    onClick={onToggle}
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
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen
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
        </>
    );
}
