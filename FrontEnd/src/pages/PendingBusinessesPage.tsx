import { useEffect, useState, ReactNode } from "react"; 
import AdminLayout from "../components/AdminLayout";
import {
  getPendingBusinesses,
  updateBusinessStatus,
  PendingBusiness, 
} from "../api/admin";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Globe,
  MessageSquare,
} from "lucide-react";
import ApproveBusinessModal from "../components/ApproveBusinessModal";
import RejectBusinessModal from "../components/RejectBusinessModal";



export default function PendingBusinessesPage() {
  
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Estados para manejar los modales (también usan el tipo)
  const [approvingBusiness, setApprovingBusiness] =
    useState<PendingBusiness | null>(null);
  const [rejectingBusiness, setRejectingBusiness] =
    useState<PendingBusiness | null>(null);

  // 🔹 Cargar los negocios pendientes
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getPendingBusinesses();
      setBusinesses(data); 
    } catch (err) {
      setError("No se pudieron cargar los negocios pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // 🔹 Handler para el modal de APROBAR
  const handleApprove = async (id: number, lat: number, lon: number) => {
    try {
      await updateBusinessStatus(id, true, lat, lon);
      setApprovingBusiness(null); // Cierra el modal
      fetchBusinesses(); // Recarga la lista
    } catch (err) {
      alert("Error al aprobar el negocio.");
    }
  };

  // 🔹 Handler para el modal de RECHAZAR
  const handleReject = async (id: number) => {
    try {
      // (lat y lon no importan si aprobado=false)
      await updateBusinessStatus(id, false, 0, 0);
      setRejectingBusiness(null); // Cierra el modal
      fetchBusinesses(); // Recarga la lista
    } catch (err) {
      alert("Error al rechazar el negocio.");
    }
  };

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b2849] mb-2">
            Negocios pendientes de aprobación
          </h2>
          <p className="text-gray-500">
            Revisa y aprueba los negocios que están esperando validación
          </p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
          {businesses.length} pendiente{businesses.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* === Contenido de la página === */}
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-6">
        {!loading && businesses.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No hay negocios pendientes de aprobación.
          </p>
        )}

        {businesses.map((biz) => (
          <div
            key={biz.id_negocio}
            className="bg-white rounded-xl shadow p-6 border border-gray-200"
          >
            {/* Header de la tarjeta */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0b2849]">
                  {biz.nombre_fantasia}
                </h3>
                <span className="text-sm text-gray-500">
                  Enviado el {formatTimestamp(biz.fecha_creacion)} hs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setApprovingBusiness(biz)}
                  className="bg-green-100 text-green-700 font-semibold px-5 py-2 rounded-md hover:bg-green-200 transition"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => setRejectingBusiness(biz)}
                  className="bg-red-100 text-red-700 font-semibold px-5 py-2 rounded-md hover:bg-red-200 transition"
                >
                  Rechazar
                </button>
              </div>
            </div>

            {/* Grilla de detalles */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <InfoItem icon={<MapPin />} text={biz.direccion} />
              <InfoItem icon={<Phone />} text={biz.telefono} />
              <InfoItem icon={<Mail />} text={biz.email} />
              <InfoItem icon={<Globe />} text={biz.sitio_web} />
              <InfoItem icon={<Clock />} text={biz.horarios} />
            </div>

            {/* Descripción */}
            <div className="mt-4">
              <InfoItem
                icon={<MessageSquare />}
                text={biz.descripcion}
                isBlock
              />
            </div>
          </div>
        ))}
      </div>

      {/* === Modales === */}
      {approvingBusiness && (
        <ApproveBusinessModal
          business={approvingBusiness}
          onClose={() => setApprovingBusiness(null)}
          onApprove={handleApprove}
        />
      )}

      {rejectingBusiness && (
        <RejectBusinessModal
          business={rejectingBusiness}
          onClose={() => setRejectingBusiness(null)}
          onReject={handleReject}
        />
      )}
    </AdminLayout>
  );
}

// Componente auxiliar para los items de info
function InfoItem({
  icon,
  text,
  isBlock = false,
}: {
  icon: ReactNode; 
  text: string | null;
  isBlock?: boolean;
}) {
  if (!text) return null;
  return (
    <div
      className={`flex items-start gap-2 text-gray-700 ${
        isBlock ? "col-span-2" : ""
      }`}
    >
      <div className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <span className={isBlock ? "whitespace-pre-wrap" : "truncate"}>
        {text}
      </span>
    </div>
  );
}