"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Watch, ChevronDown, Loader2 } from "lucide-react";
import { vincularRelojAction, desvincularRelojAction } from "@/actions/smartwatch";

interface SeccionSmartwatchProps {
    isOpen: boolean;
    onToggle: () => void;
    relojVinculado: boolean;
}

/** Sección de acordeón para vincular/desvincular un smartwatch. Extraída de FormConfiguracion. */
export default function SeccionSmartwatch({ isOpen, onToggle, relojVinculado }: SeccionSmartwatchProps) {
    const [codigoReloj, setCodigoReloj] = useState("");
    const [loadingReloj, setLoadingReloj] = useState(false);
    const [successReloj, setSuccessReloj] = useState(false);
    const [errorReloj, setErrorReloj] = useState<string | null>(null);
    const [isWatchLinked, setIsWatchLinked] = useState(relojVinculado);

    const handleRelojSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoadingReloj(true);
        setErrorReloj(null);
        setSuccessReloj(false);

        const res = await vincularRelojAction(codigoReloj.trim());

        setLoadingReloj(false);
        if (res.success) {
            setSuccessReloj(true);
            setCodigoReloj("");
            setIsWatchLinked(true);
            toast.success("¡Reloj vinculado con éxito!");
        } else {
            setErrorReloj(res.error || "Ocurrió un error");
        }
    };

    const handleDesvincular = async () => {
        setLoadingReloj(true);
        const res = await desvincularRelojAction();
        setLoadingReloj(false);

        if (res.success) {
            setIsWatchLinked(false);
            setSuccessReloj(false);
            toast.success("Reloj desvinculado correctamente.");
        } else {
            toast.error(res.error || "Error al desvincular el reloj.");
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
                        <Watch className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Reloj Inteligente</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Sincroniza tu smartwatch para acceso rápido</p>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen
                    ? "max-h-[800px] opacity-100 border-t border-gray-100"
                    : "max-h-0 opacity-0 pointer-events-none"
                }`}>
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        {isWatchLinked ? (
                            <div className="text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4">
                                    <Watch className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Reloj Conectado</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Tu smartwatch está vinculado y listo para usarse con tu cuenta. Solo puedes tener un reloj conectado a la vez.
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleDesvincular}
                                    disabled={loadingReloj}
                                    className="w-full max-w-sm font-bold bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl transition-all"
                                >
                                    {loadingReloj ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    Desvincular Reloj
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">Vincular Smartwatch</h3>
                                    <p className="text-slate-500 mt-2 text-sm">
                                        Ingresa el código de 6 dígitos que aparece en la pantalla de tu reloj.
                                    </p>
                                </div>

                                {successReloj ? (
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 text-center">
                                        <h4 className="font-semibold text-lg mb-1">¡Vinculado con éxito!</h4>
                                        <p className="text-sm">
                                            Tu reloj ya está sincronizado. Deberías ver tu código QR en la pantalla del smartwatch en unos segundos.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRelojSubmit} className="space-y-4 max-w-sm mx-auto">
                                        <div>
                                            <Input
                                                value={codigoReloj}
                                                onChange={(e) => setCodigoReloj(e.target.value.toUpperCase())}
                                                placeholder="Ej. 123456"
                                                maxLength={6}
                                                className="text-center text-2xl tracking-widest h-14 font-mono rounded-xl focus-visible:ring-teal-500"
                                                required
                                            />
                                        </div>

                                        {errorReloj && (
                                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200 text-center font-medium">
                                                {errorReloj}
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all"
                                            disabled={loadingReloj || codigoReloj.length !== 6}
                                        >
                                            {loadingReloj ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                            {loadingReloj ? "Vinculando..." : "Vincular Reloj"}
                                        </Button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
