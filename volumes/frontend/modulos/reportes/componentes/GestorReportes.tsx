"use client";

import { useState, useEffect } from "react";
import { API_URL } from "../../../utilidades/api";

export default function GestorReportes() {
  const [metricas, setMetricas] = useState({
    totalProductos: 0,
    totalSedes: 0,
    totalUsuarios: 0,
    totalMesas: 0,
  });

  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        // Hacemos 4 llamadas al mismo tiempo para no hacer esperar al usuario
        const [resProd, resSedes, resUsr, resMesas] = await Promise.all([
          fetch(`${API_URL}/productos`),
          fetch(`${API_URL}/sedes`),
          fetch(`${API_URL}/usuarios`),
          fetch(`${API_URL}/mesas`),
        ]);

        const [productos, sedes, usuarios, mesas] = await Promise.all([
          resProd.json(),
          resSedes.json(),
          resUsr.json(),
          resMesas.json(),
        ]);

        setMetricas({
          totalProductos: productos.length || 0,
          totalSedes: sedes.length || 0,
          totalUsuarios: usuarios.length || 0,
          totalMesas: mesas.length || 0,
        });
      } catch (error) {
        console.error("Error al cargar métricas reales:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    cargarMetricas();
  }, []);

  // Datos simulados para las gráficas visuales
  const ventasSemanales = [
    { dia: "Lun", valor: 30 },
    { dia: "Mar", valor: 45 },
    { dia: "Mié", valor: 25 },
    { dia: "Jue", valor: 60 },
    { dia: "Vie", valor: 90 },
    { dia: "Sáb", valor: 100 },
    { dia: "Dom", valor: 70 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-gray-400 mt-1">
            Visión global del rendimiento de BarSystem
          </p>
        </div>
        <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700 flex items-center gap-2">
          <span>📥</span> Descargar PDF
        </button>
      </header>

      {/* Tarjetas de Métricas Reales (Conectadas a la BD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaMetrica
          titulo="Productos en Catálogo"
          valor={metricas.totalProductos}
          icono="📦"
          cargando={estaCargando}
          color="text-blue-400"
        />
        <TarjetaMetrica
          titulo="Personal Registrado"
          valor={metricas.totalUsuarios}
          icono="👥"
          cargando={estaCargando}
          color="text-purple-400"
        />
        <TarjetaMetrica
          titulo="Sedes Activas"
          valor={metricas.totalSedes}
          icono="🏢"
          cargando={estaCargando}
          color="text-green-400"
        />
        <TarjetaMetrica
          titulo="Mesas Configuradas"
          valor={metricas.totalMesas}
          icono="🪑"
          cargando={estaCargando}
          color="text-orange-400"
        />
      </div>

      {/* Sección de Gráficas Simuladas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Gráfica de Barras Simulada (Ventas de la semana) */}
        <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-6">
            Tráfico de Ventas (Simulación)
          </h2>
          <div className="flex items-end gap-2 sm:gap-4 h-64 mt-4">
            {ventasSemanales.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                {/* Tooltip invisible hasta hacer hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-xs px-2 py-1 rounded text-white mb-1">
                  {item.valor}%
                </div>
                {/* Barra */}
                <div
                  className="w-full bg-gray-800 rounded-t-md relative overflow-hidden flex items-end justify-center"
                  style={{ height: "100%" }}
                >
                  <div
                    className="w-full bg-blue-500/80 group-hover:bg-blue-400 transition-all duration-500 rounded-t-md"
                    style={{ height: `${item.valor}%` }}
                  ></div>
                </div>
                {/* Etiqueta del día */}
                <span className="text-xs text-gray-500 font-medium">
                  {item.dia}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Productos Simulado */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-bold text-white mb-6">
            Top Productos Vendidos
          </h2>
          <div className="space-y-6">
            <BarraProgresoProducto
              nombre="Cerveza Corona"
              porcentaje={85}
              color="bg-yellow-500"
            />
            <BarraProgresoProducto
              nombre="Margarita Clásica"
              porcentaje={65}
              color="bg-green-500"
            />
            <BarraProgresoProducto
              nombre="Alitas BBQ (12pz)"
              porcentaje={50}
              color="bg-red-500"
            />
            <BarraProgresoProducto
              nombre="Tequila Don Julio"
              porcentaje={30}
              color="bg-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini-componente para las tarjetas de métricas
function TarjetaMetrica({ titulo, valor, icono, cargando, color }: any) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg flex items-center gap-4">
      <div
        className={`text-4xl bg-gray-950 p-3 rounded-xl border border-gray-800 ${color}`}
      >
        {icono}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
          {titulo}
        </p>
        {cargando ? (
          <div className="h-8 w-16 bg-gray-800 animate-pulse rounded mt-2"></div>
        ) : (
          <p className="text-3xl font-black mt-1 text-white">{valor}</p>
        )}
      </div>
    </div>
  );
}

// Mini-componente para las barras de progreso
function BarraProgresoProducto({ nombre, porcentaje, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300 font-medium">{nombre}</span>
        <span className="text-gray-500">{porcentaje}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
}
