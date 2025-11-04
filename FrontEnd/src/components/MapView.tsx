import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import { Thermometer, Wind, CloudRain, Waves } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type Sport = "surf" | "kite";

type Spot = {
  name: string;
  lat: number;
  lon: number;
  sports: Sport[]; // derivado de best_sport del backend
};

type WeatherData = {
  temperature_2m?: number;
  wind_speed_10m?: number;
  precipitation?: number;
  wave_height?: number;
};

export default function MapView() {
  const [spots, setSpots] = useState<Spot[]>([]);
  // cache por día y por spot: data[day][spotName] -> WeatherData
  const [data, setData] = useState<Record<number, Record<string, WeatherData>>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [day, setDay] = useState(0);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const navigate = useNavigate();

  // 🔹 Un solo effect: trae spots para el día actual y (si hay spot seleccionado) prefetch del clima de ese spot
  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        // Traer spots del backend (best_sport es string)
        const res = await fetch(`${API_BASE}/spot/list?day=${day}`);
        const arr = await res.json();

        const list: Spot[] = (Array.isArray(arr) ? arr : []).map((r: any) => ({
          name: String(r.name ?? r.nombre ?? ""),
          lat: Number(r.lat),
          lon: Number(r.lon),
          sports: bestToSports(r.best_sport), // 👈 derivamos el array desde el string
        }));

        setSpots(list);

        // Prefetch del clima si hay un spot seleccionado y no está cacheado para ESTE día
        if (!selected) return;
        const s = list.find((sp) => sp.name === selected);
        if (!s) return;
        if (data[day]?.[s.name]) return;

        setLoadingWeather(true);
        const w = await fetch(`${API_BASE}/spot/weather_average?lat=${s.lat}&lon=${s.lon}&day=${day}`);
        const weather = await w.json();
        if (cancel) return;

        setData((prev) => ({
          ...prev,
          [day]: { ...(prev[day] || {}), [s.name]: weather },
        }));
      } catch (e) {
        console.error("Error cargando spots/weather", e);
        setSpots([]);
      } finally {
        setLoadingWeather(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [day, selected]);

  // === Filtro por deporte ===
  const visibleSpots = useMemo(() => {
    if (selectedSports.length === 0) return spots;
    return spots.filter((s) => s.sports?.some((sport) => selectedSports.includes(sport)));
  }, [selectedSports, spots]);

  const selectedSpot = visibleSpots.find((s) => s.name === selected);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };
  const resetSports = () => setSelectedSports([]);

  // === Pedir clima al click (usa cache por día) ===
  const handleSpotClick = async (spot: Spot) => {
    setSelected(spot.name);

    // si ya tenemos los datos para ESTE día, no volvemos a pedirlos
    if (data[day]?.[spot.name]) return;

    setLoadingWeather(true);
    try {
      const url = `${API_BASE}/spot/weather_average?lat=${spot.lat}&lon=${spot.lon}&day=${day}`;
      const res = await fetch(url);
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        [day]: { ...(prev[day] || {}), [spot.name]: json },
      }));
    } catch (err) {
      console.error("Error al cargar clima", err);
      setData((prev) => ({
        ...prev,
        [day]: { ...(prev[day] || {}), [spot.name]: {} as WeatherData },
      }));
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <div className="relative flex-1 min-h-0 w-full">
      {/* === FILTROS === */}
      <div className="fixed z-[1100] right-4 top-[calc(64px+16px)] pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto items-end">
          {/* Filtro de deporte */}
          <div className="flex gap-2">
            {["surf", "kite"].map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`w-[90px] px-4 py-2 rounded-md text-sm font-medium shadow transition-all border ${
                  selectedSports.includes(sport)
                    ? "bg-[#0D3B66] text-white border-[#0D3B66]"
                    : "bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
                }`}
              >
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </button>
            ))}
            <button
              onClick={resetSports}
              className="w-[40px] px-2 py-2 rounded-md text-sm font-bold shadow transition-all border bg-white text-[#0D3B66] border-slate-300 hover:bg-slate-50"
            >
              ×
            </button>
          </div>

          {/* Filtro de día */}
          <select
            className="select select-bordered select-sm bg-white text-[#0D3B66] w-[180px] border-slate-300"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={i}>
                Día {i === 0 ? "0 (hoy)" : `+${i}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* === MAPA === */}
      <MapContainer
        center={[-37.8, -58.0]}
        zoom={7}
        className="h-full w-full z-0"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* === MARCADORES === */}
        {visibleSpots.map((spot) => {
          const d = data[day]?.[spot.name];
          const wind = d?.wind_speed_10m ?? 0;
          const waves = d?.wave_height ?? 0;
          const rain = d?.precipitation ?? 0;
          const sport = pickSportForSpot(selectedSports, spot.sports);
          const apt = calcAptitude(sport, wind, waves, rain);
          const color = aptColor(apt);

          return (
            <CircleMarker
              key={spot.name}
              center={[spot.lat, spot.lon]}
              radius={6}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
              eventHandlers={{ click: () => handleSpotClick(spot) }}
            >
              <Tooltip permanent direction="bottom" offset={[0, 14]} className="spot-chip">
                {spot.name}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* === POPUP === */}
        {selectedSpot && (
          <Popup
            position={[selectedSpot.lat, selectedSpot.lon]}
            offset={[0, -10]}
            autoPan
            keepInView
            closeButton
            className="spot-popup"
            eventHandlers={{ remove: () => setSelected(null) }}
          >
            <div className="w-[260px] space-y-2">
              <h3 className="font-semibold text-[#0D3B66]">{selectedSpot.name}</h3>

              {loadingWeather && !data[day]?.[selectedSpot.name] ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md text-[#0D3B66]"></span>
                </div>
              ) : data[day]?.[selectedSpot.name] ? (
                <>
                  <div className="text-xs text-slate-500">
                    Día {day} • Deporte:{" "}
                    <span className="font-semibold">
                      {pickSportForSpot(selectedSports, selectedSpot.sports).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mt-2">
                    <Info
                      icon={<Thermometer className="w-4 h-4 text-[#0D3B66]" />}
                      label="Temp prom."
                      value={`${data[day]?.[selectedSpot.name]?.temperature_2m ?? "-"}°C`}
                    />
                    <Info
                      icon={<Wind className="w-4 h-4 text-[#0D3B66]" />}
                      label="Viento prom."
                      value={`${data[day]?.[selectedSpot.name]?.wind_speed_10m ?? "-"} m/s`}
                    />
                    <Info
                      icon={<CloudRain className="w-4 h-4 text-[#0D3B66]" />}
                      label="Lluvia prom."
                      value={`${data[day]?.[selectedSpot.name]?.precipitation ?? "-"} mm`}
                    />
                    <Info
                      icon={<Waves className="w-4 h-4 text-[#0D3B66]" />}
                      label="Olas prom."
                      value={`${data[day]?.[selectedSpot.name]?.wave_height ?? "-"} m`}
                    />
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm">Sin datos disponibles</p>
              )}

              <button
                className="w-full bg-[#0D3B66] text-white py-2 rounded-md text-sm font-medium hover:bg-[#0b3355] transition"
                onClick={() => navigate(`/forecast/${encodeURIComponent(selectedSpot.name)}`)}
              >
                Ver Pronóstico Completo
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}

/* === COMPONENTE INFO === */
function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-[#0D3B66]">{value}</span>
    </div>
  );
}

/* === HELPERS === */
type AptLabel = "excelente" | "bueno" | "malo";

function calcAptitude(sport: "surf" | "kite", wind: number, waves: number, rain: number): AptLabel {
  if (sport === "surf") {
    if (waves >= 1.2 && wind < 8 && rain < 2) return "excelente";
    if (waves >= 0.7 && wind < 12 && rain < 4) return "bueno";
    return "malo";
  }
  if (wind >= 8 && wind <= 14 && rain < 2) return "excelente";
  if (wind >= 6 && rain < 4) return "bueno";
  return "malo";
}

function aptColor(label: AptLabel) {
  return label === "excelente" ? "#16a34a" : label === "bueno" ? "#f59e0b" : "#dc2626";
}

function pickSportForSpot(selectedSports: string[], spotSports?: Sport[]): Sport {
  const available: Sport[] =
    Array.isArray(spotSports) && spotSports.length ? spotSports : (["surf", "kite"] as Sport[]);

  if (selectedSports.length === 1 && available.includes(selectedSports[0] as Sport)) {
    return selectedSports[0] as Sport;
  }
  return available[0]; // fallback determinista
}

// 👇 convierte el string best_sport del backend a un arreglo Sport[]
function bestToSports(best: any): Sport[] {
  const s = String(best ?? "").trim().toLowerCase();
  if (s.includes("kite")) return ["kite"];
  if (s.includes("surf")) return ["surf"];
  // fallback si viene vacío o desconocido: mostramos ambos
  return ["surf", "kite"];
}
