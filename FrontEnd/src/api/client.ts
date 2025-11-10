const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 🔹 GET genérico
export async function apiGET<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`);
  if (!res.ok) {
    throw new Error(`Error GET ${url}: ${res.status}`);
  }
  return res.json();
}

// 🔹 POST genérico con query params (como usa tu back)
export async function apiFormPOST<T>(
  url: string,
  data: Record<string, any>
): Promise<T> {
  const query = new URLSearchParams(data).toString();
  const res = await fetch(`${BASE_URL}${url}?${query}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Error POST ${url}: ${res.status}`);
  }

  return res.json();
}

export async function apiFormPUT<T>(
  url: string,
  data: Record<string, any>
): Promise<T> {
  const query = new URLSearchParams(data).toString();
  const res = await fetch(`${BASE_URL}${url}?${query}`, {
    method: "PUT",
  });

  if (!res.ok) {
    throw new Error(`Error PUT ${url}: ${res.status}`);
  }

  return res.json();
}

// ------------------------------------------------------------
// 🔹 NUEVO: DELETE genérico
// ------------------------------------------------------------
export async function apiDELETE<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Error DELETE ${url}: ${res.status}`);
  }
  return res.json();
}