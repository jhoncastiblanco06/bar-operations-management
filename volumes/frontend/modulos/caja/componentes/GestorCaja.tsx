"use client";

import { useState, useEffect } from "react";
import { Producto, Mesa, Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
}

// Interfaz para el inventario cruzado
interface ProductoEnStock extends Producto {
  stock_actual: number;
}

export default function GestorCaja() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>("");

  const [productosDisponibles, setProductosDisponibles] = useState<
    ProductoEnStock[]
  >([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);

  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // 1. Cargar solo las Sedes al inicio
  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const res = await fetch(`${API_URL}/sedes`);
        const data = await res.json();
        setSedes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar sedes:", error);
      }
    };
    cargarSedes();
  }, []);

  // 2. Cargar Mesas y Productos con Stock cuando se selecciona una Sede
  useEffect(() => {
    if (!sedeSeleccionada) {
      setMesas([]);
      setProductosDisponibles([]);
      setMesaSeleccionada(null);
      setCarrito([]);
      return;
    }

    const cargarDatosDeSede = async () => {
      setEstaCargando(true);
      try {
        // Asumiremos que crearás estos endpoints en tu backend:
        // /mesas/sede/:id_sede -> Devuelve solo las mesas de la sede
        // /inventario/pos/:id_sede -> Devuelve los productos maestros cruzados con el stock de esa sede
        const [resMesas, resInventario] = await Promise.all([
          fetch(`${API_URL}/mesas/sede/${sedeSeleccionada}`),
          fetch(`${API_URL}/inventario/pos/${sedeSeleccionada}`),
        ]);

        const dataMesas = await resMesas.json();
        const dataInventario = await resInventario.json();

        setMesas(Array.isArray(dataMesas) ? dataMesas : []);
        // Filtramos para que solo salgan productos que tengan stock > 0 en el POS
        const productosConStock = Array.isArray(dataInventario)
          ? dataInventario.filter((p: ProductoEnStock) => p.stock_actual > 0)
          : [];
        setProductosDisponibles(productosConStock);

        // Limpiamos la venta anterior al cambiar de sucursal
        setMesaSeleccionada(null);
        setCarrito([]);
      } catch (error) {
        console.error("Error al cargar datos de la sede:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    cargarDatosDeSede();
  }, [sedeSeleccionada]);

  const agregarAlCarrito = (producto: ProductoEnStock) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id_producto === producto.id_producto,
      );

      // Validación de Stock
      if (existe && existe.cantidad >= producto.stock_actual) {
        alert(`No hay más stock de ${producto.nombre}`);
        return carritoActual;
      }

      if (existe) {
        return carritoActual.map((item) =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [
        ...carritoActual,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio_venta: Number(producto.precio_venta),
          cantidad: 1,
        },
      ];
    });
  };

  const quitarDelCarrito = (id_producto: number) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id_producto === id_producto,
      );
      if (existe && existe.cantidad > 1) {
        return carritoActual.map((item) =>
          item.id_producto === id_producto
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        );
      }
      return carritoActual.filter((item) => item.id_producto !== id_producto);
    });
  };

  // Cálculos Financieros
  const subtotal = carrito.reduce(
    (total, item) => total + item.precio_venta * item.cantidad,
    0,
  );
  const iva = subtotal * 0.19; // 19% de IVA
  const totalPagar = subtotal + iva;

  const formatearDinero = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const procesarVenta = async () => {
    if (!sedeSeleccionada) return alert("Selecciona una sede.");
    if (!mesaSeleccionada)
      return alert("Por favor selecciona una mesa primero.");
    if (carrito.length === 0) return alert("El carrito está vacío.");

    try {
      // 1. Enviamos la orden al backend
      const respuesta = await fetch(`${API_URL}/caja/venta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sede: Number(sedeSeleccionada),
          id_mesa: mesaSeleccionada,
          id_mesero: 1, // TODO: Cambiar por el ID del usuario logueado en el futuro
          carrito: carrito,
        }),
      });

      if (respuesta.ok) {
        alert(
          `¡Cobro exitoso!\n\nMesa: ${mesas.find((m) => m.id_mesa === mesaSeleccionada)?.nombre_identificador}\nTotal Cobrado: ${formatearDinero(totalPagar)}`,
        );

        // 2. Limpiamos la caja
        setCarrito([]);
        setMesaSeleccionada(null);

        // 3. 🔄 RECARGAMOS EL INVENTARIO PARA VER EL STOCK ACTUALIZADO
        const resInventario = await fetch(
          `${API_URL}/inventario/pos/${sedeSeleccionada}`,
        );
        const dataInventario = await resInventario.json();
        const productosConStock = Array.isArray(dataInventario)
          ? dataInventario.filter((p: ProductoEnStock) => p.stock_actual > 0)
          : [];
        setProductosDisponibles(productosConStock);
      } else {
        const error = await respuesta.json();
        alert(`Error al procesar la venta: ${error.message}`);
      }
    } catch (error) {
      console.error("Error en la transacción:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* HEADER: Selector de Sede */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-blue-500">POS</span> Terminal
          </h1>
          <p className="text-xs text-gray-400">Punto de Venta Integrado</p>
        </div>

        <div className="w-full sm:w-72">
          <select
            value={sedeSeleccionada}
            onChange={(e) => setSedeSeleccionada(e.target.value)}
            className="w-full bg-gray-950 border border-blue-500/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 font-bold transition-all shadow-lg shadow-blue-500/10"
          >
            <option value="" disabled>
              -- Seleccionar Sucursal --
            </option>
            {sedes.map((s) => (
              <option key={s.id_sede} value={s.id_sede}>
                {s.nombre} - {s.ciudad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!sedeSeleccionada ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl p-6 text-center">
          <span className="text-6xl mb-4 opacity-50">🏪</span>
          <h2 className="text-2xl font-bold text-gray-300">Caja Cerrada</h2>
          <p className="text-gray-500 mt-2 max-w-sm">
            Selecciona la sucursal en el menú superior para abrir la caja, ver
            las mesas y los productos disponibles.
          </p>
        </div>
      ) : estaCargando ? (
        <div className="flex-1 flex items-center justify-center text-blue-400 animate-pulse font-bold tracking-widest uppercase">
          Cargando entorno del POS...
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-4 flex-1 overflow-hidden">
          {/* IZQUIERDA: Mesas y Catálogo */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* MESAS */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 shrink-0 shadow-lg">
              <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <span className="bg-gray-800 px-2 py-1 rounded text-white">
                  1
                </span>{" "}
                Seleccionar Mesa
              </h2>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
                {mesas.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No hay mesas registradas en esta sede.
                  </p>
                ) : (
                  mesas.map((mesa) => (
                    <button
                      key={mesa.id_mesa}
                      onClick={() => setMesaSeleccionada(mesa.id_mesa)}
                      className={`min-w-[100px] md:min-w-[120px] p-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                        mesaSeleccionada === mesa.id_mesa
                          ? "border-blue-500 bg-blue-600/20 text-blue-400 transform scale-105 shadow-lg shadow-blue-500/20"
                          : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <span className="text-2xl mb-1">🪑</span>
                      <span className="text-xs md:text-sm font-bold truncate w-full text-center">
                        {mesa.nombre_identificador}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* PRODUCTOS */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex-1 overflow-y-auto shadow-lg scrollbar-thin scrollbar-thumb-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <span className="bg-gray-800 px-2 py-1 rounded text-white">
                    2
                  </span>{" "}
                  Agregar Productos
                </h2>
                <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full font-bold border border-blue-800/50">
                  Mostrando solo stock disponible
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {productosDisponibles.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No hay productos con stock en esta sede.
                  </div>
                ) : (
                  productosDisponibles.map((producto) => (
                    <button
                      key={producto.id_producto}
                      onClick={() => agregarAlCarrito(producto)}
                      className="bg-gray-800 rounded-xl border border-gray-700 p-3 flex flex-col items-center text-center active:scale-95 transition-transform hover:border-blue-500/50 group relative"
                    >
                      {/* Etiqueta de Stock */}
                      <span className="absolute top-2 right-2 bg-black/60 text-[9px] font-bold px-1.5 py-0.5 rounded text-gray-300">
                        {producto.stock_actual}
                      </span>

                      <div className="w-16 h-16 bg-gray-900 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                        {producto.imagen_url ? (
                          <img
                            src={`${API_URL}${producto.imagen_url}`}
                            alt={producto.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <span className="text-2xl opacity-50">🍹</span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-white line-clamp-2 leading-tight mb-1">
                        {producto.nombre}
                      </span>

                      <span className="text-xs text-blue-400 font-black mt-auto bg-gray-950/50 px-2 py-1 rounded-md w-full border border-gray-700/50">
                        {formatearDinero(Number(producto.precio_venta))}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DERECHA: Ticket de Compra (Carrito) */}
          <div className="w-full xl:w-[400px] bg-gray-900 rounded-2xl border border-gray-800 flex flex-col shrink-0 shadow-2xl overflow-hidden">
            {/* TICKET HEADER */}
            <div className="bg-gray-950 p-4 border-b border-gray-800 text-center relative">
              <h2 className="text-xl font-black text-white tracking-widest uppercase">
                Orden de Venta
              </h2>
              <div className="text-xs font-medium mt-1">
                {mesaSeleccionada ? (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-500/20 inline-block mt-1 border border-blue-500">
                    {
                      mesas.find((m) => m.id_mesa === mesaSeleccionada)
                        ?.nombre_identificador
                    }
                  </span>
                ) : (
                  <span className="text-red-400">Esperando mesa...</span>
                )}
              </div>
            </div>

            {/* TICKET ITEMS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 bg-gray-900/50">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <span className="text-5xl mb-2">🧾</span>
                  <p className="text-sm font-bold uppercase">Ticket Vacío</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.id_producto}
                    className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700/50 shadow-sm"
                  >
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {item.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {formatearDinero(item.precio_venta)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-950 px-2 py-1 rounded-lg border border-gray-700">
                      <button
                        onClick={() => quitarDelCarrito(item.id_producto)}
                        className="text-red-400 hover:text-red-300 font-bold px-1 text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm font-black text-white w-4 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          agregarAlCarrito(
                            productosDisponibles.find(
                              (p) => p.id_producto === item.id_producto,
                            )!,
                          )
                        }
                        className="text-blue-400 hover:text-blue-300 font-bold px-1 text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TICKET FOOTER (Cálculos) */}
            <div className="bg-gray-950 p-5 border-t border-gray-800">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span>{formatearDinero(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium pb-2 border-b border-gray-800 border-dashed">
                  <span>IVA (19%)</span>
                  <span>{formatearDinero(iva)}</span>
                </div>
                <div className="flex justify-between text-xl text-white font-black pt-1">
                  <span>TOTAL</span>
                  <span className="text-blue-400">
                    {formatearDinero(totalPagar)}
                  </span>
                </div>
              </div>

              <button
                onClick={procesarVenta}
                disabled={carrito.length === 0 || !mesaSeleccionada}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-4 rounded-xl font-black text-white uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 disabled:shadow-none border border-blue-500 disabled:border-gray-700"
              >
                Procesar Cobro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
