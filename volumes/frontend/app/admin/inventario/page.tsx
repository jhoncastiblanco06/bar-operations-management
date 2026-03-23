// src/app/admin/inventario/page.tsx

import GestorInventario from "../../../modulos/inventario/componentes/GestorInventario";

export default function PaginaInventarioAdmin() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <GestorInventario />
      </div>
    </div>
  );
}
