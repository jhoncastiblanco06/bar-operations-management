// Detectamos automáticamente si estamos en el servidor o en local
const esProduccion = process.env.NODE_ENV === "production";

// Asignamos la URL dependiendo del entorno
export const API_URL = esProduccion
  ? "https://apigg.fljgroup.site"
  : "http://localhost:7086";
