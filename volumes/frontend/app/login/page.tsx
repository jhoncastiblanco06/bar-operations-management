"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../../utilidades/api";

export default function PaginaLogin() {
  const enrutador = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarInicioSesion = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEstaCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: correo,
          password_hash: contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        const usuario = datos.usuario;

        // 🛡️ REGLA 1: Bloqueo de Usuario Inactivo
        if (usuario.estado === "Inactivo" || usuario.estado === "Inactiva") {
          setEstaCargando(false);
          return setError(
            "❌ Tu cuenta está desactivada. Habla con el administrador.",
          );
        }

        // 🛡️ REGLA 2: Bloqueo de Sede Inactiva
        // Verifica si el usuario tiene una sede asignada y si esta se encuentra inactiva
        if (
          usuario.sedes &&
          (usuario.sedes.estado === "Inactiva" ||
            usuario.sedes.estado === "Inactivo")
        ) {
          setEstaCargando(false);
          return setError(
            "❌ La sede a la que estás asignado está inactiva. Acceso denegado.",
          );
        }

        // 🛡️ REGLA 3: Control de Turnos (Solo aplica para Cajeros y Meseros)
        if (usuario.rol !== "Administrador" && usuario.rol !== "Admin") {
          const horaActual = new Date().getHours(); // Retorna la hora local (0 - 23)
          let accesoPermitido = false;

          if (usuario.turno === "Mañana" && horaActual >= 6 && horaActual < 14)
            accesoPermitido = true;
          if (usuario.turno === "Tarde" && horaActual >= 14 && horaActual < 22)
            accesoPermitido = true;
          if (usuario.turno === "Noche" && (horaActual >= 22 || horaActual < 6))
            accesoPermitido = true;

          // Si tiene un turno asignado pero está fuera de su horario, lo bloqueamos
          if (usuario.turno && !accesoPermitido) {
            setEstaCargando(false);
            return setError(
              `❌ Estás fuera de horario. Tu turno es: ${usuario.turno}`,
            );
          }
        }

        // Si pasa todos los filtros de seguridad, lo guardamos en memoria
        console.log("Usuario logueado:", usuario);
        localStorage.setItem("usuario_bar", JSON.stringify(usuario));

        // 🚀 REDIRECCIÓN INTELIGENTE (Corregido el bug del Admin)
        const rol = usuario.rol;

        if (rol === "Administrador" || rol === "Admin") {
          enrutador.push("/admin");
        } else if (rol === "Cajero") {
          enrutador.push("/cajero");
        } else if (rol === "Mesero") {
          enrutador.push("/mesero");
        } else {
          enrutador.push("/"); // Seguridad por si tiene un rol desconocido
        }
      } else {
        setError(datos.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor. Revisa tu conexión.");
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-950 px-4 sm:px-6 lg:px-8 bg-[url('/images/backgroud.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      {/* Luces de fondo (Glows) */}
      <div className="absolute top-1/4 left-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px] -z-10"></div>

      {/* Tarjeta de Login Responsiva */}
      <div className="bg-gray-900/80 backdrop-blur-xl p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[400px] border border-gray-800 transition-all duration-300">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block mb-4 text-3xl hover:scale-110 transition-transform"
          >
            🍸
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bienvenido
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-light">
            Ingresa al panel operativo de{" "}
            <span className="text-blue-400 font-medium">BarSystem</span>
          </p>
        </div>

        <form onSubmit={manejarInicioSesion} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center animate-pulse font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
              placeholder="nombre@bar.com"
              required
              disabled={estaCargando}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
              placeholder="••••••••"
              required
              disabled={estaCargando}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={estaCargando}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 text-base ${
                estaCargando
                  ? "bg-blue-800 cursor-not-allowed opacity-70"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-blue-600/20"
              }`}
            >
              {estaCargando ? "Verificando..." : "Entrar al Sistema"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-blue-400 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
