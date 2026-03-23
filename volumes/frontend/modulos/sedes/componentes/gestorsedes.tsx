"use client";

import { useState, useEffect } from "react";
import { API_URL } from "../../../utilidades/api";

// Interfaz local para tener TypeScript feliz
interface Sede {
  id_sede: number;
  nombre: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  estado: string; // 'Activa' o 'Inactiva'
}

export default function GestorSedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados del Formulario (Sirve para Crear y Editar)
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSedeEdicion, setIdSedeEdicion] = useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estadoSede, setEstadoSede] = useState("Activa");

  // Estado para el Pop-up (Modal) de Eliminación
  const [sedeAEliminar, setSedeAEliminar] = useState<Sede | null>(null);

  // 1. Cargar las sedes desde el Backend
  const cargarSedes = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/sedes`);
      const datos = await respuesta.json();
      setSedes(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  // 2. Limpiar el formulario
  const resetearFormulario = () => {
    setModoEdicion(false);
    setIdSedeEdicion(null);
    setNombre("");
    setDireccion("");
    setTelefono("");
    setCiudad("");
    setEstadoSede("Activa");
  };

  // 3. Preparar el formulario para Editar
  const iniciarEdicion = (sede: Sede) => {
    setModoEdicion(true);
    setIdSedeEdicion(sede.id_sede);
    setNombre(sede.nombre);
    setDireccion(sede.direccion || "");
    setTelefono(sede.telefono || "");
    setCiudad(sede.ciudad || "");
    setEstadoSede(sede.estado || "Activa");
    // Hacemos scroll suave hacia arriba en móviles
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Guardar (Crear nueva O Actualizar existente)
  const manejarGuardarSede = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstaCargando(true);

    const datosAEnviar = {
      nombre,
      direccion,
      telefono,
      ciudad,
      estado: estadoSede,
    };

    try {
      let url = `${API_URL}/sedes`;
      let metodo = "POST"; // Por defecto es Crear

      // Si estamos en modo edición, cambiamos a PATCH/PUT y apuntamos a un ID específico
      if (modoEdicion && idSedeEdicion) {
        url = `${API_URL}/sedes/${idSedeEdicion}`;
        metodo = "PATCH";
      }

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAEnviar),
      });

      if (respuesta.ok) {
        resetearFormulario();
        cargarSedes();
      } else {
        alert("Error al guardar la sede. Revisa los datos.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  // 5. Eliminar Sede (Confirmación del Modal)
  const confirmarEliminacion = async () => {
    if (!sedeAEliminar) return;

    try {
      const respuesta = await fetch(
        `${API_URL}/sedes/${sedeAEliminar.id_sede}`,
        {
          method: "DELETE",
        },
      );

      if (respuesta.ok) {
        setSedeAEliminar(null); // Cerramos el modal
        cargarSedes(); // Recargamos la lista
      } else {
        alert(
          "No se puede eliminar la sede. Es posible que tenga usuarios o mesas asignadas.",
        );
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="space-y-8 relative">
      <header>
        <h1 className="text-3xl font-bold">Gestión de Sedes</h1>
        <p className="text-gray-400">
          Administra las sucursales y puntos de venta de tu negocio
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario (Columna 1) */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit lg:col-span-1 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-xl font-semibold ${modoEdicion ? "text-purple-400" : "text-blue-400"}`}
            >
              {modoEdicion ? "✏️ Editar Sede" : "🏢 Nueva Sede"}
            </h2>
            {modoEdicion && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={manejarGuardarSede} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Nombre de la Sede
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Ej. Sede Norte"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Ciudad
                </label>
                <input
                  required
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Ej. Bogotá"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Teléfono
                </label>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Ej. 3001234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Dirección Completa
              </label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Calle 123 #45-67"
              />
            </div>

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Estado Operativo
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="estado"
                    value="Activa"
                    checked={estadoSede === "Activa"}
                    onChange={(e) => setEstadoSede(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-300">🟢 Activa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="estado"
                    value="Inactiva"
                    checked={estadoSede === "Inactiva"}
                    onChange={(e) => setEstadoSede(e.target.value)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 focus:ring-red-600"
                  />
                  <span className="text-sm text-gray-300">🔴 Inactiva</span>
                </label>
              </div>
            </div>

            <button
              disabled={estaCargando}
              className={`w-full text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg ${modoEdicion ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"}`}
            >
              {estaCargando
                ? "Guardando..."
                : modoEdicion
                  ? "Actualizar Sede"
                  : "Crear Sede"}
            </button>
          </form>
        </div>

        {/* Lista de Sedes (Columnas 2 y 3) */}
        <div className="lg:col-span-2 space-y-4">
          {sedes.length === 0 ? (
            <div className="bg-gray-900/50 p-10 rounded-2xl border border-gray-800 border-dashed text-center text-gray-500">
              <span className="text-4xl mb-4 block">🏢</span>
              No hay sedes registradas.
            </div>
          ) : (
            /* 👇 CAMBIO AQUÍ: Quitamos 'grid-cols-2' para que siempre sea una fila por sede */
            <div className="flex flex-col gap-4">
              {sedes.map((sede) => (
                <div
                  key={sede.id_sede}
                  /* 👇 OPCIONAL: Agregamos 'flex-row' para que el contenido se estire a lo ancho */
                  className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-gray-500 transition-all group relative"
                >
                  {/* ... resto del contenido (Nombre, Dirección, Botones) ... */}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {sede.nombre}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sede.estado === "Inactivo" ? "bg-red-900/50 text-red-400 border border-red-500/30" : "bg-green-900/50 text-green-400 border border-green-500/30"}`}
                      >
                        {sede.estado || "Activo"}
                      </span>
                    </div>
                    <p className="text-sm text-blue-400 font-medium mb-2">
                      {sede.ciudad}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                      <p className="flex items-center gap-2">
                        <span>📍</span> {sede.direccion || "Sin dirección"}
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📞</span> {sede.telefono || "Sin teléfono"}
                      </p>
                    </div>
                  </div>

                  {/* Botones de Acción movidos a la derecha en pantallas grandes */}
                  <div className="flex justify-end gap-2 border-t sm:border-t-0 border-gray-700 pt-4 sm:pt-0 mt-4 sm:mt-0 w-full sm:w-auto">
                    <button
                      onClick={() => iniciarEdicion(sede)}
                      className="bg-gray-900 hover:bg-purple-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700 hover:border-purple-500 flex items-center gap-1"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => setSedeAEliminar(sede)}
                      className="bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700 hover:border-red-500 flex items-center gap-1"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🛑 POP-UP (MODAL) DE ELIMINACIÓN 🛑 */}
      {sedeAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-red-500/50">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                ¿Eliminar esta Sede?
              </h3>
              <p className="text-gray-400 text-sm">
                Estás a punto de eliminar la sede{" "}
                <strong className="text-white">{sedeAEliminar.nombre}</strong>.
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSedeAEliminar(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
