// src/app/admin/layout.tsx
import MenuLateral from "../../modulos/layout/MenuLateral";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      {/* 1. El Menú Lateral Fijo a la izquierda */}
      <MenuLateral />

      {/* 2. El Contenido Dinámico a la derecha */}
      {/* Le damos un margen izquierdo (ml-64) del mismo tamaño que el menú para que no se pise el contenido */}
      <main className="flex-1 ml-64 bg-[#0a0a0a]">{children}</main>
    </div>
  );
}
