"use client";

import { useState, useEffect } from "react";
import { Producto } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

// Molde rápido para las categorías
interface Categoria {
  id_categoria: number;
  nombre: string;
}

export default function GestorInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estados del formulario de Producto
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);

  // Estados para crear Categoría al vuelo
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState("");

  const [estaCargando, setEstaCargando] = useState(false);

  // Cargar productos y categorías al mismo tiempo
  const cargarDatos = async () => {
    try {
      const [resProductos, resCategorias] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/categorias`),
      ]);

      const datosProductos = await resProductos.json();
      const datosCategorias = await resCategorias.json();

      // 🛡️ ESCUDO: Verificamos que realmente sean Arrays (listas) antes de guardarlos.
      // Si el backend mandó un error, guardamos un array vacío [] para que React no explote.
      setProductos(Array.isArray(datosProductos) ? datosProductos : []);
      setCategorias(Array.isArray(datosCategorias) ? datosCategorias : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para guardar Categoría Nueva blindada
  const manejarCrearCategoria = async () => {
    if (!nombreNuevaCategoria.trim()) return;

    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreNuevaCategoria }),
      });

      if (res.ok) {
        const nuevaCat = await res.json();
        await cargarDatos(); // Recargamos la lista
        setIdCategoria(nuevaCat.id_categoria.toString());
        setCreandoCategoria(false);
        setNombreNuevaCategoria("");
      } else {
        // 🚨 AQUÍ ESTÁ LA MAGIA: Si el backend falla, leemos el error y lo mostramos
        const errorData = await res.json();
        alert(
          `Error del Backend: ${errorData.message || "No se pudo crear la categoría"}`,
        );
      }
    } catch (error) {
      console.error("Error al crear categoría", error);
      alert("Error de conexión con el servidor");
    }
  };

  // Guardar un nuevo producto
  const manejarCrearProducto = async (evento: React.FormEvent) => {
    evento.preventDefault();

    if (!idCategoria) {
      return alert("Por favor, selecciona o crea una categoría primero.");
    }

    setEstaCargando(true);

    try {
      const datosFormulario = new FormData();
      datosFormulario.append("nombre", nombre);
      datosFormulario.append("costo_compra", costo);
      datosFormulario.append("precio_venta", precio);
      datosFormulario.append("id_categoria", idCategoria);

      if (imagen) {
        datosFormulario.append("imagen", imagen);
      }

      const respuesta = await fetch(`${API_URL}/productos`, {
        method: "POST",
        body: datosFormulario,
      });

      if (respuesta.ok) {
        setNombre("");
        setCosto("");
        setPrecio("");
        setImagen(null);
        setIdCategoria("");

        const inputArchivo = document.getElementById(
          "input-imagen",
        ) as HTMLInputElement;
        if (inputArchivo) inputArchivo.value = "";

        cargarDatos();
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
        {/* Formulario de Recepción */}
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

            {/* ZONA DE CATEGORÍAS (UX MEJORADO) */}
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Categoría
              </label>

              {!creandoCategoria ? (
                <div className="flex gap-2">
                  <select
                    required
                    value={idCategoria}
                    onChange={(e) => setIdCategoria(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCreandoCategoria(true)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 rounded-lg border border-gray-700 font-bold"
                    title="Nueva Categoría"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={nombreNuevaCategoria}
                    onChange={(e) => setNombreNuevaCategoria(e.target.value)}
                    className="flex-1 bg-gray-800 border border-blue-500 rounded-lg px-3 py-2 text-white outline-none"
                    placeholder="Ej. Licores Fuertes"
                  />
                  <button
                    type="button"
                    onClick={manejarCrearCategoria}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 rounded-lg font-bold"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreandoCategoria(false)}
                    className="bg-red-900/50 hover:bg-red-900 text-red-400 px-3 rounded-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
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

            <button
              disabled={estaCargando}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg shadow-blue-500/20"
            >
              {estaCargando ? "Guardando..." : "Agregar al Catálogo"}
            </button>
          </form>
        </div>

        {/* Catálogo Visual */}
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
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white z-10 border border-gray-600">
                    Stock: {producto.stock}
                  </div>
                  <div className="h-40 w-full bg-gray-900 relative flex items-center justify-center overflow-hidden">
                    {producto.imagen_url ? (
                      <img
                        src={`${API_URL}${producto.imagen_url}`}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x300?text=Sin+Imagen";
                        }}
                      />
                    ) : (
                      <span className="text-4xl opacity-50">🏷️</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-bold text-sm text-white truncate"
                      title={producto.nombre}
                    >
                      {producto.nombre}
                    </h3>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[10px] bg-gray-700 px-2 py-1 rounded text-gray-300 truncate max-w-[80px]">
                        {categorias.find(
                          (c) => c.id_categoria === producto.id_categoria,
                        )?.nombre || "Sin Cat"}
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
