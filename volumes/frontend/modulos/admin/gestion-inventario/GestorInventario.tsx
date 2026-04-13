"use client";

import { useState, useEffect, useRef } from "react";
import { Producto } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
}

export default function GestorInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [todasSubcategorias, setTodasSubcategorias] = useState<Subcategoria[]>(
    [],
  );

  const [estaCargando, setEstaCargando] = useState(false);

  // Estados de Edición y Eliminación de Productos
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
  const [idSubcategoria, setIdSubcategoria] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenUrlActual, setImagenUrlActual] = useState<string | null>(null);

  // Estados creación de Categorías/Subcategorías
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState("");
  const [creandoSubcategoria, setCreandoSubcategoria] = useState(false);
  const [nombreNuevaSubcategoria, setNombreNuevaSubcategoria] = useState("");

  // 🚀 NUEVO: Estados para los filtros del Catálogo Visual
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null);
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<number | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargarDatos = async () => {
    try {
      const [resProductos, resCategorias, resSubcats] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/categorias`),
        fetch(`${API_URL}/subcategorias`),
      ]);

      const datosProductos = await resProductos.json();
      const datosCategorias = await resCategorias.json();
      const datosSubcats = await resSubcats.json();

      setProductos(Array.isArray(datosProductos) ? datosProductos : []);
      setCategorias(Array.isArray(datosCategorias) ? datosCategorias : []);
      setTodasSubcategorias(Array.isArray(datosSubcats) ? datosSubcats : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🚀 CORRECCIÓN DEL BUG DE EDICIÓN: Filtramos instantáneamente sin llamar a la API
  const subcategoriasFormulario = idCategoria
    ? todasSubcategorias.filter((s) => s.id_categoria === Number(idCategoria))
    : [];

  // 🚀 NUEVO: Crear Categoría con Validación de Duplicados
  const manejarCrearCategoria = async () => {
    const nombreLimpio = nombreNuevaCategoria.trim();
    if (!nombreLimpio) return;

    // Validación de duplicados
    const existe = categorias.some(
      (c) => c.nombre.toLowerCase() === nombreLimpio.toLowerCase(),
    );
    if (existe) {
      alert("❌ Esta categoría ya existe.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreLimpio }),
      });
      if (res.ok) {
        const nuevaCat = await res.json();
        await cargarDatos();
        setIdCategoria(nuevaCat.id_categoria.toString());
        setCreandoCategoria(false);
        setNombreNuevaCategoria("");
      } else {
        alert("No se pudo crear la categoría");
      }
    } catch (error) {
      console.error("Error al crear categoría", error);
    }
  };

  // 🚀 NUEVO: Eliminar Categoría
  const eliminarCategoria = async (id: number) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esta categoría? (Solo se puede si no tiene productos asociados)",
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/categorias/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (idCategoria === id.toString()) setIdCategoria("");
        if (filtroCategoria === id) setFiltroCategoria(null);
        cargarDatos();
      } else {
        alert(
          "❌ No se puede eliminar. Probablemente tiene productos o subcategorías asociadas.",
        );
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  // 🚀 NUEVO: Crear Subcategoría con Validación de Duplicados
  const manejarCrearSubcategoria = async () => {
    const nombreLimpio = nombreNuevaSubcategoria.trim();
    if (!nombreLimpio || !idCategoria) return;

    // Validación de duplicados en la misma categoría
    const existe = subcategoriasFormulario.some(
      (s) => s.nombre.toLowerCase() === nombreLimpio.toLowerCase(),
    );
    if (existe) {
      alert("❌ Esta subcategoría ya existe en esta categoría.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/subcategorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreLimpio,
          id_categoria: Number(idCategoria),
        }),
      });
      if (res.ok) {
        const nuevaSubcat = await res.json();
        await cargarDatos();
        setIdSubcategoria(nuevaSubcat.id_subcategoria.toString());
        setCreandoSubcategoria(false);
        setNombreNuevaSubcategoria("");
      }
    } catch (error) {
      console.error("Error al crear subcategoría", error);
    }
  };

  // 🚀 NUEVO: Eliminar Subcategoría
  const eliminarSubcategoria = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta subcategoría?"))
      return;
    try {
      const res = await fetch(`${API_URL}/subcategorias/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (idSubcategoria === id.toString()) setIdSubcategoria("");
        cargarDatos();
      } else {
        alert(
          "❌ No se puede eliminar. Probablemente tiene productos asociados.",
        );
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  const resetearFormulario = () => {
    setModoEdicion(false);
    setIdProductoEdicion(null);
    setNombre("");
    setCosto("");
    setPrecio("");
    setIdCategoria("");
    setIdSubcategoria("");
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
    // Se setea la subcategoría; gracias a que subcategoriasFormulario ahora es síncrono, se reflejará perfectamente.
    setIdSubcategoria(
      prod.id_subcategoria ? prod.id_subcategoria.toString() : "",
    );
    setImagen(null);
    setImagenUrlActual(prod.imagen_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const manejarGuardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!idCategoria) return alert("Por favor, selecciona una categoría.");

    // 🚀 LÍMITE DE COSTOS Y PRECIOS (5 Millones máximo)
    if (Number(costo) > 5000000 || Number(precio) > 5000000) {
      return alert("❌ El costo o el precio no pueden superar los $5,000,000.");
    }

    setEstaCargando(true);

    try {
      const datosFormulario = new FormData();
      datosFormulario.append("nombre", nombre);
      datosFormulario.append("costo_compra", costo);
      datosFormulario.append("precio_venta", precio);
      datosFormulario.append("id_categoria", idCategoria);

      if (idSubcategoria) {
        datosFormulario.append("id_subcategoria", idSubcategoria);
      }

      if (imagen) {
        datosFormulario.append("imagen", imagen);
      }

      const url = modoEdicion
        ? `${API_URL}/productos/${idProductoEdicion}`
        : `${API_URL}/productos`;
      const metodo = modoEdicion ? "PATCH" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        body: datosFormulario,
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
        { method: "DELETE" },
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

  // 🚀 LÓGICA DE VISUALIZACIÓN DEL CATÁLOGO
  const productosOrdenados = [...productos].sort(
    (a, b) => b.id_producto - a.id_producto,
  );
  let productosAMostrar = [];

  if (filtroCategoria === null) {
    // Si no hay filtro, mostramos solo los últimos 6
    productosAMostrar = productosOrdenados.slice(0, 6);
  } else {
    // Si hay categoría, filtramos
    productosAMostrar = productosOrdenados.filter(
      (p) => p.id_categoria === filtroCategoria,
    );
    // Si además hay subcategoría, filtramos más
    if (filtroSubcategoria !== null) {
      productosAMostrar = productosAMostrar.filter(
        (p) => p.id_subcategoria === filtroSubcategoria,
      );
    }
  }

  const subcategoriasFiltroVista = filtroCategoria
    ? todasSubcategorias.filter((s) => s.id_categoria === filtroCategoria)
    : [];

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
              {modoEdicion && imagenUrlActual && !imagen && (
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={`${API_URL}${imagenUrlActual}`}
                    alt="Actual"
                    className="w-full h-full object-contain"
                  />
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
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Categoría Principal
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
                    {/* Botón Eliminar Categoría actual (solo si hay una seleccionada) */}
                    {idCategoria && (
                      <button
                        type="button"
                        onClick={() => eliminarCategoria(Number(idCategoria))}
                        className="bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white px-3 rounded-lg border border-gray-700 transition-colors"
                        title="Eliminar Categoría"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCreandoCategoria(true)}
                      className="bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white px-3 rounded-lg border border-gray-700 font-bold transition-colors"
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

              {/* 🚀 SUBCATEGORÍA AHORA SIEMPRE VISIBLE */}
              <div className="pt-3 border-t border-gray-800/50">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Subcategoría{" "}
                  <span className="text-[9px] text-gray-600 lowercase">
                    (Opcional)
                  </span>
                </label>
                {!creandoSubcategoria ? (
                  <div className="flex gap-2">
                    <select
                      value={idSubcategoria}
                      onChange={(e) => setIdSubcategoria(e.target.value)}
                      disabled={!idCategoria} // Se deshabilita si no hay categoría
                      className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 text-sm disabled:opacity-50"
                    >
                      <option value="">
                        {idCategoria
                          ? "-- Sin Subcategoría --"
                          : "Selecciona una categoría primero"}
                      </option>
                      {subcategoriasFormulario.map((sub) => (
                        <option
                          key={sub.id_subcategoria}
                          value={sub.id_subcategoria}
                        >
                          ↳ {sub.nombre}
                        </option>
                      ))}
                    </select>
                    {idSubcategoria && (
                      <button
                        type="button"
                        onClick={() =>
                          eliminarSubcategoria(Number(idSubcategoria))
                        }
                        className="bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white px-3 rounded-lg border border-gray-700 transition-colors"
                        title="Eliminar Subcategoría"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!idCategoria}
                      onClick={() => setCreandoSubcategoria(true)}
                      className="bg-gray-800/50 hover:bg-blue-600 text-gray-300 hover:text-white px-3 rounded-lg border border-gray-700 font-bold transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={nombreNuevaSubcategoria}
                      onChange={(e) =>
                        setNombreNuevaSubcategoria(e.target.value)
                      }
                      className="flex-1 bg-gray-800 border border-blue-500 rounded-lg px-3 py-2 text-white outline-none text-sm"
                      placeholder="Ej. Cerveza Artesanal"
                    />
                    <button
                      type="button"
                      onClick={manejarCrearSubcategoria}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 rounded-lg font-bold"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreandoSubcategoria(false)}
                      className="bg-red-900/50 hover:bg-red-500 text-red-400 hover:text-white px-3 rounded-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
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
                  max="5000000"
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
                  max="5000000"
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

        {/* 🚀 ZONA DEL CATÁLOGO CON FILTROS */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {/* Navegación de Filtros */}
          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">
              Filtrar por Categoría
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFiltroCategoria(null);
                  setFiltroSubcategoria(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtroCategoria === null ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                Últimos Agregados
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id_categoria}
                  onClick={() => {
                    setFiltroCategoria(cat.id_categoria);
                    setFiltroSubcategoria(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtroCategoria === cat.id_categoria ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            {/* Filtros de Subcategoría (Si hay una categoría seleccionada) */}
            {filtroCategoria !== null &&
              subcategoriasFiltroVista.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroSubcategoria(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroSubcategoria === null ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                  >
                    Todas las subcategorías
                  </button>
                  {subcategoriasFiltroVista.map((sub) => (
                    <button
                      key={sub.id_subcategoria}
                      onClick={() => setFiltroSubcategoria(sub.id_subcategoria)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroSubcategoria === sub.id_subcategoria ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                    >
                      {sub.nombre}
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* Grilla de Productos */}
          {productosAMostrar.length === 0 ? (
            <div className="bg-gray-900/50 p-10 rounded-2xl border border-gray-800 border-dashed text-center text-gray-500 flex flex-col items-center justify-center flex-1 min-h-[300px]">
              <span className="text-4xl mb-4">🔍</span>
              <p>No se encontraron productos en esta vista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {productosAMostrar.map((producto) => (
                <div
                  key={producto.id_producto}
                  className="bg-gray-800/80 rounded-2xl border border-gray-700 flex flex-col hover:border-gray-500 transition-all group overflow-hidden"
                >
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

                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-bold text-sm text-white line-clamp-2 mb-1"
                      title={producto.nombre}
                    >
                      {producto.nombre}
                    </h3>
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">
                        {categorias.find(
                          (c) => c.id_categoria === producto.id_categoria,
                        )?.nombre || "Sin Categoría"}
                      </p>
                      {producto.id_subcategoria && (
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">
                          ↳{" "}
                          {
                            todasSubcategorias.find(
                              (s) =>
                                s.id_subcategoria === producto.id_subcategoria,
                            )?.nombre
                          }
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex justify-between items-center bg-gray-950/50 p-2 rounded-lg border border-gray-800 mb-3">
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
                    <div className="flex justify-end gap-2 border-t border-gray-700 pt-3">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Eliminación de Producto */}
      {productoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Eliminar Producto?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Estás a punto de eliminar{" "}
              <strong className="text-white">{productoAEliminar.nombre}</strong>
              .
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
