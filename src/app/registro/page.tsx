"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ChevronRight, ArrowLeft, ShieldCheck, Building2, GraduationCap } from "lucide-react"
import { registrarEstudiante, verificarCorreoDisponibleRegistro } from "@/actions/registro"
import { registrarEmpresa } from "@/actions/registroEmpresa"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// ============================================================================
// ESQUEMAS DE VALIDACIÓN (ZOD)
// ============================================================================

// --- ESTUDIANTE ---
const registroEstudianteSchema = z.object({
    correo: z.string()
        .trim().toLowerCase()
        .email("Correo inválido")
        .endsWith("@utchetumal.edu.mx", "Obligatorio: Usa tu correo institucional"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
    nombre: z.string().trim().min(2, "Tu nombre es requerido"),
    apellidoPaterno: z.string().trim().min(2, "Tu apellido paterno es requerido"),
    apellidoMaterno: z.string().trim().optional(),
    matricula: z.string().trim().regex(/^\d{10}$/, "La matrícula debe tener exactamente 10 números"),
    carreraId: z.string().min(1, "Selecciona tu carrera"),
    estatus_academico: z.enum(["ACTIVO", "EGRESADO"]),
    periodo_academico: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las contraseñas no coinciden", path: ["confirmPassword"] })
    }
    if (data.estatus_academico === "ACTIVO" && !data.periodo_academico) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecciona en qué cuatrimestre estás", path: ["periodo_academico"] })
    }
})

type RegistroEstudianteValues = z.infer<typeof registroEstudianteSchema>

// --- EMPRESA ---
const registroEmpresaSchema = z.object({
    correo: z.string().trim().toLowerCase().email("Correo inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
    nombre_comercial: z.string().trim().min(2, "El nombre comercial es requerido"),
    rfc: z.string().trim().toUpperCase()
        .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, "RFC inválido (Ej: XAXX010101000)")
        .or(z.literal("")),
    nombre: z.string().trim().min(2, "El nombre del contacto es requerido"),
    apellidoPaterno: z.string().trim().min(2, "El apellido paterno es requerido"),
    apellidoMaterno: z.string().trim().optional(),
    cargo_contacto: z.string().trim().min(2, "El cargo es requerido"),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las contraseñas no coinciden", path: ["confirmPassword"] })
    }
})

type RegistroEmpresaValues = z.infer<typeof registroEmpresaSchema>

// ============================================================================
// CONFIGURACIÓN DE PASOS
// ============================================================================
const PASOS_ESTUDIANTE = [
    { id: 1, titulo: "Cuenta", campos: ["correo", "password", "confirmPassword"] },
    { id: 2, titulo: "Identidad", campos: ["nombre", "apellidoPaterno", "apellidoMaterno", "matricula"] },
    { id: 3, titulo: "Academia", campos: ["carreraId", "estatus_academico", "periodo_academico"] },
]

