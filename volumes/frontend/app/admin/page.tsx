"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Definimos la "forma" de tu usuario para que TypeScript nos ayude
interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Buscamos al usuario en la memoria (localStorage)
    const usuarioGuardado = localStorage.getItem("usuario_bar");

    if (usuarioGuardado) {
      // 2. Si existe, lo convertimos de texto a un objeto real y lo guardamos en el estado
      setUsuario(JSON.parse(usuarioGuardado));
      setCargando(false);
    } else {
      // 3. ¡INTRUSO DETECTADO! Si no hay usuario en memoria, lo mandamos al login
      router.push("/login");
    }
  }, [router]);

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario_bar"); // Borramos la memoria
    router.push("/login"); // Lo mandamos afuera
  };

  // Mientras verificamos la memoria, mostramos una pantalla de carga
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="animate-pulse text-xl font-light">
          Cargando tu espacio...
        </p>
      </div>
    );
  }

  // ¡La pantalla real del Dashboard!
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Barra de navegación superior */}
      <header className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <p className="text-gray-400 mt-1">
            Bienvenido de vuelta,{" "}
            <span className="text-blue-400 font-semibold">
              {usuario?.nombre_completo}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{usuario?.email}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {usuario?.rol}
            </p>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido del Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-40 flex items-center justify-center">
          <p className="text-gray-500">Módulo de Ventas (Próximamente)</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-40 flex items-center justify-center">
          <p className="text-gray-500">Módulo de Inventario (Próximamente)</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-40 flex items-center justify-center">
          <p className="text-gray-500">Módulo de Personal (Próximamente)</p>
        </div>
      </div>
    </div>
  );
}
