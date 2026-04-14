"use client";

import { useState, useEffect } from "react";
import { API_URL } from "../../../utilidades/api";

interface Sede {
  id_sede: number;
  nombre: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  barrio: string;
  localidad: string;
  estado: string;
}

export default function GestorSedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSedeEdicion, setIdSedeEdicion] = useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [estadoSede, setEstadoSede] = useState("Activa");

  const [errores, setErrores] = useState<any>({});
  const [sedeAEliminar, setSedeAEliminar] = useState<Sede | null>(null);

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

  const resetearFormulario = () => {
    setModoEdicion(false);
    setIdSedeEdicion(null);
    setNombre("");
    setDireccion("");
    setTelefono("");
    setCiudad("");
    setBarrio("");
    setLocalidad("");
    setEstadoSede("Activa");
    setErrores({});
  };

  const iniciarEdicion = (sede: Sede) => {
    setModoEdicion(true);
    setIdSedeEdicion(sede.id_sede);
    setNombre(sede.nombre);
    setDireccion(sede.direccion || "");
    setTelefono(sede.telefono || "");
    setCiudad(sede.ciudad || "");
    setBarrio(sede.barrio || "");
    setLocalidad(sede.localidad || "");
    setEstadoSede(sede.estado || "Activa");
    setErrores({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🛡️ MOTOR DE VALIDACIÓN ESTRICTO Y ANTIDUPLICADOS TOTAL
  const validarFormulario = () => {
    const nuevosErrores: any = {};

    const nomTrim = nombre.trim();
    const telTrim = telefono.trim();
    const dirTrim = direccion.trim();

    // 🔍 ESCÁNER ANTIDUPLICADOS: Verifica Nombre, Teléfono y Dirección
    const nombreDuplicado = sedes.some(
      (s) =>
        s.nombre.toLowerCase() === nomTrim.toLowerCase() &&
        s.id_sede !== idSedeEdicion,
    );
    const telefonoDuplicado = sedes.some(
      (s) => s.telefono === telTrim && s.id_sede !== idSedeEdicion,
    );
    const direccionDuplicada = sedes.some(
      (s) =>
        s.direccion?.toLowerCase() === dirTrim.toLowerCase() &&
        s.id_sede !== idSedeEdicion,
    );

    if (nombreDuplicado)
      nuevosErrores.nombre = "❌ Ya existe una sede con este nombre.";
    if (telefonoDuplicado)
      nuevosErrores.telefono = "❌ Este teléfono ya pertenece a otra sede.";
    if (direccionDuplicada)
      nuevosErrores.direccion =
        "❌ Esta dirección ya está registrada en otra sede.";

    // Validar Nombre
    const numerosEnNombre = (nomTrim.match(/\d/g) || []).length;
    if (nomTrim.length < 3 || nomTrim.length > 60) {
      nuevosErrores.nombre =
        nuevosErrores.nombre || "Debe tener entre 3 y 60 caracteres.";
    } else if (numerosEnNombre > 5) {
      nuevosErrores.nombre =
        nuevosErrores.nombre || "No se permiten más de 5 números en el nombre.";
    }

    // Validar Teléfono
    const telefonoRegex = /^3\d{9}$/;
    if (!telefonoRegex.test(telTrim)) {
      nuevosErrores.telefono =
        nuevosErrores.telefono ||
        "Debe tener 10 dígitos exactos y empezar con 3.";
    }

    // Validar Dirección
    const direccionRegex = /^[a-zA-Z0-9\s#\-\.,áéíóúÁÉÍÓÚñÑ]+$/;
    if (dirTrim.length < 10 || dirTrim.length > 80) {
      nuevosErrores.direccion =
        nuevosErrores.direccion || "Debe tener entre 10 y 80 caracteres.";
    } else if (!direccionRegex.test(dirTrim)) {
      nuevosErrores.direccion =
        nuevosErrores.direccion || "Usa letras, números, espacios y # - .";
    }

    // Validar Geografía
    if (ciudad.length < 3 || ciudad.length > 50)
      nuevosErrores.ciudad = "Debe tener entre 3 y 50 caracteres.";
    if (barrio.length < 3 || barrio.length > 50)
      nuevosErrores.barrio = "Debe tener entre 3 y 50 caracteres.";
    if (localidad.length < 3 || localidad.length > 50)
      nuevosErrores.localidad = "Debe tener entre 3 y 50 caracteres.";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardarSede = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!validarFormulario()) return;

    setEstaCargando(true);

    const datosAEnviar = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      ciudad: ciudad.trim(),
      barrio: barrio.trim(),
      localidad: localidad.trim(),
      estado: estadoSede,
    };

    try {
      let url = `${API_URL}/sedes`;
      let metodo = "POST";

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
        alert(
          modoEdicion ? "✅ Sede actualizada" : "✅ Sede creada exitosamente",
        );
      } else {
        const errorData = await respuesta.json();
        // Atrapa el error global de la Base de Datos si alguien se salta el Frontend
        alert(`❌ ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión al guardar.");
    } finally {
      setEstaCargando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!sedeAEliminar) return;

    try {
      const respuesta = await fetch(
        `${API_URL}/sedes/${sedeAEliminar.id_sede}`,
        { method: "DELETE" },
      );

      if (respuesta.ok) {
        setSedeAEliminar(null);
        cargarSedes();
      } else {
        alert(
          "❌ No se puede eliminar la sede. Es posible que tenga usuarios o mesas asignadas.",
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
        {/* --- FORMULARIO --- */}
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
            {/* Nombre */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Nombre de la Sede
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.nombre ? "border-red-500" : "border-gray-700"}`}
                placeholder="Ej. Sede Norte"
              />
              {errores.nombre && (
                <p className="text-red-500 text-[10px] mt-1 font-bold animate-pulse">
                  {errores.nombre}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Teléfono
              </label>
              <input
                required
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.telefono ? "border-red-500" : "border-gray-700"}`}
                placeholder="Ej. 3001234567"
              />
              {errores.telefono && (
                <p className="text-red-500 text-[10px] mt-1 font-bold animate-pulse">
                  {errores.telefono}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Dirección Completa
              </label>
              <input
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.direccion ? "border-red-500" : "border-gray-700"}`}
                placeholder="Calle 123 #45-67"
              />
              {errores.direccion && (
                <p className="text-red-500 text-[10px] mt-1 font-bold animate-pulse">
                  {errores.direccion}
                </p>
              )}
            </div>

            {/* Ubicación Geográfica */}
            <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800 space-y-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Ubicación
              </p>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Ciudad
                </label>
                <input
                  required
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 ${errores.ciudad ? "border-red-500" : "border-gray-700"}`}
                  placeholder="Ej. Bogotá"
                />
                {errores.ciudad && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">
                    {errores.ciudad}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Localidad
                  </label>
                  <input
                    required
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 ${errores.localidad ? "border-red-500" : "border-gray-700"}`}
                    placeholder="Ej. Chapinero"
                  />
                  {errores.localidad && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">
                      {errores.localidad}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Barrio
                  </label>
                  <input
                    required
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 ${errores.barrio ? "border-red-500" : "border-gray-700"}`}
                    placeholder="Ej. Chico"
                  />
                  {errores.barrio && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">
                      {errores.barrio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ESTADO OPERATIVO */}
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
                    checked={
                      estadoSede === "Inactiva" || estadoSede === "Inactivo"
                    }
                    onChange={(e) => setEstadoSede("Inactiva")}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 focus:ring-red-600"
                  />
                  <span className="text-sm text-gray-300">🔴 Inactiva</span>
                </label>
              </div>
            </div>

            <button
              disabled={estaCargando}
              className={`w-full text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg ${modoEdicion ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {estaCargando
                ? "Guardando..."
                : modoEdicion
                  ? "Actualizar Sede"
                  : "Crear Sede"}
            </button>
          </form>
        </div>

        {/* --- LISTA DE SEDES --- */}
        <div className="lg:col-span-2 space-y-4">
          {sedes.length === 0 ? (
            <div className="bg-gray-900/50 p-10 rounded-2xl border border-gray-800 border-dashed text-center text-gray-500">
              <span className="text-4xl mb-4 block">🏢</span>
              No hay sedes registradas.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sedes.map((sede) => (
                <div
                  key={sede.id_sede}
                  className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-gray-500 transition-all group relative"
                >
                  {/* Info de la sede */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {sede.nombre}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sede.estado === "Inactiva" || sede.estado === "Inactivo" ? "bg-red-900/50 text-red-400 border border-red-500/30" : "bg-green-900/50 text-green-400 border border-green-500/30"}`}
                      >
                        {sede.estado || "Activa"}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-blue-400 font-medium flex items-center gap-1">
                        <span>📍</span> {sede.ciudad}{" "}
                        {sede.localidad ? `• ${sede.localidad}` : ""}{" "}
                        {sede.barrio ? `• ${sede.barrio}` : ""}
                      </p>
                      <p className="text-sm text-gray-400 ml-5">
                        {sede.direccion || "Sin dirección"}
                      </p>
                      <p className="text-sm text-gray-400 ml-5 flex items-center gap-1 mt-1">
                        <span>📞</span> {sede.telefono || "Sin teléfono"}
                      </p>
                    </div>
                  </div>

                  {/* Botones */}
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

      {/* --- MODAL ELIMINAR --- */}
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
