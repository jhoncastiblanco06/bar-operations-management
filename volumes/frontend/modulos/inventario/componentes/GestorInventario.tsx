"use client";

import { useState, useEffect, useRef } from "react";
import { Producto } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

export default function GestorInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados de Edición y Eliminación
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProductoEdicion, setIdProductoEdicion] = useState<number | null>(
    null,
  );
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(
    null,
  );

  // Estados del formulario de Producto
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenUrlActual, setImagenUrlActual] = useState<string | null>(null);

  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargarDatos = async () => {
    try {
      const [resProductos, resCategorias] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/categorias`),
      ]);

      const datosProductos = await resProductos.json();
      const datosCategorias = await resCategorias.json();

      setProductos(Array.isArray(datosProductos) ? datosProductos : []);
      setCategorias(Array.isArray(datosCategorias) ? datosCategorias : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

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
        await cargarDatos();
        setIdCategoria(nuevaCat.id_categoria.toString());
        setCreandoCategoria(false);
        setNombreNuevaCategoria("");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || "No se pudo crear la categoría"}`);
      }
    } catch (error) {
      console.error("Error al crear categoría", error);
    }
  };

  const resetearFormulario = () => {
    setModoEdicion(false);
    setIdProductoEdicion(null);
    setNombre("");
    setCosto("");
    setPrecio("");
    setIdCategoria("");
    setImagen(null);
    setImagenUrlActual(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const iniciarEdicion = (prod: Producto) => {
    setModoEdicion(true);
    setIdProductoEdicion(prod.id_producto);
    setNombre(prod.nombre);
    setCosto(prod.costo_compra.toString());
    setPrecio(prod.precio_venta.toString());
    setIdCategoria(prod.id_categoria.toString());
    setImagen(null); // Reseteamos el input de archivo
    setImagenUrlActual(prod.imagen_url || null); // Guardamos la URL actual para mostrarla
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const manejarGuardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!idCategoria) return alert("Por favor, selecciona una categoría.");

    setEstaCargando(true);

    try {
      const datosFormulario = new FormData();
      datosFormulario.append("nombre", nombre);
      datosFormulario.append("costo_compra", costo);
      datosFormulario.append("precio_venta", precio);
      datosFormulario.append("id_categoria", idCategoria);

      // Solo adjuntamos la imagen si el usuario seleccionó una nueva
      if (imagen) {
        datosFormulario.append("imagen", imagen);
      }

      const url = modoEdicion
        ? `${API_URL}/productos/${idProductoEdicion}`
        : `${API_URL}/productos`;
      // IMPORTANTE: Para subir archivos con PATCH en NestJS/Multer, a veces es mejor usar POST y controlar la lógica en el backend,
      // pero usaremos PATCH asumiendo que tu backend lo soporta.
      const metodo = modoEdicion ? "PATCH" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        body: datosFormulario, // FormData establece automáticamente los headers correctos (multipart/form-data)
      });

      if (respuesta.ok) {
        resetearFormulario();
        cargarDatos();
      } else {
        const errorData = await respuesta.json();
        alert(`Error al guardar: ${errorData.message || "Revisa los datos"}`);
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;
    try {
      const res = await fetch(
        `${API_URL}/productos/${productoAEliminar.id_producto}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setProductoAEliminar(null);
        cargarDatos();
      } else {
        alert(
          "No se puede eliminar. Es posible que este producto ya tenga historial en inventario.",
        );
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="space-y-8 relative">
      <header>
        <h1 className="text-3xl font-bold">Catálogo Maestro</h1>
        <p className="text-gray-400">
          Registra los productos base que se distribuirán a las sedes
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit lg:col-span-1 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-xl font-semibold ${modoEdicion ? "text-purple-400" : "text-blue-400"}`}
            >
              {modoEdicion ? "✏️ Editar Producto" : "📦 Nuevo Producto"}
            </h2>
            {modoEdicion && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={manejarGuardarProducto} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider">
                Foto del Producto
              </label>

              {/* Vista previa de imagen en modo edición */}
              {modoEdicion && imagenUrlActual && !imagen && (
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={`${API_URL}${imagenUrlActual}`}
                    alt="Actual"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white bg-black/80 px-2 py-1 rounded">
                      Imagen Actual
                    </span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImagen(e.target.files ? e.target.files[0] : null)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
              />
              {modoEdicion && (
                <p className="text-[10px] text-gray-500">
                  Deja vacío para mantener la imagen actual.
                </p>
              )}
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

            {/* ZONA DE CATEGORÍAS */}
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
                    className="bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white px-3 rounded-lg border border-gray-700 font-bold transition-colors"
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
                    placeholder="Nueva Categoría"
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
                    className="bg-red-900/50 hover:bg-red-500 text-red-400 hover:text-white px-3 rounded-lg font-bold"
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
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Venta ($)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              disabled={estaCargando}
              className={`w-full text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg ${modoEdicion ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"}`}
            >
              {estaCargando
                ? "Guardando..."
                : modoEdicion
                  ? "Actualizar Producto"
                  : "Agregar al Catálogo"}
            </button>
          </form>
        </div>

        {/* Catálogo Visual */}
        <div className="lg:col-span-2">
          {productos.length === 0 ? (
            <div className="bg-gray-900/50 p-10 rounded-2xl border border-gray-800 border-dashed text-center text-gray-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <span className="text-4xl mb-4">📦</span>
              <p>El catálogo está vacío.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {productos.map((producto) => (
                <div
                  key={producto.id_producto}
                  className="bg-gray-800/80 rounded-2xl border border-gray-700 flex flex-col hover:border-gray-500 transition-all group overflow-hidden"
                >
                  {/* Imagen y Etiqueta (Sin los botones ocultos) */}
                  <div className="h-40 w-full bg-gray-900 relative flex items-center justify-center overflow-hidden border-b border-gray-700">
                    <div
                      className={`absolute top-2 right-2 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold z-10 border ${producto.estado === "Inactivo" ? "bg-red-900/80 text-red-100 border-red-500" : "bg-black/60 text-white border-gray-600"}`}
                    >
                      {producto.estado || "Activo"}
                    </div>
                    {producto.imagen_url ? (
                      <img
                        src={`${API_URL}${producto.imagen_url}`}
                        alt={producto.nombre}
                        // 👇 CAMBIAMOS 'object-cover' por 'object-contain' y le damos un poco de 'p-2' (padding) para que respire
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%231f2937%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E";
                        }}
                      />
                    ) : (
                      <span className="text-4xl opacity-30">🏷️</span>
                    )}
                  </div>

                  {/* Detalles Info */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* 🛡️ NUEVO: Botones de Acción siempre visibles */}
                    <div className="mt-auto flex justify-end gap-2 border-t border-gray-700 pt-3">
                      <button
                        onClick={() => iniciarEdicion(producto)}
                        className="bg-gray-900 hover:bg-purple-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-700 hover:border-purple-500 flex items-center gap-1"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => setProductoAEliminar(producto)}
                        className="bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-700 hover:border-red-500 flex items-center gap-1"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Detalles Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-bold text-sm text-white line-clamp-2 mb-1"
                      title={producto.nombre}
                    >
                      {producto.nombre}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">
                      {categorias.find(
                        (c) => c.id_categoria === producto.id_categoria,
                      )?.nombre || "Sin Categoría"}
                    </p>

                    <div className="mt-auto flex justify-between items-center bg-gray-950/50 p-2 rounded-lg border border-gray-800">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase">
                          Costo
                        </p>
                        <p className="font-medium text-xs text-gray-300">
                          ${Number(producto.costo_compra).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-500 uppercase">
                          Venta
                        </p>
                        <p className="font-black text-sm text-blue-400">
                          ${Number(producto.precio_venta).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🛑 Modal de Eliminación 🛑 */}
      {productoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Eliminar Producto?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Estás a punto de eliminar{" "}
              <strong className="text-white">{productoAEliminar.nombre}</strong>{" "}
              del catálogo maestro.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setProductoAEliminar(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
