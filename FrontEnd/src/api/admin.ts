import { apiGET, apiFormPOST, apiFormPUT, apiDELETE } from "./client";

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
  return apiFormPUT<{ mensaje: string }>(
    `/admin/negocios/${id_negocio}`,
    { aprobado, lat, lon }
  );
}

/**
 * Activa o desactiva un negocio (Activo <-> Inactivo).
 */
export async function toggleBusinessStatus(id_negocio: number) {
  return apiFormPUT<{ mensaje: string; nuevo_estado: string }>(
    `/admin/negocios/${id_negocio}/toggle_status`,
    {} // No necesita payload, solo el PUT
  );
}

/**
 * Elimina un negocio permanentemente.
 */
export async function deleteBusiness(id_negocio: number) {
  return apiDELETE<{ mensaje: string }>(
    `/admin/negocios/${id_negocio}`
  );
}

// 🔹 TIPO: Define cómo es un deporte en la lista
export type SportInfo = {
  id: number;
  nombre: string;
  activo: boolean;
};

// 🔹 TIPO: Define el payload para las variables de un deporte
export type SportVariablePayload = {
  nombre_variable: "wind_speed" | "waveHeight" | "wind_gustValue";
  umbral_min: number;
  umbral_max: number;
  operador: "min" | "max" | "between";
};

// 🔹 TIPO: Define el payload para crear un deporte
type CreateSportPayload = {
  nombre: string;
  descripcion: string;
  variables: SportVariablePayload[];
};

/**
 * Obtiene la lista de todos los deportes.
 */
export async function listSports() {
  // El backend devuelve tuplas [id, nombre, activo]
  // Las transformamos a objetos para que sean más fáciles de usar
  const sportsList = await apiGET<[number, string, boolean][]>("/admin/deportes");
  return sportsList.map(
    ([id, nombre, activo]): SportInfo => ({ id, nombre, activo })
  );
}

/**
 * Crea un nuevo deporte.
 */
export async function createSport(payload: CreateSportPayload) {
  /* El backend espera un POST con query params.
    El payload { nombre: "Test", variables: [...] } 
    se debe enviar como:
    ?nombre=Test&variables=[{...},{...}]
  */
  const data = {
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    // Convertimos el array de variables a un string JSON
    variables: JSON.stringify(payload.variables),
  };

  return apiFormPOST<{ mensaje: string }>("/admin/deportes", data);
}

/**
 * Activa o desactiva un deporte existente.
 */
export async function toggleSportStatus(id_deporte: number) {
  // Usa apiFormPUT según tu client.ts
  return apiFormPUT<{ mensaje: string }>(
    `/admin/deportes/${id_deporte}/toggle`,
    {}
  );
}

export type SpotAdminInfo = {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  lat: number;
  lon: number;
  activo: boolean;
};

export async function listAdminSpots() {
  return apiGET<SpotAdminInfo[]>("/admin/spots");
}

export async function createSpot(payload: {
  nombre: string;
  tipo: string;
  lat: number;
  lon: number;
}) {
  return apiFormPOST<{ mensaje: string }>(
    "/admin/spots",
    payload
  );
}

export async function toggleSpotStatus(id_spot: number) {
  return apiFormPUT<{ mensaje: string }>(
    `/admin/spots/${id_spot}/toggle`,
    {}
  );
}