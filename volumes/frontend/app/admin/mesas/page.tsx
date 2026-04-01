// src/app/admin/mesas/page.tsx

import GestorAforo from "../../../modulos/admin/gestion-mesas/GestorAforo";

export default function PaginaMesasAdmin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <GestorAforo />
      </div>
    </div>
  );
}
