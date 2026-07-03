"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Bell } from "lucide-react"

interface EstatusResponse {
    estatus: "SIN_ENVIAR" | "PENDIENTE" | "APROBADA" | "RECHAZADA" | "REQUIERE_CAMBIOS" | "SUSPENDIDA"
    motivo_rechazo: string | null
    updatedAt: string
}

const POLL_INTERVAL_MS = 10_000
const INITIAL_DELAY_MS = 5_000

const MENSAJES: Record<EstatusResponse["estatus"], { title: string; description: string }> = {
    SIN_ENVIAR: {
        title: "Tu cuenta está sin enviar",
        description: "Completa tu perfil al 100% para enviar la solicitud.",
    },
    PENDIENTE: {
        title: "Solicitud en revisión",
        description: "El equipo de la UTCH está revisando tu información.",
    },
    APROBADA: {
        title: "¡Tu cuenta fue aprobada!",
        description: "Ya puedes publicar vacantes y gestionar tu perfil.",
    },
    RECHAZADA: {
        title: "Tu solicitud fue rechazada",
        description: "Revisa los motivos comunicados por la administración.",
    },
    REQUIERE_CAMBIOS: {
        title: "Se requieren correcciones",
        description: "Ingresa a tu perfil para aplicar los cambios solicitados.",
    },
    SUSPENDIDA: {
        title: "Tu cuenta fue suspendida",
        description: "Comunícate con la administración para más información.",
    },
}

export default function EmpresaEstatusWatcher() {
    const router = useRouter()
    const pathname = usePathname()
    const [, startTransition] = useTransition()
    const lastEstatusRef = useRef<EstatusResponse["estatus"] | null>(null)
    const initializedRef = useRef(false)
    const inFlightRef = useRef(false)

    useEffect(() => {
        let cancelled = false
        let intervalId: ReturnType<typeof setInterval> | null = null

        const fetchEstatus = async () => {
            if (cancelled || inFlightRef.current) return
            if (typeof document !== "undefined" && document.hidden) return

            inFlightRef.current = true
            try {
                const res = await fetch("/api/empresa/mi-estatus", { cache: "no-store" })
                if (!res.ok) return
                const data: EstatusResponse = await res.json()

                if (!initializedRef.current) {
                    lastEstatusRef.current = data.estatus
                    initializedRef.current = true
                    return
                }

                if (data.estatus === lastEstatusRef.current) return

                const prevEstatus = lastEstatusRef.current
                lastEstatusRef.current = data.estatus

                const msg = MENSAJES[data.estatus]
                const isNegativo = data.estatus === "SUSPENDIDA" || data.estatus === "RECHAZADA"

                if (isNegativo) {
                    toast.error(msg.title, {
                        description: msg.description,
                        icon: <Bell className="w-4 h-4" />,
                        duration: 8000,
                    })
                } else {
                    toast.success(msg.title, {
                        description: msg.description,
                        icon: <Bell className="w-4 h-4" />,
                        duration: 6000,
                    })
                }

                if (prevEstatus !== null) {
                    startTransition(() => {
                        router.refresh()
                    })
                }
            } catch {
                // Silenciar errores de red
            } finally {
                inFlightRef.current = false
            }
        }

        const timeoutId = setTimeout(() => {
            if (cancelled) return
            void fetchEstatus()
            intervalId = setInterval(fetchEstatus, POLL_INTERVAL_MS)
        }, INITIAL_DELAY_MS)

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [router, pathname])

    return null
}
