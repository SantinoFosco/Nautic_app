import { useEffect, useMemo, useState, type ComponentType } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from "react-leaflet";
import {
  Thermometer,
  Wind,
  CloudRain,
  Waves,
  Clock,
  Phone,
  MapPin,
  Globe,
  Home,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

// 2. IMPORTAR 'L' E IMÁGENES
import L from "leaflet";
import iconSurf from "../assets/IconoBlueSurf.png";
import iconKite from "../assets/IconoBlueKite.png";
import iconKayak from "../assets/IconoBlueKayak.png";
import iconTienda from "../assets/IconoSkyBlueTienda.png";
import iconFiltros from "../assets/filtros.png";
// === TIPOS ===
type Sport = "surf" | "kite" | "kayak";

function normalizeSportName(name?: string | null): Sport | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  if (n.includes("kite")) return "kite";
  if (n.includes("kayak")) return "kayak";
  if (n.includes("surf")) return "surf";
  return null;
}

type Spot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "spot" | "business";
  sports?: Sport[];
  best_sport?: string;

  // Datos de negocio
  nombre_fantasia?: string;
  rubro?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  horarios?: string;
  descripcion?: string;
};

// 3. DEFINIR LOS ÍCONOS PERSONALIZADOS
const iconSize: [number, number] = [32, 32];
const iconAnchor: [number, number] = [16, 32]; // (centro-abajo)

const surfIcon = L.icon({
  iconUrl: iconSurf,
  iconSize: iconSize,
  iconAnchor: iconAnchor,
});

const kiteIcon = L.icon({
  iconUrl: iconKite,
  iconSize: iconSize,
  iconAnchor: iconAnchor,
});

const kayakIcon = L.icon({
  iconUrl: iconKayak,
  iconSize: iconSize,
  iconAnchor: iconAnchor,
});

// 👈 2. Definir el ícono de Tienda
const tiendaIcon = L.icon({
  iconUrl: iconTienda,
  iconSize: iconSize,
  iconAnchor: iconAnchor,
});

const extractBusinessSports = (raw: any): Sport[] =>
  (Array.isArray(raw) ? raw : [])
    .map((value) => normalizeSportName(typeof value === "string" ? value : value?.nombre))
    .filter(Boolean) as Sport[];

// 4. FUNCIÓN HELPER PARA DECIDIR EL ÍCONO
function getIconForSpot(spot: Spot) {
  // Usamos 'best_sport' que ya viene en tu lógica
  const sportName = normalizeSportName(spot.best_sport);

  if (sportName === "surf") return surfIcon;
  if (sportName === "kite") return kiteIcon;
  if (sportName === "kayak") return kayakIcon;

  // Fallback por si 'best_sport' es nulo o no coincide
  return surfIcon;
}

const MapContainerAny = MapContainer as unknown as ComponentType<any>;
const TileLayerAny = TileLayer as unknown as ComponentType<any>;
const MarkerAny = Marker as unknown as ComponentType<any>;
const TooltipAny = Tooltip as unknown as ComponentType<any>;
const PopupAny = Popup as unknown as ComponentType<any>;

// === COMPONENTE PRINCIPAL ===
export default function MapView() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [data, setData] = useState<Record<string, any>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [day, setDay] = useState(0);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const [selectedTypes, setSelectedTypes] = useState<Array<"spot" | "business">>([]);

  const toggleType = (t: "spot" | "business") => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const resetTypes = () => setSelectedTypes([]);

  // === 1️⃣ Cargar spots y negocios ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSpots = await fetch(`http://localhost:8000/spot/list?day=${day}`);
        const spotsData = await resSpots.json();

        const resBusiness = await fetch("http://localhost:8000/spot/business_list");
        const businessData = await resBusiness.json();

        const normalizedSpots: Spot[] = spotsData.map((s: any) => ({
          id: `spot-${s.name}-${s.lat}-${s.lon}`,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          type: "spot" as const,
          best_sport: s.best_sport,
          sports: Array.isArray(s.sports)
            ? (s.sports.map((n: string) => normalizeSportName(n)).filter(Boolean) as Sport[])
            : undefined,
        }));

