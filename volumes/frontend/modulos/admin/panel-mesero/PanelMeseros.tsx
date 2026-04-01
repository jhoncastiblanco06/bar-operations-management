"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../../utilidades/api";

interface Sede {
  id_sede: number;
  nombre: string;
}

interface Mesa {
  id_mesa: number;
  nombre_identificador: string;
  capacidad: number;
  estado: string;
}

export default function MapaMesasMesero() {
  const router = useRouter();

  // 🚀 ESTADOS DE SEDES
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>("");

  // ESTADOS DE MESAS
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);

  // 1. Cargar la lista de Sedes al entrar a la pantalla
  useEffect(() => {
    fetch(`${API_URL}/sedes`)
      .then((r) => r.json())
      .then((data) => {
        setSedes(Array.isArray(data) ? data : []);
        // Si el usuario ya tiene una sede en su perfil, la seleccionamos por defecto
        const usrStr = localStorage.getItem("usuario_bar");
        if (usrStr) {
          const usuario = JSON.parse(usrStr);
          if (usuario.id_sede) {
            setSedeSeleccionada(String(usuario.id_sede));
          }
        }
      })
      .catch((err) => console.error("Error al cargar sedes:", err));
  }, []);

  // 2. El Motor de Mesas en Tiempo Real (Reacciona al cambiar de sede)
  useEffect(() => {
    if (!sedeSeleccionada) {
      setMesas([]);
      setEstaCargando(false);
      return;
    }

    const cargarMesas = async () => {
      try {
        const respuesta = await fetch(
          `${API_URL}/mesas/sede/${sedeSeleccionada}`,
        );
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

    cargarMesas(); // Primera carga inmediata al cambiar de sede

    // 🚀 TRUCO 1: Pulso acelerado a 2.5 segundos
    const intervalo = setInterval(() => {
      cargarMesas();
    }, 2500);

    // 🚀 TRUCO 2: Actualización al instante al enfocar la pantalla
    const alEnfocarPantalla = () => cargarMesas();
    window.addEventListener("focus", alEnfocarPantalla);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") cargarMesas();
    });

    // Limpieza
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", alEnfocarPantalla);
      window.removeEventListener("visibilitychange", alEnfocarPantalla);
    };
  }, [sedeSeleccionada]); // 👈 Si la sede cambia, el motor se reinicia solo

  const seleccionarMesa = (id_mesa: number) => {
    router.push(`/admin/meseros/pedido/${id_mesa}`);
  };

  const mesasLibres = mesas.filter((m) => m.estado === "Disponible").length;
  const mesasOcupadas = mesas.filter((m) => m.estado === "Ocupada").length;

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

        {/* 🚀 SELECTOR DE SEDE INTEGRADO AQUÍ */}
        <select
          value={sedeSeleccionada}
          onChange={(e) => {
            setSedeSeleccionada(e.target.value);
            setEstaCargando(true); // Mostramos loader al cambiar
          }}
          className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none transition-colors focus:border-purple-500 cursor-pointer shadow-inner"
        >
          <option value="" disabled>
            -- Elegir Sede --
          </option>
          {sedes.map((s) => (
            <option key={s.id_sede} value={s.id_sede}>
              📍 {s.nombre}
            </option>
          ))}
        </select>

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
      {!sedeSeleccionada ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
          <span className="text-4xl block mb-4">🏢</span>
          <h3 className="text-xl font-bold text-white">Selecciona una Sede</h3>
          <p className="text-gray-500 mt-2">
            Elige la sucursal en el menú de arriba para ver las mesas.
          </p>
        </div>
      ) : estaCargando ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-pulse text-purple-400 font-bold tracking-widest uppercase">
            Cargando salón...
          </div>
        </div>
      ) : mesas.length === 0 ? (
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
