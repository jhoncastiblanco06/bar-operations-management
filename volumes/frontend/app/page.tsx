import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col text-white font-sans selection:bg-blue-500 selection:text-white bg-[url('/images/backgroud.png')] bg-cover bg-center bg-no-repeat bg-gray-950 bg-blend-overlay">
      
      {/* Barra de Navegación */}
      <nav className="fixed top-0 w-full flex items-center justify-between p-6 md:px-12 z-20 backdrop-blur-sm bg-black/10">
        <div className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2">
          <span className="text-blue-500">🍸</span> BarSystem
        </div>
      </nav>

      {/* Sección Hero (Principal) */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-6 md:px-4 overflow-hidden z-0 py-20">
        
        {/* Efectos de luces de fondo (Glows) - Ajustados para móviles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-purple-600/10 rounded-full blur-[60px] md:blur-[100px] -z-10 pointer-events-none"></div>

        <div className="space-y-6 max-w-4xl z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 leading-tight pb-2">
            Control total de tu Bar. <br className="hidden md:block" /> Cero estrés.
          </h1>
          
          <p className="text-base sm:text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto font-light drop-shadow-md px-2">
            El sistema de auditoría diseñado para maximizar tus ganancias, controlar tu inventario y agilizar la atención a tus mesas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-8 w-full max-w-xs mx-auto sm:max-w-none">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-950 font-bold rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 duration-300 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] text-center"
            >
              Iniciar Operaciones
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimalista - Ajustado para no solapar */}
      <footer className="w-full py-6 md:py-8 border-t border-gray-800/50 bg-gray-950/50 backdrop-blur-md text-center text-gray-400 text-xs md:text-sm z-10 px-4">
        <p>© {new Date().getFullYear()} BarSystem POS. <br className="block sm:hidden" /> Desarrollado con Next.js y NestJS.</p>
      </footer>

    </div>
  );
}