import { useEffect, useMemo, useState } from "react";
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
  ClipboardList,
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
    try {
      return new Date(isoString).toLocaleString("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const pendingCount = useMemo(() => businesses.length, [businesses]);

  return (
    <AdminLayout>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0b2849] mb-1">
            Negocios pendientes de aprobación
          </h1>
          <p className="text-gray-600">
            Revisá la información enviada y decide si aprobar o rechazar la solicitud.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 bg-[#e5efff] text-[#0b2849] text-sm font-semibold px-4 py-1.5 rounded-full shadow-sm">
          {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}
        </span>
      </header>

      {/* === Contenido de la página === */}
      {loading && (
        <div className="flex justify-center items-center py-12 text-gray-500">
          Cargando negocios...
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && businesses.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500">
          No hay negocios pendientes de aprobación.
        </div>
      ) : (
        <ul className="space-y-6">
          {businesses.map((biz) => (
            <li
              key={biz.id_negocio}
              className="bg-white rounded-3xl shadow-sm border border-[#dfe7f4] px-6 py-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0b2849]">
                      {biz.nombre_fantasia}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0b2849]" />
                        {formatTimestamp(biz.fecha_creacion)} hs
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                    <DetailItem icon={<MapPin className="w-4 h-4" />} label="Dirección" value={biz.direccion} />
                    <DetailItem icon={<Phone className="w-4 h-4" />} label="Teléfono" value={biz.telefono} />
                    <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={biz.email} />
                    <DetailItem icon={<Globe className="w-4 h-4" />} label="Sitio web" value={biz.sitio_web} />
                    <DetailItem icon={<Clock className="w-4 h-4" />} label="Horario" value={biz.horarios} />
                    <DetailItem icon={<ClipboardList className="w-4 h-4" />} label="Rubro" value={biz.rubro} />
                  </div>

                  {biz.descripcion && (
                    <p className="text-sm text-gray-600 italic">
                      “{biz.descripcion}”
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => setApprovingBusiness(biz)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-600 text-sm font-semibold hover:bg-emerald-200 transition"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => setRejectingBusiness(biz)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | null;
};

function DetailItem({ icon, label, value }: DetailItemProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-slate-100 text-[#0b2849] flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col text-sm text-gray-700">
        <span className="text-xs uppercase tracking-wide text-gray-400">
          {label}
        </span>
        <span className="break-words">{value}</span>
      </div>
    </div>
  );
}