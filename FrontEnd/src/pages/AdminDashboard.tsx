import { Clock, CheckCircle, Store, Users, MapPin } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-[#0b2849] text-white flex flex-col py-6">
        <div className="px-6 mb-10 flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Nautic"
            className="w-8 h-8 rounded-full bg-white p-1"
          />
          <h1 className="text-lg font-bold">NAUTIC</h1>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          <SidebarItem icon={<Store />} label="Dashboard" active />
          <SidebarItem icon={<Clock />} label="Negocios pendientes" />
          <SidebarItem icon={<CheckCircle />} label="Todos los negocios" />
          <SidebarItem icon={<Users />} label="Deportes" />
        </nav>
      </aside>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 px-10 py-8">
        <h2 className="text-3xl font-bold text-[#0b2849] mb-2">Dashboard</h2>
        <p className="text-gray-500 mb-8">
          Resumen general de la plataforma
        </p>

        {/* === MÉTRICAS === */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Store className="w-6 h-6" />}
            label="Total negocios"
            value="56"
          />
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            label="Pendientes de aprobación"
            value="3"
          />
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            label="Usuarios registrados"
            value="72"
          />
          <MetricCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Negocios activos"
            value="44"
          />
        </div>

        {/* === LISTADOS === */}
        <div className="grid grid-cols-2 gap-8">
          {/* Negocios pendientes */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-[#0b2849] text-lg mb-4">
              Negocios pendientes
            </h3>

            <BusinessCard
              name="Atlántida Surf Club"
              type="Escuela"
              location="Pinamar"
              status="Pendiente"
            />
            <BusinessCard
              name="Kite School MDQ"
              type="Escuela"
              location="Mar del Plata"
              status="Pendiente"
            />
            <BusinessCard
              name="Surf Shop Necochea"
              type="Tienda"
              location="Necochea"
              status="Pendiente"
            />
          </div>

          {/* Spots activos */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-[#0b2849] text-lg mb-4">
              Spots activos
            </h3>

            <ActiveSpot name="Pinamar" />
            <ActiveSpot name="Mar del Plata" type="Escuela" location="Mar del Plata" status="Pendiente" />
            <ActiveSpot name="Necochea" type="Tienda" location="Necochea" />
          </div>
        </div>
      </main>
    </div>
  );
}

/* === COMPONENTES AUXILIARES === */
function SidebarItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-[#163d70]" : "hover:bg-[#112e55]"
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
  value: string;
}) {
  return (
    <div className="bg-white shadow rounded-xl flex flex-col items-center justify-center py-5">
      <p className="text-3xl font-bold text-[#0b2849]">{value}</p>
      <div className="flex items-center gap-2 text-gray-600 mt-1">
        {icon}
        <span className="text-sm">{label}</span>
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
  type: string;
  location: string;
  status: string;
}) {
  return (
    <div className="flex justify-between items-center bg-[#f9fafc] border border-gray-200 rounded-lg px-4 py-3 mb-3">
      <div>
        <p className="font-semibold text-[#0b2849]">{name}</p>
        <p className="text-sm text-gray-500">{type}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {location}
        </p>
      </div>
      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
        {status}
      </span>
    </div>
  );
}

function ActiveSpot({
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
