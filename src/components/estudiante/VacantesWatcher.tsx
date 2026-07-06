"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface VacantesStatusResponse {
    count: number
    lastId: number
    lastCreatedAt: string | null
}

const POLL_INTERVAL_MS = 20_000
const INITIAL_DELAY_MS = 5_000

export default function VacantesWatcher() {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const lastSnapshotRef = useRef<string>("")
    const initializedRef = useRef(false)
    const inFlightRef = useRef(false)

    useEffect(() => {
        let cancelled = false
        let intervalId: ReturnType<typeof setInterval> | null = null

        const fetchStatus = async () => {
            if (cancelled || inFlightRef.current) return
            if (typeof document !== "undefined" && document.hidden) return

            inFlightRef.current = true
            try {
                const res = await fetch("/api/estudiante/vacantes-status", { cache: "no-store" })
                if (!res.ok) return
                const data: VacantesStatusResponse = await res.json()
                const snapshot = JSON.stringify(data)

                if (!initializedRef.current) {
                    lastSnapshotRef.current = snapshot
                    initializedRef.current = true
                    return
                }

                if (snapshot === lastSnapshotRef.current) return

                lastSnapshotRef.current = snapshot

                startTransition(() => {
                    router.refresh()
                })
            } catch {
                // Silenciar errores de red transitorios
            } finally {
                inFlightRef.current = false
            }
        }

        const timeoutId = setTimeout(() => {
            if (cancelled) return
            void fetchStatus()
            intervalId = setInterval(fetchStatus, POLL_INTERVAL_MS)
        }, INITIAL_DELAY_MS)

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [router])

    return null
}
