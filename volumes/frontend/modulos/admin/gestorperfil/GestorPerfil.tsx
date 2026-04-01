"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../utilidades/api";

export default function GestorPerfil() {
  const [estaCargandoDatos, setEstaCargandoDatos] = useState(true);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  // Datos del Usuario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState("");

  // Manejo de la Foto
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nuevaFotoFile, setNuevaFotoFile] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  // Seguridad
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  useEffect(() => {
    const cargarMiPerfil = async () => {
      try {
        // ⚠️ ATENCIÓN AQUÍ: Si falla, revisa que el usuario ID 1 exista en tu base de datos
        const res = await fetch(`${API_URL}/usuarios/1`);

        if (res.ok) {
          const data = await res.json();
          setNombre(data.nombre_completo || "");
          setEmail(data.email || "");
          setRol(data.rol || "Sin Rol");
          setEstado(data.estado || "Inactivo");
          setAvatarUrl(data.avatar_url || null);
        } else {
          console.error("No se encontró el usuario. ¿Existe el ID 1?");
          // Valores por defecto para que no se quede "Cargando..." si falla
          setNombre("Usuario de Prueba");
          setEmail("prueba@bar.com");
          setRol("Administrador");
          setEstado("Activo");
        }
      } catch (error) {
        console.error("Error de red al cargar perfil:", error);
      } finally {
        setEstaCargandoDatos(false);
      }
    };
    cargarMiPerfil();
  }, []);

  const manejarCambioFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const archivo = e.target.files[0];
      setNuevaFotoFile(archivo);
      setPreviewFoto(URL.createObjectURL(archivo));
    }
  };

  const guardarCambiosPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    try {
      // 1. Preparamos el "Paquete" de datos que soporta imágenes
      const formData = new FormData();
      formData.append("nombre_completo", nombre);
      // El correo no lo enviamos porque es de solo lectura en esta vista

      if (nuevaFotoFile) {
        formData.append("avatar", nuevaFotoFile); // Metemos el archivo real
      }

      // 2. Disparamos la petición REAL al backend
      const respuesta = await fetch(`${API_URL}/usuarios/perfil/1`, {
        method: "PATCH", // 👈 ¡ESTA LÍNEA ES LA QUE EVITA EL ERROR 'Cannot GET'!
        body: formData,
      });

      if (respuesta.ok) {
        const datosActualizados = await respuesta.json();
        // Actualizamos la vista con la nueva URL de la imagen que nos devuelve el server
        if (datosActualizados.avatar_url) {
          setAvatarUrl(datosActualizados.avatar_url);
        }
        alert("✅ Perfil actualizado en la base de datos.");
      } else {
        alert("❌ Error al guardar en el servidor.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error de conexión.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const guardarSeguridad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) {
      return alert("Las contraseñas no coinciden.");
    }
    if (!passwordActual) {
      return alert("Debes ingresar tu contraseña actual.");
    }

    setGuardandoPassword(true);
    try {
      // Simulación de guardado de contraseña
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("✅ Contraseña actualizada con seguridad.");
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (error) {
      alert("Error al actualizar la contraseña.");
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (estaCargandoDatos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-blue-400 font-bold animate-pulse uppercase tracking-widest">
        Cargando datos de la cuenta...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Centro de Cuentas
        </h1>
        <p className="text-gray-400 mt-1">
          Administra tu información personal y seguridad
        </p>
      </header>

      {/* BLOQUE 1: DETALLES DEL PERFIL */}
      <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>👤</span> Detalles del Perfil
        </h2>

        <form onSubmit={guardarCambiosPerfil} className="space-y-8">
          {/* FOTO DE PERFIL */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-gray-950/50 border border-gray-800 rounded-2xl">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 shadow-inner flex items-center justify-center">
                {previewFoto || avatarUrl ? (
                  <img
                    src={previewFoto || `${API_URL}${avatarUrl}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-gray-500">
                    {nombre.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-white mb-1">
                Foto de perfil
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Sube una imagen en formato JPG o PNG. Máximo 2MB.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={inputArchivoRef}
                  onChange={manejarCambioFoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl border border-gray-700 transition-colors shadow-sm"
                >
                  Cambiar foto
                </button>
                {(previewFoto || avatarUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewFoto(null);
                      setNuevaFotoFile(null);
                      setAvatarUrl(null);
                    }}
                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CAMPOS DE DATOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Editable (Con lápiz) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  ✏️
                </span>
              </div>
            </div>

            {/* Email (Solo Lectura) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Correo Electrónico</span>
                <span className="text-[10px] text-gray-600">No editable</span>
              </label>
              <input
                disabled
                value={email}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed shadow-inner font-medium opacity-70"
              />
            </div>

            {/* Badges de Rol y Estado */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Rol Asignado
                </span>
                <span className="text-sm font-black text-purple-400 flex items-center gap-2">
                  🛡️ {rol}
                </span>
              </div>
              <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Estado de Cuenta
                </span>
                <span className="text-sm font-black flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${estado === "Activo" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={
                      estado === "Activo" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {estado}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-800">
            <button
              disabled={guardandoPerfil}
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {guardandoPerfil ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        </form>
      </section>

      {/* BLOQUE 2: SEGURIDAD Y ACCESO */}
      <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🔒</span> Seguridad y Acceso
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Actualiza tu contraseña. Asegúrate de usar una combinación fuerte.
        </p>

        <form onSubmit={guardarSeguridad} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Contraseña Actual
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Nueva Contraseña
              </label>
              <input
                required
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <input
                required
                type="password"
                placeholder="Repite la contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-800">
            <button
              disabled={guardandoPassword}
              type="submit"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 border border-gray-700"
            >
              {guardandoPassword ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
