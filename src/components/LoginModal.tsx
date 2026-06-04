"use client";

import { useState } from "react";
import { X, Loader2, ShieldCheck, Lock, Mail } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";

interface LoginModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const idCarga = toast.loading("Verificando credenciales...");
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("tipo", "estudiante");

        try {
            const result = await loginAction(formData);
            if (result?.error) {
                toast.dismiss(idCarga);
                toast.error("Error de inicio de sesión", {
                    description: result.error,
                });
            } else if (result?.redirect) {
                toast.dismiss(idCarga);
                window.location.href = result.redirect;
            } else if (result?.success) {
                toast.success("¡Bienvenido a Joby!", { id: idCarga });
                onSuccess();
            }
        } catch (error) {
            toast.dismiss(idCarga);
            toast.error("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-teal-900 to-teal-800 p-8 text-white relative flex flex-col justify-end">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck className="w-7 h-7 text-teal-300" />
                    </div>
                    <h2 className="text-2xl font-black leading-tight">Iniciar Sesión</h2>
                    <p className="text-teal-200/80 text-xs font-bold uppercase tracking-widest mt-1">
                        Accede para enviar tu postulación
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                            Correo Institucional
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@utchetumal.edu.mx"
                                className="w-full pl-12 pr-4 h-12 rounded-2xl border-2 border-gray-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 h-12 rounded-2xl border-2 border-gray-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Ingresar a la plataforma"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
