"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    variant?: "default" | "premium";
}

export default function ShareButton({ title, text, url, variant = "default" }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;

        // Intentar compartir nativamente (Móvil)
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                return;
            } catch (error) {
                // Si falla o cancela, dejamos que siga al copiado al portapapeles
            }
        }

        // Fallback: copiar al portapapeles (Robusto)
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shareUrl);
                exitoCopiado();
            } else {
                throw new Error('Clipboard API no disponible');
            }
        } catch (err) {
            // Fallback Legacy (textarea invisible)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
                exitoCopiado();
            } catch (fallbackErr) {
                toast.error("No se pudo copiar el enlace automáticamente");
            }
        }
    };

    const exitoCopiado = () => {
        setCopied(true);
        toast.success("Enlace seguro copiado");
        setTimeout(() => setCopied(false), 2000);
    };

    if (variant === "premium") {
        return (
            <button
                onClick={handleShare}
                className="flex items-center gap-3 px-8 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-black rounded-full transition-all border border-teal-500/30 backdrop-blur-md group shadow-lg shadow-teal-900/20"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-teal-400" />
                ) : (
                    <Share2 className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                )}
                Compartir
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all border border-gray-200 group"
        >
            {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
            ) : (
                <Share2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            )}
            Compartir
        </button>
    );
}
