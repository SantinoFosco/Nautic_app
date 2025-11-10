import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Phone, Mail, Globe, MoreVertical } from "lucide-react";
import { BusinessInfo, getBusinessesInfo } from "../api/businessOwner";
import { toggleBusinessStatus, deleteBusiness } from "../api/admin"; // 👈 Funciones nuevas
import AdminLayout from "../components/AdminLayout"; // 👈 Layout de Admin

// --- Helpers (copiados de BusinessesPage.tsx) ---
function formatCreatedAt(dateString?: string | null) {
  if (!dateString) return "Fecha no disponible";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function statusChipClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "activo") {
    return "bg-[#d1fae5] text-[#047857]";
  }
  if (normalized === "inactivo") {
    return "bg-[#e5e7eb] text-[#374151]";
  }
  // Pendiente
  return "bg-[#fef3c7] text-[#b45309]";
}
// --- Fin Helpers ---


export default function AdminAllBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Estado para saber qué menú "..." está abierto
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // 🔹 Función para cargar negocios
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getBusinessesInfo();
      // Filtramos los pendientes, ya que tienen su propia sección
      const activeOrInactive = data.filter(
        (b) => b.estado === "activo" || b.estado === "inactivo"
      );
      setBusinesses(activeOrInactive);
    } catch (err) {
      console.error("Error al cargar negocios", err);
      setError("No pudimos cargar los negocios. Intentá nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // 🔹 Filtro de búsqueda
  const filteredBusinesses = useMemo(() => {
    if (!search.trim()) return businesses;
    const query = search.trim().toLowerCase();
    return businesses.filter((business) =>
      business.nombre_fantasia.toLowerCase().includes(query)
    );
  }, [businesses, search]);

  // 🔹 Handler para Activar/Desactivar
  const handleToggleStatus = async (id: number) => {
    if (!window.confirm("¿Seguro que querés cambiar el estado de este negocio?")) return;
    try {
      const res = await toggleBusinessStatus(id);
      alert(res.mensaje);
      setActiveMenu(null); // Cierra el menú
      fetchBusinesses(); // Recarga la lista
    } catch (err) {
      alert("Error al cambiar el estado del negocio.");
    }
  };

  // 🔹 Handler para Eliminar
  const handleDelete = async (id: number) => {
    if (!window.confirm("Esta acción es permanente. ¿Seguro que querés ELIMINAR este negocio?")) return;
    try {
      const res = await deleteBusiness(id);
      alert(res.mensaje);
      setActiveMenu(null); // Cierra el menú
      fetchBusinesses(); // Recarga la lista
    } catch (err) {
      alert("Error al eliminar el negocio.");
    }
  };


  return (
    <AdminLayout>
      {/* === Header (como en la foto) === */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#0b2849] mb-2">
          Todos los negocios
        </h1>
        <p className="text-gray-600">
          Gestiona todos los negocios registrados en la plataforma
        </p>
      </header>

      {/* === Search (como en la foto) === */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
          aria-label="Buscar negocios por nombre"
        />
      </div>

      {/* === Contenido === */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="text-gray-500">Cargando negocios...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg">
          {error}
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
          No encontramos negocios que coincidan con tu búsqueda.
        </div>
      ) : (
        <ul className="space-y-6">
          {filteredBusinesses.map((business) => {
            const websiteUrl = business.sitio_web?.startsWith("http")
              ? business.sitio_web
              : `https://${business.sitio_web}`;

            return (
              <li
                key={business.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-6"
              >
                {/* --- Fila superior (Nombre, Chips, Botón) --- */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0b2849]">
                      {business.nombre_fantasia}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {business.rubro && (
                        <span className="px-3 py-1 rounded-full bg-[#fef3c7] text-[#b45309] text-xs font-medium">
                          {business.rubro}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusChipClasses(
                          business.estado
                        )}`}
                      >
                        {business.estado.charAt(0).toUpperCase() +
                          business.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* --- Menú "..." --- */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenu(activeMenu === business.id ? null : business.id)}
                      className="text-gray-400 hover:text-gray-600 transition"
                      aria-haspopup="true"
                      aria-label="Más opciones"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* --- Dropdown (como en la foto) --- */}
                    {activeMenu === business.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => handleToggleStatus(business.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {business.estado === "activo" ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => handleDelete(business.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Grilla de info (como en la foto) --- */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-3 col-span-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Registrado
                    </span>
                    <span>{formatCreatedAt(business.fecha_creacion)}</span>
                  </div>
                  {business.direccion && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-[2px] text-gray-400 flex-shrink-0" />
                      <span>{business.direccion}</span>
                    </div>
                  )}
                  {business.telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{business.telefono}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{business.email}</span>
                    </div>
                  )}
                  {business.sitio_web && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0b2849] hover:underline break-all"
                      >
                        {business.sitio_web}
                      </a>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
}