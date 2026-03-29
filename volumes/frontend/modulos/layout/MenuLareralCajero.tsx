"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { API_URL } from "../../utilidades/api";

export default function MenuLateralCajero() {
  const rutaActual = usePathname();
  const enrutador = useRouter();
  const [abierto, setAbierto] = useState(false);

  // ESTADO PARA GUARDAR LOS DATOS DEL USUARIO
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: "Cargando...",
    rol: "",
    sede: "Verificando sede...",
    avatar: null as string | null,
  });

  // 🚀 USEEFFECT: Trae los datos y escucha actualizaciones
  useEffect(() => {
    const cargarUsuario = async () => {
      const usrStr = localStorage.getItem("usuario_bar");

      if (usrStr) {
        const usuarioLocal = JSON.parse(usrStr);

        setDatosUsuario({
          nombre: usuarioLocal.nombre_completo || "Usuario",
          rol: usuarioLocal.rol || "Cajero",
          sede: usuarioLocal.id_sede ? "Cargando sede..." : "Sin sede",
          avatar: usuarioLocal.avatar_url || null,
        });

        try {
          const respuesta = await fetch(
            `${API_URL}/usuarios/${usuarioLocal.id_usuario}`,
          );

          if (respuesta.ok) {
            const datosFrescos = await respuesta.json();
            setDatosUsuario({
              nombre: datosFrescos.nombre_completo,
              rol: datosFrescos.rol,
              sede: datosFrescos.sedes?.nombre || "Sin sede asignada",
              avatar: datosFrescos.avatar_url || null,
            });
            localStorage.setItem("usuario_bar", JSON.stringify(datosFrescos));
          }
        } catch (error) {
          console.error("Error al traer datos del cajero:", error);
        }
      }
    };

    cargarUsuario();

    // Suscripción al evento de actualización de perfil
    const escucharActualizacion = () => cargarUsuario();
    window.addEventListener("perfilActualizado", escucharActualizacion);

    return () =>
      window.removeEventListener("perfilActualizado", escucharActualizacion);
  }, []);

  // 🚀 MENÚ EXCLUSIVO DEL CAJERO
  const menuOperacion = [
    { nombre: "Terminal de Caja", ruta: "/cajero", icono: "🖥️" },
    // Aquí a futuro puedes agregar: { nombre: "Historial/Cierres", ruta: "/cajero/historial", icono: "📊" }
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
          // 🚀 ACENTO VERDE PARA EL CAJERO
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold text-sm ${
            estaActivo
              ? "bg-green-600/10 text-green-400 border border-green-500/20 shadow-inner"
              : "text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent"
          }`}
        >
          <span className="text-2xl">{item.icono}</span>
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
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ${abierto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* TARJETA DE PERFIL DINÁMICA */}
        <div className="p-6 border-b border-gray-800 shrink-0 bg-gray-900/20">
          <div className="flex items-center gap-3 mb-3">
            {/* 🚀 ACENTO VERDE PARA EL AVATAR */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-green-500/20 flex items-center justify-center text-green-400 font-black text-xl border-2 border-green-500/30 shrink-0">
              {datosUsuario.avatar ? (
                <img
                  src={`${API_URL}${datosUsuario.avatar}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                datosUsuario.nombre.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <h2
                className="text-sm font-bold text-white truncate w-full"
                title={datosUsuario.nombre}
              >
                {datosUsuario.nombre}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold truncate">
                  {datosUsuario.rol}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 font-medium">
            <span>📍</span>
            <span className="truncate">{datosUsuario.sede}</span>
          </div>
        </div>

        {/* Zonas de Navegación */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
              Operación Caja
            </p>
            <div className="space-y-2">{renderizarLinks(menuOperacion)}</div>
          </div>
        </nav>

        {/* Footer: Perfil y Salida */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex flex-col gap-2 shrink-0">
          {/* 🚀 RUTA DE CONFIGURACIÓN DEL CAJERO */}
          <Link
            href="/cajero/configusr"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-900 rounded-xl transition-colors text-sm font-medium"
          >
            <span className="text-lg">⚙️</span> Configuración
          </Link>
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-bold border border-red-500/20"
          >
            <span>🚪</span> Cerrar Caja
          </button>
        </div>
      </aside>
    </>
  );
}
