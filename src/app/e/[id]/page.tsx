import { redirect } from "next/navigation";

interface Params {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ vacante?: string }>;
}

export default async function ShortLinkPage({ params, searchParams }: Params) {
    const { id } = await params;
    const { vacante } = await searchParams;
    
    const query = vacante ? `?vacante=${vacante}` : "";
    
    // Redirigir al perfil público completo
    // El id ya viene con el hash ofuscado
    redirect(`/perfil-publico-empresa/${id}${query}`);
}
