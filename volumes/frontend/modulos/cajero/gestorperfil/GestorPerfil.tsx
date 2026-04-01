"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../../utilidades/api"; // Ajusta la ruta si es necesario

export default function GestorPerfilMesero() {
  const router = useRouter();
  const [estaCargandoDatos, setEstaCargandoDatos] = useState(true);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const [idUsuario, setIdUsuario] = useState<number | null>(null);

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
        // 🚀 1. Obtenemos el ID del usuario real desde el localStorage
        const usrStr = localStorage.getItem("usuario_bar");
        if (!usrStr) {
          return router.push("/login");
        }

        const usuarioLocal = JSON.parse(usrStr);
        const idDelMesero = usuarioLocal.id_usuario;
        setIdUsuario(idDelMesero);

        // 🚀 2. Hacemos el fetch con el ID real
        const res = await fetch(`${API_URL}/usuarios/${idDelMesero}`);

        if (res.ok) {
          const data = await res.json();
          setNombre(data.nombre_completo || "");
          setEmail(data.email || "");
          setRol(data.rol || "Sin Rol");
          setEstado(data.estado || "Inactivo");
          setAvatarUrl(data.avatar_url || null);
        } else {
          alert("No se pudo cargar la información del perfil.");
        }
      } catch (error) {
        console.error("Error de red al cargar perfil:", error);
      } finally {
        setEstaCargandoDatos(false);
      }
    };
    cargarMiPerfil();
  }, [router]);

  const manejarCambioFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const archivo = e.target.files[0];
      setNuevaFotoFile(archivo);
      setPreviewFoto(URL.createObjectURL(archivo));
    }
  };

  const guardarCambiosPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuario) return;

    setGuardandoPerfil(true);
    try {
      const formData = new FormData();
      formData.append("nombre_completo", nombre);

      if (nuevaFotoFile) {
        formData.append("avatar", nuevaFotoFile);
      }

      // 🚀 Guardamos al ID dinámico
      const respuesta = await fetch(`${API_URL}/usuarios/perfil/${idUsuario}`, {
        method: "PATCH",
        body: formData,
      });

      if (respuesta.ok) {
        const datosActualizados = await respuesta.json();
        if (datosActualizados.avatar_url) {
          setAvatarUrl(datosActualizados.avatar_url);
        }

        // Actualizamos el localStorage
        const usrStr = localStorage.getItem("usuario_bar");
        if (usrStr) {
          const usrObj = JSON.parse(usrStr);
          usrObj.nombre_completo = nombre;
          usrObj.avatar_url = datosActualizados.avatar_url || avatarUrl;
          localStorage.setItem("usuario_bar", JSON.stringify(usrObj));

          // 🚀 AQUÍ ESTÁ EL MEGÁFONO: Disparamos el evento para que el menú se entere
          window.dispatchEvent(new Event("perfilActualizado"));
        }

        alert("✅ Perfil actualizado.");
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
    if (!idUsuario) return;

    if (nuevaPassword !== confirmarPassword) {
      return alert("Las contraseñas no coinciden.");
    }
    if (!passwordActual) {
      return alert("Debes ingresar tu contraseña actual.");
    }

    setGuardandoPassword(true);

    try {
      const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password_hash: nuevaPassword,
        }),
      });

      if (respuesta.ok) {
        alert("✅ Contraseña actualizada correctamente en la base de datos.");
        setPasswordActual("");
        setNuevaPassword("");
        setConfirmarPassword("");
      } else {
        alert("❌ Error al actualizar la contraseña en el servidor.");
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      alert("Error de conexión al servidor.");
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (estaCargandoDatos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-purple-400 font-bold animate-pulse uppercase tracking-widest">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Configuración de Cuenta
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-gray-950/50 border border-gray-800 rounded-2xl">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-purple-500/30 shadow-inner flex items-center justify-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  ✏️
                </span>
              </div>
            </div>

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
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {guardandoPerfil ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        </form>
      </section>

      {/* BLOQUE 2: SEGURIDAD Y ACCESO */}
      {/* BLOQUE 2: SEGURIDAD Y ACCESO */}
      <section className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        {/* Decoración sutil de fondo (Resplandor morado) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="bg-gray-800 p-2.5 rounded-xl border border-gray-700 shadow-inner text-xl leading-none">
                🔒
              </span>
              Seguridad y Acceso
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Protege tu cuenta actualizando tu contraseña periódicamente.
            </p>
          </div>
        </div>

        <form
          onSubmit={guardarSeguridad}
          className="space-y-6 max-w-3xl relative z-10"
        >
          {/* Contraseña Actual */}
          <div className="bg-gray-950/30 p-5 rounded-2xl border border-gray-800/50">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Contraseña Actual
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-500 text-sm">🔑</span>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner placeholder:text-gray-700 font-medium"
              />
            </div>
          </div>

          {/* Nuevas Contraseñas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-gray-950/50 rounded-2xl border border-gray-800/50">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>Nueva Contraseña</span>
                <span className="text-[9px] text-purple-400/70">
                  Mín. 8 caracteres
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-500 text-sm">
                  🛡️
                </span>
                <input
                  required
                  type="password"
                  placeholder="Escribe la nueva clave"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner placeholder:text-gray-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-500 text-sm">
                  ✔️
                </span>
                <input
                  required
                  type="password"
                  placeholder="Repite la nueva clave"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner placeholder:text-gray-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer del formulario */}
          <div className="pt-6 mt-4 flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left mr-auto">
              Se cerrará la sesión en otros dispositivos.
            </p>
            <button
              disabled={guardandoPassword}
              type="submit"
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2"
            >
              {guardandoPassword ? (
                <>
                  <span className="animate-spin text-lg leading-none">⏳</span>
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <span>Actualizar Contraseña</span>
                  <span className="text-lg leading-none">✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
