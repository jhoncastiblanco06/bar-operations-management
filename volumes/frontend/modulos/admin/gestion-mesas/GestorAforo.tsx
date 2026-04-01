"use client";

import { useState, useEffect } from "react";
// Importamos nuestros moldes globales y la URL centralizada
import { Sede, Mesa } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

export default function GestorAforo() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>("");
  const [estaCargando, setEstaCargando] = useState(false);

  // 1. Cargar datos usando nuestra variable global API_URL
  // Función blindada para cargar datos
  const cargarDatos = async () => {
    try {
      const [resMesas, resSedes] = await Promise.all([
        fetch(`${API_URL}/mesas`),
        fetch(`${API_URL}/sedes`),
      ]);

      const datosMesas = await resMesas.json();
      const datosSedes = await resSedes.json();

      // 🛡️ EL ESCUDO: Si no es un array, le pasamos un array vacío [] para que no explote
      if (Array.isArray(datosMesas)) {
        setMesas(datosMesas);
      } else {
        console.error("El backend no devolvió una lista de mesas:", datosMesas);
        setMesas([]);
      }

      if (Array.isArray(datosSedes)) {
        setSedes(datosSedes);
      } else {
        console.error("El backend no devolvió una lista de sedes:", datosSedes);
        setSedes([]);
      }
    } catch (error) {
      console.error("Error de conexión al cargar datos:", error);
      setMesas([]);
      setSedes([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mesasDeLaSede = mesas.filter(
    (mesa) => mesa.sedes?.id_sede.toString() === sedeSeleccionada,
  );

  const contarMesasPorCapacidad = (capacidadBuscada: number) => {
    let contador = 0;
    for (let i = 0; i < mesasDeLaSede.length; i++) {
      if (mesasDeLaSede[i].capacidad === capacidadBuscada) {
        contador++;
      }
    }
    return contador;
  };

  const agregarMesa = async (capacidad: number) => {
    if (!sedeSeleccionada) return;
    setEstaCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/mesas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sede: sedeSeleccionada,
          capacidad: capacidad,
        }),
      });
      if (respuesta.ok) cargarDatos();
    } catch (error) {
      console.error("Error al agregar mesa:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  const quitarMesa = async (capacidad: number) => {
    if (!sedeSeleccionada || contarMesasPorCapacidad(capacidad) === 0) return;

    setEstaCargando(true);
    try {
      const respuesta = await fetch(
        `${API_URL}/mesas/sede/${sedeSeleccionada}/capacidad/${capacidad}`,
        {
          method: "DELETE",
        },
      );
      if (respuesta.ok) cargarDatos();
    } catch (error) {
      console.error("Error al quitar mesa:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  const tiposDeMesas = [
    { nombre: "Mesas para Parejas", asientos: 2, icono: "🥂" },
    { nombre: "Mesas para Cuatro", asientos: 4, icono: "🍻" },
    { nombre: "Mesas para Seis", asientos: 6, icono: "🍷" },
    { nombre: "Mesas para Ocho", asientos: 8, icono: "🍾" },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado y Selector de Sede */}
      <header className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold">Administración de Mesas</h1>
          <p className="text-gray-400 mt-1">
            Configura la cantidad de mesas por cada sede
          </p>
        </div>

        <div className="w-full md:w-72">
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
            Sede actual
          </label>
          <select
            value={sedeSeleccionada}
            onChange={(evento) => setSedeSeleccionada(evento.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none"
          >
            <option value="">-- Selecciona una Sede --</option>
            {sedes.map((sede) => (
              <option key={sede.id_sede} value={sede.id_sede}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Panel de Mesas */}
      {!sedeSeleccionada ? (
        <div className="bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl p-10 text-center text-gray-500">
          Por favor, selecciona una sede arriba para ver sus mesas.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiposDeMesas.map((tipo) => {
            const cantidadActual = contarMesasPorCapacidad(tipo.asientos);

            return (
              <div
                key={tipo.asientos}
                className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center"
              >
                <div className="text-5xl mb-4">{tipo.icono}</div>
                <h3 className="font-bold text-lg text-white">{tipo.nombre}</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {tipo.asientos} asientos
                </p>

                <div className="flex justify-between items-center bg-gray-950 p-2 rounded-xl border border-gray-800">
                  <button
                    onClick={() => quitarMesa(tipo.asientos)}
                    disabled={cantidadActual === 0 || estaCargando}
                    className="w-10 h-10 bg-red-900/50 text-red-400 rounded-lg font-bold text-xl hover:bg-red-800 disabled:opacity-50"
                  >
                    -
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black">
                      {cantidadActual}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">
                      Mesas
                    </span>
                  </div>

                  <button
                    onClick={() => agregarMesa(tipo.asientos)}
                    disabled={estaCargando}
                    className="w-10 h-10 bg-blue-900/50 text-blue-400 rounded-lg font-bold text-xl hover:bg-blue-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
