'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg z-30">
        <span className="font-bold text-xl">Bar System</span>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-800 rounded-lg focus:outline-none"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MENÚ LATERAL (Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-20 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:block p-6 text-2xl font-black tracking-tighter border-b border-gray-800">
          <span className="text-blue-500">🍸</span> BarSystem
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          <a href="#" className="flex items-center gap-3 py-3 px-4 rounded-xl transition duration-200 bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20">
            <span>📊</span> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 py-3 px-4 rounded-xl transition duration-200 text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>🍺</span> Inventario
          </a>
          <a href="#" className="flex items-center gap-3 py-3 px-4 rounded-xl transition duration-200 text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>🧾</span> Cuentas
          </a>
          <a href="#" className="flex items-center gap-3 py-3 px-4 rounded-xl transition duration-200 text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>⚙️</span> Ajustes
          </a>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition duration-200 font-medium">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* OVERLAY PARA CERRAR EL MENÚ EN MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Principal</h1>
            <p className="text-gray-500 text-sm">Resumen de operaciones del día</p>
          </div>
          
          <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-200 w-fit">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
              A
            </div>
            <div className="hidden sm:block mr-4">
              <p className="text-xs text-gray-400 leading-none mb-1">Usuario</p>
              <p className="text-sm font-bold text-gray-800 leading-none">Administrador</p>
            </div>
          </div>
        </header>

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">💰</span>
              <span className="text-green-500 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">+12%</span>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Ventas Netas</h3>
              <p className="text-3xl font-black text-gray-900">$0.00</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-green-50 text-green-600 rounded-xl text-xl">🪑</span>
              <span className="text-gray-400 text-xs">Capacidad: 10</span>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Mesas Activas</h3>
              <p className="text-3xl font-black text-gray-900">0 / 3</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-yellow-50 text-yellow-600 rounded-xl text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Alertas de Stock</h3>
              <p className="text-3xl font-black text-gray-900">0 <span className="text-sm font-normal text-gray-400">Productos</span></p>
            </div>
          </div>

        </div>

        {/* Espacio para tablas o gráficas futuras */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[300px] border-dashed border-2">
           <p className="text-gray-400 italic">Panel de gráficas y actividad reciente (Próximamente)</p>
        </div>
      </main>
    </div>
  );
}