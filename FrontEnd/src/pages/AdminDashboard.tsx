import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getPendingBusinesses,
  getActiveSpots,
} from "../api/admin";

import {
  MapPin,
  Clock,
  CheckCircle,
  Users,
  Store,
  LayoutDashboard,
  Timer,
  ListChecks,
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [negociosPendientes, setNegociosPendientes] = useState<any[]>([]);
  const [spotsActivos, setSpotsActivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔹 Traer datos del backend al cargar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes, spotsRes] = await Promise.all([
          getDashboardStats(),
          getPendingBusinesses(),
          getActiveSpots(),
        ]);

        setData(statsRes);
        setNegociosPendientes(pendingRes);
        setSpotsActivos(spotsRes);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-[#0b2849]">
        Cargando datos...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        No se pudieron cargar los datos.
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-white text-[#0b2849] flex flex-col border-r border-gray-200">
        <nav className="flex flex-col gap-2 px-4 py-8 text-sm">
          <SidebarItem
            label="Dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            active
          />
          <SidebarItem
            label="Negocios pendientes"
            icon={<Timer className="w-4 h-4" />}
          />
          <SidebarItem
            label="Todos los negocios"
            icon={<ListChecks className="w-4 h-4" />}
          />
          <SidebarItem label="Deportes" icon={<Users className="w-4 h-4" />} />
        </nav>
      </aside>

      {/* === CONTENIDO === */}
      <main className="flex-1 bg-[#f8fafc] px-10 py-8 overflow-y-auto">
        <h2 className="text-3xl font-bold text-[#0b2849] mb-2">Dashboard</h2>
        <p className="text-gray-500 mb-8">Resumen general de la plataforma</p>

        {/* === MÉTRICAS === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            icon={<Store className="w-7 h-7 text-[#0b2849]" />}
            value={data?.negocios_totales ?? 0}
            label="Total negocios"
          />
          <MetricCard
            icon={<Clock className="w-7 h-7 text-[#0b2849]" />}
            value={data?.negocios_pendientes ?? 0}
            label="Pendientes de aprobación"
          />
          <MetricCard
            icon={<Users className="w-7 h-7 text-[#0b2849]" />}
            value={data?.usuarios_registrados ?? 0}
            label="Usuarios registrados"
          />
          <MetricCard
            icon={<CheckCircle className="w-7 h-7 text-[#0b2849]" />}
            value={data?.negocios_activos ?? 0}
            label="Negocios activos"
          />
        </div>

        {/* === LISTADOS === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Negocios pendientes */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-[#0b2849] text-lg mb-4">
              Negocios pendientes
            </h3>
            {negociosPendientes.length > 0 ? (
              negociosPendientes.map((n, i) => (
                <BusinessCard
                  key={i}
                  name={n.nombre_fantasia || "Sin nombre"}
                  type={n.rubro || "—"}
                  location={n.direccion || "—"}
                  status="Pendiente"
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No hay negocios pendientes.
              </p>
            )}
          </div>

          {/* Spots activos */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-[#0b2849] text-lg mb-4">
              Spots activos
            </h3>
            {spotsActivos.length > 0 ? (
              spotsActivos.map((s, i) => (
                <ActiveSpot
                  key={i}
                  name={s.nombre}
                  type={s.tipo}
                  location={
                    s.lat ? `${s.lat.toFixed(2)}, ${s.lon.toFixed(2)}` : ""
                  }
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No hay spots activos.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* === COMPONENTES AUXILIARES === */

function SidebarItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full text-left ${
        active
          ? "bg-[#0b2849] text-white"
          : "text-[#0b2849] hover:bg-[#0b2849] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white shadow rounded-xl flex flex-col items-center justify-center px-4 py-5 min-h-[130px] border border-gray-200">
      <p className="text-4xl font-bold text-[#0b2849] leading-none">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-gray-600 text-sm">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}

function BusinessCard({
  name,
  type,
  location,
  status,
}: {
  name: string;
  type?: string;
  location?: string;
  status?: string;
}) {
  return (
    <div className="flex justify-between items-center bg-[#f9fafc] border border-gray-200 rounded-lg px-4 py-3 mb-3">
      <div>
        <p className="font-semibold text-[#0b2849]">{name}</p>
        {type && <p className="text-sm text-gray-500">{type}</p>}
        {location && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </p>
        )}
      </div>
      {status && (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
          {status}
        </span>
      )}
    </div>
  );
}

function ActiveSpot({
  name,
  type,
  location,
}: {
  name: string;
  type?: string;
  location?: string;
}) {
  return (
    <div className="flex justify-between items-center bg-[#f9fafc] border border-gray-200 rounded-lg px-4 py-3 mb-3">
      <div>
        <p className="font-semibold text-[#0b2849]">{name}</p>
        {type && <p className="text-sm text-gray-500">{type}</p>}
        {location && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </p>
        )}
      </div>
    </div>
  );
}
