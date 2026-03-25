"use client";

import { useState, useEffect } from "react";
import { Producto, Mesa, Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

interface ProductoEnStock extends Producto {
  stock_actual: number;
}

interface ItemPedido {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
}

export default function PanelMesero() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>("");

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<ProductoEnStock[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados de navegación del mesero
  const [vistaActual, setVistaActual] = useState<"mapa" | "tomar_pedido">(
    "mapa",
  );
  const [mesaActiva, setMesaActiva] = useState<Mesa | null>(null);

  // El carrito temporal (lo que el mesero está anotando AHORA MISMO en la libreta)
  const [pedidoActual, setPedidoActual] = useState<ItemPedido[]>([]);
  const [procesando, setProcesando] = useState(false);

  // 1. Cargar sedes (En un sistema real, el mesero ya tendría su sede asignada por login)
  useEffect(() => {
    fetch(`${API_URL}/sedes`)
      .then((r) => r.json())
      .then((data) => setSedes(Array.isArray(data) ? data : []));
  }, []);

  // 2. Cargar Mesas y Catálogo al seleccionar sede
  const cargarDatosSede = async () => {
    if (!sedeSeleccionada) return;
    setEstaCargando(true);
    try {
      const [resMesas, resInventario] = await Promise.all([
        fetch(`${API_URL}/mesas/sede/${sedeSeleccionada}`),
        fetch(`${API_URL}/inventario/pos/${sedeSeleccionada}`),
      ]);
      setMesas(await resMesas.json());
      setProductos(await resInventario.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosSede();
  }, [sedeSeleccionada]);

  // Interacción del Mesero: Tocar una mesa
  const manejarClickMesa = (mesa: Mesa) => {
    setMesaActiva(mesa);
    setPedidoActual([]); // Limpiamos la libreta
    setVistaActual("tomar_pedido");
  };

  const agregarAlPedido = (producto: ProductoEnStock) => {
    setPedidoActual((pedidoAnterior) => {
      const existe = pedidoAnterior.find(
        (p) => p.id_producto === producto.id_producto,
      );

      // 🛡️ PRIMERA BARRERA: Verificación local (Visual)
      if (existe && existe.cantidad >= producto.stock_actual) {
        alert(
          `¡Aviso! Solo quedan ${producto.stock_actual} unidades de ${producto.nombre}.`,
        );
        return pedidoAnterior;
      }

      if (existe) {
        return pedidoAnterior.map((p) =>
          p.id_producto === producto.id_producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p,
        );
      }
      return [
        ...pedidoAnterior,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio_venta: Number(producto.precio_venta),
          cantidad: 1,
        },
      ];
    });
  };

  const quitarDelPedido = (idProducto: number) => {
    setPedidoActual((prev) => {
      const existe = prev.find((p) => p.id_producto === idProducto);
      if (existe && existe.cantidad > 1) {
        return prev.map((p) =>
          p.id_producto === idProducto ? { ...p, cantidad: p.cantidad - 1 } : p,
        );
      }
      return prev.filter((p) => p.id_producto !== idProducto);
    });
  };

  // 🚀 LA MAGIA: Enviar el pedido a barra/cocina
  const enviarPedidoABarra = async () => {
    if (pedidoActual.length === 0) return alert("No has agregado productos.");
    setProcesando(true);

    try {
      // Aquí enviamos la orden al Backend.
      // El Backend es quien hace la SEGUNDA BARRERA (La definitiva). Si dos meseros pidieron la última Poker, el backend rechazará al segundo.
      const respuesta = await fetch(`${API_URL}/ordenes/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sede: Number(sedeSeleccionada),
          id_mesa: mesaActiva?.id_mesa,
          id_mesero: 1, // ID del mesero logueado
          productos: pedidoActual,
        }),
      });

      if (respuesta.ok) {
        alert("✅ Pedido enviado a barra correctamente.");
        await cargarDatosSede(); // Recargamos para ver la mesa como ocupada y el stock real
        setVistaActual("mapa");
        setMesaActiva(null);
      } else {
        // 🚨 AQUÍ ATRAPAMOS EL ERROR SI ALGUIEN MÁS SE LLEVÓ LA POKER
        const errorData = await respuesta.json();
        alert(`❌ Problema con el pedido:\n${errorData.message}`);
        // Recargamos el inventario para que el mesero vea el nuevo stock real (que seguro es 0)
        cargarDatosSede();
      }
    } catch (error) {
      alert("Error de conexión al enviar el pedido.");
    } finally {
      setProcesando(false);
    }
  };

  const formatearDinero = (valor: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gray-950 text-white font-sans">
      {/* HEADER MESERO */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white">📱 Panel Meseros</h1>
          <p className="text-xs text-blue-400">Modo de Atención Rápida</p>
        </div>

        {vistaActual === "mapa" ? (
          <select
            value={sedeSeleccionada}
            onChange={(e) => setSedeSeleccionada(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="" disabled>
              Elegir Sede
            </option>
            {sedes.map((s) => (
              <option key={s.id_sede} value={s.id_sede}>
                {s.nombre}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setVistaActual("mapa")}
            className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold border border-gray-700 hover:bg-gray-700"
          >
            🔙 Volver al Mapa
          </button>
        )}
      </header>

      {/* VISTA 1: MAPA DE MESAS */}
      {vistaActual === "mapa" && (
        <div className="p-4 sm:p-6 flex-1">
          {!sedeSeleccionada ? (
            <div className="text-center mt-20 text-gray-500">
              Selecciona tu sede para empezar a trabajar.
            </div>
          ) : estaCargando ? (
            <div className="text-center mt-20 text-blue-400 animate-pulse font-bold">
              Cargando mesas...
            </div>
          ) : (
            <>
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-widest">
                Estado de Mesas
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mesas.map((mesa) => {
                  const estaOcupada = mesa.estado === "Ocupada"; // Asumimos que agregaremos este campo
                  return (
                    <button
                      key={mesa.id_mesa}
                      onClick={() => manejarClickMesa(mesa)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all active:scale-95 shadow-lg ${
                        estaOcupada
                          ? "border-orange-500 bg-orange-600/10 hover:bg-orange-600/20"
                          : "border-emerald-500 bg-emerald-600/10 hover:bg-emerald-600/20"
                      }`}
                    >
                      {/* Indicador visual de estado */}
                      <span
                        className={`absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse ${estaOcupada ? "bg-orange-500 shadow-[0_0_10px_#f97316]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"}`}
                      ></span>

                      <span
                        className={`text-4xl mb-2 ${estaOcupada ? "opacity-100" : "opacity-70"}`}
                      >
                        🪑
                      </span>
                      <span className="font-black text-lg">
                        {mesa.nombre_identificador}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full ${estaOcupada ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"}`}
                      >
                        {estaOcupada ? "Ocupada" : "Libre"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* VISTA 2: TOMAR PEDIDO (El Menú) */}
      {vistaActual === "tomar_pedido" && mesaActiva && (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
          {/* Lado Izquierdo: Catálogo */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-900/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Catálogo
              </h2>
              <input
                type="text"
                placeholder="Buscar producto..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {productos.map((producto) => {
                const sinStock = producto.stock_actual <= 0;
                return (
                  <button
                    key={producto.id_producto}
                    disabled={sinStock}
                    onClick={() => agregarAlPedido(producto)}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition-transform active:scale-95 relative overflow-hidden ${
                      sinStock
                        ? "border-red-900/50 bg-gray-900 opacity-60 cursor-not-allowed"
                        : "border-gray-700 bg-gray-800 hover:border-blue-500"
                    }`}
                  >
                    {sinStock && (
                      <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center backdrop-blur-[1px] z-10">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded border border-red-500 transform -rotate-12">
                          Agotado
                        </span>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 bg-black/50 text-[10px] text-gray-300 px-1.5 rounded">
                      {producto.stock_actual} disp.
                    </span>

                    <div className="w-12 h-12 bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
                      🍺
                    </div>
                    <span className="text-xs font-bold leading-tight mb-1">
                      {producto.nombre}
                    </span>
                    <span className="text-blue-400 font-black text-xs mt-auto">
                      {formatearDinero(Number(producto.precio_venta))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lado Derecho: La Libreta del Mesero (Sticky en móvil) */}
          <div className="w-full md:w-80 lg:w-96 bg-gray-900 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col h-[50vh] md:h-auto shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] md:shadow-none z-20">
            {/* Header Libreta */}
            <div className="p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">
                  Mesa {mesaActiva.nombre_identificador}
                </h3>
                <p className="text-[10px] text-gray-400 uppercase">
                  {mesaActiva.estado === "Ocupada"
                    ? "Agregando a cuenta existente"
                    : "Abriendo mesa nueva"}
                </p>
              </div>
            </div>

            {/* Lista de Pedidos actuales */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pedidoActual.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                  <span className="text-4xl mb-2">📝</span>
                  <p className="text-sm font-bold">Libreta vacía</p>
                  <p className="text-xs">
                    Toca los productos para agregarlos a la orden.
                  </p>
                </div>
              ) : (
                pedidoActual.map((item) => (
                  <div
                    key={item.id_producto}
                    className="bg-gray-800 p-2 rounded-lg border border-gray-700 flex justify-between items-center shadow-sm"
                  >
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-bold leading-tight">
                        {item.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatearDinero(item.precio_venta)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 rounded-md border border-gray-700 px-1 py-0.5">
                      <button
                        onClick={() => quitarDelPedido(item.id_producto)}
                        className="text-red-400 px-2 py-1 font-bold active:bg-gray-800 rounded"
                      >
                        -
                      </button>
                      <span className="text-sm font-black w-4 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          agregarAlPedido(
                            productos.find(
                              (p) => p.id_producto === item.id_producto,
                            )!,
                          )
                        }
                        className="text-blue-400 px-2 py-1 font-bold active:bg-gray-800 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Botón Enviar */}
            <div className="p-4 bg-gray-950 border-t border-gray-800">
              <button
                disabled={pedidoActual.length === 0 || procesando}
                onClick={enviarPedidoABarra}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 py-4 rounded-xl font-black text-white tracking-widest uppercase transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2"
              >
                {procesando ? "Enviando..." : "🔔 Enviar a Barra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
