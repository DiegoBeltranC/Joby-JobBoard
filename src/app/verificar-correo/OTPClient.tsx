"use client"

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react"
import { useRouter } from "next/navigation"
import { reenviarOTPAction, verificarOTPAction } from "@/actions/auth"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"

interface OTPClientProps {
    email: string
    redirect?: string
}

export default function OTPClient({ email, redirect }: OTPClientProps) {
    const router = useRouter()
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value
        if (isNaN(Number(val))) return

        const newOtp = [...otp]
        // Solo toma el ultimo caracter por si logran teclear rapido
        newOtp[index] = val.substring(val.length - 1)
        setOtp(newOtp)

        // Avanzar al siguiente si se escribió un número
        if (val && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            // Retroceder en borrado
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain").trim()
        if (!/^\d+$/.test(pastedData)) return // Ignorar si no son números

        const newOtp = [...otp]
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i]
        }
        setOtp(newOtp)
        
        // Enfocar el input correspondiente al final del pegado
        const focusIndex = Math.min(pastedData.length, 5)
        inputRefs.current[focusIndex]?.focus()
    }

    const handleVerifyClick = async () => {
        const fullCode = otp.join("")
        if (fullCode.length < 6) {
            return toast.error("Ingresa el código completo de 6 dígitos.")
        }
        
        setIsVerifying(true)
        const idCarga = toast.loading("Verificando código...")
        
        const res = await verificarOTPAction(email, fullCode)
        if (res.error) {
            toast.error(res.error, { id: idCarga })
            setIsVerifying(false)
            // Limpiar inputs si el codigo es incorrecto para reintentar rapido
            if (res.error === "El código es incorrecto.") {
                 setOtp(Array(6).fill(""))
                 inputRefs.current[0]?.focus()
            }
        } else {
            toast.success("¡Cuenta verificada exitosamente!", { id: idCarga })
            // Redirigimos al inicio según el rol o al redirect url
            if (redirect) {
                router.push(redirect)
            } else {
                const target = res.rol === "EMPRESA" ? "/empresa/inicio" : "/inicio"
                router.push(target)
            }
        }
    }

    const handleResendClick = async () => {
        setIsResending(true)
        const idCarga = toast.loading("Generando nuevo código...")
        
        const res = await reenviarOTPAction(email)
        if (res.error) {
            toast.error(res.error, { id: idCarga })
        } else {
            toast.success("Te hemos enviado un nuevo código al correo.", { id: idCarga })
            setOtp(Array(6).fill(""))
            inputRefs.current[0]?.focus()
        }
        setIsResending(false)
    }

    return (
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-teal-600 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
            </Link>

            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-teal-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu correo</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Hemos enviado un código seguro de 6 dígitos a la dirección <br/>
                <span className="font-semibold text-teal-700">{email}</span>
            </p>

            <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        ref={(el) => { inputRefs.current[index] = el }}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        disabled={isVerifying}
                        className="w-12 h-14 md:w-14 md:h-16 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold text-gray-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                ))}
            </div>

            <button
                onClick={handleVerifyClick}
                disabled={isVerifying || otp.join("").length < 6}
                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:hover:bg-teal-600 flex items-center justify-center group"
            >
                {isVerifying ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>Verificar cuenta <ArrowLeft className="w-5 h-5 ml-2 rotate-180 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" /></>
                )}
            </button>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    ¿No recibiste el correo?{" "}
                    <button 
                        onClick={handleResendClick} 
                        disabled={isResending || isVerifying}
                        className="font-bold text-teal-600 hover:underline disabled:opacity-50 disabled:hover:no-underline"
                    >
                        {isResending ? "Enviando..." : "Click para reenviar"}
                    </button>
                </p>
            </div>
        </div>
    )
}
