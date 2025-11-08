import { apiGET, apiFormPOST } from "./client";

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
  return apiGET<
    {
      id_negocio: number;
      nombre_fantasia: string;
      rubro: string;
      direccion: string;
      telefono: string;
      email: string;
    }[]
  >("/admin/negocios/pendientes");
}

// 🔹 Obtener spots activos (aleatorios)
export async function getActiveSpots() {
  return apiGET<
    {
      nombre: string;
      tipo: string;
      lat: number;
      lon: number;
      activo: boolean;
    }[]
  >("/admin/spots/aleatorios");
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
