import { redirect } from "next/navigation"
import OTPClient from "./OTPClient"

interface PageProps {
    searchParams: Promise<{
        email?: string
        redirect?: string
    }>
}

export default async function VerificarCorreoPage({ searchParams }: PageProps) {
    // Si no trae correo, posiblemente se metió a la URL a la fuerza
    const params = await searchParams;
    
    if (!params?.email) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <OTPClient email={params.email} redirect={params.redirect} />
        </div>
    )
}
