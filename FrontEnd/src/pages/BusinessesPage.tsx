import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Phone, Mail, Globe, MoreVertical } from "lucide-react";
import {
  BusinessInfo,
  getBusinessesInfo,
} from "../api/businessOwner";

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
  return "bg-[#fef3c7] text-[#b45309]";
}

function normalizeWebsite(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const data = await getBusinessesInfo();
        setBusinesses(data);
      } catch (err) {
        console.error("Error al cargar negocios", err);
        setError("No pudimos cargar los negocios. Intentá nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    if (!search.trim()) return businesses;
    const query = search.trim().toLowerCase();
    return businesses.filter((business) =>
      business.nombre_fantasia.toLowerCase().includes(query)
    );
  }, [businesses, search]);

  return (
    <div className="flex-1 w-full px-8 py-10 bg-[#f7fafc]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0b2849] mb-2">
            Todos los negocios
          </h1>
          <p className="text-gray-600">
            Explorá todos los negocios registrados en la plataforma
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-8 flex items-center gap-3">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-gray-500">Cargando negocios...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl">
            {error}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500">
            No encontramos negocios que coincidan con tu búsqueda.
          </div>
        ) : (
          <ul className="space-y-6">
            {filteredBusinesses.map((business) => {
              const websiteUrl = normalizeWebsite(business.sitio_web);

              return (
                <li
                  key={business.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-6 relative"
                >
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
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-haspopup="true"
                    aria-label="Más opciones"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Registrado
                    </span>
                    <span>{formatCreatedAt(business.fecha_creacion)}</span>
                  </div>
                  {business.direccion && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-[2px] text-gray-400" />
                      <span>{business.direccion}</span>
                    </div>
                  )}
                  {business.telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{business.telefono}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{business.email}</span>
                    </div>
                  )}
                  {websiteUrl && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400" />
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
                {business.descripcion && (
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                    {business.descripcion}
                  </p>
                )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

