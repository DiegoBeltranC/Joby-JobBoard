import { redirect } from "next/navigation";

export default async function ShortLinkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Redirigir al perfil público completo
    // El id ya viene con el hash ofuscado
    redirect(`/perfil-publico-empresa/${id}`);
}
