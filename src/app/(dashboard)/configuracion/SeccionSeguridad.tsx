"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ChevronDown, Loader2 } from "lucide-react";
import { actualizarPasswordEstudiante } from "@/actions/perfil";
import { validarPassword } from "@/lib/configuracionEstudiante";

interface SeccionSeguridadProps {
    isOpen: boolean;
    onToggle: () => void;
}

/** Sección de acordeón para cambiar la contraseña. Extraída de FormConfiguracion. */
export default function SeccionSeguridad({ isOpen, onToggle }: SeccionSeguridadProps) {
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNuevo, setPasswordNuevo] = useState("");
    const [confirmarPasswordNuevo, setConfirmarPasswordNuevo] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const errs = validarPassword({ passwordActual, passwordNuevo, confirmarPasswordNuevo });
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
        } catch {
            toast.error("Ocurrió un error inesperado al cambiar la contraseña.");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
            <button
                type="button"
                onClick={onToggle}
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
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen
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
    );
}
