"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { crearVacanteAction } from "@/actions/vacantes"
import { toast } from "sonner"
import {
    Plus,
    X,
    Briefcase,
    MapPin,
    DollarSign,
    Sparkles,
    Wrench,
    Languages,
    Clock,
    Check,
    ChevronsUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { habilidades as sugerenciasHabilidades } from "@/lib/data/habilidades"
import catalogos from "@/lib/data/idiomas.json"
import locacionesRaw from "@/lib/data/mexico.json"
import {
    esFechaCierreVacanteValida,
    getMinimaFechaCierreVacanteString,
} from "@/lib/vacanteFechaLimite"

const ubicaciones = locacionesRaw as Record<string, string[]>
const listaEstados = Object.keys(ubicaciones)

const horarioRegex =
    /^([01][0-9]|2[0-3]):[0-5][0-9] - ([01][0-9]|2[0-3]):[0-5][0-9]$/

/** Alineado con `vacanteSchema` del servidor (mismos límites y mensajes clave). */
const vacanteFormSchema = z.object({
    titulo: z
        .string()
        .trim()
        .min(5, "El título debe tener al menos 5 caracteres")
        .max(100, "Máximo 100 caracteres"),
    descripcion: z
        .string()
        .trim()
        .min(20, "La descripción debe ser más detallada (mín. 20 caracteres)"),
    tipo_contrato: z.enum(["ESTADIA", "MEDIO_TIEMPO", "TIEMPO_COMPLETO"]),
    modalidad: z.enum(["PRESENCIAL", "HIBRIDO", "REMOTO"]),
    estado: z.string().min(2, "Selecciona un estado"),
    municipio: z.string().min(2, "Selecciona un municipio"),
    sueldo_min: z.string().optional(),
    sueldo_max: z.string().optional(),
    fecha_limite: z
        .string()
        .min(1, "Selecciona la fecha de cierre de la vacante")
        .refine(esFechaCierreVacanteValida, {
            message: "La fecha de cierre debe ser como mínimo mañana",
        }),
})

type VacanteFormValues = z.infer<typeof vacanteFormSchema>

interface FormularioVacanteProps {
    onSuccess: () => void
    onCancel: () => void
}

function parseSueldo(raw: string | undefined): number | null {
    if (raw == null || String(raw).trim() === "") return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
}

export default function FormularioVacante({ onSuccess, onCancel }: FormularioVacanteProps) {
    const [inputHabilidad, setInputHabilidad] = React.useState("")
    const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = React.useState<string[]>([])
    const [idiomaTemp, setIdiomaTemp] = React.useState("")
    const [nivelTemp, setNivelTemp] = React.useState("")
    const [idiomasSeleccionados, setIdiomasSeleccionados] = React.useState<string[]>([])
    const [horaEntrada, setHoraEntrada] = React.useState("09:00")
    const [horaSalida, setHoraSalida] = React.useState("18:00")
    const [openEstado, setOpenEstado] = React.useState(false)
    const [openMunicipio, setOpenMunicipio] = React.useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<VacanteFormValues>({
        resolver: zodResolver(vacanteFormSchema),
        defaultValues: {
            titulo: "",
            descripcion: "",
            tipo_contrato: "ESTADIA",
            modalidad: "PRESENCIAL",
            estado: "Quintana Roo",
            municipio: "Othón P. Blanco",
            sueldo_min: "",
            sueldo_max: "",
            fecha_limite: getMinimaFechaCierreVacanteString(),
        },
    })

    const estadoActual = watch("estado")
    const municipioActual = watch("municipio")
    const tipoContrato = watch("tipo_contrato")

    const municipiosDisponibles = estadoActual ? ubicaciones[estadoActual] || [] : []

    const sugerenciasFiltradas =
        inputHabilidad.trim() === ""
            ? []
            : (sugerenciasHabilidades || [])
                  .filter(
                      (sug) =>
                          sug.toLowerCase().includes(inputHabilidad.toLowerCase()) &&
                          !habilidadesSeleccionadas.some((h) => h.toLowerCase() === sug.toLowerCase())
                  )
                  .slice(0, 5)

    const agregarHabilidad = (habilidad: string) => {
        const limpia = habilidad.trim()
        if (!limpia) return
        if (habilidadesSeleccionadas.length >= 15) {
            toast.error("Máximo 15 habilidades.")
            return
        }
        if (habilidadesSeleccionadas.some((h) => h.toLowerCase() === limpia.toLowerCase())) return

        const capitalizada = limpia.charAt(0).toUpperCase() + limpia.slice(1).toLowerCase()
        setHabilidadesSeleccionadas([...habilidadesSeleccionadas, capitalizada])
        setInputHabilidad("")
    }

    const quitarHabilidad = (index: number) => {
        setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter((_, i) => i !== index))
    }

    const agregarIdioma = () => {
        if (!idiomaTemp || !nivelTemp) {
            toast.error("Selecciona idioma y nivel.")
            return
        }
        const formato = `${idiomaTemp} - ${nivelTemp.split(" - ")[0]}`
        if (idiomasSeleccionados.some((i) => i.startsWith(idiomaTemp))) {
            toast.error("Ya agregaste este idioma.")
            return
        }
        setIdiomasSeleccionados([...idiomasSeleccionados, formato])
        setIdiomaTemp("")
        setNivelTemp("")
    }

    const quitarIdioma = (index: number) => {
        setIdiomasSeleccionados(idiomasSeleccionados.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: VacanteFormValues) => {
        const requisitosFusionados = [...habilidadesSeleccionadas, ...idiomasSeleccionados]
        if (requisitosFusionados.length === 0) {
            toast.error("Requisito faltante", {
                description: "Debes añadir al menos una habilidad o idioma.",
            })
            return
        }

        const horarioStr = `${horaEntrada} - ${horaSalida}`
        const horario =
            horarioStr.trim() && horarioRegex.test(horarioStr) ? horarioStr : null

        const sueldo_min = parseSueldo(data.sueldo_min)
        const sueldo_max = parseSueldo(data.sueldo_max)
        const fecha_limite = data.fecha_limite.trim()

        const datos = {
            titulo: data.titulo,
            descripcion: data.descripcion,
            tipo_contrato: data.tipo_contrato,
            modalidad: data.modalidad,
            estado: data.estado,
            municipio: data.municipio,
            habilidades_req: requisitosFusionados,
            sueldo_min,
            sueldo_max,
            horario,
            fecha_limite,
        }

        try {
            const res = await crearVacanteAction(datos)
            if (res.success) {
                toast.success(res.message)
                onSuccess()
            } else {
                toast.error("Error al publicar", { description: res.error })
            }
        } catch {
            toast.error("Error crítico", {
                description: "Fallo inesperado en la comunicación con el servidor.",
            })
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="relative z-10 flex items-start justify-between gap-4 p-5 bg-violet-50/40 border-b border-violet-100">
                <div>
                    <h2 className="text-lg font-bold text-violet-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        Nueva Vacante
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Completa los datos para publicar en Joby.</p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="shrink-0 text-gray-500 hover:text-violet-800"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-5">
                    <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-violet-600" />
                        Información general
                    </h3>
                    <div className="space-y-1.5">
                        <Label htmlFor="vacante-titulo" className="text-sm font-medium text-gray-700">
                            Título de la oferta *
                        </Label>
                        <Input
                            id="vacante-titulo"
                            placeholder="Ej: Desarrollador Backend Junior"
                            className={cn(errors.titulo && "border-red-500 focus-visible:ring-red-200")}
                            {...register("titulo")}
                        />
                        {errors.titulo && (
                            <p className="text-xs text-red-500">{errors.titulo.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="vacante-descripcion" className="text-sm font-medium text-gray-700">
                            Descripción del puesto *
                        </Label>
                        <textarea
                            id="vacante-descripcion"
                            rows={4}
                            placeholder="Describe brevemente el puesto, beneficios y cultura corporativa..."
                            className={cn(
                                "flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]",
                                errors.descripcion && "border-red-500 focus-visible:ring-red-200"
                            )}
                            {...register("descripcion")}
                        />
                        {errors.descripcion && (
                            <p className="text-xs text-red-500">{errors.descripcion.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-violet-600" />
                            Ubicación y contrato
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="vacante-tipo-contrato" className="text-sm font-medium text-gray-700">
                                    Tipo de contrato
                                </Label>
                                <select
                                    id="vacante-tipo-contrato"
                                    className={cn(
                                        "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none",
                                        errors.tipo_contrato && "border-red-500"
                                    )}
                                    {...register("tipo_contrato")}
                                >
                                    <option value="ESTADIA">Estadía Profesional</option>
                                    <option value="MEDIO_TIEMPO">Medio Tiempo</option>
                                    <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                                </select>
                                {errors.tipo_contrato && (
                                    <p className="text-xs text-red-500">{errors.tipo_contrato.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="vacante-modalidad" className="text-sm font-medium text-gray-700">
                                    Modalidad
                                </Label>
                                <select
                                    id="vacante-modalidad"
                                    className={cn(
                                        "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none",
                                        errors.modalidad && "border-red-500"
                                    )}
                                    {...register("modalidad")}
                                >
                                    <option value="PRESENCIAL">Presencial</option>
                                    <option value="HIBRIDO">Híbrido</option>
                                    <option value="REMOTO">Remoto</option>
                                </select>
                                {errors.modalidad && (
                                    <p className="text-xs text-red-500">{errors.modalidad.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-dashed border-gray-200 bg-white/80 p-4 space-y-3">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-violet-600" />
                                Rango de horario (entrada — salida)
                            </Label>
                            <div className="flex flex-wrap items-center gap-3">
                                <Input
                                    type="time"
                                    value={horaEntrada}
                                    onChange={(e) => setHoraEntrada(e.target.value)}
                                    className="flex-1 min-w-[120px]"
                                />
                                <span className="text-gray-400 text-sm font-medium">—</span>
                                <Input
                                    type="time"
                                    value={horaSalida}
                                    onChange={(e) => setHoraSalida(e.target.value)}
                                    className="flex-1 min-w-[120px]"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Formato 24 h: {horaEntrada} a {horaSalida}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label className="text-sm font-medium text-gray-700">Estado *</Label>
                                <Popover open={openEstado} onOpenChange={setOpenEstado}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openEstado}
                                            className={cn(
                                                "w-full justify-between bg-white font-normal",
                                                !estadoActual && "text-muted-foreground",
                                                errors.estado && "border-red-500"
                                            )}
                                        >
                                            {estadoActual || "Buscar estado..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 z-[110]" align="start">
                                        <Command>
                                            <CommandInput placeholder="Escribe tu estado..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró el estado.</CommandEmpty>
                                                <CommandGroup>
                                                    {listaEstados.map((estado) => (
                                                        <CommandItem
                                                            key={estado}
                                                            value={estado}
                                                            onSelect={(v) => {
                                                                const estadoReal = listaEstados.find(
                                                                    (e) => e.toLowerCase() === v.toLowerCase()
                                                                )
                                                                setValue("estado", estadoReal || "", {
                                                                    shouldValidate: true,
                                                                })
                                                                setValue("municipio", "", { shouldValidate: true })
                                                                setOpenEstado(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    estadoActual === estado ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {estado}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.estado && (
                                    <p className="text-xs text-red-500">{errors.estado.message}</p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label className="text-sm font-medium text-gray-700">Municipio *</Label>
                                <Popover open={openMunicipio} onOpenChange={setOpenMunicipio}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openMunicipio}
                                            disabled={!estadoActual}
                                            className={cn(
                                                "w-full justify-between bg-white font-normal",
                                                !municipioActual && "text-muted-foreground",
                                                !estadoActual && "bg-gray-100",
                                                errors.municipio && "border-red-500"
                                            )}
                                        >
                                            {municipioActual ||
                                                (estadoActual ? "Buscar municipio..." : "Primero elige un estado")}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 z-[110]" align="start">
                                        <Command>
                                            <CommandInput placeholder="Escribe tu municipio..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró el municipio.</CommandEmpty>
                                                <CommandGroup>
                                                    {municipiosDisponibles.map((mun) => (
                                                        <CommandItem
                                                            key={mun}
                                                            value={mun}
                                                            onSelect={(v) => {
                                                                const munReal = municipiosDisponibles.find(
                                                                    (m) => m.toLowerCase() === v.toLowerCase()
                                                                )
                                                                setValue("municipio", munReal || "", {
                                                                    shouldValidate: true,
                                                                })
                                                                setOpenMunicipio(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    municipioActual === mun ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {mun}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.municipio && (
                                    <p className="text-xs text-red-500">{errors.municipio.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-5">
                        <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-violet-600" />
                            {tipoContrato === "ESTADIA"
                                ? "Beca / apoyo económico"
                                : "Sueldo y plazo"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="vacante-sueldo-min" className="text-sm font-medium text-gray-700">
                                    {tipoContrato === "ESTADIA" ? "Beca mín." : "Sueldo mín."}
                                </Label>
                                <Input
                                    id="vacante-sueldo-min"
                                    type="number"
                                    placeholder="0"
                                    {...register("sueldo_min")}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="vacante-sueldo-max" className="text-sm font-medium text-gray-700">
                                    {tipoContrato === "ESTADIA" ? "Beca máx." : "Sueldo máx."}
                                </Label>
                                <Input
                                    id="vacante-sueldo-max"
                                    type="number"
                                    placeholder="0"
                                    {...register("sueldo_max")}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="vacante-fecha-limite" className="text-sm font-medium text-gray-700">
                                Cierre de vacante *
                            </Label>
                            <Input
                                id="vacante-fecha-limite"
                                type="date"
                                min={getMinimaFechaCierreVacanteString()}
                                className={cn(errors.fecha_limite && "border-red-500 focus-visible:ring-red-200")}
                                {...register("fecha_limite")}
                            />
                            {errors.fecha_limite && (
                                <p className="text-xs text-red-500">{errors.fecha_limite.message}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Solo puedes elegir fechas a partir de mañana.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-violet-600" />
                        Habilidades requeridas
                    </h3>
                    <div className="relative">
                        <Input
                            type="text"
                            value={inputHabilidad}
                            onChange={(e) => setInputHabilidad(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    agregarHabilidad(inputHabilidad)
                                }
                            }}
                            placeholder="Ej: React, Cocina Mexicana..."
                            autoComplete="off"
                            className="pr-20"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {habilidadesSeleccionadas.length}/15
                        </span>
                        {sugerenciasFiltradas.length > 0 && (
                            <ul className="absolute z-[110] w-full bg-white border border-gray-200 shadow-lg rounded-xl mt-1 overflow-hidden">
                                {sugerenciasFiltradas.map((sug, idx) => (
                                    <li
                                        key={idx}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            agregarHabilidad(sug)
                                        }}
                                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-800 cursor-pointer border-b border-gray-50 last:border-0"
                                    >
                                        {sug}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[46px] p-2 bg-white rounded-xl border border-dashed border-gray-200">
                        {habilidadesSeleccionadas.length === 0 && (
                            <p className="text-xs text-gray-500 italic p-2">
                                Escribe y presiona Enter para añadir habilidades técnicas...
                            </p>
                        )}
                        {habilidadesSeleccionadas.map((h, i) => (
                            <span
                                key={`${h}-${i}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-900 border border-violet-200 rounded-lg text-xs font-medium"
                            >
                                {h}
                                <button
                                    type="button"
                                    onClick={() => quitarHabilidad(i)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    aria-label={`Quitar ${h}`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-violet-50/40 p-5 rounded-2xl border border-violet-100 space-y-4">
                    <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                        <Languages className="w-4 h-4 text-violet-600" />
                        Idiomas requeridos
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={idiomaTemp}
                            onChange={(e) => setIdiomaTemp(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            <option value="">Seleccionar idioma...</option>
                            {(catalogos?.lista || []).map((i) => (
                                <option key={i} value={i}>
                                    {i}
                                </option>
                            ))}
                        </select>
                        <select
                            value={nivelTemp}
                            onChange={(e) => setNivelTemp(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            <option value="">Nivel...</option>
                            {(catalogos?.niveles || []).map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <Button
                            type="button"
                            onClick={agregarIdioma}
                            className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Añadir
                        </Button>
                    </div>
                    {idiomasSeleccionados.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {idiomasSeleccionados.map((idioma, index) => (
                                <div
                                    key={`${idioma}-${index}`}
                                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-violet-100"
                                >
                                    <span className="text-sm font-medium text-violet-900">{idioma}</span>
                                    <button
                                        type="button"
                                        onClick={() => quitarIdioma(index)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        aria-label="Quitar idioma"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="text-gray-600 hover:text-gray-900 sm:w-auto"
                    >
                        Descartar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-sm sm:w-auto sm:min-w-[200px]"
                    >
                        {isSubmitting ? "Publicando…" : "Confirmar publicación"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
