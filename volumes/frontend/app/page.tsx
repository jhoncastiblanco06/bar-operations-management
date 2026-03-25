// src/app/admin/meseros/page.tsx

import PanelMesero from "../modulos/meseros/componentes/PanelMeseros";

export default function PaginaMeserosAdmin() {
  return (
    // Quitamos el padding excesivo para que el panel del mesero
    // aproveche toda la pantalla del iPad o celular
    <div className="min-h-screen bg-gray-950">
      <PanelMesero />
    </div>
  );
}
