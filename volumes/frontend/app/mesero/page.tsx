"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../utilidades/api";

interface Mesa {
  id_mesa: number;
  nombre_identificador: string;
  capacidad: number;
  estado: string;
}

export default function MapaMesasMesero() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const usrStr = localStorage.getItem("usuario_bar");
        let url = `${API_URL}/mesas`;

        if (usrStr) {
          const usuario = JSON.parse(usrStr);
          if (usuario.id_sede) {
            url = `${API_URL}/mesas/sede/${usuario.id_sede}`;
          }
        }

        const respuesta = await fetch(url);
        if (respuesta.ok) {
          const data = await respuesta.json();
          setMesas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al cargar las mesas:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    cargarMesas(); // Primera carga inmediata

    // 🚀 TRUCO 1: Pulso acelerado a 2.5 segundos (Se siente inmediato)
    const intervalo = setInterval(() => {
      cargarMesas();
    }, 2500);

    // 🚀 TRUCO 2: Si el mesero apaga la pantalla y la vuelve a encender,
    // o cambia de pestaña y regresa, actualiza AL INSTANTE.
    const alEnfocarPantalla = () => {
      cargarMesas();
    };
    window.addEventListener("focus", alEnfocarPantalla);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") cargarMesas();
    });

    // Limpieza al salir de la vista
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", alEnfocarPantalla);
      window.removeEventListener("visibilitychange", alEnfocarPantalla);
    };
  }, []);

  const seleccionarMesa = (id_mesa: number) => {
    router.push(`/mesero/pedido/${id_mesa}`);
  };

  const mesasLibres = mesas.filter((m) => m.estado === "Disponible").length;
  const mesasOcupadas = mesas.filter((m) => m.estado === "Ocupada").length;

  // Solo mostramos esta pantalla de carga la primerísima vez
  if (estaCargando) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse text-purple-400 font-bold tracking-widest uppercase">
          Cargando salón...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Encabezado y Estadísticas */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/80 p-5 rounded-3xl border border-gray-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white">Salón Principal</h1>
          <p className="text-sm text-gray-400">
            Selecciona una mesa para atender
          </p>
        </div>

        {/* Badges de resumen dinámicos */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-2xl text-center transition-all">
            <span className="block text-2xl font-black text-green-400">
              {mesasLibres}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-green-500/70 font-bold">
              Libres
            </span>
          </div>
          <div className="flex-1 sm:flex-none bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-2xl text-center transition-all">
            <span className="block text-2xl font-black text-red-400">
              {mesasOcupadas}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-red-500/70 font-bold">
              Ocupadas
            </span>
          </div>
        </div>
      </header>

      {/* Cuadrícula de Mesas */}
      {mesas.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
          <span className="text-4xl block mb-4">🪑</span>
          <h3 className="text-xl font-bold text-white">
            No hay mesas configuradas
          </h3>
          <p className="text-gray-500 mt-2">
            Pídele al administrador que asigne mesas a tu sede.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mesas.map((mesa) => {
            const estaLibre = mesa.estado === "Disponible";

            return (
              <button
                key={mesa.id_mesa}
                onClick={() => seleccionarMesa(mesa.id_mesa)}
                className={`relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-500 active:scale-95 group ${
                  estaLibre
                    ? "bg-gray-900/50 border-gray-800 hover:border-green-500 hover:bg-green-500/5"
                    : "bg-red-500/5 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                }`}
              >
                {/* Indicador de estado */}
                <div
                  className={`absolute top-3 right-3 w-3 h-3 rounded-full shadow-lg transition-colors duration-500 ${
                    estaLibre
                      ? "bg-green-500 shadow-green-500/50"
                      : "bg-red-500 shadow-red-500/50 animate-pulse"
                  }`}
                />

                <span
                  className={`text-xl sm:text-2xl text-center font-black tracking-tight mb-3 leading-tight transition-colors duration-500 ${estaLibre ? "text-white" : "text-red-100"}`}
                >
                  {mesa.nombre_identificador}
                </span>

                <div
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-colors duration-500 ${estaLibre ? "bg-gray-800 text-gray-400" : "bg-red-500/20 text-red-300"}`}
                >
                  <span>👥</span> {mesa.capacidad} asientos
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
