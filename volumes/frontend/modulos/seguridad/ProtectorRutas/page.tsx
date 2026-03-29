// Archivo: src/modulos/seguridad/ProtectorRutas.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectorRutas({
  children,
  rolesPermitidos,
}: {
  children: React.ReactNode;
  rolesPermitidos: string[];
}) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const usrStr = localStorage.getItem("usuario_bar");

    // 1. Si no hay nadie logueado, patada al login
    if (!usrStr) {
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(usrStr);

    // 2. Verificamos si su rol está en la lista de invitados VIP de esta ruta
    if (!rolesPermitidos.includes(usuario.rol)) {
      // Si es un intruso, lo mandamos a su área de trabajo correspondiente
      if (usuario.rol === "Administrador") {
        router.push("/admin");
      } else if (usuario.rol === "Cajero") {
        router.push("/cajero");
      } else if (usuario.rol === "Mesero") {
        router.push("/mesero");
      } else {
        router.push("/login"); // Por si tiene un rol raro o dañado
      }
    } else {
      // 3. Si todo está bien, le abrimos la puerta
      setAutorizado(true);
    }
  }, [router, rolesPermitidos]);

  // Mientras verifica (toma milisegundos), mostramos una pantalla negra de seguridad
  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <span className="text-4xl mb-4 animate-bounce">🛡️</span>
        <p className="text-gray-400 font-bold tracking-widest uppercase animate-pulse text-sm">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  // Si está autorizado, renderizamos la página normal
  return <>{children}</>;
}
