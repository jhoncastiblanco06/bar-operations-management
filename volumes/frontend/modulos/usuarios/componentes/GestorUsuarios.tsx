"use client";

import { useState, useEffect } from "react";
import { Usuario, Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

export default function GestorUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Mesero");
  const [idSede, setIdSede] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);

  // Función para cargar usuarios y sedes al mismo tiempo
  const cargarDatos = async () => {
    try {
      const [respuestaUsuarios, respuestaSedes] = await Promise.all([
        fetch(`${API_URL}/usuarios`),
        fetch(`${API_URL}/sedes`),
      ]);

      setUsuarios(await respuestaUsuarios.json());
      setSedes(await respuestaSedes.json());
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para crear un nuevo usuario
  const manejarCrearUsuario = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstaCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_completo: nombre,
          email: email,
          password_hash: password,
          rol: rol,
          id_sede: idSede === "" ? null : idSede,
        }),
      });

      if (respuesta.ok) {
        setNombre("");
        setEmail("");
        setPassword("");
        setRol("Mesero");
        setIdSede("");
        cargarDatos(); // Recargar la lista
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Gestión de Personal</h1>
        <p className="text-gray-400">
          Administra los accesos y roles de tu equipo
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Nuevo Usuario
          </h2>
          <form onSubmit={manejarCrearUsuario} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Nombre Completo
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Ej. Carlos Pérez"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="carlos@bar.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Contraseña Temporal
              </label>
              <input
                required
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                placeholder="Secreta123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Rol
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="Mesero">Mesero</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Sede Asignada
                </label>
                <select
                  value={idSede}
                  onChange={(e) => setIdSede(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">-- Ninguna --</option>
                  {sedes.map((sede) => (
                    <option key={sede.id_sede} value={sede.id_sede}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              disabled={estaCargando}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
            >
              {estaCargando ? "Guardando..." : "Crear Usuario"}
            </button>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="lg:col-span-2 space-y-4">
          {usuarios.length === 0 ? (
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center text-gray-500">
              Cargando usuarios...
            </div>
          ) : (
            usuarios.map((usuario) => (
              <div
                key={usuario.id_usuario}
                className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gray-600 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {usuario.nombre_completo}
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider ${
                        usuario.rol === "Administrador"
                          ? "bg-purple-500/20 text-purple-400"
                          : usuario.rol === "Cajero"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{usuario.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-300">
                    📍{" "}
                    {usuario.sedes ? usuario.sedes.nombre : "Sin sede asignada"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estado: {usuario.estado || "Activo"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
