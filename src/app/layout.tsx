import type { Metadata } from "next";
import { Inter } from "next/font/google"; // O la fuente que estés usando
import "./globals.css";
// 1. IMPORTAMOS EL TOASTER
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joby - UT Chetumal",
  description: "Bolsa de trabajo para estudiantes de la UT Chetumal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        {/* 2. AGREGAMOS EL TOASTER AQUÍ */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
