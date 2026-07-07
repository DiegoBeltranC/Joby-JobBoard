"use client"
import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"

export default function BienvenidaAprobado({ empresaId }: { empresaId: number }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const hashID = `joby_bienvenida_${empresaId}`;
        const hasSeenWelcome = localStorage.getItem(hashID);

        // Si NO ha visto la bienvenida, le decimos SHOW
        if (!hasSeenWelcome) {
            setShow(true);
        }
    }, [empresaId]);

    const handleCerrar = () => {
        // Marcaje permanente en este navegador
        localStorage.setItem(`joby_bienvenida_${empresaId}`, "true");
        setShow(false);
    }

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-500 delay-150">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-400 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                
                <button onClick={handleCerrar} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10">
                    <X className="w-4 h-4" />
                </button>

                <div className="w-20 h-20 bg-violet-100 text-violet-600 flex items-center justify-center rounded-3xl mb-6 shadow-inner mx-auto relative z-10 border-4 border-white ring-1 ring-violet-50">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <h2 className="text-2xl font-black text-center text-gray-900 mb-3 relative z-10 tracking-tight">¡Cuenta Verificada!</h2>
                <p className="text-gray-500 text-sm text-center mb-8 relative z-10 leading-relaxed px-4">
                    Felicidades, el equipo de Vinculación de UT Chetumal ha revisado y aprobado tu expediente institucional. 
                    <br/><br/>
                    A partir de este momento puedes acceder libremente al módulo de creación de vacantes y publicar oportunidades de empleo para la base estudiantil.
                </p>
                
                <div className="flex relative z-10">
                    <button onClick={handleCerrar} className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition shadow-sm shadow-violet-200 text-sm tracking-wide">
                        ¡Entendido, gracias!
                    </button>
                </div>
            </div>
        </div>
    )
}
