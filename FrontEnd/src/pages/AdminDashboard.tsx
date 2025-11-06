import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/business_owner/all_businesses")
      .then((res) => res.json())
      .then((data) => setBusinesses(data))
      .catch((err) => console.error("Error al traer negocios:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-600">
        Cargando negocios...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-[#0b2849] mb-6">Panel de Administración</h1>

      {businesses.length === 0 ? (
        <p className="text-gray-600">No hay negocios registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <div
              key={biz.id_negocio}
              className="rounded-xl bg-white shadow-md p-4 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-[#0b2849]">
                {biz.nombre_fantasia}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{biz.rubro}</p>
              <p className="text-sm text-gray-600 mb-1">{biz.email}</p>
              <p className="text-sm text-gray-600 mb-1">
                {biz.direccion || "Sin dirección"}
              </p>
              <p
                className={`text-sm font-medium ${
                  biz.activo ? "text-green-600" : "text-red-600"
                }`}
              >
                {biz.activo ? "Activo" : "Inactivo"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
