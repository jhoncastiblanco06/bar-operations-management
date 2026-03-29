import Link from "next/link";

export default function MenuPrincipal() {
  return (
    <div className="min-h-screen bg-gray-950 text-white relative selection:bg-purple-500/30">
      {/* Botón discreto para el Staff en la esquina superior derecha */}
      <div className="absolute top-6 right-6 z-10">
        <Link
          href="/login"
          className="text-[10px] font-bold text-gray-600 hover:text-purple-400 uppercase tracking-widest transition-colors border border-transparent hover:border-purple-500/30 px-3 py-1.5 rounded-full"
        >
          Acceso Staff 🔒
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Encabezado del Menú */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 border border-gray-800 rounded-full mb-2 shadow-2xl">
            <span className="text-4xl">🍸</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
            Nuestro Menú
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            Descubre nuestra selección de bebidas premium, cócteles de autor y
            platillos para acompañar tu noche.
          </p>
        </header>

        {/* Categorías del Menú (Muestra estática) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Categoría 1: Cócteles */}
          <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl shadow-xl hover:border-purple-500/30 transition-colors">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
              <span className="text-purple-400">🍹</span> Cócteles de Autor
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-200">Margarita Blue</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    Tequila reposado, blue curaçao, jugo de limón fresco y
                    escarcha de sal.
                  </p>
                </div>
                <span className="font-black text-blue-400 shrink-0">
                  $25.000
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-200">
                    Old Fashioned Ahumado
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    Whisky bourbon, amargo de angostura, azúcar y humo de roble.
                  </p>
                </div>
                <span className="font-black text-blue-400 shrink-0">
                  $32.000
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-200">
                    Gin & Tonic Frutos Rojos
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    Ginebra premium, tónica artesanal, fresas, moras y romero.
                  </p>
                </div>
                <span className="font-black text-blue-400 shrink-0">
                  $28.000
                </span>
              </div>
            </div>
          </section>

          {/* Categoría 2: Cervezas */}
          <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl shadow-xl hover:border-blue-500/30 transition-colors">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
              <span className="text-blue-400">🍺</span> Cervezas
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-gray-200">
                  Cerveza Artesanal IPA
                </h3>
                <span className="font-black text-blue-400 shrink-0">
                  $15.000
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-gray-200">
                  Cerveza Rubia Nacional
                </h3>
                <span className="font-black text-blue-400 shrink-0">
                  $10.000
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-gray-200">
                  Cerveza Negra Importada
                </h3>
                <span className="font-black text-blue-400 shrink-0">
                  $18.000
                </span>
              </div>
            </div>
          </section>

          {/* Categoría 3: Para Picar */}
          <section className="md:col-span-2 bg-gray-900/50 border border-gray-800 p-8 rounded-3xl shadow-xl hover:border-orange-500/30 transition-colors mt-4">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
              <span className="text-orange-400">🍟</span> Para Compartir
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-200">Nachos Supremo</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Totopos bañados en queso cheddar, guacamole, pico de gallo y
                    carne molida.
                  </p>
                </div>
                <span className="font-black text-blue-400 shrink-0">
                  $35.000
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-200">
                    Alitas BBQ (10 und)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Alitas bañadas en salsa BBQ de la casa, acompañadas de papas
                    a la francesa.
                  </p>
                </div>
                <span className="font-black text-blue-400 shrink-0">
                  $28.000
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-600 text-xs pb-10">
          <p>
            © {new Date().getFullYear()} BarSystem. Todos los derechos
            reservados.
          </p>
          <p className="mt-1">
            Prohibida la venta de bebidas embriagantes a menores de edad.
          </p>
        </footer>
      </div>
    </div>
  );
}
