"use client"

import { useState, useRef, useTransition } from "react"
import { CheckCircle2, AlertTriangle, XCircle, MessagesSquare, CheckCircle, ShieldAlert, MailWarning, Ban } from "lucide-react"
import { aprobarEmpresa, rechazarEmpresa, solicitarCorreccion, suspenderEmpresa, reactivarEmpresa } from "@/actions/adminEmpresas"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function RevisionWizardClient({ empresa, enlaces }: { empresa: any, enlaces: Record<string, string> }) {
    const [tabActivo, setTabActivo] = useState(1);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const procesandoRef = useRef(false);

    // Estados para modales
    const [modalCorreccion, setModalCorreccion] = useState(false);
    const [modalRechazo, setModalRechazo] = useState(false);
    const [modalSuspension, setModalSuspension] = useState(false);
    const [modalAprobar, setModalAprobar] = useState(false);
    const [modalReactivar, setModalReactivar] = useState(false);
    const [loading, setLoading] = useState(false);

    const isProcessing = loading || isPending;

    // Forms
    const [asunto, setAsunto] = useState("");
    const [mensaje, setMensaje] = useState("");

    const tabsDef = [
        { id: 1, label: "Info General", completed: !!empresa.descripcion && !!empresa.nombre_comercial },
        { id: 2, label: "Docs Legales", completed: !!empresa.rfc && !!empresa.razon_social },
        { id: 3, label: "Reclutador", completed: !!empresa.nombre && !!empresa.telefono_contacto }
    ];

    // Funciones Actions
    const handleAprobar = () => {
        if (procesandoRef.current || isPending) return;
        procesandoRef.current = true;
        startTransition(async () => {
            setLoading(true);
            const loadId = toast.loading("Aprobando empresa...");
            const result = await aprobarEmpresa(empresa.id);

            if (result?.error) toast.error(result.error);
            else {
                toast.success("Empresa Aprobada Exitosamente");
                setModalAprobar(false);
                router.refresh();
            }
            toast.dismiss(loadId);
            setLoading(false);
            procesandoRef.current = false;
        });
    };

    const handleCorreccion = () => {
        if (!asunto || !mensaje) return toast.error("Por favor llena todos los campos del correo");
        if (procesandoRef.current || isPending) return;
        procesandoRef.current = true;
        startTransition(async () => {
            setLoading(true);
            const loadId = toast.loading("Enviando solicitud de corrección...");
            const result = await solicitarCorreccion(empresa.id, asunto, mensaje);

            if (result?.error) toast.error(result.error);
            else {
                toast.success("Correo enviado. Estatus cambiado a REQUIERE CAMBIOS.");
                setModalCorreccion(false);
                setMensaje(""); setAsunto("");
                router.refresh();
            }
            toast.dismiss(loadId);
            setLoading(false);
            procesandoRef.current = false;
        });
    };

    const handleRechazar = () => {
        if (!mensaje) return toast.error("El motivo de rechazo es obligatorio para el expediente.");
        if (procesandoRef.current || isPending) return;
        procesandoRef.current = true;
        startTransition(async () => {
            setLoading(true);
            const loadId = toast.loading("Rechazando empresa...");
            const result = await rechazarEmpresa(empresa.id, mensaje);

            if (result?.error) toast.error(result.error);
            else {
                toast.success("Empresa rechazada definitivamente.");
                setModalRechazo(false);
                setMensaje("");
                router.refresh();
            }
            toast.dismiss(loadId);
            setLoading(false);
            procesandoRef.current = false;
        });
    };

    const handleSuspender = () => {
        if (!mensaje) return toast.error("El motivo de suspensión es obligatorio.");
        if (procesandoRef.current || isPending) return;
        procesandoRef.current = true;
        startTransition(async () => {
            setLoading(true);
            const loadId = toast.loading("Suspendiendo cuenta...");
            const result = await suspenderEmpresa(empresa.id, mensaje);
            if (result?.error) toast.error(result.error);
            else {
                toast.success("Empresa Suspendida");
                setModalSuspension(false);
                setMensaje("");
                router.refresh();
            }
            toast.dismiss(loadId);
            setLoading(false);
            procesandoRef.current = false;
        });
    };

    const handleReactivar = () => {
        if (procesandoRef.current || isPending) return;
        procesandoRef.current = true;
        startTransition(async () => {
            setLoading(true);
            const loadId = toast.loading("Reactivando proceso...");
            const result = await reactivarEmpresa(empresa.id);
            if (result?.error) toast.error(result?.error);
            else {
                toast.success("Empresa de nuevo en revisión");
                setModalReactivar(false);
                router.refresh();
            }
            toast.dismiss(loadId);
            setLoading(false);
            procesandoRef.current = false;
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Columna Principal: Wizard */}
            <div className="flex-1 space-y-6">
                
                {/* Cabecera Wizard (Tabs Nav) */}
                <div className="bg-white p-2 flex flex-wrap lg:flex-nowrap items-center gap-2 rounded-2xl border border-gray-100 shadow-sm">
                    {tabsDef.map((tab, idx) => (
                        <div key={tab.id} className="flex items-center flex-1">
                            <button
                                onClick={() => setTabActivo(tab.id)}
                                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                                    tabActivo === tab.id 
                                        ? "bg-primary text-white shadow-sm shadow-primary/20" 
                                        : "bg-transparent text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${tabActivo === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    {tab.id}
                                </span>
                                {tab.label}
                                {tab.completed && tabActivo !== tab.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1" />}
                            </button>
                            {idx < tabsDef.length - 1 && <div className="hidden lg:block w-4 border-t-2 border-dashed border-gray-200 mx-2"></div>}
                        </div>
                    ))}
                </div>

                {/* Contenido Visual del Tab Actual */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
                    {tabActivo === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                           <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Información Pública Visual</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div>
                                   <p className="text-sm text-gray-400 mb-1">Nombre Comercial</p>
                                   <p className="font-semibold text-gray-800 text-lg">{empresa.nombre_comercial}</p>
                                   
                                   <p className="text-sm text-gray-400 mb-1 mt-6">Sitio Web</p>
                                   <p className="font-semibold text-gray-800">{empresa.sitio_web ? <a href={empresa.sitio_web || ''} target="_blank" className="text-indigo-600 hover:underline">{empresa.sitio_web}</a> : "N/A"}</p>
                                   
                                   <p className="text-sm text-gray-400 mb-1 mt-6">Enlaces de Referencia</p>
                                   <div className="flex gap-2 mt-2">
                                        {enlaces.linkedin && <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-bold">LinkedIn</span>}
                                        {enlaces.facebook && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold">Facebook</span>}
                                        {!enlaces.linkedin && !enlaces.facebook && <span className="text-sm italic text-gray-400">Sin enlaces extra</span>}
                                   </div>
                               </div>
                               <div>
                                   <p className="text-sm text-gray-400 mb-2">Descripción General</p>
                                   <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed shadow-inner border border-gray-100">
                                       {empresa.descripcion || <span className="italic text-gray-400">No ha provisto descripción.</span>}
                                   </div>
                               </div>

                               {/* Galería de Fotografías */}
                               {empresa.fotos_empresa && empresa.fotos_empresa.length > 0 && (
                                   <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                                       <p className="text-sm text-gray-400 mb-4 font-bold flex items-center gap-2">Galería Fotográfica Instalaciones</p>
                                       <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                           {empresa.fotos_empresa.map((fotoUrl: string, idx: number) => (
                                               <img key={idx} src={fotoUrl} alt={`Foto Galería ${idx+1}`} className="w-56 h-40 object-cover rounded-2xl border border-gray-200 shadow-sm shrink-0" />
                                           ))}
                                       </div>
                                   </div>
                               )}
                           </div>
                        </div>
                    )}

                    {tabActivo === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                           <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Documentación Fiscal y Legal</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div>
                                   <p className="text-sm text-gray-400 mb-1">Razón Social</p>
                                   <p className="font-semibold text-gray-800 text-lg">{empresa.razon_social || "PENDIENTE"}</p>
                                   
                                   <p className="text-sm text-gray-400 mb-1 mt-6">RFC Registrado</p>
                                   <div className="inline-block px-3 py-1 bg-gray-900 text-white font-mono rounded-lg tracking-wider text-sm shadow-sm">
                                       {empresa.rfc || "PENDIENTE"}
                                   </div>
                               </div>
                               <div>
                                   <p className="text-sm text-gray-400 mb-1">Ubicación Física</p>
                                   <p className="font-semibold text-gray-800">{empresa.municipio}, {empresa.estado}</p>
                               </div>
                           </div>
                        </div>
                    )}

                    {tabActivo === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                           <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Datos del Reclutador (Gestor de Cuenta)</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div>
                                   <p className="text-sm text-gray-400 mb-1">Nombre y Apellidos</p>
                                   <p className="font-semibold text-gray-800 text-lg">{empresa.nombre} {empresa.apellidoPaterno} {empresa.apellidoMaterno}</p>
                                   
                                   <p className="text-sm text-gray-400 mb-1 mt-6">Cargo / Puesto</p>
                                   <p className="font-medium text-gray-600 bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg inline-block">{empresa.cargo_contacto || "No especificado"}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-gray-400 mb-1">Teléfono Directo</p>
                                   <p className="font-semibold text-gray-800">{empresa.telefono_contacto || "Oculto"}</p>

                                   <p className="text-sm text-gray-400 mb-1 mt-6">Correo de Contacto</p>
                                   <p className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 py-1.5 px-3 rounded-lg inline-block">
                                        {empresa.usuario?.correo || "No provisto"}
                                   </p>
                               </div>
                           </div>
                        </div>
                    )}
                </div>

                {/* Acciones de Revisión */}
                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <h3 className="text-gray-900 font-bold mb-1">Dictaminar Empresa</h3>
                        <p className="text-gray-500 text-xs">Selecciona el veredicto para habilitar la cuenta.</p>
                    </div>
                    
                    <div className="flex gap-3">
                        {(empresa.estatus_verificacion === "RECHAZADA" || empresa.estatus_verificacion === "SUSPENDIDA") && (
                            <button
                                onClick={() => setModalReactivar(true)} disabled={loading}
                                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Activar de Nuevo
                            </button>
                        )}

                        {empresa.estatus_verificacion === "APROBADA" && (
                            <>
                                <button
                                    onClick={() => {
                                        setAsunto(""); setMensaje("");
                                        setModalCorreccion(true);
                                    }} disabled={loading}
                                    className="px-6 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl transition text-sm flex items-center gap-2 border border-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Requiere Cambios
                                </button>
                                <button
                                    onClick={() => { setMensaje(""); setModalSuspension(true); }} disabled={loading}
                                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold rounded-xl transition text-sm flex items-center gap-2 border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Ban className="w-4 h-4" /> Suspender
                                </button>
                            </>
                        )}

                        {empresa.estatus_verificacion !== "RECHAZADA" &&
                         empresa.estatus_verificacion !== "SUSPENDIDA" &&
                         empresa.estatus_verificacion !== "APROBADA" && (
                            <>
                                <button
                                    onClick={() => {
                                        setAsunto(""); setMensaje("");
                                        setModalCorreccion(true);
                                    }} disabled={loading}
                                    className="px-6 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl transition text-sm flex items-center gap-2 border border-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Prevenir / Regresar
                                </button>

                                <button
                                    onClick={() => {
                                        setMensaje("");
                                        setModalRechazo(true);
                                    }} disabled={loading}
                                    className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition text-sm flex items-center gap-2 border border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rechazar
                                </button>

                                <button
                                    onClick={() => setModalAprobar(true)} disabled={loading}
                                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Aprobar
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* Columna Lateral: Historial Comunicación */}
            <div className="w-full lg:w-96 shrink-0">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24 h-[calc(100vh-120px)] flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <MessagesSquare className="w-5 h-5 text-primary" />
                        Historial de Ping-Pong
                    </h3>
                    <p className="text-xs text-gray-400 mb-6">Registro de correos y avisos emitidos.</p>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {empresa.comunicaciones.length === 0 ? (
                            <div className="text-center text-sm text-gray-400 py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                Sin comunicaciones registradas aún.
                            </div>
                        ) : (
                            empresa.comunicaciones.map((com: any) => (
                                <div key={com.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 relative pt-7">
                                    <span className={`absolute top-0 right-0 rounded-bl-xl rounded-tr-xl px-2 py-1 text-[9px] font-black tracking-wider uppercase
                                        ${com.tipo === "CORRECCION_DATOS" ? "bg-orange-100 text-orange-700" :
                                          com.tipo === "RECHAZO" ? "bg-red-100 text-red-700" :
                                          com.tipo === "SUSPENSION" ? "bg-gray-800 text-white" :
                                          "bg-primary/10 text-primary"}
                                    `}>
                                        {com.tipo.replace("_", " ")}
                                    </span>
                                    <p className="font-bold text-gray-800 text-sm mb-1 leading-tight">{com.asunto}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{com.mensaje}</p>

                                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">{com.admin.nombre.charAt(0)}</div>
                                            {com.admin.nombre}
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                            {new Date(com.createdAt).toLocaleDateString('es-MX', {day:'2-digit', month:'short'})}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL SOLICITAR CORRECCIÓN */}
            {modalCorreccion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 px-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner mx-auto">
                            <MailWarning className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-center text-gray-900 mb-2">Solicitar Correcciones</h2>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Se enviará un correo a la empresa detallando qué datos legales o generales están mal. La empresa no será aprobada hasta que responda.
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Asunto del Correo</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition"
                                    placeholder="Ej. Revisión de Documentación Legal UTCH"
                                    value={asunto} onChange={(e)=>setAsunto(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Cuerpo del Correo (Observaciones)</label>
                                <textarea 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none min-h-[120px] resize-none transition"
                                    placeholder="Estimado equipo de recursos humanos, hemos notado que su RFC no coincide con la Razón Social colocada..."
                                    value={mensaje} onChange={(e)=>setMensaje(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setModalCorreccion(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition disabled:opacity-50" disabled={isProcessing}>
                                Cancelar
                            </button>
                            <button onClick={handleCorreccion} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-sm shadow-orange-200 disabled:opacity-50" disabled={isProcessing}>
                                {isProcessing ? "Enviando..." : "Enviar Correo y Avisar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RECHAZO DEFINITIVO */}
            {modalRechazo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 px-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="absolute top-0 right-10 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                        <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner mx-auto relative z-10">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-center text-gray-900 mb-2 relative z-10">Rechazo Definitivo</h2>
                        <p className="text-gray-500 text-sm text-center mb-6 relative z-10">
                            ¿Por qué detienes el proceso de esta empresa? Este será el veredicto final.
                        </p>
                        
                        <div className="mb-8 relative z-10">
                            <textarea 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none min-h-[120px] resize-none transition"
                                placeholder="Motivo administrativo del rechazo..."
                                value={mensaje} onChange={(e)=>setMensaje(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => setModalRechazo(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition disabled:opacity-50" disabled={isProcessing}>
                                Cancelar
                            </button>
                            <button onClick={handleRechazar} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm shadow-red-200 disabled:opacity-50" disabled={isProcessing}>
                                {isProcessing ? "Procesando..." : "Confirmar Rechazo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUSPENSION */}
            {modalSuspension && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 px-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="absolute top-0 left-10 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                        <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-2xl mb-6 mx-auto relative z-10">
                            <Ban className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-center text-gray-900 mb-2 relative z-10">Suspender Empresa</h2>
                        <p className="text-gray-500 text-sm text-center mb-6 relative z-10">
                            Esta empresa perderá su acceso público y todas sus vacantes activas pasarán a ocultas inmediatamente.
                        </p>
                        
                        <div className="mb-8 relative z-10">
                            <textarea 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none min-h-[120px] resize-none transition placeholder:text-gray-400"
                                placeholder="Escribe el motivo detallado de la suspensión..."
                                value={mensaje} onChange={(e)=>setMensaje(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => setModalSuspension(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition disabled:opacity-50" disabled={isProcessing}>
                                Cancelar
                            </button>
                            <button onClick={handleSuspender} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm shadow-red-200 disabled:opacity-50" disabled={isProcessing}>
                                {isProcessing ? "Suspendiendo..." : "Confirmar Suspensión"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL APROBAR */}
            {modalAprobar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 px-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="absolute top-0 right-10 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl mb-6 shadow-inner mx-auto relative z-10">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-center text-gray-900 mb-2 relative z-10">Aprobar Empresa</h2>
                        <p className="text-gray-500 text-sm text-center mb-8 relative z-10">
                            ¿Seguro que deseas aprobar esta empresa? Su información será pública, aparecerá verificada y podrá subir vacantes de empleo inmediatamente a la plataforma.
                        </p>
                        
                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => setModalAprobar(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition disabled:opacity-50" disabled={isProcessing}>
                                Cancelar
                            </button>
                            <button onClick={handleAprobar} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm shadow-emerald-200 disabled:opacity-50" disabled={isProcessing}>
                                {isProcessing ? "Procesando..." : "Confirmar Aprobación"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REACTIVAR */}
            {modalReactivar && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 px-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="absolute top-0 right-10 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl mb-6 mx-auto relative z-10">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-center text-gray-900 mb-2 relative z-10">Reactivar a PENDIENTE</h2>
                        <p className="text-gray-500 text-sm text-center mb-8 relative z-10">
                            ¿Seguro que deseas reactivar este expediente? La empresa regresará al estatus "En revisión" (PENDIENTE) donde podrá ser reevaluada. Sus vacantes permanecerán ocultas hasta ser aprobada de nuevo.
                        </p>
                        
                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => setModalReactivar(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition disabled:opacity-50" disabled={isProcessing}>
                                Cancelar
                            </button>
                            <button onClick={handleReactivar} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm shadow-blue-200 disabled:opacity-50" disabled={isProcessing}>
                                {isProcessing ? "Procesando..." : "Confirmar Reactivación"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
