"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// Importamos la URL global por si acaso queremos hacer conteos rápidos luego
import { API_URL } from "../../utilidades/api";

export default function PaginaDashboardAdmin() {
  // Datos de ejemplo (Placeholders) - Luego los traeremos del backend real
  const [resumen, setResumen] = useState({
    ventasHoy: 1250500,
    mesasOcupadas: 8,
    totalMesas: 20,
    productosBajoStock: 5,
    personalActivo: 12,
  });

  const [nombreUsuario, setNombreUsuario] = useState("Administrador");

  useEffect(() => {
    // Intentamos recuperar el nombre real del usuario logueado del localStorage
    try {
      const usuarioGuardado = localStorage.getItem("usuario_bar");
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        // Sacamos solo el primer nombre
        setNombreUsuario(usuario.nombre_completo.split(" ")[0]);
      }
    } catch (error) {
      console.error("Error al leer usuario del localStorage", error);
    }
  }, []);

  // Función para formatear dinero en Pesos Colombianos (COP)
  const formatearCOP = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const tarjetasResumen = [
    {
      titulo: "Ventas de Hoy (Simulación)",
      valor: formatearCOP(resumen.ventasHoy),
      icono: "💰",
      color: "text-green-400",
      detalle: "+15% vs ayer",
    },
    {
      titulo: "Ocupación Actual",
      valor: `${resumen.mesasOcupadas} / ${resumen.totalMesas}`,
      icono: "🪑",
      color: "text-blue-400",
      detalle: `${Math.round((resumen.mesasOcupadas / resumen.totalMesas) * 100)}% de aforo`,
    },
    {
      titulo: "Alertas de Inventario",
      valor: resumen.productosBajoStock,
      icono: "⚠️",
      color: resumen.productosBajoStock > 0 ? "text-red-400" : "text-gray-400",
      detalle: "Productos próximos a agotarse",
    },
    {
      titulo: "Personal en Turno",
      valor: resumen.personalActivo,
      icono: "👥",
      color: "text-purple-400",
      detalle: "Colaboradores logueados",
    },
  ];

  const accesosRapidos = [
    {
      nombre: "Abrir Caja (POS)",
      ruta: "/admin/caja",
      icono: "🖥️",
      bg: "bg-blue-600",
    },
    {
      nombre: "Recibir Inventario",
      ruta: "/admin/inventario/recepcion",
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
      nombre: "Ver Reportes",
      ruta: "/admin/reportes",
      icono: "📈",
      bg: "bg-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 space-y-10">
      {/* Cabecera de Bienvenida */}
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

      {/* Grid de Tarjetas de Resumen (Métricas Clave) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetasResumen.map((tarjeta, indice) => (
          <div
            key={indice}
            className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all shadow-xl shadow-black/20 group"
          >
            <div className="flex justify-between items-start mb-4">
              <span
                className={`text-3xl ${tarjeta.color} opacity-80 group-hover:opacity-100 transition-opacity`}
              >
                {tarjeta.icono}
              </span>
              <span className="text-xs font-medium text-gray-500 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                Hoy
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
              {tarjeta.titulo}
            </p>
            <p className="text-3xl font-extrabold tracking-tighter mt-2 group-hover:scale-105 transition-transform origin-left">
              {tarjeta.valor}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              {tarjeta.detalle}
            </p>
          </div>
        ))}
      </section>

      {/* Sección de Accesos Rápidos y Estado del Servidor */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Accesos Rápidos */}
        <div className="xl:col-span-2 bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl shadow-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Acciones Frecuentes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {accesosRapidos.map((accion, indice) => (
              <Link
                href={accion.ruta}
                key={indice}
                className={`${accion.bg} ${accion.bg === "bg-blue-600" ? "hover:bg-blue-500" : "hover:bg-gray-700"} p-5 rounded-xl text-center flex flex-col items-center gap-3 transition-colors group shadow-lg`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {accion.icono}
                </span>
                <span className="text-sm font-semibold text-white tracking-tight">
                  {accion.nombre}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl shadow-black/10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-950 text-green-400 rounded-full flex items-center justify-center border-4 border-green-900 mb-4 animate-pulse">
            <span className="text-4xl">📡</span>
          </div>
          <h3 className="text-xl font-bold text-white">Servidor Online</h3>
          <p className="text-sm text-gray-400 mt-1">Conectado a {API_URL}</p>
          <div className="text-[10px] mt-4 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-gray-500">
            Base de Datos PostgreSQL OK
          </div>
        </div>
      </section>

      {/* Footer minimalista */}
      <footer className="text-center pt-10 text-xs text-gray-700 border-t border-gray-800/50">
        BarSystem POS v0.1 | Módulo de Administración Inicial | Desarrollado con
        Next.js & NestJS
      </footer>
    </div>
  );
}
