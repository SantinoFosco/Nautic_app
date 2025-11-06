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

// 🟩 Crear negocio (usa /business_owner/new_business)
export async function createBusiness(payload: {
  id_dueno: string;
  nombre_fantasia: string;
  rubro?: string;
  sitio_web?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  latitud?: string;
  longitud?: string;
  horarios?: string;
  descripcion?: string;
}) {
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
