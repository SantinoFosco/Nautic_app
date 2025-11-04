import {apiGET, apiFormPOST } from "./client";


// 🔹 Registro de dueño (ya lo tenías)
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

// 🔹 Login de dueño (nuevo)
export async function loginOwner(payload: { email: string; password: string }) {
  return apiFormPOST<{ message: string; id_dueno: number; email: string }>(
    "/user/login",
    payload
  );
}


// 🔹 Listar negocios del dueño
export async function listMyBusinesses(id_dueno: string) {
  return apiGET<
    { id_negocio: number; nombre_fantasia: string; rubro: string; activo: boolean }[]
  >(`/my_business?id_dueno=${id_dueno}`);
}

import { apiFormPOST } from "./client";

// 🔹 Crear negocio
export async function createBusiness(payload: {
  id_dueno: string;
  nombre_fantasia: string;
  rubro?: string;
  sitio_web?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  coordenadas?: string;
  horarios?: string;
  descripcion?: string;
}) {
  return apiFormPOST<{ message: string; id_negocio: number }>(
    "/business_owner/new_business",
    payload
  );
}
