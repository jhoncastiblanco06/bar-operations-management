// src/app/admin/layout.tsx
import MenuLateral from "../../modulos/layout/MenuLateral";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      {/* Sidebar */}
      <MenuLateral />

      {/* Contenido */}
      <main className="flex-1 md:ml-64 bg-[#0a0a0a] p-4">{children}</main>
    </div>
  );
}
