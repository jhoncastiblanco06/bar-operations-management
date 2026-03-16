"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(true);

  useEffect(() => {
    // 1. Verificamos la identidad del usuario una sola vez para TODO el sistema
    const usuarioGuardado = localStorage.getItem("usuario_bar");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      setCargando(false);
    } else {
      router.push("/login"); // Intruso detectado, lo mandamos al login
    }
  }, [router]);

  // Si está verificando, mostramos pantalla de carga
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 2. CONFIGURACIÓN DEL MENÚ SEGÚN EL ROL
  const menuConfig = {
    Administrador: [
      { titulo: "Inicio", path: "/admin", icon: "📊" },
      { categoria: "OPERACIONES" },
      { titulo: "Inventario", path: "/admin/inventario", icon: "📦" },
      { titulo: "Ventas en Caja", path: "/admin/caja", icon: "💰" },
      { categoria: "INTELIGENCIA" },
      { titulo: "Reportes (PDF)", path: "/admin/reportes", icon: "📈" },
      { categoria: "PARAMETRIZACIÓN" },
      { titulo: "Sedes", path: "/admin/sedes", icon: "🏢" },
      { titulo: "Personal", path: "/admin/usuarios", icon: "👥" },
      { titulo: "Productos", path: "/admin/productos", icon: "🏷️" },
      { titulo: "Mesas", path: "/admin/mesas", icon: "🪑" },
    ],
    Cajero: [
      { titulo: "Inicio", path: "/admin", icon: "📊" },
      { categoria: "OPERACIONES" },
      { titulo: "Punto de Venta", path: "/admin/caja", icon: "💰" },
      { titulo: "Cierre de Turno", path: "/admin/cierres", icon: "🔐" },
    ],
    Mesero: [
      { titulo: "Inicio", path: "/admin", icon: "📊" },
      { categoria: "ATENCIÓN" },
      { titulo: "Mis Mesas", path: "/admin/mesas", icon: "🍽️" },
    ],
  };

  // Obtenemos el menú que le corresponde al usuario actual
  const menuActual = menuConfig[usuario?.rol as keyof typeof menuConfig] || [];

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario_bar");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside
        className={`${menuAbierto ? "w-64" : "w-20"} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col hidden md:flex`}
      >
        {/* Logo del Sidebar */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <span
            className="text-2xl cursor-pointer"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? "🍸 BarSystem" : "🍸"}
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuActual.map((item, index) => {
            // Renderizar Categorías (Títulos pequeños)
            if (item.categoria) {
              return menuAbierto ? (
                <p
                  key={index}
                  className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider mt-2"
                >
                  {item.categoria}
                </p>
              ) : (
                <div
                  key={index}
                  className="my-4 border-t border-gray-800 mx-4"
                ></div>
              );
            }

            // Renderizar Enlaces normales
            const activo = pathname === item.path;
            return (
              <Link key={index} href={item.path || "#"}>
                <div
                  className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
                    activo
                      ? "bg-blue-600/10 border-r-4 border-blue-500 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {menuAbierto && (
                    <span className="ml-4 font-medium">{item.titulo}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Perfil del Usuario al final del Sidebar */}
        <div className="p-4 border-t border-gray-800">
          {menuAbierto ? (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white truncate">
                {usuario?.nombre_completo}
              </span>
              <span className="text-xs text-gray-500 mb-3">{usuario?.rol}</span>
              <button
                onClick={handleCerrarSesion}
                className="bg-red-500/10 text-red-400 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={handleCerrarSesion}
              className="w-full text-center text-red-400 hover:text-red-300"
              title="Cerrar Sesión"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Superior Móvil (Solo visible en pantallas pequeñas) */}
        <header className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
          <span className="text-xl font-bold">🍸 BarSystem</span>
          <button onClick={handleCerrarSesion} className="text-sm text-red-400">
            Salir
          </button>
        </header>

        {/* Aquí se inyectarán tus páginas (Dashboard, Sedes, Usuarios) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
