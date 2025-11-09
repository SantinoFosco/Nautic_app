import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Navigation, Compass } from "lucide-react";
import { getSpots, SpotInfo } from "../api/spots";

function formatCoords(lat: number, lon: number) {
  const format = (value: number, axis: "N" | "S" | "E" | "W") =>
    `${Math.abs(value).toFixed(2)}°${axis}`;

  const latLabel = lat >= 0 ? "N" : "S";
  const lonLabel = lon >= 0 ? "E" : "W";

  return `${format(lat, latLabel)} · ${format(lon, lonLabel)}`;
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<SpotInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true);
        const data = await getSpots(0);
        setSpots(data);
      } catch (err) {
        console.error("Error al cargar spots", err);
        setError("No pudimos cargar los spots. Intentá nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  const filteredSpots = useMemo(() => {
    if (!search.trim()) return spots;
    const query = search.trim().toLowerCase();
    return spots.filter((spot) => spot.name.toLowerCase().includes(query));
  }, [spots, search]);

  const handleViewForecast = (spot: SpotInfo) => {
    navigate(`/forecast/${encodeURIComponent(spot.name)}`);
  };

  return (
    <div className="flex-1 w-full px-8 py-10 bg-[#f7fafc]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0b2849] mb-2">
            Todos los spots
          </h1>
          <p className="text-gray-600">
            Explorá los spots disponibles y consultá su pronóstico detallado
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-8 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar spot por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
            aria-label="Buscar spots por nombre"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-gray-500">Cargando spots...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl">
            {error}
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center text-gray-500">
            No encontramos spots que coincidan con tu búsqueda.
          </div>
        ) : (
          <ul className="space-y-6">
            {filteredSpots.map((spot) => (
              <li
                key={`${spot.name}-${spot.lat}-${spot.lon}`}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-6"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0b2849]">
                      {spot.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium">
                      <span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1]">
                        {spot.type === "spot"
                          ? "Spot oficial"
                          : spot.type.charAt(0).toUpperCase() + spot.type.slice(1)}
                      </span>
                      {spot.best_sport && (
                        <span className="px-3 py-1 rounded-full bg-[#ecfdf5] text-[#047857]">
                          Mejor para {spot.best_sport}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewForecast(spot)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b2849] text-white text-sm font-semibold hover:bg-[#143b6b] transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Ver clima
                  </button>
                </div>

                <div className="grid gap-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-[2px] text-gray-400" />
                    <span>{formatCoords(spot.lat, spot.lon)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-gray-400" />
                    <span>
                      Lat: {spot.lat.toFixed(4)} · Lon: {spot.lon.toFixed(4)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

