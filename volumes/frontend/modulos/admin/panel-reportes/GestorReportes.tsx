"use client";

import { useState, useEffect } from "react";
import { API_URL } from "../../../utilidades/api";

interface FilaReporte {
  codigo_sku: string;
  fecha_inicio: string;
  fecha_final: string;
  total_vendido: number;
  costo_producto: number;
  valor_venta: number;
  ganancia: number;
  sede: string;
}

export default function GestorReportes() {
  const [metricas, setMetricas] = useState({
    totalProductos: 0,
    totalSedes: 0,
    totalUsuarios: 0,
    totalMesas: 0,
  });

  const [sedes, setSedes] = useState<any[]>([]);
  const [usuarioLogueado, setUsuarioLogueado] = useState<any>(null);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");

  const [datosReporte, setDatosReporte] = useState<FilaReporte[]>([]);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [reporteGenerado, setReporteGenerado] = useState(false);
  const [estaCargandoMetricas, setEstaCargandoMetricas] = useState(true);

  const [ventasSemanales, setVentasSemanales] = useState<any[]>([]);
  const [topProductos, setTopProductos] = useState<any[]>([]);

  useEffect(() => {
    const usrStr = localStorage.getItem("usuario_bar");
    let idSedeStr = "";
    if (usrStr) {
      const usuario = JSON.parse(usrStr);
      setUsuarioLogueado(usuario);
      if (usuario.id_sede) {
        setSedeSeleccionada(String(usuario.id_sede));
        idSedeStr = String(usuario.id_sede);
      }
    }

    const cargarDatosIniciales = async () => {
      try {
        // 🚀 ROMPEDOR DE CACHÉ: Añadimos la hora exacta para obligar a traer datos nuevos
        const t = new Date().getTime();
        const parametroSede = idSedeStr
          ? `?sede=${idSedeStr}&t=${t}`
          : `?t=${t}`;

        const [resProd, resSedes, resUsr, resMesas, resTrafico, resTop] =
          await Promise.all([
            fetch(`${API_URL}/productos?t=${t}`, { cache: "no-store" }),
            fetch(`${API_URL}/sedes?t=${t}`, { cache: "no-store" }),
            fetch(`${API_URL}/usuarios?t=${t}`, { cache: "no-store" }),
            fetch(`${API_URL}/mesas?t=${t}`, { cache: "no-store" }),
            fetch(`${API_URL}/reportes/trafico${parametroSede}`, {
              cache: "no-store",
            }),
            fetch(`${API_URL}/reportes/top-productos${parametroSede}`, {
              cache: "no-store",
            }),
          ]);

        const [productos, dataSedes, usuarios, mesas, dataTrafico, dataTop] =
          await Promise.all([
            resProd.json(),
            resSedes.json(),
            resUsr.json(),
            resMesas.json(),
            resTrafico.ok ? resTrafico.json() : [],
            resTop.ok ? resTop.json() : [],
          ]);

        setSedes(Array.isArray(dataSedes) ? dataSedes : []);
        setMetricas({
          totalProductos: productos.length || 0,
          totalSedes: dataSedes.length || 0,
          totalUsuarios: usuarios.length || 0,
          totalMesas: mesas.length || 0,
        });

        setVentasSemanales(Array.isArray(dataTrafico) ? dataTrafico : []);
        setTopProductos(Array.isArray(dataTop) ? dataTop : []);
      } catch (error) {
        console.error("Error al cargar datos reales:", error);
      } finally {
        setEstaCargandoMetricas(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  const formatearDinero = (valor: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  const manejarClickFecha = (e: React.MouseEvent<HTMLInputElement>) => {
    // Esto fuerza a que el calendario se abra dando click en cualquier parte del input
    if ("showPicker" in HTMLInputElement.prototype) {
      (e.target as HTMLInputElement).showPicker();
    }
  };

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      return alert(
        "Por favor, selecciona la fecha de inicio y la fecha final utilizando el calendario.",
      );
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      return alert("La fecha de inicio no puede ser mayor a la fecha final.");
    }

    setCargandoReporte(true);
    setReporteGenerado(false);

    try {
      const queryParams = new URLSearchParams({
        inicio: fechaInicio,
        fin: fechaFin,
        ...(sedeSeleccionada && { sede: sedeSeleccionada }),
        t: String(new Date().getTime()), // 🚀 Rompedor de caché también aquí
      });

      const respuesta = await fetch(
        `${API_URL}/reportes/ventas-detalladas?${queryParams.toString()}`,
        { cache: "no-store" },
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setDatosReporte(Array.isArray(datos) ? datos : []);
        setReporteGenerado(true);
      } else {
        alert(
          "El servidor no pudo generar el reporte. Asegúrate de que el módulo backend esté funcionando.",
        );
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
      alert("Error de conexión al generar el reporte.");
    } finally {
      setCargandoReporte(false);
    }
  };

  const descargarCSV = () => {
    if (datosReporte.length === 0) return;

    const cabeceras = [
      "Código",
      "Fecha de Inicio",
      "Fecha Final",
      "Total Producto Vendido",
      "Costo del Producto",
      "Valor Venta Producto",
      "Ganancia",
      "Sede",
    ];
    const filas = datosReporte.map((row) => [
      row.codigo_sku,
      row.fecha_inicio,
      row.fecha_final,
      row.total_vendido,
      row.costo_producto,
      row.valor_venta,
      row.ganancia,
      row.sede,
    ]);

    const contenidoCSV = [
      cabeceras.join(","),
      ...filas.map((fila) => fila.join(",")),
    ].join("\n");
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Reporte_Ventas_${fechaInicio}_al_${fechaFin}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const granTotalGanancia = datosReporte.reduce(
    (acc, curr) => acc + curr.ganancia,
    0,
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold">Inteligencia de Negocios</h1>
          <p className="text-gray-400 mt-1">
            Visión global y extracción de datos reales
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaMetrica
          titulo="Productos"
          valor={metricas.totalProductos}
          icono="📦"
          cargando={estaCargandoMetricas}
          color="text-blue-400"
        />
        <TarjetaMetrica
          titulo="Personal"
          valor={metricas.totalUsuarios}
          icono="👥"
          cargando={estaCargandoMetricas}
          color="text-purple-400"
        />
        <TarjetaMetrica
          titulo="Sedes"
          valor={metricas.totalSedes}
          icono="🏢"
          cargando={estaCargandoMetricas}
          color="text-green-400"
        />
        <TarjetaMetrica
          titulo="Mesas"
          valor={metricas.totalMesas}
          icono="🪑"
          cargando={estaCargandoMetricas}
          color="text-orange-400"
        />
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-2xl">
        <div className="mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Generador de Reportes Detallados
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Filtra por fechas exactas para extraer la contabilidad.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 🚀 FECHAS MEJORADAS UX */}
            {/* FECHA DE INICIO */}
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                style={{ colorScheme: "dark" }}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer transition-all hover:border-gray-500 block"
              />
            </div>

            {/* FECHA FINAL */}
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">
                Fecha Final
              </label>
              <input
                type="date"
                value={fechaFin}
                style={{ colorScheme: "dark" }}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer transition-all hover:border-gray-500 block"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5">
                Sede a Consultar
              </label>
              <select
                disabled={usuarioLogueado?.id_sede}
                value={sedeSeleccionada}
                onChange={(e) => setSedeSeleccionada(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                  usuarioLogueado?.id_sede
                    ? "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-950 border border-gray-700 text-white focus:border-blue-500 cursor-pointer hover:border-gray-500"
                }`}
              >
                {!usuarioLogueado?.id_sede && (
                  <option value="">Todas las Sedes (Global)</option>
                )}
                {sedes.map((s) => (
                  <option key={s.id_sede} value={s.id_sede}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generarReporte}
            disabled={cargandoReporte}
            className="w-full xl:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap active:scale-95"
          >
            {cargandoReporte
              ? "Consultando Base de Datos..."
              : "Generar Reporte Real"}
          </button>
        </div>

        {reporteGenerado && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-t-2xl border border-gray-700">
              <h3 className="font-bold text-blue-400">
                Resultados de la Búsqueda
              </h3>
              <button
                onClick={descargarCSV}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 active:scale-95"
              >
                📥 Descargar CSV
              </button>
            </div>

            <div className="overflow-x-auto border-x border-b border-gray-700 rounded-b-2xl bg-gray-950/50">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">F. Inicio</th>
                    <th className="px-4 py-3">F. Final</th>
                    <th className="px-4 py-3 text-center">Unid. Vendidas</th>
                    <th className="px-4 py-3 text-right">Costo (Und)</th>
                    <th className="px-4 py-3 text-right">Venta (Und)</th>
                    <th className="px-4 py-3 text-right text-green-400">
                      Ganancia Neta
                    </th>
                    <th className="px-4 py-3">Sede</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {datosReporte.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No hay registros de ventas reales en este rango de
                        fechas.
                      </td>
                    </tr>
                  ) : (
                    datosReporte.map((fila, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-gray-300">
                          {fila.codigo_sku}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {fila.fecha_inicio}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {fila.fecha_final}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-white">
                          {fila.total_vendido}
                        </td>
                        <td className="px-4 py-3 text-right text-red-400">
                          {formatearDinero(fila.costo_producto)}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-400">
                          {formatearDinero(fila.valor_venta)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-green-400">
                          {formatearDinero(fila.ganancia)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {fila.sede}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {datosReporte.length > 0 && (
                  <tfoot className="bg-gray-900 border-t-2 border-gray-700">
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-right font-black text-white uppercase tracking-widest text-xs"
                      >
                        Ganancia Total del Periodo:
                      </td>
                      <td className="px-4 py-4 text-right font-black text-green-400 text-lg">
                        {formatearDinero(granTotalGanancia)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Gráficas 100% Reales */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
            Tráfico de Ventas (Últimos 7 días)
          </h2>
          {ventasSemanales.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-gray-600 font-bold">
              <span className="text-4xl mb-2 opacity-30">📉</span>
              Sin datos de ventas recientes.
            </div>
          ) : (
            <div className="flex items-end gap-2 sm:gap-4 h-56 mt-4">
              {ventasSemanales.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-xs px-2 py-1 rounded text-white mb-1">
                    {item.valor}%
                  </div>
                  <div
                    className="w-full bg-gray-950 rounded-t-md relative overflow-hidden flex items-end justify-center"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="w-full bg-blue-600 group-hover:bg-blue-400 transition-all duration-500 rounded-t-md"
                      style={{ height: `${item.valor}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">
                    {item.dia}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
            Top 4 Más Vendidos
          </h2>
          {topProductos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 font-bold pb-10">
              <span className="text-4xl mb-2 opacity-30">🏆</span>
              Aún no hay ventas.
            </div>
          ) : (
            <div className="space-y-6">
              {topProductos.map((prod, index) => {
                const colores = [
                  "bg-yellow-500",
                  "bg-green-500",
                  "bg-red-500",
                  "bg-blue-500",
                ];
                return (
                  <BarraProgresoProducto
                    key={index}
                    nombre={prod.nombre}
                    porcentaje={prod.porcentaje}
                    color={colores[index % 4]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TarjetaMetrica({ titulo, valor, icono, cargando, color }: any) {
  return (
    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl flex items-center gap-4 hover:border-gray-700 transition-colors">
      <div
        className={`text-4xl bg-gray-950 p-4 rounded-2xl border border-gray-800 shadow-inner ${color}`}
      >
        {icono}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
          {titulo}
        </p>
        {cargando ? (
          <div className="h-8 w-20 bg-gray-800 animate-pulse rounded"></div>
        ) : (
          <p className="text-3xl font-black text-white">{valor}</p>
        )}
      </div>
    </div>
  );
}

function BarraProgresoProducto({ nombre, porcentaje, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 font-bold">
        <span className="text-gray-300">{nombre}</span>
        <span className="text-gray-500">{porcentaje}%</span>
      </div>
      <div className="w-full bg-gray-950 border border-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
}
