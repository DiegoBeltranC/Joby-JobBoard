"use client"

import { useEffect, useRef, Suspense } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

function AlertsInterceptorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const shownRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const errorType = searchParams.get("error");
        if (!errorType || shownRef.current.has(errorType)) return;
        shownRef.current.add(errorType);

        if (errorType === "locked") {
            toast.error("Edición Bloqueada", {
                id: "edicion-bloqueada",
                description: "Tu perfil empresarial se encuentra bajo revisión o restricción y no puede ser editado."
            });
        }
        router.replace("/empresa/inicio", { scroll: false });
    }, [searchParams, router]);

    return null;
}

export default function AlertsInterceptor() {
    return (
        <Suspense fallback={null}>
            <AlertsInterceptorContent />
        </Suspense>
    )
}
