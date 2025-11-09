import { apiFormPOST, apiGET } from "./client";

// 🟩 Registrar dueño (usa /user/register)
export async function registerOwner(payload: {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}) {
  return apiFormPOST<{ message: string; id_dueno: number }>(
    "/user/register",
    payload
  );
}

// 🟩 Login del dueño (usa /user/login)
export async function loginOwner(payload: { email: string; password: string }) {
  return apiFormPOST<{ message: string; id_dueno: number; email: string }>(
    "/user/login",
    payload
  );
}

// ✅ Interfaz tipada para crear negocio
export interface CreateBusinessPayload {
  id_dueno: string;
  nombre_fantasia: string;
  rubro?: string;
  sitio_web?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  horarios?: string;
  descripcion?: string;
  id_deporte1: number;          // 👈 deporte principal (obligatorio)
  id_deporte2?: number | null;  // 👈 opcional
  id_deporte3?: number | null;  // 👈 opcional
}

// 🟩 Crear negocio (usa /business_owner/new_business)
export async function createBusiness(payload: CreateBusinessPayload) {
  return apiFormPOST<{ message: string; id_negocio: number }>(
    "/business_owner/new_business",
    payload
  );
}

// 🟩 Listar negocios del dueño (usa /business_owner/my_business)
export async function listMyBusinesses(id_dueno: string) {
  return apiGET<
    {
      nombre_fantasia: string;
      rubro: string;
      sitio_web: string;
      telefono: string;
      email: string;
      direccion: string;
      lat: number | null;
      lon: number | null;
      horarios: string;
      descripcion: string;
      activo: boolean;
    }[]
  >(`/business_owner/my_business?id_dueno=${id_dueno}`);
}

// 🟦 Obtener lista de deportes (usa /deporte/list)
export async function listSports() {
  return apiGET<{ id: number; nombre: string; codigo: string; descripcion: string }[]>(
    "/deporte/list"
  );
}

// 🟩 Obtener información general de negocios (ej: para el mapa o panel)
export type BusinessInfo = {
  id: number;
  nombre_fantasia: string;
  rubro?: string | null;
  estado: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  sitio_web?: string | null;
  descripcion?: string | null;
  fecha_creacion?: string | null;
};

export async function getBusinessesInfo() {
  return apiGET<BusinessInfo[]>("/spot/businesses/info");
}
