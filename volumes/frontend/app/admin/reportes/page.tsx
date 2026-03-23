// src/app/admin/reportes/page.tsx

import GestorReportes from "../../../modulos/reportes/componentes/GestorReportes";

export default function PaginaReportesAdmin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <GestorReportes />
      </div>
    </div>
  );
}
