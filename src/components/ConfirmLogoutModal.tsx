"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmLogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmLogoutModal({ isOpen, onClose, onConfirm }: ConfirmLogoutModalProps) {
    if (!isOpen || typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Cerrar sesión?</h3>
                <p className="text-sm text-gray-500 mb-6">Tendrás que volver a ingresar tus credenciales para acceder a tu cuenta.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                    >
                        Sí, cerrar sesión
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export function useLogoutModal() {
    const [isOpen, setIsOpen] = useState(false);
    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        modal: (onConfirm: () => void) => (
            <ConfirmLogoutModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={onConfirm} />
        ),
    };
}

export function MobileCloseButton({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="md:hidden float-right text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}

export function LogoutButton({ onClick, icon: Icon }: { onClick: () => void; icon?: React.ComponentType<{ className?: string }> }) {
    return (
        <button onClick={onClick} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
            {Icon ? (
                <Icon className="w-5 h-5" />
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            )}
            Cerrar sesión
        </button>
    );
}
