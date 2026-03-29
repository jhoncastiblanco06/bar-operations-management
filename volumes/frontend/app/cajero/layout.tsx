import MenuLateralCajero from "../../modulos/layout/MenuLareralCajero"; // 👈 Corregido el nombre y el typo
import ProtectorRutas from "../../modulos/seguridad/ProtectorRutas/page"; // 👈 Importación corregida

export default function CajeroLayout({
  // 👈 Corregido el nombre de la función
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🚀 El Guardián de esta puerta SOLO deja entrar a Cajeros (y Admins)
    <ProtectorRutas rolesPermitidos={["Cajero", "Administrador"]}>
      <div className="flex min-h-screen bg-gray-950 text-white font-sans">
        {/* Sidebar Exclusivo para Cajeros */}
        <MenuLateralCajero />

        {/* Contenido Principal */}
        <main className="flex-1 md:ml-64 bg-[#0a0a0a] p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </ProtectorRutas>
  );
}
