"use client"

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function AlertsInterceptor() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const errorType = searchParams.get("error");
        
        if (errorType === "locked") {
            toast.error("Edición Bloqueada", {
                description: "Tu perfil empresarial se encuentra bajo revisión o restricción y no puede ser editado."
            });
            // Opcional: Limpiar la URL sin recargar
            router.replace("/empresa/inicio", { scroll: false });
        }
    }, [searchParams, router]);

    return null;
}
