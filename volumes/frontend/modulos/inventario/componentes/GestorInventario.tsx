"use client";

import { useState, useEffect } from "react";
import { Producto } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

export default function GestorInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [idCategoria, setIdCategoria] = useState("1"); // Por defecto 1 para evitar errores de llave foránea
  const [imagen, setImagen] = useState<File | null>(null);

  const [estaCargando, setEstaCargando] = useState(false);

  // Cargar el catálogo
  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/productos`);
      const datos = await respuesta.json();
      setProductos(datos);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Guardar un nuevo producto
  const manejarCrearProducto = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstaCargando(true);

    try {
      // 📸 LA MAGIA: Usamos FormData en lugar de JSON para poder enviar la foto
      const datosFormulario = new FormData();
      datosFormulario.append("nombre", nombre);
      datosFormulario.append("costo_compra", costo);
      datosFormulario.append("precio_venta", precio);
      datosFormulario.append("id_categoria", idCategoria);

      if (imagen) {
        datosFormulario.append("imagen", imagen);
      }

      // OJO: Cuando usamos FormData, NO le ponemos 'Content-Type' a los headers.
      // El navegador lo hace automáticamente y le pone el formato correcto.
      const respuesta = await fetch(`${API_URL}/productos`, {
        method: "POST",
        body: datosFormulario,
      });

      if (respuesta.ok) {
        // Limpiamos el formulario
        setNombre("");
        setCosto("");
        setPrecio("");
        setImagen(null);
        // Reseteamos el input tipo file visualmente
        const inputArchivo = document.getElementById(
          "input-imagen",
        ) as HTMLInputElement;
        if (inputArchivo) inputArchivo.value = "";

        cargarProductos(); // Recargamos la lista
      } else {
        const errorData = await respuesta.json();
        alert(`Error al guardar: ${errorData.message || "Revisa los datos"}`);
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Catálogo e Inventario</h1>
        <p className="text-gray-400">
          Registra los productos que se venderán en el bar
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Recepción (1/3 de la pantalla) */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Nuevo Producto
          </h2>
          <form onSubmit={manejarCrearProducto} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Foto del Producto
              </label>
              <input
                id="input-imagen"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImagen(e.target.files ? e.target.files[0] : null)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Nombre
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Ej. Cerveza Corona 355ml"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Costo ($)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Ej. 2500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Precio Venta ($)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Ej. 8000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                ID Categoría
              </label>
              <input
                required
                type="number"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Ej. 1"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                *Asegúrate de que este ID exista en tu tabla de categorías.
              </p>
            </div>

            <button
              disabled={estaCargando}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg shadow-blue-500/20"
            >
              {estaCargando ? "Guardando..." : "Agregar al Catálogo"}
            </button>
          </form>
        </div>

        {/* Catálogo Visual (2/3 de la pantalla) */}
        <div className="lg:col-span-2">
          {productos.length === 0 ? (
            <div className="bg-gray-900/50 p-10 rounded-2xl border border-gray-800 border-dashed text-center text-gray-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <span className="text-4xl mb-4">📦</span>
              <p>Tu inventario está vacío.</p>
              <p className="text-sm">
                Agrega tu primer producto usando el formulario.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <div
                  key={producto.id_producto}
                  className="bg-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-500 transition-all group relative"
                >
                  {/* Etiqueta de Stock */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white z-10 border border-gray-600">
                    Stock: {producto.stock}
                  </div>

                  {/* Imagen del Producto */}
                  <div className="h-40 w-full bg-gray-900 relative flex items-center justify-center overflow-hidden">
                    {producto.imagen_url ? (
                      <img
                        src={`${API_URL}${producto.imagen_url}`}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Si falla al cargar la imagen, mostramos un fallback
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x300?text=Sin+Imagen";
                        }}
                      />
                    ) : (
                      <span className="text-4xl opacity-50">🏷️</span>
                    )}
                  </div>

                  {/* Detalles del Producto */}
                  <div className="p-4">
                    <h3
                      className="font-bold text-sm text-white truncate"
                      title={producto.nombre}
                    >
                      {producto.nombre}
                    </h3>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-xs text-gray-400">
                        Cat: {producto.id_categoria}
                      </p>
                      <p className="font-black text-blue-400">
                        ${Number(producto.precio_venta).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
