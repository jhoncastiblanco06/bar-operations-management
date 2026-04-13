"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "../../../../utilidades/api";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
}

interface ProductoEnStock {
  id_producto: number;
  id_categoria: number;
  id_subcategoria: number | null;
  nombre: string;
  precio_venta: number | string;
  stock_actual: number;
  imagen_url: string | null;
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

export default function TomaDePedidosMesero() {
  const params = useParams();
  const router = useRouter();
  const id_mesa = params.id_mesa;

  const [mesaActiva, setMesaActiva] = useState<Mesa | null>(null);
  const [productos, setProductos] = useState<ProductoEnStock[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [todasSubcategorias, setTodasSubcategorias] = useState<Subcategoria[]>(
    [],
  );

  const [estaCargando, setEstaCargando] = useState(true);
  const [cuentaExistente, setCuentaExistente] = useState<any>(null);

  const [pedidoActual, setPedidoActual] = useState<ItemPedido[]>([]);
  const [procesando, setProcesando] = useState(false);

  // 🚀 ESTADOS DE FILTRO
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>("");

  const cargarDatos = async () => {
    try {
      const usrStr = localStorage.getItem("usuario_bar");
      if (!usrStr) return router.push("/login");

      const usuario = JSON.parse(usrStr);
      const idSede = usuario.id_sede;

      if (!idSede) {
        alert("No tienes una sede asignada.");
        return router.push("/mesero");
      }

      // Carga paralela para mayor velocidad
      const [resInventario, resMesas, resCuenta, resCategorias, resSubcats] =
        await Promise.all([
          fetch(`${API_URL}/inventario/pos/${idSede}`),
          fetch(`${API_URL}/mesas/sede/${idSede}`),
          fetch(`${API_URL}/ordenes/mesa/${id_mesa}/activa`),
          fetch(`${API_URL}/categorias`),
          fetch(`${API_URL}/subcategorias`),
        ]);

      if (resInventario.ok) setProductos(await resInventario.json());
      if (resCategorias.ok) setCategorias(await resCategorias.json());
      if (resSubcats.ok) setTodasSubcategorias(await resSubcats.json());

      if (resMesas.ok) {
        const dataMesas = await resMesas.json();
        const mesa = dataMesas.find((m: any) => m.id_mesa === Number(id_mesa));
        if (mesa) setMesaActiva(mesa);
      }

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
    setProcesando(true);

    try {
      const usrStr = localStorage.getItem("usuario_bar");
      const usuario = usrStr ? JSON.parse(usrStr) : null;

      const respuesta = await fetch(`${API_URL}/ordenes/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sede: Number(usuario?.id_sede),
          id_mesa: Number(id_mesa),
          id_mesero: Number(usuario?.id_usuario),
          productos: pedidoActual,
        }),
      });

      if (respuesta.ok) {
        alert("✅ Pedido enviado a barra correctamente.");
        router.push("/mesero");
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
      router.push("/mesero");
    }
  };

  const formatearDinero = (valor: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  // 🚀 MOTOR DE FILTROS PARA EL MESERO
  let productosAMostrar = [...productos];

  if (terminoBusqueda.trim() !== "") {
    productosAMostrar = productosAMostrar.filter((p) =>
      p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()),
    );
  }
  if (filtroCategoria !== "") {
    productosAMostrar = productosAMostrar.filter(
      (p) => String(p.id_categoria) === filtroCategoria,
    );
  }
  if (filtroSubcategoria !== "") {
    productosAMostrar = productosAMostrar.filter(
      (p) => String(p.id_subcategoria) === filtroSubcategoria,
    );
  }

  const subcategoriasParaFiltro =
    filtroCategoria !== ""
      ? todasSubcategorias.filter(
          (s) => String(s.id_categoria) === filtroCategoria,
        )
      : todasSubcategorias;

  // CÁLCULO DE TOTALES
  const totalHistorico = cuentaExistente ? Number(cuentaExistente.total) : 0;
  const totalNuevo = pedidoActual.reduce(
    (acc, item) => acc + item.precio_venta * item.cantidad,
    0,
  );
  const granTotal = totalHistorico + totalNuevo;

  if (estaCargando) {
    return (
      <div className="p-10 text-center text-purple-400 font-bold animate-pulse flex flex-col items-center justify-center h-screen">
        <span className="text-4xl mb-4">🍹</span>Cargando menú y cuenta...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-4 pb-10 lg:pb-0">
      {/* LADO IZQUIERDO: EL CATÁLOGO (Ahora con filtros y fotos) */}
      <div className="flex-1 flex flex-col bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        {/* 🚀 BARRA SUPERIOR DE FILTROS */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/mesero")}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-bold transition-colors text-white whitespace-nowrap"
            >
              ⬅ Volver
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar en menú..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-1">
            <select
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setFiltroSubcategoria("");
              }}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-300 outline-none focus:border-blue-500 font-bold"
            >
              <option value="">📁 Todas las Categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>

            <select
              value={filtroSubcategoria}
              onChange={(e) => setFiltroSubcategoria(e.target.value)}
              disabled={filtroCategoria === ""}
              className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-colors ${filtroCategoria === "" ? "bg-gray-900 border border-gray-800 text-gray-600 opacity-50" : "bg-gray-950 border border-purple-500/50 text-purple-400"}`}
            >
              <option value="">🔎 Subcategorías</option>
              {subcategoriasParaFiltro.map((sub) => (
                <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                  ↳ {sub.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
          {productosAMostrar.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
              <span className="text-6xl mb-4">🤷‍♂️</span>
              <p className="font-bold">No hay productos en esta vista</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {productosAMostrar.map((producto) => {
                const sinStock = producto.stock_actual <= 0;
                return (
                  <button
                    key={producto.id_producto}
                    disabled={sinStock}
                    onClick={() => agregarAlPedido(producto)}
                    className={`rounded-2xl border flex flex-col text-center transition-transform active:scale-95 relative overflow-hidden h-48 group ${
                      sinStock
                        ? "border-red-900/50 bg-gray-950 opacity-50 cursor-not-allowed"
                        : "border-gray-800 bg-gray-900 hover:border-purple-500 shadow-lg hover:shadow-purple-500/10"
                    }`}
                  >
                    {sinStock && (
                      <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center backdrop-blur-[1px] z-20">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded border border-red-500 transform -rotate-12">
                          Agotado
                        </span>
                      </div>
                    )}

                    {/* Badge de Stock */}
                    <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-[10px] text-gray-300 px-2 py-0.5 rounded-full font-bold z-10 border border-gray-700">
                      {producto.stock_actual} disp.
                    </span>

                    {/* 🚀 ZONA DE IMAGEN */}
                    <div className="h-24 w-full bg-gray-950 flex items-center justify-center overflow-hidden border-b border-gray-800/50">
                      {producto.imagen_url ? (
                        <img
                          src={`${API_URL}${producto.imagen_url}`}
                          alt={producto.nombre}
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20fill%3D%22%23030712%22%20width%3D%22300%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%234b5563%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3E%F0%9F%8D%B8%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                        />
                      ) : (
                        <span className="text-3xl opacity-30">🍸</span>
                      )}
                    </div>

                    {/* INFO DEL PRODUCTO */}
                    <div className="p-3 flex flex-col flex-1 justify-between w-full bg-gray-900/80">
                      <span className="text-xs font-bold leading-tight text-gray-200 line-clamp-2">
                        {producto.nombre}
                      </span>
                      <span className="text-purple-400 font-black text-sm">
                        {formatearDinero(Number(producto.precio_venta))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO: LA LIBRETA DIVIDIDA (Historial + Nuevos) */}
      <div className="w-full lg:w-[400px] bg-gray-900 border border-gray-800 rounded-3xl flex flex-col h-[50vh] lg:h-full shrink-0 shadow-2xl overflow-hidden">
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
          {/* HISTORIAL */}
          {cuentaExistente && cuentaExistente.historialAgrupado.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-gray-800 pb-1 mb-2">
                Ya en mesa
              </h4>
              {cuentaExistente.historialAgrupado.map((item: any) => (
                <div
                  key={`hist-${item.id_producto}`}
                  className="flex justify-between items-center px-2 py-1 opacity-60 bg-gray-950/50 rounded-lg"
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

          {/* NUEVOS (Comanda Actual) */}
          <div>
            {pedidoActual.length > 0 && (
              <h4 className="text-[10px] text-purple-400 font-black uppercase tracking-widest border-b border-purple-500/30 pb-1 mb-3 mt-4">
                Nuevos a enviar
              </h4>
            )}

            {pedidoActual.length === 0 &&
            (!cuentaExistente ||
              cuentaExistente.historialAgrupado.length === 0) ? (
              <div className="flex flex-col items-center justify-center text-center px-4 py-10 opacity-50 h-full">
                <span className="text-5xl mb-4">📝</span>
                <p className="text-gray-400 font-bold">Libreta vacía</p>
                <p className="text-[10px] mt-2">
                  Selecciona productos del menú
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pedidoActual.map((item) => (
                  <div
                    key={item.id_producto}
                    className="bg-gray-950 p-3 rounded-xl border border-purple-500/30 flex justify-between items-center shadow-md"
                  >
                    <div className="flex-1 pr-3">
                      <p className="text-xs font-bold leading-tight text-white mb-1">
                        {item.nombre}
                      </p>
                      <p className="text-[11px] text-purple-400 font-medium">
                        {formatearDinero(item.precio_venta * item.cantidad)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 rounded-lg border border-gray-800 p-1">
                      <button
                        onClick={() => quitarDelPedido(item.id_producto)}
                        className="text-red-400 w-7 h-7 flex items-center justify-center font-bold bg-red-500/10 hover:bg-red-500/30 rounded-md transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-4 text-center text-white">
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
                        className="text-green-400 w-7 h-7 flex items-center justify-center font-bold bg-green-500/10 hover:bg-green-500/30 rounded-md transition-colors"
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

        {/* TOTALES Y BOTONES */}
        <div className="p-5 bg-gray-950 border-t border-gray-800">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Total Consumo:
              </span>
              {cuentaExistente && pedidoActual.length > 0 && (
                <span className="text-[9px] text-gray-500 mb-1 font-bold">
                  Mesa: {formatearDinero(totalHistorico)} <br />
                  Nuevos: {formatearDinero(totalNuevo)}
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
              className="w-[60%] bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900/50 disabled:text-gray-600 py-4 rounded-xl font-black text-white text-xs sm:text-sm transition-all border border-gray-700 disabled:border-transparent active:scale-95 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-sm uppercase tracking-widest">
                {procesando ? "..." : "Enviar a barra"}
              </span>
            </button>

            <button
              disabled={!cuentaExistente || pedidoActual.length > 0}
              onClick={solicitarCuenta}
              className="w-[40%] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 py-4 rounded-xl font-black text-white text-[10px] sm:text-xs tracking-widest uppercase transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none active:scale-95 flex flex-col items-center justify-center gap-1"
            >
              <span>💳</span>
              <span>Terminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
