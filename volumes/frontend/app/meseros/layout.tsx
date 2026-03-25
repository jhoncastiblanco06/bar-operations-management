// src/app/meseros/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "Portal Meseros | BarSystem",
  description: "Interfaz rápida para toma de pedidos",
};

export default function MeserosLayout({ children }: { children: ReactNode }) {
  return (
    // Un lienzo completamente limpio y oscuro para que resalten los botones
    <div className="bg-gray-950 min-h-screen text-white selection:bg-blue-500/30 overflow-x-hidden">
      {children}
    </div>
  );
}
