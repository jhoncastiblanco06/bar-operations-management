"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "../../../../../utilidades/api";

interface ProductoEnStock {
  id_producto: number;
  nombre: string;
  precio_venta: number | string;
  stock_actual: number;
  id_categoria: number;
  id_subcategoria?: number;
}

interface ItemPedido {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
}

interface Mesa {
  id_mesa: number;
  nombre_identificador: string;
  estado: string;
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

export default function TomaDePedidosMesero() {
  const params = useParams();
  const router = useRouter();
  const id_mesa = params.id_mesa;

  const [mesaActiva, setMesaActiva] = useState<Mesa | null>(null);
  const [productos, setProductos] = useState<ProductoEnStock[]>([]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [idCategoriaFiltro, setIdCategoriaFiltro] = useState<string>("");
  const [idSubcategoriaFiltro, setIdSubcategoriaFiltro] = useState<string>("");

  const [estaCargando, setEstaCargando] = useState(true);
  const [cuentaExistente, setCuentaExistente] = useState<any>(null);

  const [pedidoActual, setPedidoActual] = useState<ItemPedido[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  // 🚀 NUEVO: Guardaremos la sede operativa de esta sesión para el Administrador
  const [idSedeOperativa, setIdSedeOperativa] = useState<number | null>(null);

  const cargarDatos = async () => {
    try {
      const usrStr = localStorage.getItem("usuario_bar");
      if (!usrStr) return router.push("/login");

      const usuario = JSON.parse(usrStr);
      let idSede = usuario.id_sede;

      // 🚀 MAGIA MODO DIOS: Si el Administrador no tiene sede fija, averiguamos de qué sede es la mesa
      if (
        !idSede &&
        (usuario.rol === "Administrador" || usuario.rol === "Admin")
      ) {
        const resMesasGlobal = await fetch(`${API_URL}/mesas`);
        if (resMesasGlobal.ok) {
          const todasMesas = await resMesasGlobal.json();
          const mesaDelAdmin = todasMesas.find(
            (m: any) => m.id_mesa === Number(id_mesa),
          );
          if (mesaDelAdmin) {
            idSede = mesaDelAdmin.id_sede;
          }
        }
      }

      // Si después de todo sigue sin haber sede, lo rebotamos
      if (!idSede) {
        alert(
          "❌ Error: No se pudo determinar a qué sede pertenece esta mesa.",
        );
        return router.push("/admin/meseros");
      }

      setIdSedeOperativa(idSede); // Guardamos la sede descubierta

      // Cargamos Catálogo, Categorías y Subcategorías usando la sede descubierta
      const [resInventario, resMesas, resCategorias, resSubcats] =
        await Promise.all([
          fetch(`${API_URL}/inventario/pos/${idSede}`),
          fetch(`${API_URL}/mesas/sede/${idSede}`),
          fetch(`${API_URL}/categorias`),
          fetch(`${API_URL}/subcategorias`),
        ]);

      if (resInventario.ok) setProductos(await resInventario.json());
      if (resCategorias.ok) setCategorias(await resCategorias.json());
      if (resSubcats.ok) setSubcategorias(await resSubcats.json());

      if (resMesas.ok) {
        const dataMesas = await resMesas.json();
        const mesa = dataMesas.find((m: any) => m.id_mesa === Number(id_mesa));
        if (mesa) setMesaActiva(mesa);
      }

      // Cargamos el historial si la mesa ya está abierta
      const resCuenta = await fetch(
        `${API_URL}/ordenes/mesa/${id_mesa}/activa`,
      );
      if (resCuenta.ok) {
        const dataCuenta = await resCuenta.json();
        if (dataCuenta) {
          const historialAgrupado = agruparDetalles(dataCuenta.detalle_cuentas);
          setCuentaExistente({ ...dataCuenta, historialAgrupado });
        }
      }
    } catch (error) {
      console.error("Error al cargar comandera:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id_mesa, router]);

  useEffect(() => {
    setIdSubcategoriaFiltro("");
  }, [idCategoriaFiltro]);

  const agruparDetalles = (detalles: any[]) => {
    const agrupado: Record<number, any> = {};
    detalles.forEach((d) => {
      if (agrupado[d.id_producto]) {
        agrupado[d.id_producto].cantidad += d.cantidad;
        agrupado[d.id_producto].subtotal =
          Number(agrupado[d.id_producto].subtotal) + Number(d.subtotal);
      } else {
        agrupado[d.id_producto] = {
          id_producto: d.id_producto,
          nombre: d.productos.nombre,
          cantidad: d.cantidad,
          precio_unitario: Number(d.precio_unitario),
          subtotal: Number(d.subtotal),
        };
      }
    });
    return Object.values(agrupado);
  };

  const agregarAlPedido = (producto: ProductoEnStock) => {
    setPedidoActual((pedidoAnterior) => {
      const existe = pedidoAnterior.find(
        (p) => p.id_producto === producto.id_producto,
      );
      if (existe && existe.cantidad >= producto.stock_actual) {
        alert(`¡Aviso! Solo quedan ${producto.stock_actual} unidades.`);
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

  const enviarPedidoABarra = async () => {
    if (pedidoActual.length === 0)
      return alert("No has agregado productos nuevos.");
    if (!idSedeOperativa)
      return alert("Error de sesión: No se detectó la sede.");

    setProcesando(true);

    try {
      const usrStr = localStorage.getItem("usuario_bar");
      const usuario = usrStr ? JSON.parse(usrStr) : null;

      const respuesta = await fetch(`${API_URL}/ordenes/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sede: Number(idSedeOperativa), // 🚀 AHORA USA LA SEDE DESCUBIERTA AUTOMÁTICAMENTE
          id_mesa: Number(id_mesa),
          id_mesero: Number(usuario?.id_usuario),
          productos: pedidoActual,
        }),
      });

      if (respuesta.ok) {
        alert("✅ Pedido enviado a barra correctamente.");
        router.push("/admin/meseros");
      } else {
        const errorData = await respuesta.json();
        alert(`❌ Problema con el pedido:\n${errorData.message}`);
      }
    } catch (error) {
      alert("Error de conexión al enviar el pedido.");
    } finally {
      setProcesando(false);
    }
  };

  const solicitarCuenta = async () => {
    if (pedidoActual.length > 0) {
      return alert(
        "Tienes productos sin enviar a la barra. Envíalos o bórralos antes de pedir la cuenta.",
      );
    }

    const confirmar = confirm(
      "¿Notificar a la caja para imprimir la cuenta de esta mesa?",
    );
    if (confirmar) {
      alert("✅ Cajero notificado. Preparando la cuenta...");
      router.push("/admin/meseros");
    }
  };

  const formatearDinero = (valor: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  const subcategoriasParaFiltro = subcategorias.filter(
    (sub) => sub.id_categoria.toString() === idCategoriaFiltro,
  );

  const productosFiltrados = productos.filter((p) => {
    const coincideTexto = p.nombre
      .toLowerCase()
      .includes(terminoBusqueda.toLowerCase());
    if (!coincideTexto) return false;

    if (idCategoriaFiltro && p.id_categoria.toString() !== idCategoriaFiltro)
      return false;

    if (
      idSubcategoriaFiltro &&
      p.id_subcategoria?.toString() !== idSubcategoriaFiltro
    )
      return false;

    return true;
  });

  const totalHistorico = cuentaExistente ? Number(cuentaExistente.total) : 0;
  const totalNuevo = pedidoActual.reduce(
    (acc, item) => acc + item.precio_venta * item.cantidad,
    0,
  );
  const granTotal = totalHistorico + totalNuevo;

  if (estaCargando) {
    return (
      <div className="p-10 text-center text-purple-400 font-bold animate-pulse">
        Cargando menú y cuenta...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-4 pb-10 lg:pb-0">
      {/* LADO IZQUIERDO: EL CATÁLOGO */}
      <div className="flex-1 flex flex-col bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => router.push("/admin/meseros")}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-bold transition-colors shrink-0"
          >
            ⬅ Volver
          </button>

          <div className="flex flex-col xl:flex-row w-full gap-2">
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="flex-1 min-w-[150px] bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-purple-500"
            />

            <select
              value={idCategoriaFiltro}
              onChange={(e) => setIdCategoriaFiltro(e.target.value)}
              className="w-full xl:w-40 bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <select
              disabled={
                !idCategoriaFiltro || subcategoriasParaFiltro.length === 0
              }
              value={idSubcategoriaFiltro}
              onChange={(e) => setIdSubcategoriaFiltro(e.target.value)}
              className={`w-full xl:w-40 rounded-xl px-3 py-2 text-sm outline-none transition-all ${
                !idCategoriaFiltro || subcategoriasParaFiltro.length === 0
                  ? "bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-950 border border-purple-500/50 text-white focus:border-purple-500 cursor-pointer"
              }`}
            >
              <option value="">
                {!idCategoriaFiltro
                  ? "Primero categoría"
                  : subcategoriasParaFiltro.length === 0
                    ? "Sin subcategorías"
                    : "Todas las sub..."}
              </option>
              {subcategoriasParaFiltro.map((s) => (
                <option key={s.id_subcategoria} value={s.id_subcategoria}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
          {productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <span className="text-4xl mb-2">🔍</span>
              <p>No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {productosFiltrados.map((producto) => {
                const sinStock = producto.stock_actual <= 0;
                return (
                  <button
                    key={producto.id_producto}
                    disabled={sinStock}
                    onClick={() => agregarAlPedido(producto)}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-transform active:scale-95 relative overflow-hidden ${
                      sinStock
                        ? "border-red-900/50 bg-gray-950 opacity-50 cursor-not-allowed"
                        : "border-gray-800 bg-gray-900 hover:border-purple-500 shadow-lg hover:shadow-purple-500/10"
                    }`}
                  >
                    {sinStock && (
                      <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center backdrop-blur-[1px] z-10">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded border border-red-500 transform -rotate-12">
                          Agotado
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/60 text-[10px] text-gray-300 px-2 py-0.5 rounded-full font-bold">
                      {producto.stock_actual} disp.
                    </span>
                    <div className="w-12 h-12 bg-gray-800 rounded-full mb-3 flex items-center justify-center text-xl shadow-inner border border-gray-700">
                      🍸
                    </div>
                    <span className="text-xs font-bold leading-tight mb-2 text-gray-200">
                      {producto.nombre}
                    </span>
                    <span className="text-purple-400 font-black text-sm mt-auto">
                      {formatearDinero(Number(producto.precio_venta))}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO: LA LIBRETA DIVIDIDA */}
      <div className="w-full lg:w-96 bg-gray-900 border border-gray-800 rounded-3xl flex flex-col h-[50vh] lg:h-full shrink-0 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
          <div>
            <h3 className="font-black text-xl text-white">
              {mesaActiva ? mesaActiva.nombre_identificador : `Mesa ${id_mesa}`}
            </h3>
            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold mt-1">
              {cuentaExistente ? "Cuenta Abierta" : "Mesa Nueva"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50 scrollbar-thin scrollbar-thumb-gray-800">
          {cuentaExistente && cuentaExistente.historialAgrupado.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-gray-800 pb-1 mb-2">
                Ya en mesa
              </h4>
              {cuentaExistente.historialAgrupado.map((item: any) => (
                <div
                  key={`hist-${item.id_producto}`}
                  className="flex justify-between items-center px-2 py-1 opacity-60"
                >
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-gray-400">
                      {item.cantidad}x
                    </span>
                    <p className="text-xs font-medium text-gray-300">
                      {item.nombre}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formatearDinero(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            {pedidoActual.length > 0 && (
              <h4 className="text-[10px] text-purple-400 font-black uppercase tracking-widest border-b border-purple-500/30 pb-1 mb-3 mt-4">
                Nuevos a enviar
              </h4>
            )}
            {pedidoActual.length === 0 &&
            (!cuentaExistente ||
              cuentaExistente.historialAgrupado.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center px-4 py-10 opacity-50">
                <span className="text-5xl mb-4">📝</span>
                <p className="text-gray-400 font-bold">Libreta vacía</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pedidoActual.map((item) => (
                  <div
                    key={item.id_producto}
                    className="bg-gray-950 p-3 rounded-2xl border border-purple-500/20 flex justify-between items-center shadow-md"
                  >
                    <div className="flex-1 pr-3">
                      <p className="text-xs font-bold leading-tight text-white mb-1">
                        {item.nombre}
                      </p>
                      <p className="text-[11px] text-purple-400 font-medium">
                        {formatearDinero(item.precio_venta * item.cantidad)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900 rounded-xl border border-gray-800 px-2 py-1">
                      <button
                        onClick={() => quitarDelPedido(item.id_producto)}
                        className="text-red-400 w-6 h-6 font-bold hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-black w-4 text-center text-white">
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
                        className="text-green-400 w-6 h-6 font-bold hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-gray-950 border-t border-gray-800">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Total Consumo:
              </span>
              {cuentaExistente && pedidoActual.length > 0 && (
                <span className="text-[10px] text-gray-400 mb-1">
                  Mesa: {formatearDinero(totalHistorico)} + Nuevos:{" "}
                  {formatearDinero(totalNuevo)}
                </span>
              )}
            </div>
            <span className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              {formatearDinero(granTotal)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              disabled={pedidoActual.length === 0 || procesando}
              onClick={enviarPedidoABarra}
              className="w-[60%] bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900/50 disabled:text-gray-600 py-4 racking-widest rounded-xl font-black text-white text-xs sm:text-sm transition-all border border-gray-700 disabled:border-transparent active:scale-95 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-[17px] uppercase tracking-wider">
                {procesando ? "..." : "Agregar al pedido"}
              </span>
            </button>
            <button
              disabled={!cuentaExistente || pedidoActual.length > 0}
              onClick={solicitarCuenta}
              className="w-[40%] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-4 rounded-xl font-black text-white tracking-widest uppercase transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2"
            >
              💳 Terminar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
