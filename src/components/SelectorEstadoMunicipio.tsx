"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { listaEstados, getMunicipios } from "@/lib/ubicacionesMexico";

interface SelectorEstadoMunicipioProps {
    estado: string;
    municipio: string;
    /** Se invoca al elegir un estado (el municipio se reinicia automáticamente). */
    onEstadoChange: (estado: string) => void;
    onMunicipioChange: (municipio: string) => void;
    /** Mensaje de error opcional; si se pasa, marca el borde en rojo y muestra el texto. */
    errorEstado?: string;
    errorMunicipio?: string;
}

/**
 * Selector combinado Estado + Municipio (catálogo de México) con búsqueda.
 * Extraído del patrón duplicado en los formularios de perfil (estudiante/empresa).
 */
export default function SelectorEstadoMunicipio({
    estado,
    municipio,
    onEstadoChange,
    onMunicipioChange,
    errorEstado,
    errorMunicipio,
}: SelectorEstadoMunicipioProps) {
    const [openEstado, setOpenEstado] = React.useState(false);
    const [openMunicipio, setOpenMunicipio] = React.useState(false);

    const municipiosDisponibles = getMunicipios(estado);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ESTADO */}
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Estado *</label>
                <Popover open={openEstado} onOpenChange={setOpenEstado}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openEstado} className={cn("w-full justify-between bg-white font-normal", !estado && "text-muted-foreground", errorEstado && "border-red-500")}>
                            {estado || "Buscar estado..."} <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0"><Command><CommandInput placeholder="Escribe tu estado..." /><CommandList><CommandEmpty>No se encontró el estado.</CommandEmpty><CommandGroup>
                        {listaEstados.map((e) => (<CommandItem key={e} value={e} onSelect={(v) => { const estadoReal = listaEstados.find((x) => x.toLowerCase() === v.toLowerCase()); onEstadoChange(estadoReal || ""); onMunicipioChange(""); setOpenEstado(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", estado === e ? "opacity-100" : "opacity-0")} /> {e}
                        </CommandItem>))}
                    </CommandGroup></CommandList></Command></PopoverContent>
                </Popover>
                {errorEstado && <p className="text-xs text-red-500">{errorEstado}</p>}
            </div>

            {/* MUNICIPIO */}
            <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Municipio *</label>
                <Popover open={openMunicipio} onOpenChange={setOpenMunicipio}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openMunicipio} disabled={!estado} className={cn("w-full justify-between bg-white font-normal", !municipio && "text-muted-foreground", !estado && "bg-gray-100", errorMunicipio && "border-red-500")}>
                            {municipio || (estado ? "Buscar municipio..." : "Primero elige un estado")} <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0"><Command><CommandInput placeholder="Escribe tu municipio..." /><CommandList><CommandEmpty>No se encontró el municipio.</CommandEmpty><CommandGroup>
                        {municipiosDisponibles.map((mun) => (<CommandItem key={mun} value={mun} onSelect={(v) => { const munReal = municipiosDisponibles.find((m) => m.toLowerCase() === v.toLowerCase()); onMunicipioChange(munReal || ""); setOpenMunicipio(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", municipio === mun ? "opacity-100" : "opacity-0")} /> {mun}
                        </CommandItem>))}
                    </CommandGroup></CommandList></Command></PopoverContent>
                </Popover>
                {errorMunicipio && <p className="text-xs text-red-500">{errorMunicipio}</p>}
            </div>
        </div>
    );
}
