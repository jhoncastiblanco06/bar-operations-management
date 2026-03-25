"use client";

import { useState, useEffect } from "react";
import { Usuario, Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

export default function GestorUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados para Edición
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idUsuarioEdicion, setIdUsuarioEdicion] = useState<number | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Mesero");
  const [idSede, setIdSede] = useState("");
  const [estado, setEstado] = useState("Activo");

  // Estado para el Modal de Eliminación
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(
    null,
  );

  const cargarDatos = async () => {
    try {
      const [resUsuarios, resSedes] = await Promise.all([
        fetch(`${API_URL}/usuarios`),
        fetch(`${API_URL}/sedes`),
      ]);
      const dataUsers = await resUsuarios.json();
      const dataSedes = await resSedes.json();

      setUsuarios(Array.isArray(dataUsers) ? dataUsers : []);
      setSedes(Array.isArray(dataSedes) ? dataSedes : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetearFormulario = () => {
    setModoEdicion(false);
    setIdUsuarioEdicion(null);
    setNombre("");
    setEmail("");
    setPassword("");
    setRol("Mesero");
    setIdSede("");
    setEstado("Activo");
  };

  const iniciarEdicion = (u: Usuario) => {
    setModoEdicion(true);
    setIdUsuarioEdicion(u.id_usuario);
    setNombre(u.nombre_completo);
    setEmail(u.email);
    setPassword("");
    setRol(u.rol);
    setIdSede(u.id_sede?.toString() || "");
    setEstado(u.estado || "Activo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const manejarGuardarUsuario = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstaCargando(true);

    // 🚀 CAMBIO CLAVE: Usamos FormData para que sea compatible con Multer en el backend
    const formData = new FormData();
    formData.append("nombre_completo", nombre);
    formData.append("email", email);
    formData.append("rol", rol);
    formData.append("estado", estado);

    // Solo enviamos la sede si se seleccionó una
    if (idSede !== "") {
      formData.append("id_sede", idSede);
    }

    // Solo enviamos password si el usuario escribió algo
    if (password) {
      formData.append("password_hash", password);
    }

    try {
      const url = modoEdicion
        ? `${API_URL}/usuarios/${idUsuarioEdicion}`
        : `${API_URL}/usuarios`;

      const metodo = modoEdicion ? "PATCH" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        // ⚠️ MUY IMPORTANTE: NO enviamos headers de 'Content-Type' aquí, el navegador lo hace solo con FormData
        body: formData,
      });

      if (respuesta.ok) {
        resetearFormulario();
        cargarDatos();
        alert(modoEdicion ? "✅ Usuario actualizado" : "✅ Usuario creado");
      } else {
        alert("❌ Error al procesar la solicitud en el servidor");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!usuarioAEliminar) return;
    try {
      const res = await fetch(
        `${API_URL}/usuarios/${usuarioAEliminar.id_usuario}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setUsuarioAEliminar(null);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="space-y-8 relative">
      <header>
        <h1 className="text-3xl font-bold text-white">Gestión de Personal</h1>
        <p className="text-gray-400">
          Administra los accesos y roles de tu equipo
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 h-fit shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl font-semibold ${modoEdicion ? "text-purple-400" : "text-blue-400"}`}
            >
              {modoEdicion ? "✏️ Editar Usuario" : "👤 Nuevo Usuario"}
            </h2>
            {modoEdicion && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="text-xs text-gray-500 hover:text-white underline"
              >
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={manejarGuardarUsuario} className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                Nombre Completo
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                {modoEdicion ? "Nueva Contraseña (Opcional)" : "Contraseña"}
              </label>
              <input
                required={!modoEdicion}
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
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
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                  Sede
                </label>
                <select
                  value={idSede}
                  onChange={(e) => setIdSede(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Ninguna</option>
                  {sedes.map((s) => (
                    <option key={s.id_sede} value={s.id_sede}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <label className="block text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
                Estado
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    value="Activo"
                    checked={estado === "Activo"}
                    onChange={(e) => setEstado(e.target.value)}
                  />{" "}
                  Activo
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    value="Inactivo"
                    checked={estado === "Inactivo"}
                    onChange={(e) => setEstado(e.target.value)}
                  />{" "}
                  Inactivo
                </label>
              </div>
            </div>

            <button
              disabled={estaCargando}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${modoEdicion ? "bg-purple-600 hover:bg-purple-500" : "bg-blue-600 hover:bg-blue-500"}`}
            >
              {estaCargando
                ? "Procesando..."
                : modoEdicion
                  ? "Actualizar Datos"
                  : "Crear Usuario"}
            </button>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {usuarios.map((u) => (
            <div
              key={u.id_usuario}
              className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${u.rol === "Administrador" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
                >
                  {u.avatar_url ? (
                    <img
                      src={`${API_URL}${u.avatar_url}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    u.nombre_completo.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    {u.nombre_completo}
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border ${u.estado === "Inactivo" ? "border-red-500/50 text-red-400" : "border-green-500/50 text-green-400"}`}
                    >
                      {u.estado || "Activo"}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {u.email} • <span className="text-blue-400">{u.rol}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {u.sedes?.nombre || "Sin sede"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0">
                <button
                  onClick={() => iniciarEdicion(u)}
                  className="p-2 bg-gray-800 hover:bg-purple-600 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setUsuarioAEliminar(u)}
                  className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg text-gray-400 hover:text-white transition-colors border border-gray-700"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Eliminar Usuario?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Estás por eliminar a{" "}
              <span className="text-white font-semibold">
                {usuarioAEliminar.nombre_completo}
              </span>
              . Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUsuarioAEliminar(null)}
                className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
