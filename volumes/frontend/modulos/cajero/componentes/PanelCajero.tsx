"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../../utilidades/api"; // Ajusta la ruta según tu proyecto

interface CuentaActiva {
  id_cuenta: number;
  id_mesa: number;
  total: string | number;
  fecha_apertura: string;
  mesas: { nombre_identificador: string };
  usuarios: { nombre_completo: string }; // El mesero que la atiende
}

export default function TerminalCaja() {
  const router = useRouter();
  const [cuentas, setCuentas] = useState<CuentaActiva[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);

  // Estados para el panel de cobro
  const [cuentaSeleccionada, setCuentaSeleccionada] =
    useState<CuentaActiva | null>(null);
  const [metodoPago, setMetodoPago] = useState<"Efectivo" | "Tarjeta">(
    "Efectivo",
  );
  const [montoRecibido, setMontoRecibido] = useState<number | "">("");
  const [procesandoCobro, setProcesandoCobro] = useState(false);

  const cargarCuentasAbiertas = async () => {
    try {
      const usrStr = localStorage.getItem("usuario_bar");
      if (!usrStr) return router.push("/login");

      const usuario = JSON.parse(usrStr);
      if (!usuario.id_sede) return alert("No tienes sede asignada.");

      // 🚀 Esta ruta la crearemos en el backend en el siguiente paso
      const respuesta = await fetch(
        `${API_URL}/caja/cuentas-activas/${usuario.id_sede}`,
      );
      if (respuesta.ok) {
        const data = await respuesta.json();
        setCuentas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar las cuentas:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarCuentasAbiertas();

    // Un pequeño "refresco automático" cada 10 segundos por si los meseros envían más pedidos
    const intervalo = setInterval(cargarCuentasAbiertas, 10000);
    return () => clearInterval(intervalo);
  }, [router]);

  const manejarCobro = async () => {
    if (!cuentaSeleccionada) return;

    const totalCuenta = Number(cuentaSeleccionada.total);
    const recibido = Number(montoRecibido);

    if (metodoPago === "Efectivo" && recibido < totalCuenta) {
      return alert(
        "El monto recibido no puede ser menor al total de la cuenta.",
      );
    }

    setProcesandoCobro(true);
    try {
      const usrStr = localStorage.getItem("usuario_bar");
      const cajero = JSON.parse(usrStr!);

      // 🚀 Esta ruta la crearemos en el backend para procesar el pago y liberar la mesa
      const respuesta = await fetch(`${API_URL}/caja/cobrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cuenta: cuentaSeleccionada.id_cuenta,
          id_mesa: cuentaSeleccionada.id_mesa,
          id_cajero: cajero.id_usuario,
          metodo_pago: metodoPago,
          monto_recibido: metodoPago === "Tarjeta" ? totalCuenta : recibido, // Si es tarjeta, es exacto
          total_pagado: totalCuenta,
        }),
      });

      if (respuesta.ok) {
        alert("✅ Pago registrado con éxito. Mesa liberada.");
        setCuentaSeleccionada(null);
        setMontoRecibido("");
        setMetodoPago("Efectivo");
        cargarCuentasAbiertas(); // Recargamos la lista
      } else {
        const error = await respuesta.json();
        alert(`❌ Error al cobrar: ${error.message}`);
      }
    } catch (error) {
      alert("Error de conexión al procesar el cobro.");
    } finally {
      setProcesandoCobro(false);
    }
  };

  const formatearDinero = (valor: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);

  // Cálculos matemáticos rápidos
  const totalACobrar = cuentaSeleccionada
    ? Number(cuentaSeleccionada.total)
    : 0;
  const cambio =
    metodoPago === "Efectivo" && Number(montoRecibido) > totalACobrar
      ? Number(montoRecibido) - totalACobrar
      : 0;

  if (estaCargando) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-green-500 font-bold animate-pulse tracking-widest uppercase">
        Cargando terminal de caja...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6 pb-10 lg:pb-0 font-sans">
      {/* LADO IZQUIERDO: MESAS POR COBRAR */}
      <div className="flex-1 flex flex-col bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
        <header className="p-6 border-b border-gray-800 bg-gray-950">
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="bg-gray-800 p-2.5 rounded-xl border border-gray-700 shadow-inner leading-none text-xl">
              🖥️
            </span>
            Terminal de Caja
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Mesas con cuentas abiertas pendientes de pago.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800">
          {cuentas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span className="text-6xl mb-4 text-green-500/50">✅</span>
              <h3 className="text-xl font-bold text-white mb-1">Todo al día</h3>
              <p className="text-sm text-gray-400">
                No hay cuentas pendientes por cobrar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {cuentas.map((cuenta) => (
                <button
                  key={cuenta.id_cuenta}
                  onClick={() => {
                    setCuentaSeleccionada(cuenta);
                    setMontoRecibido("");
                  }}
                  className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all shadow-lg active:scale-95 ${
                    cuentaSeleccionada?.id_cuenta === cuenta.id_cuenta
                      ? "bg-green-600/10 border-green-500 shadow-green-500/10"
                      : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xl font-black text-white">
                      Mesa {cuenta.mesas.nombre_identificador}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-red-500/20 text-red-400 px-2 py-1 rounded-full animate-pulse">
                      Por Cobrar
                    </span>
                  </div>
                  <div className="space-y-1 mb-4 flex-1">
                    <p className="text-xs text-gray-400 flex justify-between">
                      <span>Mesero:</span>{" "}
                      <span className="text-gray-300 font-medium">
                        {cuenta.usuarios.nombre_completo}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 flex justify-between">
                      <span>Apertura:</span>{" "}
                      <span className="text-gray-300 font-medium">
                        {new Date(cuenta.fecha_apertura).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-700/50 mt-auto">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Total a Pagar
                    </p>
                    <p className="text-2xl font-black text-green-400">
                      {formatearDinero(Number(cuenta.total))}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO: PANEL DE COBRO (REGISTRADORA) */}
      <div className="w-full lg:w-[400px] bg-gray-900 border border-gray-800 rounded-3xl flex flex-col shrink-0 shadow-2xl overflow-hidden">
        {!cuentaSeleccionada ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-950/50">
            <span className="text-6xl mb-6 opacity-30">💳</span>
            <h3 className="text-xl font-bold text-white mb-2">Caja Inactiva</h3>
            <p className="text-sm text-gray-500">
              Selecciona una mesa del panel izquierdo para iniciar el proceso de
              cobro.
            </p>
          </div>
        ) : (
          <>
            {/* Cabecera Caja */}
            <div className="p-6 border-b border-gray-800 bg-gray-950">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-black text-2xl text-white">
                  Mesa {cuentaSeleccionada.mesas.nombre_identificador}
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  #{cuentaSeleccionada.id_cuenta}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                Atendida por:{" "}
                <span className="text-blue-400">
                  {cuentaSeleccionada.usuarios.nombre_completo}
                </span>
              </p>
            </div>

            {/* Total a Cobrar Grandote */}
            <div className="p-8 bg-green-500/5 border-b border-green-500/10 text-center">
              <p className="text-xs font-bold text-green-500/70 uppercase tracking-widest mb-2">
                Total a Pagar
              </p>
              <p className="text-5xl font-black text-white tracking-tighter">
                {formatearDinero(totalACobrar)}
              </p>
            </div>

            {/* Formulario de Pago */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-900/50">
              {/* Método de Pago */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Método de Pago
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMetodoPago("Efectivo");
                      setMontoRecibido("");
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      metodoPago === "Efectivo"
                        ? "bg-green-600/20 border-green-500 text-green-400 shadow-inner"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <span>💵</span> Efectivo
                  </button>
                  <button
                    onClick={() => {
                      setMetodoPago("Tarjeta");
                      setMontoRecibido(totalACobrar);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      metodoPago === "Tarjeta"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-inner"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <span>💳</span> Tarjeta/Datafono
                  </button>
                </div>
              </div>

              {/* Input Monto Recibido (Solo Efectivo) */}
              {metodoPago === "Efectivo" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Efectivo Recibido
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Ej. 100000"
                      value={montoRecibido}
                      onChange={(e) =>
                        setMontoRecibido(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-8 pr-4 py-4 text-white text-xl font-bold outline-none focus:border-green-500 transition-colors shadow-inner"
                    />
                  </div>

                  {/* Botones rápidos de billetes */}
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-none">
                    {[20000, 50000, 100000].map((billete) => (
                      <button
                        key={billete}
                        onClick={() => setMontoRecibido(billete)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 rounded-lg border border-gray-700 shrink-0 transition-colors"
                      >
                        +{formatearDinero(billete)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de Cambio (Vuelto) */}
              {metodoPago === "Efectivo" && Number(montoRecibido) > 0 && (
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    cambio >= 0
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${cambio >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {cambio >= 0 ? "Cambio a devolver:" : "Falta dinero:"}
                    </span>
                    <span
                      className={`text-xl font-black ${cambio >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatearDinero(Math.abs(cambio))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Cobrar Factura */}
            <div className="p-6 bg-gray-950 border-t border-gray-800">
              <button
                disabled={
                  procesandoCobro ||
                  (metodoPago === "Efectivo" &&
                    Number(montoRecibido) < totalACobrar)
                }
                onClick={manejarCobro}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 py-4 rounded-xl font-black text-white tracking-widest uppercase transition-all shadow-lg shadow-green-500/20 disabled:shadow-none active:scale-95 flex items-center justify-center gap-2 text-lg"
              >
                {procesandoCobro ? "Procesando..." : "💰 Cobrar y Liberar Mesa"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
