"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, ChevronRight, ArrowLeft, ShieldCheck } from "lucide-react"
import { registrarEstudiante } from "@/actions/registro"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
// Si usas un toast para notificaciones, impórtalo aquí también

// 1. ESQUEMA DE VALIDACIÓN (ZOD) - El guardia de seguridad
const registroSchema = z.object({
    correo: z.string()
        .trim() // Elimina espacios fantasma
        .toLowerCase() // Todo a minúsculas
        .email("Correo inválido")
        .endsWith("@utchetumal.edu.mx", "Obligatorio: Usa tu correo institucional"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),

    nombre: z.string().trim().min(2, "Tu nombre es requerido"),
    apellidoPaterno: z.string().trim().min(2, "Tu apellido paterno es requerido"),
    apellidoMaterno: z.string().trim().optional(),
    matricula: z.string().trim().regex(/^\d{10}$/, "La matrícula debe tener exactamente 10 números"),

    carreraId: z.string().min(1, "Selecciona tu carrera"),
    estatus_academico: z.enum(["ACTIVO", "EGRESADO"], { required_error: "Selecciona tu estatus" }),
    periodo_academico: z.string().optional(),
}).superRefine((data, ctx) => {
    // 1. Validación de contraseñas
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Las contraseñas no coinciden",
            path: ["confirmPassword"],
        })
    }
    // 2. Validación de cuatrimestre condicional
    if (data.estatus_academico === "ACTIVO" && !data.periodo_academico) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selecciona en qué cuatrimestre estás",
            path: ["periodo_academico"],
        })
    }
})

type RegistroFormValues = z.infer<typeof registroSchema>

// 2. CONFIGURACIÓN DE LOS PASOS
const PASOS = [
    { id: 1, titulo: "Cuenta", campos: ["correo", "password", "confirmPassword"] },
    { id: 2, titulo: "Identidad", campos: ["nombre", "apellidoPaterno", "apellidoMaterno", "matricula"] },
    { id: 3, titulo: "Academia", campos: ["carreraId", "estatus_academico", "periodo_academico"] },
]

