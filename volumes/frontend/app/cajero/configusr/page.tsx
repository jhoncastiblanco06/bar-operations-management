import GestorPerfilMesero from "../../../modulos/cajero/gestorperfil/GestorPerfil";

export default function PaginaConfiguracionMesero() {
  return (
    <div className="min-h-[calc(100vh-2rem)] bg-[#0a0a0a] p-4 sm:p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <GestorPerfilMesero />
      </div>
    </div>
  );
}
