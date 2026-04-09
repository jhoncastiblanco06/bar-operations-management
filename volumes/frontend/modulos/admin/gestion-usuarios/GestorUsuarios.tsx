"use client";

import { useState, useEffect } from "react";
import { Usuario, Sede } from "../../../tipos";
import { API_URL } from "../../../utilidades/api";

// Ampliamos la interfaz para incluir los nuevos campos
interface UsuarioExtendido extends Usuario {
  documento?: string;
  telefono?: string;
  turno?: string;
}

export default function GestorUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioExtendido[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados para Edición
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idUsuarioEdicion, setIdUsuarioEdicion] = useState<number | null>(null);

  // Estados del formulario
  const [documento, setDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Mesero");
  const [turno, setTurno] = useState("Mañana");
  const [idSede, setIdSede] = useState("");
  const [estado, setEstado] = useState("Activo");

  // Estado de errores
  const [errores, setErrores] = useState<any>({});
  const [usuarioAEliminar, setUsuarioAEliminar] =
    useState<UsuarioExtendido | null>(null);

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
    setDocumento("");
    setNombre("");
    setEmail("");
    setTelefono("");
    setPassword("");
    setRol("Mesero");
    setTurno("Mañana");
    setIdSede("");
    setEstado("Activo");
    setErrores({});
  };

  const iniciarEdicion = (u: UsuarioExtendido) => {
    setModoEdicion(true);
    setIdUsuarioEdicion(u.id_usuario);
    setDocumento(u.documento || "");
    setNombre(u.nombre_completo);
    setEmail(u.email);
    setTelefono(u.telefono || "");
    setPassword(""); // Nunca cargamos la contraseña por seguridad
    setRol(u.rol);
    setTurno(u.turno || "Mañana");
    setIdSede(u.id_sede?.toString() || "");
    setEstado(u.estado || "Activo");
    setErrores({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🛡️ MOTOR DE VALIDACIÓN
  const validarFormulario = () => {
    const nuevosErrores: any = {};

    // Limpiamos espacios
    const docTrim = documento.trim();
    const nomTrim = nombre.trim();
    const emailTrim = email.trim().toLowerCase();
    const telTrim = telefono.trim();
    const passTrim = password.trim();

    // 1. Validar Documento: 6 a 12 dígitos, solo números
    const docRegex = /^\d{6,12}$/;
    if (!docRegex.test(docTrim)) {
      nuevosErrores.documento = "Debe tener entre 6 y 12 dígitos numéricos.";
    }

    // 2. Validar Nombre: 3 a 60 chars, letras, espacios, apóstrofes, guiones. Cero números.
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{3,60}$/;
    if (!nombreRegex.test(nomTrim)) {
      nuevosErrores.nombre =
        "Entre 3 y 60 caracteres. Solo letras. No números ni símbolos raros.";
    }

    // 3. Validar Email: Formato válido, máximo 100 caracteres
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailTrim.length > 100 || !emailRegex.test(emailTrim)) {
      nuevosErrores.email =
        "Ingresa un correo electrónico válido (máx 100 caracteres).";
    }

    // 4. Validar Teléfono: Exactamente 10 dígitos, empieza con 3
    const telefonoRegex = /^3\d{9}$/;
    if (!telefonoRegex.test(telTrim)) {
      nuevosErrores.telefono = "Debe tener 10 dígitos exactos y empezar con 3.";
    }

    // 5. Validar Contraseña (Solo si está creando, o si está editando y escribió algo)
    if (!modoEdicion || (modoEdicion && passTrim !== "")) {
      // Al menos 1 letra, 1 número y entre 8 y 50 caracteres
      const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,50}$/;
      if (!passRegex.test(passTrim)) {
        nuevosErrores.password =
          "Mínimo 8 caracteres. Debe incluir al menos una letra y un número.";
      }
    }

    // 6. Validar Sede: Obligatorio
    if (!idSede) {
      nuevosErrores.sede = "Debes asignar una sede al empleado.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardarUsuario = async (evento: React.FormEvent) => {
    evento.preventDefault();

    if (!validarFormulario()) return;

    setEstaCargando(true);

    const formData = new FormData();
    formData.append("documento", documento.trim());
    formData.append("nombre_completo", nombre.trim());
    formData.append("email", email.trim().toLowerCase()); // Guardamos en minúsculas
    formData.append("telefono", telefono.trim());
    formData.append("rol", rol);
    formData.append("turno", turno);
    formData.append("estado", estado);
    formData.append("id_sede", idSede);

    if (password.trim() !== "") {
      formData.append("password_hash", password.trim());
    }

    try {
      const url = modoEdicion
        ? `${API_URL}/usuarios/${idUsuarioEdicion}`
        : `${API_URL}/usuarios`;

      const metodo = modoEdicion ? "PATCH" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        body: formData,
      });

      if (respuesta.ok) {
        resetearFormulario();
        cargarDatos();
        alert(modoEdicion ? "✅ Usuario actualizado" : "✅ Usuario creado");
      } else {
        const errorData = await respuesta.json();
        // Manejar errores de campos únicos desde el backend (ej. correo o cédula repetida)
        alert(
          `❌ Error: ${errorData.message || "Revisa los datos (Cédula o Email podrían estar repetidos)"}`,
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    } finally {
      setEstaCargando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!usuarioAEliminar) return;
    try {
      const res = await fetch(
        `${API_URL}/usuarios/${usuarioAEliminar.id_usuario}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setUsuarioAEliminar(null);
        cargarDatos();
      } else {
        alert("❌ No se puede eliminar. Probablemente tenga ventas asociadas.");
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
            <div className="grid grid-cols-2 gap-4">
              {/* Documento */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                  Cédula
                </label>
                <input
                  required
                  value={documento}
                  onChange={(e) =>
                    setDocumento(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={12}
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 ${errores.documento ? "border-red-500" : "border-gray-700"}`}
                  placeholder="Ej. 1023456789"
                />
                {errores.documento && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errores.documento}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                  Teléfono
                </label>
                <input
                  required
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
                  className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 ${errores.telefono ? "border-red-500" : "border-gray-700"}`}
                  placeholder="Ej. 3001234567"
                />
                {errores.telefono && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errores.telefono}
                  </p>
                )}
              </div>
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                Nombre Completo
              </label>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.nombre ? "border-red-500" : "border-gray-700"}`}
                placeholder="Ej. Juan Pérez"
              />
              {errores.nombre && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errores.nombre}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.email ? "border-red-500" : "border-gray-700"}`}
                placeholder="usuario@correo.com"
              />
              {errores.email && (
                <p className="text-red-500 text-[10px] mt-1">{errores.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                {modoEdicion ? "Nueva Contraseña (Opcional)" : "Contraseña"}
              </label>
              <input
                required={!modoEdicion}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.password ? "border-red-500" : "border-gray-700"}`}
                placeholder="Mínimo 8 caracteres, 1 letra, 1 número"
              />
              {errores.password && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errores.password}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Rol */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                  Rol
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Mesero">Mesero</option>
                </select>
              </div>

              {/* Turno */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                  Turno
                </label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
            </div>

            {/* Sede */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">
                Sede Asignada
              </label>
              <select
                required
                value={idSede}
                onChange={(e) => setIdSede(e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 ${errores.sede ? "border-red-500" : "border-gray-700"}`}
              >
                <option value="">-- Seleccionar Sede --</option>
                {sedes.map((s) => (
                  <option key={s.id_sede} value={s.id_sede}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              {errores.sede && (
                <p className="text-red-500 text-[10px] mt-1">{errores.sede}</p>
              )}
            </div>

            {/* Estado */}
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <label className="block text-[10px] text-gray-500 mb-2 uppercase tracking-widest">
                Estado Operativo
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    value="Activo"
                    checked={estado === "Activo"}
                    onChange={(e) => setEstado(e.target.value)}
                    className="text-blue-500"
                  />{" "}
                  Activo
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    value="Inactivo"
                    checked={estado === "Inactivo"}
                    onChange={(e) => setEstado(e.target.value)}
                    className="text-red-500"
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${u.rol === "Admin" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
                >
                  {u.avatar_url ? (
                    <img
                      src={`${API_URL}${u.avatar_url}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    u.nombre_completo.charAt(0).toUpperCase()
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
                  <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                    <p>
                      📧 {u.email} <span className="mx-2">|</span> 📞{" "}
                      {u.telefono || "N/A"}
                    </p>
                    <p>
                      🪪 {u.documento || "N/A"} <span className="mx-2">|</span>{" "}
                      🕒 {u.turno || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-gray-800 text-blue-400 px-2 py-1 rounded">
                      {u.rol}
                    </span>
                    <span className="text-xs text-gray-400">
                      📍 {u.sedes?.nombre || "Sin sede"}
                    </span>
                  </div>
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
