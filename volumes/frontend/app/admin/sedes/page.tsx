// src/app/admin/sedes/page.tsx

import GestorSedes from "../../../modulos/admin/gestion-sedes/gestorsedes";

export default function PaginaSedesAdmin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Aquí inyectamos todo el cerebro que programamos en el otro archivo */}
        <GestorSedes />
      </div>
    </div>
  );
}
