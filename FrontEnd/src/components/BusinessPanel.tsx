import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGET } from "../api/client";

type Business = {
  nombre_fantasia: string;
  rubro?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  sitio_web?: string | null;
  horarios?: string | null;
  descripcion?: string | null;
  estado: "activo" | "inactivo" | "pendiente";
  deportes?: { id_deporte: number; nombre: string | null }[];
};

type MyBusinessResponse =
  | { hasBusiness: false }
  | ({ hasBusiness: true } & Business);

export default function BusinessPanel() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const resp = await apiGET<MyBusinessResponse>("/business_owner/my_business");

        if ("hasBusiness" in resp && resp.hasBusiness === false) {
          navigate("/business-empty");
          return;
        }

        const biz = resp as Exclude<MyBusinessResponse, { hasBusiness: false }>;
        if ((biz.estado || "").toLowerCase() === "pendiente") setPending(true);
        setBusiness(biz);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (msg.includes(": 401")) return navigate("/login");
        if (msg.includes(": 404")) return navigate("/business-empty");
        if (msg.includes(": 403")) { setPending(true); return; }
        setError("No se pudo cargar el negocio.");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-500">
        Cargando tu negocio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-red-600">
        {error}
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7FAFC] flex flex-col items-center pb-16">
      <div className="w-full max-w-3xl mt-10 px-6">
        <div className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-[#0b2849] mb-2">
            {business.nombre_fantasia}
          </h1>
          <p className="text-gray-600">{business.rubro}</p>

          {pending && (
            <div className="mt-4 mb-6 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              Tu negocio está <b>pendiente de habilitación</b>. Te avisaremos cuando sea aprobado.
            </div>
          )}

          <div className="mt-6 text-left space-y-2 text-gray-700">
            <p><strong>📍 Dirección:</strong> {business.direccion || "—"}</p>
            <p><strong>📞 Teléfono:</strong> {business.telefono || "—"}</p>
            <p><strong>📧 Email:</strong> {business.email || "—"}</p>
            <p><strong>🌐 Sitio web:</strong> {business.sitio_web || "—"}</p>
            <p><strong>🕒 Horarios:</strong> {business.horarios || "—"}</p>
            <p><strong>📝 Descripción:</strong> {business.descripcion || "—"}</p>

            {Array.isArray(business.deportes) && business.deportes.length > 0 && (
              <div className="pt-2">
                <p><strong>🏄‍♂️ Deportes:</strong> {business.deportes.map(d => d.nombre || "—").join(", ")}</p>
              </div>
            )}
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
