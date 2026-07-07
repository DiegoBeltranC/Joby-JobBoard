"use client"
import { Clock, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function TimelineComunicaciones({ comunicaciones }: { comunicaciones: any[] }) {
    const [expandido, setExpandido] = useState(false);

    if (!comunicaciones || comunicaciones.length === 0) return null;

    const ultimo = comunicaciones[0];
    const historialesAntiguos = comunicaciones.slice(1);

    return (
        <div className="w-full mt-4">
            {/* Mensaje Mas Reciente Destacado */}
            <div className="bg-white border border-orange-200/60 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Retroalimentación Actual
                    </span>
                    <span className="text-xs text-gray-400 font-medium ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ultimo.createdAt).toLocaleDateString("es-MX", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">{ultimo.asunto}</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ultimo.mensaje}</p>
            </div>

            {/* Listado Antiguo Expansible */}
            {historialesAntiguos.length > 0 && (
                <div className="mt-3">
                    <button 
                        onClick={() => setExpandido(!expandido)}
                        className="flex items-center gap-2 text-xs font-bold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                    >
                        {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {expandido ? "Ocultar historial" : `Ver historial de correcciones (${historialesAntiguos.length})`}
                    </button>

                    {expandido && (
                        <div className="mt-4 pl-3 ml-2 border-l-2 border-orange-100 space-y-6 relative before:content-[''] before:absolute before:inset-0 before:bg-linear-to-b before:from-transparent before:via-orange-50/10 before:to-transparent pointer-events-auto animate-in slide-in-from-top-4 duration-300">
                            {(historialesAntiguos || []).map((com, index) => (
                                <div key={com.id} className="relative z-10">
                                    <div className="absolute -left-[19px] top-1 w-3 h-3 bg-white border-2 border-orange-300 rounded-full"></div>
                                    <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold text-orange-600 uppercase">Intento de Revisión #{(historialesAntiguos || []).length - index}</span>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {new Date(com.createdAt).toLocaleDateString("es-MX", { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <h5 className="font-semibold text-gray-800 text-sm">{com.asunto}</h5>
                                        <p className="text-xs text-gray-600 mt-1">{com.mensaje}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
