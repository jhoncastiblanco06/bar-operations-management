"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MenuLateral() {
  const rutaActual = usePathname();
  const enrutador = useRouter();

  const menu = [
    { nombre: "Dashboard", ruta: "/admin", icono: "📊" },
    { nombre: "Caja (POS)", ruta: "/admin/caja", icono: "🖥️" },
    { nombre: "Inventario", ruta: "/admin/inventario", icono: "📦" },
    { nombre: "Mesas y Aforo", ruta: "/admin/mesas", icono: "🪑" },
    { nombre: "Sedes", ruta: "/admin/sedes", icono: "🏢" },
    { nombre: "Personal", ruta: "/admin/usuarios", icono: "👥" },
    { nombre: "Reportes", ruta: "/admin/reportes", icono: "📈" },
  ];

  const cerrarSesion = () => {
    // Borramos al usuario de la memoria y lo mandamos al login
    localStorage.removeItem("usuario_bar");
    enrutador.push("/login");
  };

  return (
    <aside className="w-64 h-screen bg-gray-950 border-r border-gray-800 flex flex-col fixed left-0 top-0">
      {/* Logo / Título */}
      <div className="h-20 flex items-center px-6 border-b border-gray-800">
        <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
          <span className="text-blue-500 text-2xl">🍸</span> BarSystem
        </h2>
      </div>

      {/* Lista de Navegación */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Menú Principal
        </p>

        {menu.map((item) => {
          const estaActivo = rutaActual === item.ruta;

          return (
            <Link
              key={item.ruta}
              href={item.ruta}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm ${
                estaActivo
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-lg">{item.icono}</span>
              {item.nombre}
            </Link>
          );
        })}
      </nav>

      {/* Perfil y Salir (Parte inferior) */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-bold border border-red-500/20"
        >
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
