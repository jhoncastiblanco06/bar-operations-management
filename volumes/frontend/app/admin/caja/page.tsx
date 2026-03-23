// src/app/admin/caja/page.tsx
import GestorCaja from "../../../modulos/caja/componentes/GestorCaja";

export default function PaginaCajaAdmin() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-3 sm:p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <GestorCaja />
      </div>
    </div>
  );
}
