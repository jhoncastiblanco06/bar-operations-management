// src/app/admin/configusr/page.tsx

// Importamos el componente con el nombre exacto que le diste al archivo
import GestorPerfil from "../../../modulos/admin/gestorperfil/GestorPerfil";

export default function PaginaConfiguracionUsuario() {
  return (
    // Agregamos un padding generoso para que el formulario respire en pantallas grandes
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <GestorPerfil />
      </div>
    </div>
  );
}
