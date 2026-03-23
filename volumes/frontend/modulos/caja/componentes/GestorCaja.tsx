"use client";

import { useState, useEffect } from "react";
import { Producto, Mesa } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
}

export default function GestorCaja() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);

  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProductos, resMesas] = await Promise.all([
          fetch(`${API_URL}/productos`),
          fetch(`${API_URL}/mesas`),
        ]);
        setProductos(await resProductos.json());
        setMesas(await resMesas.json());
      } catch (error) {
        console.error("Error al cargar datos del POS:", error);
      }
    };
    cargarDatos();
  }, []);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id_producto === producto.id_producto,
      );
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

  const totalPagar = carrito.reduce(
    (total, item) => total + item.precio_venta * item.cantidad,
    0,
  );

  const formatearDinero = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const procesarVenta = () => {
    if (!mesaSeleccionada)
      return alert("Por favor selecciona una mesa primero.");
    if (carrito.length === 0) return alert("El carrito está vacío.");

    alert(
      `¡Cobro exitoso por ${formatearDinero(totalPagar)} en la Mesa ${mesaSeleccionada}!`,
    );
    setCarrito([]);
    setMesaSeleccionada(null);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
      {/* IZQUIERDA */}
      <div className="flex-1 flex flex-col gap-4 md:gap-6">
        {/* MESAS */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-3">
            1. Selecciona la Mesa
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {mesas.map((mesa) => (
              <button
                key={mesa.id_mesa}
                onClick={() => setMesaSeleccionada(mesa.id_mesa)}
                className={`min-w-[100px] md:min-w-[120px] p-3 rounded-xl border-2 flex flex-col items-center ${
                  mesaSeleccionada === mesa.id_mesa
                    ? "border-blue-500 bg-blue-600/20 text-blue-400"
                    : "border-gray-700 bg-gray-800 text-gray-300"
                }`}
              >
                <span className="text-xl md:text-2xl">🪑</span>
                <span className="text-xs md:text-sm font-bold truncate w-full text-center">
                  {mesa.nombre_identificador}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-4">
            2. Agrega Productos
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {productos.map((producto) => (
              <button
                key={producto.id_producto}
                onClick={() => agregarAlCarrito(producto)}
                className="bg-gray-800 rounded-xl border border-gray-700 p-2 md:p-3 flex flex-col items-center text-center active:scale-95"
              >
                {producto.imagen_url ? (
                  <img
                    src={`${API_URL}${producto.imagen_url}`}
                    alt={producto.nombre}
                    className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
                    🍺
                  </div>
                )}

                <span className="text-[11px] md:text-xs font-bold text-white line-clamp-2">
                  {producto.nombre}
                </span>

                <span className="text-xs md:text-sm text-blue-400 font-black mt-1">
                  {formatearDinero(Number(producto.precio_venta))}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DERECHA (CARRITO) */}
      <div className="w-full xl:w-96 bg-gray-900 rounded-2xl border border-gray-800 flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-black">Orden</h2>
          <p className="text-xs text-gray-400">
            {mesaSeleccionada
              ? `Mesa ${mesaSeleccionada}`
              : "Selecciona una mesa"}
          </p>
        </div>

        {/* ITEMS */}
        <div className="flex-1 max-h-[300px] md:max-h-[400px] xl:max-h-none overflow-y-auto p-4 space-y-2">
          {carrito.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">Carrito vacío</p>
          ) : (
            carrito.map((item) => (
              <div
                key={item.id_producto}
                className="flex justify-between items-center bg-gray-800 p-2 md:p-3 rounded-xl"
              >
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold truncate">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-blue-400">
                    {formatearDinero(item.precio_venta)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => quitarDelCarrito(item.id_producto)}
                    className="px-2 text-red-400"
                  >
                    -
                  </button>

                  <span className="text-xs md:text-sm">{item.cantidad}</span>

                  <button
                    onClick={() =>
                      agregarAlCarrito(
                        productos.find(
                          (p) => p.id_producto === item.id_producto,
                        )!,
                      )
                    }
                    className="px-2 text-blue-400"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-400">Total</span>
            <span className="font-black">{formatearDinero(totalPagar)}</span>
          </div>

          <button
            onClick={procesarVenta}
            disabled={carrito.length === 0 || !mesaSeleccionada}
            className="w-full bg-blue-600 disabled:bg-gray-700 py-3 rounded-xl font-bold"
          >
            Cobrar
          </button>
        </div>
      </div>
    </div>
  );
}
