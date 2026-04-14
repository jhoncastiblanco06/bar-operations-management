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

  // Estados de Edición y Eliminación
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProductoEdicion, setIdProductoEdicion] = useState<number | null>(
    null,
  );
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(
    null,
  );

  // Estados del Formulario
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [precio, setPrecio] = useState("");
  const [idCategoria, setIdCategoria] = useState<string>("");
  const [idSubcategoria, setIdSubcategoria] = useState<string>("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenUrlActual, setImagenUrlActual] = useState<string | null>(null);

  // Estados de Creación Rápida
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState("");
  const [creandoSubcategoria, setCreandoSubcategoria] = useState(false);
  const [nombreNuevaSubcategoria, setNombreNuevaSubcategoria] = useState("");

  // 🚀 ESTADOS DE FILTROS Y BÚSQUEDA
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargarDatos = async () => {
    try {
      const [resProductos, resCategorias, resSubcats] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/categorias`),
        fetch(`${API_URL}/subcategorias`),
      ]);

      setProductos(await resProductos.json());
      setCategorias(await resCategorias.json());
      setTodasSubcategorias(await resSubcats.json());
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LOGICA DE FORMULARIO ---
  const subcategoriasDelFormulario =
    idCategoria !== ""
      ? todasSubcategorias.filter((s) => String(s.id_categoria) === idCategoria)
      : todasSubcategorias;

  const manejarCambioSubcategoriaFormulario = (val: string) => {
    setIdSubcategoria(val);
    if (val !== "") {
      const subcat = todasSubcategorias.find(
        (s) => String(s.id_subcategoria) === val,
      );
      if (subcat) setIdCategoria(String(subcat.id_categoria));
    }
  };

  // --- 🛡️ GESTIÓN DE CATEGORÍAS (CON ESCÁNER ANTIDUPLICADOS) ---
  const manejarCrearCategoria = async () => {
    const nomTrim = nombreNuevaCategoria.trim();
    if (!nomTrim) return;

    // Validación Local: Evitar duplicados
    if (
      categorias.some((c) => c.nombre.toLowerCase() === nomTrim.toLowerCase())
    ) {
      return alert(`❌ La categoría "${nomTrim}" ya existe.`);
    }

    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nomTrim }),
      });
      if (res.ok) {
        await cargarDatos();
        setCreandoCategoria(false);
        setNombreNuevaCategoria("");
      } else {
        const err = await res.json();
        alert(`❌ Error del servidor: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarCategoria = async (idCat: number) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esta categoría? Todo lo que esté adentro (subcategorías y productos) también desaparecerá.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/categorias/${idCat}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (idCategoria === String(idCat)) setIdCategoria("");
        if (filtroCategoria === String(idCat)) setFiltroCategoria("");
        await cargarDatos();
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- 🛡️ GESTIÓN DE SUBCATEGORÍAS (CON ESCÁNER ANTIDUPLICADOS) ---
  const manejarCrearSubcategoria = async () => {
    const nomTrim = nombreNuevaSubcategoria.trim();
    if (!nomTrim || idCategoria === "")
      return alert("Selecciona una Categoría Padre.");

    // Validación Local: Evitar duplicados en la misma categoría
    if (
      todasSubcategorias.some(
        (s) =>
          s.nombre.toLowerCase() === nomTrim.toLowerCase() &&
          String(s.id_categoria) === idCategoria,
      )
    ) {
      return alert(
        `❌ La subcategoría "${nomTrim}" ya existe dentro de esta categoría.`,
      );
    }

    try {
      const res = await fetch(`${API_URL}/subcategorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nomTrim,
          id_categoria: Number(idCategoria),
        }),
      });
      if (res.ok) {
        await cargarDatos();
        setCreandoSubcategoria(false);
        setNombreNuevaSubcategoria("");
      } else {
        const err = await res.json();
        alert(`❌ Error del servidor: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarSubcategoria = async (idSub: number) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esta subcategoría? Sus productos desaparecerán.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/subcategorias/${idSub}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (idSubcategoria === String(idSub)) setIdSubcategoria("");
        if (filtroSubcategoria === String(idSub)) setFiltroSubcategoria("");
        await cargarDatos();
      } else {
        const err = await res.json();
        alert(`❌ Error al eliminar subcategoría: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- 🛡️ GESTIÓN DE PRODUCTOS (CON ESCÁNER ANTIDUPLICADOS) ---
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
    setIdCategoria(String(prod.id_categoria));
    setIdSubcategoria(prod.id_subcategoria ? String(prod.id_subcategoria) : "");
    setImagen(null);
    setImagenUrlActual(prod.imagen_url || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const manejarGuardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const nomTrim = nombre.trim();

    if (idCategoria === "")
      return alert("Por favor, selecciona una categoría.");
    if (Number(costo) > 5000000 || Number(precio) > 5000000)
      return alert("❌ Costo o precio muy altos.");

    // Validación Local: Evitar productos duplicados (ignorando al que editamos)
    const duplicado = productos.some(
      (p) =>
        p.nombre.toLowerCase() === nomTrim.toLowerCase() &&
        p.id_producto !== idProductoEdicion,
    );
    if (duplicado)
      return alert(`❌ Ya existe un producto registrado como "${nomTrim}".`);

    setEstaCargando(true);
    try {
      const datosFormulario = new FormData();
      datosFormulario.append("nombre", nomTrim);
      datosFormulario.append("costo_compra", costo);
      datosFormulario.append("precio_venta", precio);
      datosFormulario.append("id_categoria", idCategoria);
      if (idSubcategoria !== "")
        datosFormulario.append("id_subcategoria", idSubcategoria);
      if (imagen) datosFormulario.append("imagen", imagen);

      const url = modoEdicion
        ? `${API_URL}/productos/${idProductoEdicion}`
        : `${API_URL}/productos`;
      const respuesta = await fetch(url, {
        method: modoEdicion ? "PATCH" : "POST",
        body: datosFormulario,
      });

      if (respuesta.ok) {
        resetearFormulario();
        await cargarDatos();
      } else {
        const err = await respuesta.json();
        alert(`❌ Error al guardar: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
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
        await cargarDatos();
      } else {
        alert(
          "❌ No se puede eliminar. Probablemente tenga ventas o stock en sedes.",
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🚀 MOTOR DE BÚSQUEDA Y FILTROS
  let productosAMostrar = [...productos].sort(
    (a, b) => b.id_producto - a.id_producto,
  );

  // 1. Filtrar por Búsqueda de Texto
  if (busqueda.trim() !== "") {
    productosAMostrar = productosAMostrar.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }

  // 2. Filtrar por Categoría
  if (filtroCategoria !== "") {
    productosAMostrar = productosAMostrar.filter(
      (p) => String(p.id_categoria) === filtroCategoria,
    );
  }

  // 3. Filtrar por Subcategoría
  if (filtroSubcategoria !== "") {
    productosAMostrar = productosAMostrar.filter(
      (p) => String(p.id_subcategoria) === filtroSubcategoria,
    );
  }

  // 4. Si no hay filtros activos ni búsqueda, mostrar los 6 más recientes
  if (
    filtroCategoria === "" &&
    filtroSubcategoria === "" &&
    busqueda.trim() === ""
  ) {
    productosAMostrar = productosAMostrar.slice(0, 6);
  }

  const subcategoriasParaFiltro =
    filtroCategoria !== ""
      ? todasSubcategorias.filter(
          (s) => String(s.id_categoria) === filtroCategoria,
        )
      : todasSubcategorias;

  return (
    <div className="space-y-8 relative">
      <header>
        <h1 className="text-3xl font-bold">Catálogo Maestro</h1>
        <p className="text-gray-400">
          Administra los productos base, categorías y subcategorías
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- FORMULARIO --- */}
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
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none text-sm"
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

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-4">
              {/* CATEGORÍA */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Categoría Principal *
                </label>
                {!creandoCategoria ? (
                  <div className="flex gap-2">
                    <select
                      required
                      value={idCategoria}
                      onChange={(e) => setIdCategoria(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="">-- Seleccionar --</option>
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                    {idCategoria !== "" && (
                      <button
                        type="button"
                        onClick={() => eliminarCategoria(Number(idCategoria))}
                        className="bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white px-3 rounded-lg border border-gray-700 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
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
                      className="flex-1 bg-gray-800 border border-blue-500 rounded-lg px-3 py-2 text-white outline-none text-sm"
                      placeholder="Nombre Categoría"
                    />
                    <button
                      type="button"
                      onClick={manejarCrearCategoria}
                      className="bg-green-600 text-white px-3 rounded-lg font-bold"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreandoCategoria(false)}
                      className="bg-red-500 text-white px-3 rounded-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* SUBCATEGORÍA CON BLOQUEO */}
              <div className="pt-3 border-t border-gray-800/50">
                <label
                  className={`block text-xs mb-2 uppercase tracking-wider font-bold transition-colors ${idCategoria === "" ? "text-gray-600" : "text-purple-400"}`}
                >
                  Subcategoría{" "}
                  <span className="text-[9px] text-gray-500 lowercase font-normal">
                    (Opcional)
                  </span>
                </label>
                {!creandoSubcategoria ? (
                  <div className="flex gap-2">
                    <select
                      value={idSubcategoria}
                      onChange={(e) =>
                        manejarCambioSubcategoriaFormulario(e.target.value)
                      }
                      disabled={idCategoria === ""}
                      className={`flex-1 border rounded-lg px-3 py-2 text-white outline-none text-sm transition-all ${idCategoria === "" ? "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed" : "bg-gray-800 border-purple-500/30 focus:border-purple-500"}`}
                    >
                      <option value="">
                        {idCategoria === ""
                          ? "Bloqueado (Selecciona Categoría)"
                          : "-- Sin Subcategoría --"}
                      </option>
                      {subcategoriasDelFormulario.map((sub) => (
                        <option
                          key={sub.id_subcategoria}
                          value={sub.id_subcategoria}
                        >
                          ↳ {sub.nombre}
                        </option>
                      ))}
                    </select>
                    {idSubcategoria !== "" && (
                      <button
                        type="button"
                        onClick={() =>
                          eliminarSubcategoria(Number(idSubcategoria))
                        }
                        className="bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white px-3 rounded-lg border border-gray-700 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={idCategoria === ""}
                      onClick={() => setCreandoSubcategoria(true)}
                      className={`px-3 rounded-lg border font-bold transition-all ${idCategoria === "" ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-800 hover:bg-purple-600 border-gray-700 text-gray-300 hover:text-white"}`}
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
                      className="flex-1 bg-gray-800 border border-purple-500 rounded-lg px-3 py-2 text-white outline-none text-sm"
                      placeholder="Nombre Subcategoría"
                    />
                    <button
                      type="button"
                      onClick={manejarCrearSubcategoria}
                      className="bg-green-600 text-white px-3 rounded-lg font-bold"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreandoSubcategoria(false)}
                      className="bg-red-500 text-white px-3 rounded-lg font-bold"
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
              className={`w-full text-white font-bold py-3 rounded-lg mt-4 shadow-lg transition-colors ${modoEdicion ? "bg-purple-600 hover:bg-purple-500" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {estaCargando
                ? "Guardando..."
                : modoEdicion
                  ? "Actualizar Producto"
                  : "Agregar al Catálogo"}
            </button>
          </form>
        </div>

        {/* --- CATÁLOGO Y FILTROS --- */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 mb-6 flex flex-col gap-4 shadow-lg">
            {/* 🚀 NUEVO: BARRA DE BÚSQUEDA */}
            <div className="w-full relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto por nombre..."
                className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro de Categoría */}
              <div className="w-full sm:w-1/2">
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
                  Filtro de Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setFiltroSubcategoria(""); // Resetea subcategoría al cambiar categoría
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 text-sm transition-colors"
                >
                  <option value="">🌟 Últimos Agregados (Vista General)</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      📁 {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Subcategoría CON BLOQUEO */}
              <div className="w-full sm:w-1/2">
                <label
                  className={`block text-[10px] uppercase tracking-widest mb-2 font-bold transition-colors ${filtroCategoria === "" ? "text-gray-600" : "text-purple-400"}`}
                >
                  Filtro de Subcategoría
                </label>
                <select
                  value={filtroSubcategoria}
                  onChange={(e) => setFiltroSubcategoria(e.target.value)}
                  disabled={filtroCategoria === ""}
                  className={`w-full rounded-lg px-4 py-3 text-white outline-none text-sm transition-all ${filtroCategoria === "" ? "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed" : "bg-gray-800 border border-purple-500/50 focus:border-purple-500"}`}
                >
                  <option value="">
                    {filtroCategoria === "" ? "Bloqueado" : "🔎 Todas"}
                  </option>
                  {subcategoriasParaFiltro.map((sub) => (
                    <option
                      key={sub.id_subcategoria}
                      value={sub.id_subcategoria}
                    >
                      ↳ {sub.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {productosAMostrar.length === 0 ? (
            <div className="bg-gray-900/50 p-10 rounded-2xl border border-gray-800 border-dashed text-center text-gray-500 flex flex-col items-center justify-center flex-1 min-h-[300px]">
              <span className="text-5xl mb-4 opacity-50">🔍</span>
              <p className="font-medium text-lg text-gray-400">
                No se encontraron productos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {productosAMostrar.map((producto) => (
                <div
                  key={producto.id_producto}
                  className="bg-gray-800/80 rounded-2xl border border-gray-700 flex flex-col hover:border-gray-500 transition-all group overflow-hidden shadow-md hover:shadow-xl"
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
                      />
                    ) : (
                      <span className="text-4xl opacity-30">🏷️</span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-white line-clamp-2 mb-1">
                      {producto.nombre}
                    </h3>
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
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
                        className="bg-gray-900 hover:bg-purple-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setProductoAEliminar(producto)}
                        className="bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {productoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Eliminar Producto?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Vas a eliminar{" "}
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
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors"
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
