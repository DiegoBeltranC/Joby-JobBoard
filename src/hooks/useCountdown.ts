import { useState, useEffect, useRef, useCallback } from "react"

export function useCountdown(initialSeconds: number = 60) {
    const [secondsLeft, setSecondsLeft] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const clear = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const startCountdown = useCallback((seconds?: number) => {
        clear()
        const targetSeconds = seconds !== undefined ? seconds : initialSeconds
        setSecondsLeft(targetSeconds)

        if (targetSeconds <= 0) return

        intervalRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clear()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [initialSeconds])

    useEffect(() => {
        return () => clear()
    }, [])

    return { secondsLeft, startCountdown }
}
