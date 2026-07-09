import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import OTPClient from "./OTPClient"
import { prisma } from "@/lib/prisma"

interface PageProps {
    searchParams: Promise<{
        email?: string
        redirect?: string
        status?: string
    }>
}

function getCooldownDuration(attempts: number): number {
  switch (attempts) {
    case 0: return 60 * 1000      // 1 minuto
    case 1: return 5 * 60 * 1000  // 5 minutos
    case 2: return 15 * 60 * 1000 // 15 minutos
    case 3: return 60 * 60 * 1000 // 1 hora
    default: return -1            // Bloqueado por completo
  }
}

export default async function VerificarCorreoPage({ searchParams }: PageProps) {
    const params = await searchParams;
    let email = params?.email;

    if (!email) {
        const cookieStore = await cookies();
        email = cookieStore.get("registro_pendiente")?.value;
    }
    
    if (!email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { correo: email },
        select: { ultimo_reenvio_at: true, intentos_reenvio: true, verifiedAt: true }
    });

    // SEGURIDAD: Si no existe el usuario o ya está verificado, no debe ver esta pantalla.
    if (!user || user.verifiedAt) {
        redirect("/login")
    }

    // Consultar el cooldown restante real en la base de datos
    let initialCooldown = 0;
    let isBlocked = false;

    const cooldownMs = getCooldownDuration(user.intentos_reenvio);
    if (cooldownMs === -1) {
        isBlocked = true;
    } else if (user.ultimo_reenvio_at) {
        const msSinceLastSend = Date.now() - user.ultimo_reenvio_at.getTime();
        if (msSinceLastSend < cooldownMs) {
            initialCooldown = Math.max(0, Math.ceil((cooldownMs - msSinceLastSend) / 1000));
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <OTPClient 
                email={email} 
                redirect={params.redirect} 
                initialCooldown={initialCooldown}
                isInitiallyBlocked={isBlocked}
                status={params.status}
            />
        </div>
    )
}

