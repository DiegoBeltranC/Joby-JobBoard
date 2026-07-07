"use client"

import * as React from "react"
import { Calendar, X } from "lucide-react"
import { toast } from "sonner"
import { extenderVacanteAction } from "@/actions/vacantes"
import { getMinimaFechaCierreVacanteString } from "@/lib/vacanteFechaLimite"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ExtenderVacanteModalProps {
    vacante: { id: number; titulo: string }
    onSuccess: () => void
    onCancel: () => void
}

export default function ExtenderVacanteModal({
    vacante,
    onSuccess,
    onCancel,
}: ExtenderVacanteModalProps) {
    const [fecha, setFecha] = React.useState(getMinimaFechaCierreVacanteString())
    const [isPending, setIsPending] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        try {
            const res = await extenderVacanteAction(vacante.id, fecha)
            if (res.success) {
                toast.success(res.message)
                onSuccess()
            } else {
                toast.error("No se pudo extender", { description: res.error })
            }
        } catch {
            toast.error("Error al extender la convocatoria")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md">
            <div className="flex items-start justify-between gap-4 p-5 bg-amber-50/60 border-b border-amber-100">
                <div>
                    <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        Extender convocatoria
                    </h2>
                    <p className="text-sm text-amber-800/80 mt-1 line-clamp-2">{vacante.titulo}</p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="shrink-0 text-gray-500"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="nueva-fecha-cierre" className="text-sm font-medium text-gray-700">
                        Nueva fecha de cierre *
                    </Label>
                    <Input
                        id="nueva-fecha-cierre"
                        type="date"
                        min={getMinimaFechaCierreVacanteString()}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-500">Solo fechas a partir de mañana. La vacante volverá a estado Abierta.</p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                    >
                        {isPending ? "Guardando…" : "Confirmar extensión"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
