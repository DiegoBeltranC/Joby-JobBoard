"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { crearVacanteAction, editarVacanteAction } from "@/actions/vacantes"
import { toast } from "sonner"
import {
    Plus,
    X,
    Briefcase,
    MapPin,
    DollarSign,
    Sparkles,
    Languages,
    Clock,
    AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import catalogos from "@/lib/data/idiomas.json"
import SelectorEstadoMunicipio from "@/components/SelectorEstadoMunicipio"
import SelectorHabilidades from "@/components/empresa/SelectorHabilidades"
import { separarHabilidadesEIdiomas } from "@/lib/habilidadesVacante"
import { getMinimaFechaCierreVacanteString } from "@/lib/vacanteFechaLimite"
import {
    vacanteFormSchema,
    parseSueldo,
    formatFechaToLocalString,
    horarioRegex,
    type VacanteFormValues,
} from "@/lib/vacanteForm"

interface FormularioVacanteProps {
    onSuccess: () => void
    onCancel: () => void
    vacanteAEditar?: any
}

export default function FormularioVacante({ onSuccess, onCancel, vacanteAEditar }: FormularioVacanteProps) {
    const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = React.useState<string[]>(
        () => separarHabilidadesEIdiomas(vacanteAEditar?.habilidades_req).habilidades
    )
    const [idiomaTemp, setIdiomaTemp] = React.useState("")
    const [nivelTemp, setNivelTemp] = React.useState("")
    const [idiomasSeleccionados, setIdiomasSeleccionados] = React.useState<string[]>(
        () => separarHabilidadesEIdiomas(vacanteAEditar?.habilidades_req, vacanteAEditar?.idiomas_req).idiomas
    )
    const [horaEntrada, setHoraEntrada] = React.useState(() => {
        if (vacanteAEditar?.horario && horarioRegex.test(vacanteAEditar.horario)) {
            return vacanteAEditar.horario.split(" - ")[0]
        }
        return "09:00"
    })
    const [horaSalida, setHoraSalida] = React.useState(() => {
        if (vacanteAEditar?.horario && horarioRegex.test(vacanteAEditar.horario)) {
            return vacanteAEditar.horario.split(" - ")[1]
        }
        return "18:00"
    })
    const [errorRequisitos, setErrorRequisitos] = React.useState(false)
    const [confirmarGuardar, setConfirmarGuardar] = React.useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<VacanteFormValues>({
        resolver: zodResolver(vacanteFormSchema),
        defaultValues: {
            titulo: vacanteAEditar?.titulo || "",
            descripcion: vacanteAEditar?.descripcion || "",
            tipo_contrato: vacanteAEditar?.tipo_contrato || "" as any,
            modalidad: vacanteAEditar?.modalidad || "" as any,
            estado: vacanteAEditar?.estado || "",
            municipio: vacanteAEditar?.municipio || "",
            sueldo_min: vacanteAEditar?.sueldo_min != null ? String(vacanteAEditar.sueldo_min) : "",
            sueldo_max: vacanteAEditar?.sueldo_max != null ? String(vacanteAEditar.sueldo_max) : "",
            fecha_limite: formatFechaToLocalString(vacanteAEditar?.fecha_limite),
        },
    })

    const estadoActual = watch("estado")
    const municipioActual = watch("municipio")
    const tipoContrato = watch("tipo_contrato")

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
        setErrorRequisitos(false)
        setIdiomaTemp("")
        setNivelTemp("")
    }

    const quitarIdioma = (index: number) => {
        setIdiomasSeleccionados(idiomasSeleccionados.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: VacanteFormValues) => {
        if (habilidadesSeleccionadas.length === 0 && idiomasSeleccionados.length === 0) {
            setErrorRequisitos(true)
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
            habilidades_req: habilidadesSeleccionadas,
            idiomas_req: idiomasSeleccionados,
            sueldo_min,
            sueldo_max,
            horario,
            fecha_limite,
        }

        try {
            let res;
            if (vacanteAEditar) {
                res = await editarVacanteAction(vacanteAEditar.id, datos)
            } else {
                res = await crearVacanteAction(datos)
            }

            if (res.success) {
                toast.success(res.message)
                setConfirmarGuardar(false)
                onSuccess()
            } else {
                toast.error("Error al procesar", { description: res.error })
            }
        } catch {
            toast.error("Error crítico", {
                description: "Fallo inesperado en la comunicación con el servidor.",
            })
        }
    }

    const solicitarConfirmacionGuardar = () => {
        handleSubmit(
            () => {
                if (habilidadesSeleccionadas.length === 0 && idiomasSeleccionados.length === 0) {
                    setErrorRequisitos(true)
                    setConfirmarGuardar(false)
                    return
                }
                setErrorRequisitos(false)
                setConfirmarGuardar(true)
            },
            () => setConfirmarGuardar(false)
        )()
    }

    const tienePostulaciones = vacanteAEditar?._count?.postulaciones > 0
    const esEdicion = !!vacanteAEditar

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Banner de Advertencia si está en edición y tiene postulantes */}
            {vacanteAEditar && tienePostulaciones && (
                <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-900">
                            Vacante con postulaciones activas ({vacanteAEditar._count.postulaciones} alumnos)
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                            Esta vacante ya tiene alumnos postulados. El tipo de contrato no se podrá modificar para proteger el estatus de los candidatos. Si modificas otros campos, asegúrate de que no afecte drásticamente las condiciones acordadas.
                        </p>
                    </div>
                </div>
            )}

            <div className="relative z-10 flex items-start justify-between gap-4 p-5 bg-violet-50/40 border-b border-violet-100">
                <div>
                    <h2 className="text-lg font-bold text-violet-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        {vacanteAEditar ? "Editar Vacante" : "Nueva Vacante"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {vacanteAEditar ? "Modifica los datos de la oferta laboral." : "Completa los datos para publicar en Joby."}
                    </p>
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
                                    disabled={tienePostulaciones}
                                    className={cn(
                                        "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed",
                                        errors.tipo_contrato && "border-red-500"
                                    )}
                                    {...register("tipo_contrato")}
                                >
                                    <option value="">Selecciona una opción...</option>
                                    <option value="ESTADIA">Estadía Profesional</option>
                                    <option value="MEDIO_TIEMPO">Medio Tiempo</option>
                                    <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                                </select>
                                {tienePostulaciones && (
                                    <p className="text-[10px] text-amber-600 font-semibold mt-1">
                                        Bloqueado por postulaciones activas.
                                    </p>
                                )}
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
                                    <option value="">Selecciona una opción...</option>
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

                        <SelectorEstadoMunicipio
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            contentClassName="z-[110]"
                            align="start"
                            estado={estadoActual}
                            municipio={municipioActual}
                            onEstadoChange={(e) => setValue("estado", e, { shouldValidate: true })}
                            onMunicipioChange={(m) => setValue("municipio", m, { shouldValidate: true })}
                            errorEstado={errors.estado?.message}
                            errorMunicipio={errors.municipio?.message}
                        />
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
                                min={vacanteAEditar?.fecha_limite ? formatFechaToLocalString(vacanteAEditar.fecha_limite) : getMinimaFechaCierreVacanteString()}
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

                <SelectorHabilidades
                    habilidades={habilidadesSeleccionadas}
                    onChange={(nuevas) => {
                        if (nuevas.length > habilidadesSeleccionadas.length) setErrorRequisitos(false)
                        setHabilidadesSeleccionadas(nuevas)
                    }}
                    error={errorRequisitos}
                />

                <div className={cn(
                    "p-5 rounded-2xl border space-y-4 transition-colors",
                    errorRequisitos ? "bg-red-50/10 border-red-500" : "bg-violet-50/40 border-violet-100"
                )}>
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
                {errorRequisitos && (
                    <p className="text-sm text-red-500 font-medium animate-in fade-in-50 duration-200">
                        * Debes añadir al menos una habilidad o un idioma requerido.
                    </p>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setConfirmarGuardar(false)
                            onCancel()
                        }}
                        className="text-gray-600 hover:text-gray-900 sm:w-auto"
                    >
                        Descartar
                    </Button>
                    {confirmarGuardar ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-sm sm:min-w-[200px]"
                            >
                                {isSubmitting
                                    ? esEdicion
                                        ? "Guardando…"
                                        : "Publicando…"
                                    : esEdicion
                                      ? "Confirmar cambios"
                                      : "Confirmar publicación"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={isSubmitting}
                                onClick={() => setConfirmarGuardar(false)}
                                className="text-gray-600"
                            >
                                No
                            </Button>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            onClick={solicitarConfirmacionGuardar}
                            className="border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 hover:text-violet-900 font-semibold rounded-xl sm:min-w-[200px]"
                        >
                            {esEdicion ? "Guardar cambios" : "Publicar vacante"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
