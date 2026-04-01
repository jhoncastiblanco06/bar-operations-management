import MenuLateralMesero from "../../modulos/layout/MenuLateralMesero";
import ProtectorRutas from "../../modulos/seguridad/ProtectorRutas/page"; // 👈 Importación corregida

export default function MeseroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectorRutas rolesPermitidos={["Mesero", "Administrador"]}>
      <div className="flex min-h-screen bg-gray-950 text-white font-sans">
        {/* Sidebar Exclusivo para Meseros */}
        <MenuLateralMesero />

        {/* Contenido Principal */}
        <main className="flex-1 md:ml-64 bg-[#0a0a0a] p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </ProtectorRutas>
  );
}
