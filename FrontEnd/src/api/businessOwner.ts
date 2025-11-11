import { apiFormPOST, apiGET, apiFormPUT } from "./client";

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
export type LoginOwnerResponse = {
  message: string;
  id_dueno: number;
  email: string;
  tipo_usuario?: string;
  haveBusiness?: boolean;
};

export async function loginOwner(payload: { email: string; password: string }) {
  return apiFormPOST<LoginOwnerResponse>("/user/login", payload);
}

// ✅ Interfaz tipada para crear negocio (actualizada)
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

  // 👇 Nuevo manejo de deportes
  id_deporte1: number;           // principal (obligatorio)
  id_deporte2?: number | null;   // secundario 1 (opcional)
  id_deporte3?: number | null;   // secundario 2 (opcional)
}

// 🟩 Crear negocio
export async function createBusiness(payload: CreateBusinessPayload) {
  // ✅ sin cambios en endpoint, sigue usando /business_owner/new_business
  return apiFormPOST<{ message: string; id_negocio: number; deportes_asociados: number[] }>(
    "/business_owner/new_business",
    payload
  );
}


export type MyBusiness = {
  nombre_fantasia: string;
  rubro?: string | null;
  sitio_web?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  lat?: number | null;
  lon?: number | null;
  horarios?: string | null;
  descripcion?: string | null;
  estado: "activo" | "inactivo" | "pendiente";
  deportes: { id_deporte: number; nombre: string | null }[];
};

// 🟩 Listar negocios del dueño
export async function listMyBusinesses()  {
  return apiGET<MyBusiness>>(`/business_owner/my_business`);
}

export async function updateMyBusiness(payload: {
  nombre_fantasia?: string;
  rubro?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  sitio_web?: string;
  horarios?: string;
  descripcion?: string;
}) {
  return apiFormPUT<{ message: string }>("/business_owner/update_business", payload);
}


// 🟦 Obtener lista de deportes
export async function listSports() {
  return apiGET<{ id: number; nombre: string; codigo: string; descripcion: string }[]>(
    "/deporte/list"
  );
}

// 🟩 Obtener información general de negocios
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
