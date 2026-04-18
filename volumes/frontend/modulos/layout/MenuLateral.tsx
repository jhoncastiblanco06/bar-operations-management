"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function MenuLateral() {
  const rutaActual = usePathname();
  const enrutador = useRouter();
  const [abierto, setAbierto] = useState(false);

  const menuOperacion = [
    { nombre: "Dashboard", ruta: "/admin", icono: "📊" },
    { nombre: "Caja", ruta: "/admin/caja", icono: "🖥️" },
    { nombre: "Panel Meseros", ruta: "/admin/meseros", icono: "📱" },
  ];

  const menuLogistica = [
    { nombre: "Catálogo Maestro", ruta: "/admin/inventario", icono: "📦" },
    {
      nombre: "Recepción Stock",
      ruta: "/admin/inventario/recepcion",
      icono: "📥",
    },
  ];

  const menuAdministracion = [
    { nombre: "Mesas y Aforo", ruta: "/admin/mesas", icono: "🪑" },
    { nombre: "Sedes", ruta: "/admin/sedes", icono: "🏢" },
    { nombre: "Personal", ruta: "/admin/usuarios", icono: "👥" },
    { nombre: "Reportes", ruta: "/admin/reportes", icono: "📈" },
  ];

  const cerrarSesion = () => {
    localStorage.removeItem("usuario_bar");
    enrutador.push("/login");
  };

  const renderizarLinks = (
    items: { nombre: string; ruta: string; icono: string }[],
  ) =>
    items.map((item) => {
      const estaActivo = rutaActual === item.ruta;
      return (
        <Link
          key={item.ruta}
          href={item.ruta}
          onClick={() => setAbierto(false)}
          className={`flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl transition-all font-medium text-sm ${
            estaActivo
              ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner"
              : "text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent"
          }`}
        >
          <span className="text-lg">{item.icono}</span>
          {item.nombre}
        </Link>
      );
    });

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 text-white p-2 rounded-lg border border-gray-700 shadow-xl"
      >
        ☰
      </button>

      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 md:h-20 flex items-center px-6 border-b border-gray-800 shrink-0">
          <h2 className="text-lg md:text-xl font-black text-white tracking-tighter flex items-center gap-2">
            <span className="text-blue-500 text-xl md:text-2xl">🍸</span>{" "}
            BarSystem
          </h2>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          <div>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 md:mb-3 px-2">
              Operación
            </p>
            <div className="space-y-1.5 md">
              {renderizarLinks(menuOperacion)}
            </div>
          </div>

          <div>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 md:mb-3 px-2">
              Logística
            </p>
            <div className="space-y-1.5 md:space-y-2">
              {renderizarLinks(menuLogistica)}
            </div>
          </div>

          <div>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 md:mb-3 px-2">
              Administración
            </p>
            <div className="space-y-1.5 md:space-y-2">
              {renderizarLinks(menuAdministracion)}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-gray-800 bg-gray-950 flex flex-col gap-2 md:gap-3 shrink-0">
          <Link
            href="/admin/configusr"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl text-gray-400 hover:bg-gray-900 hover:text-white transition"
          >
            <span>⚙️</span> Mi Perfil
          </Link>

          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 md:py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition text-sm font-bold border border-red-500/20"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
