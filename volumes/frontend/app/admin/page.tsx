// src/app/admin/usuarios/page.tsx

import GestorUsuarios from "../../modulos/usuarios/componentes/GestorUsuarios";

export default function PaginaUsuariosAdmin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Inyectamos el componente de gestión de personal */}
        <GestorUsuarios />
      </div>
    </div>
  );
}
