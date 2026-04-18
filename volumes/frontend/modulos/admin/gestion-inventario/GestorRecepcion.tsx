"use client";

import { useState, useEffect } from "react";
import { Producto, Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

interface InventarioSede {
  id_producto: number;
  stock_actual: number;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
}

export default function GestorRecepcion() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [inventarioActual, setInventarioActual] = useState<InventarioSede[]>(
    [],
  );
  const [idSedeSeleccionada, setIdSedeSeleccionada] = useState<string>("");

  // Estados para los filtros de búsqueda
  const [idCategoriaFiltro, setIdCategoriaFiltro] = useState<string>("");
  const [idSubcategoriaFiltro, setIdSubcategoriaFiltro] = useState<string>("");

  const [cantidadesIngreso, setCantidadesIngreso] = useState<
    Record<number, string>
  >({});
  const [estaCargando, setEstaCargando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  useEffect(() => {
    const cargarDatosBase = async () => {
      try {
        const [resSedes, resProductos, resCategorias, resSubcats] =
          await Promise.all([
            fetch(`${API_URL}/sedes`),
            fetch(`${API_URL}/productos`),
            fetch(`${API_URL}/categorias`),
            fetch(`${API_URL}/subcategorias`),
          ]);

        const dataSedes = await resSedes.json();
        const dataProductos = await resProductos.json();
        const dataCategorias = await resCategorias.json();
        const dataSubcats = await resSubcats.json();

        setSedes(Array.isArray(dataSedes) ? dataSedes : []);
        setProductos(Array.isArray(dataProductos) ? dataProductos : []);
        setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
        setSubcategorias(Array.isArray(dataSubcats) ? dataSubcats : []);
      } catch (error) {
        console.error("Error al cargar datos base:", error);
      }
    };
    cargarDatosBase();
  }, []);

  useEffect(() => {
    if (!idSedeSeleccionada) {
      setInventarioActual([]);
      return;
    }

    const cargarInventarioSede = async () => {
      setEstaCargando(true);
      try {
        const res = await fetch(
          `${API_URL}/inventario/sede/${idSedeSeleccionada}`,
        );
        if (res.ok) {
          const data = await res.json();
          setInventarioActual(Array.isArray(data) ? data : []);
        } else {
          setInventarioActual([]);
        }
      } catch (error) {
        console.error("Error al cargar inventario:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    cargarInventarioSede();
    setCantidadesIngreso({});
  }, [idSedeSeleccionada]);

  // Resetear subcategoría si cambian la categoría principal en el filtro
  useEffect(() => {
    setIdSubcategoriaFiltro("");
  }, [idCategoriaFiltro]);

  const manejarCambioCantidad = (idProducto: number, valor: string) => {
    setCantidadesIngreso((prev) => ({ ...prev, [idProducto]: valor }));
  };

  const guardarIngreso = async (idProducto: number) => {
    const cantidadString = cantidadesIngreso[idProducto];
    const cantidad = parseInt(cantidadString);

    if (!cantidad || cantidad <= 0 || isNaN(cantidad)) {
      return alert("Ingresa una cantidad válida mayor a 0.");
    }

    setProcesandoId(idProducto);

    try {
      const res = await fetch(`${API_URL}/inventario/recepcion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sede: parseInt(idSedeSeleccionada),
          id_producto: idProducto,
          cantidad_agregada: cantidad,
          id_usuario: 1,
        }),
      });

      if (res.ok) {
        setInventarioActual((prev) => {
          const existe = prev.find((i) => i.id_producto === idProducto);
          if (existe) {
            return prev.map((i) =>
              i.id_producto === idProducto
                ? { ...i, stock_actual: i.stock_actual + cantidad }
                : i,
            );
          } else {
            return [
              ...prev,
              { id_producto: idProducto, stock_actual: cantidad },
            ];
          }
        });

        setCantidadesIngreso((prev) => ({ ...prev, [idProducto]: "" }));
      } else {
        alert("Error al guardar el ingreso en el servidor.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setProcesandoId(null);
    }
  };

  const obtenerStockDeProducto = (idProducto: number) => {
    const item = inventarioActual.find((i) => i.id_producto === idProducto);
    return item ? item.stock_actual : 0;
  };

  // Filtramos las subcategorías que pertenecen a la categoría seleccionada
  const subcategoriasParaFiltro = subcategorias.filter(
    (sub) => sub.id_categoria.toString() === idCategoriaFiltro,
  );

  // Lógica de filtrado de productos en la cuadrícula
  const productosFiltrados = productos.filter((prod) => {
    if (
      idCategoriaFiltro &&
      prod.id_categoria.toString() !== idCategoriaFiltro
    ) {
      return false;
    }
    if (
      idSubcategoriaFiltro &&
      prod.id_subcategoria?.toString() !== idSubcategoriaFiltro
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Recepción de Mercancía
          </h1>
          <p className="text-gray-400 mt-1">
            Ingresa stock a los inventarios de cada sede
          </p>
        </div>

        {/* CONTENEDOR DE FILTROS */}
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3">
          {/* 1. Selector de Sede */}
          <div className="flex-1 sm:w-56">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">
              1. Seleccionar Sede
            </label>
            <select
              value={idSedeSeleccionada}
              onChange={(e) => setIdSedeSeleccionada(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 shadow-lg transition-all cursor-pointer font-medium text-sm"
            >
              <option value="" disabled>
                Seleccionar
              </option>
              {sedes.map((s) => (
                <option key={s.id_sede} value={s.id_sede}>
                  {s.nombre} - {s.ciudad}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filtro Categoría (Visible si hay sede seleccionada) */}
          {idSedeSeleccionada && (
            <div className="flex-1 sm:w-48 animate-in fade-in">
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">
                2. Filtrar Categoría
              </label>
              <select
                value={idCategoriaFiltro}
                onChange={(e) => setIdCategoriaFiltro(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-all cursor-pointer font-medium text-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 🚀 3. Filtro Subcategoría (Siempre visible, pero se bloquea si no hay categoría elegida) */}
          {idSedeSeleccionada && (
            <div className="flex-1 sm:w-48 animate-in fade-in">
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">
                Subcategoría
              </label>
              <select
                disabled={
                  !idCategoriaFiltro || subcategoriasParaFiltro.length === 0
                }
                value={idSubcategoriaFiltro}
                onChange={(e) => setIdSubcategoriaFiltro(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all ${
                  !idCategoriaFiltro || subcategoriasParaFiltro.length === 0
                    ? "bg-gray-900/50 border border-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-900 border border-blue-500/50 text-white focus:border-blue-500 cursor-pointer"
                }`}
              >
                <option value="">
                  {!idCategoriaFiltro
                    ? "Elige categoría primero"
                    : subcategoriasParaFiltro.length === 0
                      ? "Sin subcategorías"
                      : "Todas las subcategorías"}
                </option>
                {subcategoriasParaFiltro.map((s) => (
                  <option key={s.id_subcategoria} value={s.id_subcategoria}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {!idSedeSeleccionada ? (
        <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <span className="text-5xl mb-4 opacity-50">🏢</span>
          <h3 className="text-xl font-bold text-gray-300 mb-2">
            Selecciona una Sede
          </h3>
          <p className="text-gray-500 max-w-md">
            Para poder ingresar mercancía y ver los niveles de inventario,
            primero debes elegir una sede en el menú superior.
          </p>
        </div>
      ) : estaCargando ? (
        <div className="text-center py-20 text-blue-400 animate-pulse font-bold tracking-widest uppercase">
          Cargando inventario de la sede...
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <span className="text-5xl mb-4 opacity-50">🔍</span>
          <h3 className="text-xl font-bold text-gray-300 mb-2">
            Sin resultados
          </h3>
          <p className="text-gray-500 max-w-md">
            No se encontraron productos con los filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setIdCategoriaFiltro("");
              setIdSubcategoriaFiltro("");
            }}
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => {
            const stockActual = obtenerStockDeProducto(producto.id_producto);

            return (
              <div
                key={producto.id_producto}
                className="bg-gray-800/60 rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all flex flex-col group relative shadow-lg"
              >
                {/* Etiqueta de Stock */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-black z-10 shadow-lg border ${stockActual <= 9 ? "bg-red-500 text-white border-red-400" : "bg-green-500 text-white border-green-400"}`}
                >
                  Stock: {stockActual}
                </div>

                {/* Imagen del Producto */}
                <div className="h-32 bg-gray-900 flex items-center justify-center p-2 relative overflow-hidden">
                  {producto.imagen_url ? (
                    <img
                      src={`${API_URL}${producto.imagen_url}`}
                      alt={producto.nombre}
                      className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-3xl opacity-30">📦</span>
                  )}
                </div>

                {/* Detalles y Formulario de Ingreso */}
                <div className="p-4 flex flex-col flex-1 bg-gray-800/80">
                  <h3
                    className="font-bold text-sm text-white line-clamp-2 mb-1"
                    title={producto.nombre}
                  >
                    {producto.nombre}
                  </h3>

                  <div className="mb-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">
                      {categorias.find(
                        (c) => c.id_categoria === producto.id_categoria,
                      )?.nombre || "Sin Categoría"}
                    </p>
                    {producto.id_subcategoria && (
                      <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">
                        ↳{" "}
                        {
                          subcategorias.find(
                            (s) =>
                              s.id_subcategoria === producto.id_subcategoria,
                          )?.nombre
                        }
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500 mb-4 font-mono">
                    SKU: {producto.codigo_sku || "N/A"}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-700">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold">
                      Ingresar Unidades
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Ej. 24"
                        value={cantidadesIngreso[producto.id_producto] || ""}
                        onChange={(e) =>
                          manejarCambioCantidad(
                            producto.id_producto,
                            e.target.value,
                          )
                        }
                        className="w-full bg-gray-950 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 font-bold"
                      />
                      <button
                        onClick={() => guardarIngreso(producto.id_producto)}
                        disabled={
                          procesandoId === producto.id_producto ||
                          !cantidadesIngreso[producto.id_producto]
                        }
                        className={`px-4 rounded-lg font-bold flex items-center justify-center transition-all ${cantidadesIngreso[producto.id_producto] ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                      >
                        {procesandoId === producto.id_producto ? "..." : "+"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
