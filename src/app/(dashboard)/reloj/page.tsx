"use client";

import { useState } from "react";
import { vincularRelojAction } from "@/actions/smartwatch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VincularRelojPage() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await vincularRelojAction(codigo.trim());
    
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setCodigo("");
    } else {
      setError(res.error || "Ocurrió un error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Vincular Smartwatch</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Ingresa el código de 6 dígitos que aparece en la pantalla de tu reloj.
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 text-center">
          <h3 className="font-semibold text-lg mb-1">¡Vinculado con éxito!</h3>
          <p className="text-sm">
            Tu reloj ya está sincronizado. Deberías ver tu código QR en la pantalla del smartwatch en unos segundos.
          </p>
          <Button 
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setSuccess(false)}
          >
            Vincular otro dispositivo
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej. 123456"
              maxLength={6}
              className="text-center text-3xl tracking-widest h-16 font-mono"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-teal-700 hover:bg-teal-800 text-white" 
            disabled={loading || codigo.length !== 6}
          >
            {loading ? "Vinculando..." : "Vincular Reloj"}
          </Button>
        </form>
      )}
    </div>
  );
}