export default function RegistroPage() {
    const [pasoActual, setPasoActual] = useState(1)
    const router = useRouter()

    // Inicializamos React Hook Form con Zod
    const { register, handleSubmit, trigger, formState: { errors }, watch, getValues, setError } = useForm<RegistroFormValues>({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            estatus_academico: "ACTIVO",
        }
    })

    // Observamos el estatus para saber si mostramos el campo de Cuatrimestre
    const estatusSeleccionado = watch("estatus_academico")

    // Función para avanzar de paso asegurando que los campos actuales sean válidos
    // Función mejorada para avanzar de paso
    const avanzarPaso = async () => {
        const camposDelPaso = PASOS[pasoActual - 1].campos as (keyof RegistroFormValues)[]
        const pasoValido = await trigger(camposDelPaso)

        if (pasoValido) {
            // FIX: Validación manual exclusiva para el Paso 1 (Contraseñas)
            if (pasoActual === 1) {
                const { password, confirmPassword } = getValues()
                if (password !== confirmPassword) {
                    setError("confirmPassword", {
                        type: "manual",
                        message: "Las contraseñas no coinciden"
                    })
                    return // 🛑 Detiene la función y no deja avanzar al paso 2
                }
            }

            // Si todo está bien, pasamos al siguiente paso
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
            await handleSubmit(onSubmit)(e)
        }
    }

    // Se ejecuta al finalizar el paso 3
    const onSubmit = async (data: RegistroFormValues) => {
        // 1. Mostramos un toast de carga que se queda dando vueltas
        const idCarga = toast.loading("Creando tu cuenta en Joby...")

        // 2. Ejecutamos el Server Action
        const respuesta = await registrarEstudiante(data)

        // 3. Si falla, quitamos el loader y mostramos el error
        if (!respuesta.success) {
            toast.dismiss(idCarga)
            toast.error("Hubo un problema", {
                description: respuesta.error
            })
            return
        }

        // 4. Si es exitoso, quitamos el loader, mostramos confeti/éxito y redirigimos
        toast.dismiss(idCarga)
        toast.success("¡Bienvenido a Joby!", {
            description: "Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión."
        })

        // Redirigimos suavemente al login
        router.push("/login")
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
            {/* HEADER SIMPLE */}
            <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-white">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold italic">UT</div>
                    <span className="font-bold text-xl tracking-tight text-foreground">Joby</span>
                </Link>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    ¿Ya tienes cuenta? <span className="text-primary font-bold">Inicia sesión</span>
                </Link>
            </header>

            {/* CONTENEDOR PRINCIPAL */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-border/50">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-primary mb-2">Crea tu cuenta en Joby</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Exclusivo con correo institucional UT Chetumal.
                        </p>
                    </div>

                    {/* INDICADOR DE PASOS (STEPPER) */}
                    <div className="flex items-center justify-between mb-10 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
                            style={{ width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}
                        ></div>

                        {PASOS.map((paso) => (
                            <div key={paso.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 
                  ${pasoActual >= paso.id
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-white text-muted-foreground border-border"}`}>
                                    {pasoActual > paso.id ? <CheckCircle2 className="w-6 h-6" /> : paso.id}
                                </div>
                                <span className={`text-xs font-medium ${pasoActual >= paso.id ? "text-primary" : "text-muted-foreground"}`}>
                                    {paso.titulo}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={manejarSubmit} className="space-y-6">

                        {/* PASO 1: CUENTA */}
                        {pasoActual === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Datos de acceso</h2>
                                <div className="space-y-2">
                                    <Label htmlFor="correo">Correo Institucional</Label>
                                    <Input
                                        id="correo"
                                        placeholder="usuario@utchetumal.edu.mx"
                                        {...register("correo")}
                                        className={errors.correo ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.correo && <p className="text-sm text-destructive font-medium">{errors.correo.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Mínimo 8 caracteres"
                                            {...register("password")}
                                        />
                                        {errors.password && <p className="text-sm text-destructive font-medium">{errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Repite tu contraseña"
                                            {...register("confirmPassword")}
                                        />
                                        {errors.confirmPassword && <p className="text-sm text-destructive font-medium">{errors.confirmPassword.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 2: IDENTIDAD */}
                        {pasoActual === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Identidad Estudiantil</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre(s)</Label>
                                        <Input id="nombre" placeholder="Ej. Diego" {...register("nombre")} />
                                        {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="matricula">Matrícula</Label>
                                        <Input id="matricula" placeholder="Ej. 23000123" {...register("matricula")} />
                                        {errors.matricula && <p className="text-sm text-destructive">{errors.matricula.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                                        <Input id="apellidoPaterno" placeholder="Ej. Beltran" {...register("apellidoPaterno")} />
                                        {errors.apellidoPaterno && <p className="text-sm text-destructive">{errors.apellidoPaterno.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellidoMaterno">Apellido Materno (Opcional)</Label>
                                        <Input id="apellidoMaterno" placeholder="Ej. Can" {...register("apellidoMaterno")} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 3: ACADEMIA */}
                        {pasoActual === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-6">Perfil Académico</h2>

                                <div className="space-y-2">
                                    <Label htmlFor="carreraId">Carrera</Label>
                                    <select
                                        id="carreraId"
                                        {...register("carreraId")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Selecciona tu carrera...</option>
                                        <option value="1">Ingeniería de Software</option>
                                        <option value="2">Licenciatura en Gastronomía</option>
                                        <option value="3">Ingeniería en Mecatrónica</option>
                                        <option value="4">Licenciatura en Negocios</option>
                                    </select>
                                    {errors.carreraId && <p className="text-sm text-destructive">{errors.carreraId.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estatus_academico">Estatus Académico</Label>
                                        <select
                                            id="estatus_academico"
                                            {...register("estatus_academico")}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="ACTIVO">Estudiante Activo</option>
                                            <option value="EGRESADO">Egresado</option>
                                        </select>
                                    </div>

                                    {/* Se oculta si es Egresado */}
                                    {estatusSeleccionado === "ACTIVO" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="periodo_academico">Cuatrimestre</Label>
                                            <select
                                                id="periodo_academico"
                                                {...register("periodo_academico")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
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
                                <Button type="button" onClick={avanzarPaso} className="font-bold">
                                    Continuar <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-8">
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