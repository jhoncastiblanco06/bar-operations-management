// src/tipos/index.ts
export interface Sede {
  id_sede: number;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  // 👇 AQUÍ ESTÁ LA MAGIA QUE QUITA EL ERROR
  ciudad?: string | null;
  estado?: string | null;
  fecha_creacion?: string | Date | null;
}
export interface Mesa {
  id_mesa: number;
  nombre_identificador: string;
  capacidad: number;
  estado: string;
  sedes?: Sede | null;
}

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: string;
  estado?: string | null;
  id_sede?: number | null;
  avatar_url?: string | null; // 👈 Agrégalo aquí
  sedes?: {
    id_sede: number;
    nombre: string;
  } | null;
}
export interface Producto {
  id_producto: number;
  nombre: string;
  codigo_sku?: string | null;
  costo_compra: string | number;
  precio_venta: string | number;
  stock: number;
  estado: string;
  imagen_url?: string | null;
  id_categoria: number;
  id_subcategoria: number;
}
