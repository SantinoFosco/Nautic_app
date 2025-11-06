import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BusinessPanel() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id_dueno = localStorage.getItem("ownerId");

  useEffect(() => {
    if (!id_dueno) {
      navigate("/login");
      return;
    }

    async function loadBusiness() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/business_owner/my_business?id_dueno=${id_dueno}`
        );
        if (!res.ok) throw new Error("Error al traer el negocio");
        const data = await res.json();
        if (data.length > 0) setBusiness(data[0]);
      } catch {
        setError("No se pudo cargar la información del negocio.");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id_dueno, navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-600">
        Cargando negocio...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-red-600">
        {error}
      </div>
    );

  if (!business)
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-white">
        <h2 className="text-2xl font-semibold text-[#0b2849] mb-4">
          No tenés ningún negocio registrado aún.
        </h2>
        <button
          onClick={() => navigate("/business-register")}
          className="bg-[#0b2849] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#143b6b] transition"
        >
          Crear mi negocio
        </button>
      </div>
    );

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7FAFC] flex flex-col items-center pb-16">
      {/* Tarjeta de título */}
      <div className="w-full max-w-5xl mt-10 px-6">
        <div className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-10 text-center">
          <h1 className="text-[28px] md:text-[32px] leading-[38px] font-extrabold text-[#0b2849]">
            {business.nombre_fantasia}
          </h1>
          <p className="text-gray-500">{business.rubro}</p>
        </div>
      </div>

      {/* Tarjeta de información */}
      <div className="w-full max-w-5xl mt-10 px-6">
        <section className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-10">
          <h2 className="text-xl font-semibold text-[#0b2849] mb-6">
            Información del negocio
          </h2>

          <div className="grid grid-cols-1 gap-3 text-gray-700">
            <p>
              <strong>Dirección:</strong> {business.direccion || "—"}
            </p>
            <p>
              <strong>Teléfono:</strong> {business.telefono || "—"}
            </p>
            <p>
              <strong>Email:</strong> {business.email || "—"}
            </p>
            <p>
              <strong>Sitio web / redes:</strong> {business.sitio_web || "—"}
            </p>
            <p>
              <strong>Horarios:</strong> {business.horarios || "—"}
            </p>
            <p>
              <strong>Descripción:</strong> {business.descripcion || "—"}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={
                  business.activo
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {business.activo ? "Activo" : "Inactivo"}
              </span>
            </p>
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={() => navigate("/business/edit")}
              className="px-8 py-3 rounded-full bg-[#0b2849] text-white font-semibold hover:bg-[#143b6b] transition"
            >
              Editar negocio
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
