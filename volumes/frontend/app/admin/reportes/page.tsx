// src/app/admin/reportes/page.tsx

import GestorReportes from "../../../modulos/admin/panel-reportes/GestorReportes";

export default function PaginaReportesAdmin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <GestorReportes />
      </div>
    </div>
  );
}
