// src/tipos/index.ts

export interface Sede {
  id_sede: number;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  estado?: string;
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
  estado: string;
  sedes?: Sede | null;
}
