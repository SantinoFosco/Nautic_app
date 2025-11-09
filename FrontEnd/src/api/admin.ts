import { apiGET, apiFormPOST } from "./client";

// Definimos el tipo PendingBusiness 
export type PendingBusiness = {
  id_negocio: number;
  nombre_fantasia: string;
  rubro: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  horarios: string | null;
  descripcion: string | null;
  fecha_creacion: string;
};

// 🔹 Obtener estadísticas generales
export async function getDashboardStats() {
  return apiGET<{
    negocios_totales: number;
    negocios_pendientes: number;
    usuarios_registrados: number;
    negocios_activos: number;
  }>("/admin/estadisticas");
}

// 🔹 Obtener lista de negocios pendientes
export async function getPendingBusinesses() {
  // Ahora usa el tipo que definimos arriba
  return apiGET<PendingBusiness[]>("/admin/negocios/pendientes");
}

// 🔹 Obtener spots activos (aleatorios)
export async function getActiveSpots() {
  return apiGET<
    {
      id: number;
      nombre: string;
      tipo: string;
      lat: number;
      lon: number;
      // Tu backend no devuelve 'activo', así que lo quitamos del tipo
    }[]
  >("/admin/spots/activos");
}

// 🔹 Aprobar o rechazar negocio
export async function updateBusinessStatus(
  id_negocio: number,
  aprobado: boolean,
  lat: number,
  lon: number
) {
  return apiFormPOST<{ mensaje: string }>(
    `/admin/negocios/${id_negocio}?aprobado=${aprobado}&lat=${lat}&lon=${lon}`,
    {}
  );
}