const extractBusinessSports = (raw: any): Sport[] =>
  (Array.isArray(raw) ? raw : [])
    .map((d: any) => {
      const candidate =
        d?.nombre ??
        d?.codigo ??
        d?.deporte?.nombre ??
        (typeof d === "string" ? d : null);
      return normalizeSportName(candidate);
    })
    .filter(Boolean) as Sport[];
        const businesses: Spot[] = businessData.map((b: any) => ({
          id: `business-${b.nombre_fantasia}-${b.lat}-${b.lon}`,
          name: b.nombre_fantasia,
          lat: b.lat,
          lon: b.lon,
          type: "business" as const,
          rubro: b.rubro,
          direccion: b.direccion,
          telefono: b.telefono,
          email: b.email,
          sitio_web: b.sitio_web,
          horarios: b.horarios,
          descripcion: b.descripcion,
          nombre_fantasia: b.nombre_fantasia,
          sports: extractBusinessSports(b.deportes),
        }));

        setSpots([...normalizedSpots, ...businesses]);
        setData({});
        setSelectedId(null);
      } catch (err) {
        console.error("Error al cargar spots o negocios:", err);
      }
    };
    fetchData();
  }, [day]);


  // === 2️⃣ Filtro por deporte (para spots y negocios) ===
  const visibleSpots = useMemo(() => {
  // 1) Filtro por tipo (Spot / Negocio)
  const afterType = selectedTypes.length === 0
    ? spots
    : spots.filter(s => selectedTypes.includes(s.type));

  // 2) Filtro por deporte (tu lógica actual)
  if (selectedSports.length === 0) return afterType;

  return afterType.filter((s) => {
    if (s.type === "spot") {
      const best = normalizeSportName(s.best_sport);
      return best ? selectedSports.includes(best) : false;
    }

    // type === "business"
    const baseSports = s.sports ?? [];
    const detailedSports = extractBusinessSports(data[s.id]?.sports);
    const sportsNorm = [...baseSports, ...detailedSports];
    const matchesSports = sportsNorm.some((sp) => selectedSports.includes(sp));

    const rubroNorm = normalizeSportName(s.rubro ?? null);
    const matchesRubro = rubroNorm ? selectedSports.includes(rubroNorm) : false;

    return matchesSports || matchesRubro;
  });
}, [selectedTypes, selectedSports, spots]);