const PASOS_EMPRESA = [
    { id: 1, titulo: "Cuenta", campos: ["correo", "password", "confirmPassword"] },
    { id: 2, titulo: "Empresa", campos: ["nombre_comercial", "rfc", "nombre", "apellidoPaterno", "apellidoMaterno", "cargo_contacto"] },
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function RegistroPage() {
    const searchParams = useSearchParams()
    const [tipoRegistro, setTipoRegistro] = useState<"estudiante" | "empresa">(
        searchParams.get("tipo") === "empresa" ? "empresa" : "estudiante"
    )
    const [pasoActual, setPasoActual] = useState(1)
    const router = useRouter()

    const PASOS = tipoRegistro === "estudiante" ? PASOS_ESTUDIANTE : PASOS_EMPRESA

    // --- FORMULARIO ESTUDIANTE ---
    const formEstudiante = useForm<RegistroEstudianteValues>({
        resolver: zodResolver(registroEstudianteSchema),
        defaultValues: { estatus_academico: "ACTIVO" }
    })

    // --- FORMULARIO EMPRESA ---
    const formEmpresa = useForm<RegistroEmpresaValues>({
        resolver: zodResolver(registroEmpresaSchema),
    })

    const form = tipoRegistro === "estudiante" ? formEstudiante : formEmpresa
    const { register, handleSubmit, trigger, formState: { errors }, watch, getValues, setError } = form as any

    const estatusSeleccionado = tipoRegistro === "estudiante" ? formEstudiante.watch("estatus_academico") : null

    // Reset al cambiar de tipo
    useEffect(() => {
        setPasoActual(1)
        formEstudiante.reset()
        formEmpresa.reset()
    }, [tipoRegistro])

    // Color primario según tipo
    const colorPrimary = tipoRegistro === "estudiante" ? "primary" : "indigo-600"
    const colorPrimaryHover = tipoRegistro === "estudiante" ? "primary/90" : "indigo-700"
    const isEmpresa = tipoRegistro === "empresa"

    // ===== NAVEGACIÓN =====
    const avanzarPaso = async () => {
        const camposDelPaso = PASOS[pasoActual - 1].campos as any[]
        const pasoValido = await trigger(camposDelPaso)

        if (pasoValido) {
            if (pasoActual === 1) {
                const { password, confirmPassword, correo } = getValues()
                if (password !== confirmPassword) {
                    setError("confirmPassword", { type: "manual", message: "Las contraseñas no coinciden" })
                    return
                }

                if (isEmpresa) {
                    const verificacionCorreo = await verificarCorreoDisponibleRegistro(correo)
                    if (!verificacionCorreo.disponible) {
                        if ("redirect" in verificacionCorreo && verificacionCorreo.redirect) {
                            router.push(verificacionCorreo.redirect)
                            return
                        }
                        setError("correo", {
                            type: "manual",
                            message: verificacionCorreo.error ?? "Este correo ya está registrado en Joby.",
                        })
                        return
                    }
                }
            }
            if (pasoActual < PASOS.length) {
                setPasoActual(pasoActual + 1)
            }
        }
    }

    const retrocederPaso = () => {
        if (pasoActual > 1) setPasoActual(prev => prev - 1)
    }

    const manejarSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pasoActual < PASOS.length) {
            await avanzarPaso()
        } else {
            if (tipoRegistro === "estudiante") {
                await formEstudiante.handleSubmit(onSubmitEstudiante)(e)
            } else {
                await formEmpresa.handleSubmit(onSubmitEmpresa)(e)
            }
        }
    }

    // ===== SUBMIT ESTUDIANTE =====
    const onSubmitEstudiante = async (data: RegistroEstudianteValues) => {
        const idCarga = toast.loading("Creando tu cuenta en Joby...")
        const redirectUrl = searchParams.get("redirect")
        const respuesta = await registrarEstudiante(data, redirectUrl || undefined)
        if (!respuesta.success) {
            toast.dismiss(idCarga)
            toast.error("Hubo un problema", { description: respuesta.error })
            return
        }
        toast.dismiss(idCarga)

        if (respuesta.redirect) {
            router.push(respuesta.redirect)
        } else {
            toast.success("¡Bienvenido a Joby!", { description: "Tu cuenta ha sido creada exitosamente." })
            const redirectSuffix = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""
            router.push(`/login${redirectSuffix}`)
        }
    }

    // ===== SUBMIT EMPRESA =====
    const onSubmitEmpresa = async (data: RegistroEmpresaValues) => {
        const idCarga = toast.loading("Registrando tu empresa en Joby...")
        const respuesta = await registrarEmpresa(data)
        if (!respuesta.success) {
            toast.dismiss(idCarga)
            toast.error("Hubo un problema", { description: respuesta.error })
            return
        }
        toast.dismiss(idCarga)

        if (respuesta.redirect) {
            router.push(respuesta.redirect)
        } else {
            toast.success("¡Empresa registrada!", { description: "Ya puedes iniciar sesión con tu cuenta empresarial." })
            router.push("/login?tipo=empresa")
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
            {/* HEADER */}
            <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-white">
                <Link href="/" className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold italic ${isEmpresa ? 'bg-indigo-600' : 'bg-primary'}`}>UT</div>
                    <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
                </Link>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    ¿Ya tienes cuenta? <span className={`font-bold ${isEmpresa ? 'text-indigo-600' : 'text-primary'}`}>Inicia sesión</span>
                </Link>
            </header>

            {/* CONTENEDOR PRINCIPAL */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-border/50">

                    {/* ===== TOGGLE ESTUDIANTE / EMPRESA ===== */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex bg-gray-100 rounded-2xl p-1 w-full max-w-sm">
                            <button
                                type="button"
                                onClick={() => setTipoRegistro("estudiante")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    !isEmpresa
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                Estudiante
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoRegistro("empresa")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    isEmpresa
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                Empresa
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${isEmpresa ? 'text-indigo-600' : 'text-primary'}`}>
                            {isEmpresa ? 'Registra tu empresa en Joby' : 'Crea tu cuenta en Joby'}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            {isEmpresa ? (
                                <><Building2 className="w-5 h-5 text-indigo-500" />Publica vacantes y conecta con el talento UT.</>
                            ) : (
                                <><ShieldCheck className="w-5 h-5 text-primary" />Exclusivo con correo institucional UT Chetumal.</>
                            )}
                        </p>
                    </div>

                    {/* STEPPER */}
                    <div className="flex items-center justify-between mb-10 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
                        <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 -z-10 rounded-full transition-all duration-300 ${isEmpresa ? 'bg-indigo-500' : 'bg-primary'}`}
                            style={{ width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}
                        ></div>

                        {PASOS.map((paso) => (
                            <div key={paso.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 
                                    ${pasoActual >= paso.id
                                        ? isEmpresa
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-primary text-primary-foreground border-primary"
                                        : "bg-white text-muted-foreground border-border"}`}>
                                    {pasoActual > paso.id ? <CheckCircle2 className="w-6 h-6" /> : paso.id}
                                </div>
                                <span className={`text-xs font-medium ${pasoActual >= paso.id ? (isEmpresa ? "text-indigo-600" : "text-primary") : "text-muted-foreground"}`}>
                                    {paso.titulo}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ===== FORMULARIO ===== */}
                    <form onSubmit={manejarSubmit} className="space-y-6">

                        {/* PASO 1: CUENTA (Compartido — solo cambia validación de correo) */}
                        {pasoActual === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Datos de acceso</h2>
                                <div className="space-y-2">
                                    <Label htmlFor="correo">{isEmpresa ? 'Correo Electrónico' : 'Correo Institucional'}</Label>
                                    <Input
                                        id="correo"
                                        placeholder={isEmpresa ? "contacto@tuempresa.com" : "usuario@utchetumal.edu.mx"}
                                        {...register("correo")}
                                        className={errors.correo ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.correo && <p className="text-sm text-destructive font-medium">{(errors.correo as any).message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register("password")} />
                                        {errors.password && <p className="text-sm text-destructive font-medium">{(errors.password as any).message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                        <Input id="confirmPassword" type="password" placeholder="Repite tu contraseña" {...register("confirmPassword")} />
                                        {errors.confirmPassword && <p className="text-sm text-destructive font-medium">{(errors.confirmPassword as any).message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== PASOS DE ESTUDIANTE ===== */}
                        {tipoRegistro === "estudiante" && pasoActual === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Identidad Estudiantil</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre(s)</Label>
                                        <Input id="nombre" placeholder="Ej. Diego" {...register("nombre")} />
                                        {errors.nombre && <p className="text-sm text-destructive">{(errors.nombre as any).message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="matricula">Matrícula</Label>
                                        <Input id="matricula" placeholder="Ej. 23000123" {...register("matricula")} />
                                        {errors.matricula && <p className="text-sm text-destructive">{(errors.matricula as any).message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                                        <Input id="apellidoPaterno" placeholder="Ej. Beltran" {...register("apellidoPaterno")} />
                                        {errors.apellidoPaterno && <p className="text-sm text-destructive">{(errors.apellidoPaterno as any).message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellidoMaterno">Apellido Materno (Opcional)</Label>
                                        <Input id="apellidoMaterno" placeholder="Ej. Can" {...register("apellidoMaterno")} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {tipoRegistro === "estudiante" && pasoActual === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Perfil Académico</h2>
                                <div className="space-y-2">
                                    <Label htmlFor="carreraId">Carrera</Label>
                                    <select id="carreraId" {...register("carreraId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <option value="">Selecciona tu carrera...</option>
                                        <option value="1">Ingeniería de Software</option>
                                        <option value="2">Licenciatura en Gastronomía</option>
                                        <option value="3">Ingeniería en Mecatrónica</option>
                                        <option value="4">Licenciatura en Negocios</option>
                                    </select>
                                    {errors.carreraId && <p className="text-sm text-destructive">{(errors.carreraId as any).message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estatus_academico">Estatus Académico</Label>
                                        <select id="estatus_academico" {...register("estatus_academico")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                            <option value="ACTIVO">Estudiante Activo</option>
                                            <option value="EGRESADO">Egresado</option>
                                        </select>
                                    </div>
                                    {estatusSeleccionado === "ACTIVO" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="periodo_academico">Cuatrimestre</Label>
                                            <select id="periodo_academico" {...register("periodo_academico")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                <option value="">Selecciona...</option>
                                                {[...Array(11)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}º Cuatrimestre</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===== PASOS DE EMPRESA ===== */}
                        {tipoRegistro === "empresa" && pasoActual === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Datos de la Empresa</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre_comercial">Nombre Comercial *</Label>
                                        <Input id="nombre_comercial" placeholder="Ej. Hotel Xcaret" {...register("nombre_comercial")} />
                                        {errors.nombre_comercial && <p className="text-sm text-destructive">{(errors.nombre_comercial as any).message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rfc">RFC (Opcional)</Label>
                                        <Input id="rfc" placeholder="Ej. XAXX010101000" {...register("rfc")} className="uppercase" />
                                        {errors.rfc && <p className="text-sm text-destructive">{(errors.rfc as any).message}</p>}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                        Datos del contacto principal (reclutador)
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre(s) *</Label>
                                            <Input id="nombre" placeholder="Ej. María" {...register("nombre")} />
                                            {errors.nombre && <p className="text-sm text-destructive">{(errors.nombre as any).message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cargo_contacto">Cargo *</Label>
                                            <Input id="cargo_contacto" placeholder="Ej. Gerente de RH" {...register("cargo_contacto")} />
                                            {errors.cargo_contacto && <p className="text-sm text-destructive">{(errors.cargo_contacto as any).message}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                                            <Input id="apellidoPaterno" placeholder="Ej. García" {...register("apellidoPaterno")} />
                                            {errors.apellidoPaterno && <p className="text-sm text-destructive">{(errors.apellidoPaterno as any).message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="apellidoMaterno">Apellido Materno (Opcional)</Label>
                                            <Input id="apellidoMaterno" placeholder="Ej. López" {...register("apellidoMaterno")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BOTONES DE NAVEGACIÓN */}
                        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={retrocederPaso}
                                disabled={pasoActual === 1}
                                className={pasoActual === 1 ? "invisible" : ""}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
                            </Button>

                            {pasoActual < PASOS.length ? (
                                <Button
                                    type="button"
                                    onClick={avanzarPaso}
                                    className={`font-bold ${isEmpresa ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                                >
                                    Continuar <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className={`font-bold px-8 ${isEmpresa ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                                >
                                    Finalizar Registro
                                </Button>
                            )}
                        </div>
                    </form>

                </div>
            </main>
        </div>
    )
}