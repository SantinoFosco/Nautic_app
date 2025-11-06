import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BusinessPanel() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

        if (!res.ok) {
          // ⚠️ Si la API devuelve error → usuario sin negocio
          navigate("/business-empty");
          return;
        }

        const data = await res.json();

        // ⚠️ Si el array está vacío → usuario sin negocio
        if (!Array.isArray(data) || data.length === 0) {
          navigate("/business-empty");
          return;
        }

        // ✅ Si tiene negocio, lo mostramos
        setBusiness(data[0]);
      } catch (err) {
        console.error("❌ Error cargando negocio:", err);
        navigate("/business-empty");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id_dueno, navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-500">
        Cargando tu negocio...
      </div>
    );

  if (!business) return null;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7FAFC] flex flex-col items-center pb-16">
      <div className="w-full max-w-3xl mt-10 px-6">
        <div className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-[#0b2849] mb-2">
            {business.nombre_fantasia}
          </h1>
          <p className="text-gray-600">{business.rubro}</p>

          <div className="mt-6 text-left space-y-2 text-gray-700">
            <p><strong>📍 Dirección:</strong> {business.direccion}</p>
            <p><strong>📞 Teléfono:</strong> {business.telefono}</p>
            <p><strong>📧 Email:</strong> {business.email}</p>
            <p><strong>🌐 Sitio web:</strong> {business.sitio_web}</p>
            <p><strong>🕒 Horarios:</strong> {business.horarios}</p>
            <p><strong>📝 Descripción:</strong> {business.descripcion}</p>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/business-edit")}
              className="bg-[#0b2849] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#123b69] transition"
            >
              Editar negocio
            </button>

            <button
              onClick={() => navigate("/")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