useEffect(() => {
  if (!selectedId) return;
  const stillVisible = visibleSpots.some(s => s.id === selectedId);
  if (!stillVisible) setSelectedId(null);
}, [visibleSpots, selectedId]);


  // === 3️⃣ Funciones auxiliares ===
  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };
  const resetSports = () => setSelectedSports([]);

  // === 4️⃣ Click en marcador ===
  const handleSpotClick = async (spot: Spot) => {
    setSelectedId(spot.id);

    if (spot.type === "business") {
      try {
        const url = `http://localhost:8000/spot/business_details?lat=${spot.lat}&lon=${spot.lon}&day=${day}`;
        const res = await fetch(url);
        const details = await res.json();
        const normalized = {
          ...details,
          sports: extractBusinessSports(details?.sports),
        };
        setData((prev) => ({ ...prev, [spot.id]: normalized || {} }));

        setSpots((prev) =>
          prev.map((s) =>
            s.id === spot.id
              ? {
                  ...s,
                  sports: Array.from(
                    new Set([...(s.sports ?? []), ...normalized.sports])
                  ),
                }
              : s
          )
        );
      } catch (err) {
        console.error("Error al traer detalles del negocio:", err);
        setData((prev) => ({ ...prev, [spot.id]: {} }));
      }
      return;
    }

    // Si es spot deportivo: clima
    if (data[spot.id]) return;

    setLoadingWeather(true);
    try {
      const url = `http://localhost:8000/spot/weather_average?lat=${spot.lat}&lon=${spot.lon}&day=${day}`;
      const res = await fetch(url);
      const json = await res.json();
      setData((prev) => ({ ...prev, [spot.id]: json }));
    } catch (err) {
      console.error("Error al cargar clima", err);
      setData((prev) => ({ ...prev, [spot.id]: {} }));
    } finally {
      setLoadingWeather(false);
    }
  };

  const selectedSpot = useMemo(
  () => (selectedId ? visibleSpots.find(s => s.id === selectedId) ?? null : null),
  [selectedId, visibleSpots]
);

  // === RENDER ===
  return (
    <div className="relative flex-1 min-h-0 w-full">
      {/* === FILTROS COLAPSABLES === */}
<div className="fixed z-[1100] right-4 top-[calc(64px+16px)]">
  {/* Botón de abrir/cerrar */}
  {!showFilters ? (
    <button
      onClick={() => setShowFilters(true)}
      className="p-2 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-100 transition"
      title="Mostrar filtros"
    >
      <img
        src={iconFiltros}
        alt="Filtros"
        className="w-10 h-10 object-contain"
      />
    </button>
  ) : (
    <div className="bg-white/60 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-300 flex flex-col items-end gap-2">
  {/* --- Barra superior con selector de día y cerrar --- */}
  <div className="flex w-full justify-end items-center mb-1">
    <select
      className="select select-bordered select-sm bg-white/80 text-[#0D3B66] w-[160px] border-slate-300"
      value={day}
      onChange={(e) => setDay(Number(e.target.value))}
    >
      {[...Array(5)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formatted = date.toLocaleString("es-AR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        });
        return (
          <option key={i} value={i}>
            {formatted}
          </option>
        );
      })}
    </select>

    <button
      onClick={() => setShowFilters(false)}
      className="text-[#0D3B66] font-bold text-lg hover:text-red-500 ml-2"
      title="Cerrar filtros"
    >
      ×
    </button>
  </div>

  {/* --- Filtros de tipo (Spot / Negocio) --- */}
  <div className="flex gap-2">
    {[
      { key: "spot", label: "Spot" },
      { key: "business", label: "Negocio" },
    ].map(({ key, label }) => (
      <button
        key={key}
        onClick={() => toggleType(key as "spot" | "business")}
        className={`w-[90px] px-4 py-2 rounded-md text-sm font-medium shadow transition-all border ${
          selectedTypes.includes(key as "spot" | "business")
            ? "bg-[#0D3B66] text-white border-[#0D3B66]"
            : "bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
        }`}
      >
        {label}
      </button>
    ))}
    <button
      onClick={resetTypes}
      className="w-[40px] px-2 py-2 rounded-md text-sm font-bold shadow border bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
      title="Limpiar filtro de tipo"
    >
      ×
    </button>
  </div>

  {/* --- Filtros de deporte (Surf / Kite / Kayak) --- */}
  <div className="flex gap-2">
    {[
      { key: "surf", label: "Surf" },
      { key: "kite", label: "Kite" },
      { key: "kayak", label: "Kayak" },
    ].map(({ key, label }) => (
      <button
        key={key}
        onClick={() => toggleSport(key)}
        className={`w-[90px] px-4 py-2 rounded-md text-sm font-medium shadow transition-all border ${
          selectedSports.includes(key)
            ? "bg-[#0D3B66] text-white border-[#0D3B66]"
            : "bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
        }`}
      >
        {label}
      </button>
    ))}
    <button
      onClick={resetSports}
      className="w-[40px] px-2 py-2 rounded-md text-sm font-bold shadow border bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
      title="Limpiar filtro de deporte"
    >
      ×
    </button>
  </div>
</div>

  )}
</div>


      {/* === MAPA === */}
      <MapContainerAny
        center={[-37.8, -58.0]}
        zoom={7}
        className="h-full w-full z-0"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <TileLayerAny
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* === MARCADORES === */}
        {visibleSpots.map((spot) => {
          
          // Si es un NEGOCIO, usamos el ícono de tienda
          if (spot.type === "business") {
            return (
              <MarkerAny
                key={spot.id}
                position={[spot.lat, spot.lon]}
                icon={tiendaIcon}
                eventHandlers={{ click: () => handleSpotClick(spot) }}
              >
                <TooltipAny permanent direction="bottom" offset={[0, 14]} className="spot-chip">
                  {spot.name}
                </TooltipAny>
              </MarkerAny>
            );
          }

          // Si es un SPOT DEPORTIVO, usamos el <Marker> de deporte
          const icon = getIconForSpot(spot);

          return (
            <MarkerAny
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={icon}
              eventHandlers={{ click: () => handleSpotClick(spot) }}
            >
              <TooltipAny permanent direction="bottom" offset={[0, 14]} className="spot-chip">
                {spot.name}
              </TooltipAny>
            </MarkerAny>
          );
        })}

        {/* === POPUP === */}
        {selectedSpot && (
          <PopupAny
            position={[selectedSpot.lat, selectedSpot.lon]}
            offset={[0, -10]}
            autoPan
            keepInView
            closeButton
            eventHandlers={{ remove: () => setSelectedId(null) }}
          >
            <div className="w-[260px] space-y-2">
              <h3 className="font-bold text-[#0D3B66] text-lg text-center">
                {selectedSpot.nombre_fantasia || selectedSpot.name}
              </h3>

              {selectedSpot.type === "business" ? (
                (() => {
                  const biz = { ...selectedSpot, ...(data[selectedSpot.id] || {}) };
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mt-3">
                        {biz.rubro && (
                          <Info icon={<Home className="w-4 h-4 text-[#0D3B66]" />} label="Rubro" value={biz.rubro} />
                        )}
                        {biz.telefono && (
                          <Info icon={<Phone className="w-4 h-4 text-[#0D3B66]" />} label="Teléfono" value={biz.telefono} />
                        )}
                        {biz.horarios && (
                          <Info icon={<Clock className="w-4 h-4 text-[#0D3B66]" />} label="Horarios" value={biz.horarios} />
                        )}
                        {biz.direccion && (
                          <Info icon={<MapPin className="w-4 h-4 text-[#0D3B66]" />} label="Dirección" value={biz.direccion} />
                        )}
                      </div>

                      {biz.sitio_web && (
                        <p className="text-center text-sm text-[#0D3B66] mt-3 underline">
                          <a
                            href={
                              biz.sitio_web.startsWith("http://") || biz.sitio_web.startsWith("https://")
                                ? biz.sitio_web
                                : `https://${biz.sitio_web}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Globe className="w-4 h-4" /> Sitio web
                            </span>
                          </a>
                        </p>
                      )}

                      {biz.descripcion && (
                        <p className="mt-3 text-gray-600 text-xs italic text-center">
                          “{biz.descripcion}”
                        </p>
                      )}
                    </>
                  );
                })()
              ) : loadingWeather && !data[selectedSpot.id] ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md text-[#0D3B66]"></span>
                </div>
              ) : data[selectedSpot.id] ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mt-2">
                    <Info icon={<Thermometer className="w-4 h-4 text-[#0D3B66]" />} label="Temp prom." value={`${data[selectedSpot.id].temperature_2m ?? 0}°C`} />
                    <Info icon={<Wind className="w-4 h-4 text-[#0D3B66]" />} label="Viento prom." value={`${data[selectedSpot.id].wind_speed_10m ?? 0} km/h`} />
                    <Info icon={<CloudRain className="w-4 h-4 text-[#0D3B66]" />} label="Lluvia prom." value={`${data[selectedSpot.id].precipitation ?? 0} mm`} />
                    <Info icon={<Waves className="w-4 h-4 text-[#0D3B66]" />} label="Olas prom." value={`${data[selectedSpot.id].wave_height ?? 0} m`} />
                  </div>

                  <button
                    className="w-full bg-[#0D3B66] text-white py-2 rounded-md text-sm font-medium hover:bg-[#0b3355] transition mt-2"
                    onClick={() => navigate(`/forecast/${encodeURIComponent(selectedSpot.name)}`)}
                  >
                    Ver Pronóstico Completo
                  </button>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              )}
            </div>
          </PopupAny>
        )}
      </MapContainerAny>

      {/* === FAB Ayuda === */}
      <div className="fixed z-[1200] right-5 bottom-5">
        <div className="fab fab-vertical gap-2">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-lg btn-circle text-white shadow-lg"
            style={{ backgroundColor: "#59b7ff", border: "none" }}
          >
            ?
          </div>

          <div>
            Ver Preguntas Frecuentes
            <button
              className="btn btn-sm btn-circle bg-[#0b2849] text-white hover:bg-[#143b6b]"
              onClick={() => navigate("/faq")}
            >
              📘
            </button>
          </div>

          <div>
            Cómo usar el mapa
            <button
              className="btn btn-sm btn-circle bg-[#0b2849] text-white hover:bg-[#143b6b]"
              onClick={() =>
                alert(
                  "Usá los botones de la esquina superior derecha para cambiar el deporte (surf, kite o kayak) y el selector de día para ver el pronóstico. Hacé clic en un punto del mapa para ver más información."
                )
              }
            >
              💡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// === COMPONENTE INFO ===
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      {icon}
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-[#0D3B66] break-words">{value}</span>
    </div>
  );
}
