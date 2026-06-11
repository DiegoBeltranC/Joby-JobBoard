"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

interface SnapshotEventos {
    pendientes: {
        count: number
        ids: number[]
        lastUpdate: string | null
    }
    nuevasEmpresas: {
        count: number
        ids: number[]
        lastCreation: string | null
    }
}

const POLL_INTERVAL_MS = 15_000
const INITIAL_DELAY_MS = 5_000

export default function AdminEventosWatcher() {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const lastSnapshotRef = useRef<string>("")
    const initializedRef = useRef(false)
    const inFlightRef = useRef(false)

    useEffect(() => {
        let cancelled = false
        let intervalId: ReturnType<typeof setInterval> | null = null

        const fetchSnapshot = async () => {
            if (cancelled || inFlightRef.current) return
            if (typeof document !== "undefined" && document.hidden) return

            inFlightRef.current = true
            try {
                const res = await fetch("/api/admin/eventos-recientes", { cache: "no-store" })
                if (!res.ok) return
                const data: SnapshotEventos = await res.json()
                const snapshot = JSON.stringify(data)

                if (!initializedRef.current) {
                    lastSnapshotRef.current = snapshot
                    initializedRef.current = true
                    return
                }

                if (snapshot === lastSnapshotRef.current) return

                const prev: SnapshotEventos = JSON.parse(lastSnapshotRef.current)

                const nuevosPendientes = data.pendientes.ids.filter(
                    (id) => !prev.pendientes.ids.includes(id)
                )
                const nuevasEmpresas = data.nuevasEmpresas.ids.filter(
                    (id) => !prev.nuevasEmpresas.ids.includes(id)
                )

                lastSnapshotRef.current = snapshot

                if (nuevasEmpresas.length > 0) {
                    toast.info(
                        nuevasEmpresas.length === 1
                            ? "Nueva empresa registrada"
                            : `${nuevasEmpresas.length} nuevas empresas registradas`,
                        {
                            description: "La lista de empresas se ha actualizado",
                        }
                    )
                }

                if (nuevosPendientes.length > 0) {
                    toast.info(
                        nuevosPendientes.length === 1
                            ? "Nueva solicitud de verificación"
                            : `${nuevosPendientes.length} nuevas solicitudes de verificación`,
                        {
                            description: "La lista de empresas se ha actualizado",
                        }
                    )
                }

                if (nuevasEmpresas.length > 0 || nuevosPendientes.length > 0) {
                    startTransition(() => {
                        router.refresh()
                    })
                }
            } catch {
                // Silenciar errores de red transitorios
            } finally {
                inFlightRef.current = false
            }
        }

        const timeoutId = setTimeout(() => {
            if (cancelled) return
            void fetchSnapshot()
            intervalId = setInterval(fetchSnapshot, POLL_INTERVAL_MS)
        }, INITIAL_DELAY_MS)

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [router])

    return null
}
