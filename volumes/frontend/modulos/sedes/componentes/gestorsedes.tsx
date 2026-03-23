"use client";

import { useState, useEffect } from "react";
import { Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

export default function GestorSedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Función para traer las sedes del Backend
  const cargarSedes = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/sedes`);
      const datos = await respuesta.json();
      setSedes(datos);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
    }
  };

  // Cargar las sedes apenas entramos al componente
  useEffect(() => {
    cargarSedes();
  }, []);

  // Función para crear una nueva sede
  const manejarCrearSede = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstaCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/sedes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, direccion, telefono }),
      });

      if (respuesta.ok) {
        setNombre("");
        setDireccion("");
        setTelefono("");
        cargarSedes(); // Recargar la lista para ver la nueva sede
      }
    } catch (error) {
      console.error("Error al crear sede:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <header>
        <h1 className="text-3xl font-bold">Gestión de Sedes</h1>
        <p className="text-gray-400">Administra los locales de tu negocio</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario para Nueva Sede */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Nueva Sede
          </h2>
          <form onSubmit={manejarCrearSede} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Nombre
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Ej. Sede Norte"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Dirección
              </label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Opcional"
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
                placeholder="Opcional"
              />
            </div>
            <button
              disabled={estaCargando}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
            >
              {estaCargando ? "Guardando..." : "Guardar Sede"}
            </button>
          </form>
        </div>

        {/* Lista de Sedes */}
        <div className="md:col-span-2 space-y-4">
          {sedes.length === 0 ? (
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center text-gray-500">
              No hay sedes registradas todavía. Crea la primera a la izquierda.
            </div>
          ) : (
            sedes.map((sede) => (
              <div
                key={sede.id_sede}
                className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 flex justify-between items-center hover:border-gray-600 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {sede.nombre}
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full uppercase tracking-wider">
                      {sede.estado || "Activo"}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {sede.direccion || "Sin dirección registrada"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {sede.telefono || "Sin teléfono"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">ID: {sede.id_sede}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
