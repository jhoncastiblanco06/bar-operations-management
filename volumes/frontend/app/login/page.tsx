"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // NUEVO: Estados para manejar errores y la carga visual del botón
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Bloqueamos el botón
    setError(null); // Limpiamos errores anteriores

    try {
      // Hacemos la petición EXACTAMENTE igual que en Postman
      const response = await fetch("http://localhost:7086/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // OJO: Tu backend espera "password_hash", así que lo mapeamos aquí
        body: JSON.stringify({
          email: email,
          password_hash: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Si el backend responde con un 200/201 (Éxito)
        console.log("Usuario logueado:", data.usuario);

        // ✨ LA LÍNEA MÁGICA: Guardamos al usuario en la memoria del navegador
        // Usamos JSON.stringify porque localStorage solo acepta textos, no objetos.
        localStorage.setItem("usuario_bar", JSON.stringify(data.usuario));

        // ¡Lo mandamos al sistema!
        router.push("/admin");
      } else {
        // Si el backend responde con un 401 (Credenciales inválidas) o 500
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      // Si el backend está apagado o hay un problema de red
      setError("No se pudo conectar con el servidor. Revisa tu conexión.");
    } finally {
      setIsLoading(false); // Desbloqueamos el botón
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-950 px-4 sm:px-6 lg:px-8 bg-[url('/images/backgroud.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      {/* Luces de fondo (Glows) para mantener estética */}
      <div className="absolute top-1/4 left-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px] -z-10"></div>

      {/* Tarjeta de Login Responsiva */}
      <div className="bg-gray-900/80 backdrop-blur-xl p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[400px] border border-gray-800 transition-all duration-300">
        {/* Header del Formulario */}
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

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* NUEVO: Mensaje de error visual */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
              placeholder="nombre@bar.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 text-base ${
                isLoading
                  ? "bg-blue-800 cursor-not-allowed opacity-70"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-blue-600/20"
              }`}
            >
              {isLoading ? "Verificando..." : "Entrar al Sistema"}
            </button>
          </div>
        </form>

        {/* Footer del card */}
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
