"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_URL } from "../../utilidades/api";

export default function PaginaDashboardAdmin() {
  // 🚀 Ahora inician en 0 mientras el servidor responde
  const [resumen, setResumen] = useState({
    ventasHoy: 0,
    mesasOcupadas: 0,
    totalMesas: 0,
    productosBajoStock: 0,
    personalActivo: 0,
  });

  const [nombreUsuario, setNombreUsuario] = useState("Administrador");
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async (esSilencioso = false) => {
      try {
        if (!esSilencioso) setEstaCargando(true);

        const usuarioGuardado = localStorage.getItem("usuario_bar");
        let idSede = "";

        if (usuarioGuardado) {
          const usuario = JSON.parse(usuarioGuardado);
          setNombreUsuario(usuario.nombre_completo.split(" ")[0]);
          idSede = usuario.id_sede ? `/${usuario.id_sede}` : ""; // Si tiene sede, la agregamos a la ruta
        }

        // 🚀 LLAMADA REAL AL BACKEND (Pedimos el resumen de la sede)
        const respuesta = await fetch(`${API_URL}/dashboard/resumen${idSede}`);

        if (respuesta.ok) {
          const datosReales = await respuesta.json();
          setResumen({
            ventasHoy: datosReales.ventasHoy || 0,
            mesasOcupadas: datosReales.mesasOcupadas || 0,
            totalMesas: datosReales.totalMesas || 0,
            productosBajoStock: datosReales.productosBajoStock || 0,
            personalActivo: datosReales.personalActivo || 0,
          });
        }
      } catch (error) {
        console.error("Error al cargar el resumen del dashboard:", error);
      } finally {
        if (!esSilencioso) setEstaCargando(false);
      }
    };

    // 1. Carga inicial
    cargarDashboard(false);

    // 2. Refresco automático cada 30 segundos para ver las ventas en tiempo real
    const intervalo = setInterval(() => cargarDashboard(true), 30000);
    return () => clearInterval(intervalo);
  }, []);

  const formatearCOP = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const tarjetasResumen = [
    {
      titulo: "Ventas de Hoy",
      valor: formatearCOP(resumen.ventasHoy),
      icono: "💰",
      color: "text-green-400",
      detalle: "Facturación en tiempo real",
    },
    {
      titulo: "Ocupación Actual",
      valor: `${resumen.mesasOcupadas} / ${resumen.totalMesas}`,
      icono: "🪑",
      color: "text-blue-400",
      detalle:
        resumen.totalMesas > 0
          ? `${Math.round((resumen.mesasOcupadas / resumen.totalMesas) * 100)}% de aforo`
          : "Sin mesas",
    },
    {
      titulo: "Alertas de Inventario",
      valor: resumen.productosBajoStock,
      icono: "⚠️",
      color: resumen.productosBajoStock > 0 ? "text-red-400" : "text-gray-400",
      detalle: "Productos agotados o casi agotados",
    },
    {
      titulo: "Personal en Turno",
      valor: resumen.personalActivo,
      icono: "👥",
      color: "text-purple-400",
      detalle: "Colaboradores activos",
    },
  ];

  const accesosRapidos = [
    {
      nombre: "Abrir Caja (POS)",
      ruta: "/admin/caja", // Asumiendo que el admin también tiene acceso a la caja
      icono: "🖥️",
      bg: "bg-blue-600",
    },
    {
      nombre: "Recibir Inventario",
      ruta: "/admin/inventario", // Ajusta si tienes otra ruta
      icono: "📦",
      bg: "bg-gray-800",
    },
    {
      nombre: "Configurar Mesas",
      ruta: "/admin/mesas",
      icono: "🛠️",
      bg: "bg-gray-800",
    },
    {
      nombre: "Personal",
      ruta: "/admin/usuarios",
      icono: "👥",
      bg: "bg-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 space-y-10">
      <header className="flex justify-between items-center gap-4">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
            Panel de Control
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mt-1">
            ¡Hola de nuevo,{" "}
            <span className="text-blue-400">{nombreUsuario}</span>! 👋
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Aquí tienes un resumen de cómo operan tus sedes el día de hoy.
            Revisa las alertas y toma el control de tu negocio.
          </p>
        </div>
        <div className="hidden sm:block text-5xl opacity-80">🍸</div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetasResumen.map((tarjeta, indice) => (
          <div
            key={indice}
            className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all shadow-xl shadow-black/20 group relative overflow-hidden"
          >
            {/* Si está cargando, mostramos un pequeño esqueleto de carga */}
            {estaCargando && (
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <span
                className={`text-3xl ${tarjeta.color} opacity-80 group-hover:opacity-100 transition-opacity`}
              >
                {tarjeta.icono}
              </span>
              <span className="text-[10px] font-bold text-gray-400 px-3 py-1 bg-gray-800 rounded-full border border-gray-700 uppercase tracking-widest">
                En vivo
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
              {tarjeta.titulo}
            </p>
            <p
              className={`text-3xl font-extrabold tracking-tighter mt-2 group-hover:scale-105 transition-transform origin-left ${tarjeta.color}`}
            >
              {tarjeta.valor}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              {tarjeta.detalle}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl shadow-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Acciones Frecuentes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {accesosRapidos.map((accion, indice) => (
              <Link
                href={accion.ruta}
                key={indice}
                className={`${accion.bg} ${accion.bg === "bg-blue-600" ? "hover:bg-blue-500" : "hover:bg-gray-700"} p-5 rounded-xl text-center flex flex-col items-center gap-3 transition-colors group shadow-lg border border-transparent hover:border-gray-600`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {accion.icono}
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  {accion.nombre}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl shadow-black/10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-950/30 text-green-400 rounded-full flex items-center justify-center border-4 border-green-900/50 mb-4 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.2)]">
            <span className="text-4xl">📡</span>
          </div>
          <h3 className="text-xl font-bold text-white">Servidor Online</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
            Conexión Estable
          </p>
          <div className="text-[10px] mt-4 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-full text-green-500 font-bold tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Base de
            Datos OK
          </div>
        </div>
      </section>

      <footer className="text-center pt-10 text-xs text-gray-700 border-t border-gray-800/50">
        BarSystem v0.1 | Módulo de Administración Inicial | Desarrollado con
        Next.js & NestJS
      </footer>
    </div>
  );
}
