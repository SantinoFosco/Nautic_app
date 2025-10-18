import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Thermometer, Wind, Waves, Cloud, Sun } from "lucide-react";

type Sport = "surf" | "kite";
type Spot = { name: string; lat: number; lon: number; sports: Sport[] };

type WeatherDay = {
  uvIndex?: number;
  precipitation_probability?: number;
  wind_speed?: number;
  cloudCover?: number;
  maxTemperature?: number;
  minTemperature?: number;
  waveHeight?: number;
  precipitation_qpfCuantity?: number;
};

export default function ForecastPage() {
  const { name = "" } = useParams();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [day, setDay] = useState(0);
  const [data, setData] = useState<WeatherDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Traer lista de spots desde el backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/spot/list")
      .then((r) => r.json())
      .then(setSpots)
      .catch(() => console.warn("No se pudieron cargar los spots"));
  }, []);

  const spot = useMemo(
    () => spots.find((s) => s.name.toLowerCase() === decodeURIComponent(name).toLowerCase()),
    [spots, name]
  );

  // 🟦 Traer datos climáticos desde backend
  useEffect(() => {
    if (!spot) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://127.0.0.1:8000/spot/general_weather?lat=${spot.lat}&lon=${spot.lon}&day=${day}`
        );
        if (!res.ok) throw new Error("Error al obtener datos");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [spot, day]);

  if (!spot) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0D3B66] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver al mapa
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">Spot no encontrado</h1>
      </div>
    );
  }

  if (loading) return <p className="text-center mt-10">Cargando datos...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!data) return <p className="text-center mt-10">Sin datos disponibles.</p>;

  return (
    <div className="bg-[#f7fafc] w-full flex-1">
      {/* HERO */}
      <div className="border-b bg-gradient-to-b from-white to-[#f4f8fb]">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-[#0D3B66] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Map
          </Link>
          <div className="text-[#0D3B66] font-semibold">Nautic</div>
          <div className="flex gap-2">
            <Chip>Surf</Chip>
            <Chip>Kite</Chip>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">{spot.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {Math.abs(spot.lat).toFixed(2)}°S, {Math.abs(spot.lon).toFixed(2)}°W
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Condiciones actuales" value={qualifyNow(data)} color="blue" />
            <SummaryCard title="Puntuación Surf" value="7.0/10" color="teal" />
            <SummaryCard title="Puntuación Kite" value="7.5/10" color="emerald" />
            <SummaryCard title="Actualizado" value="Ahora mismo" color="slate" />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-10">
        <SectionTitle>Condiciones Generales</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TinyStat icon={<Thermometer className="w-4 h-4" />} label="Temperatura" value={`${data.maxTemperature}°C`} />
          <TinyStat icon={<Cloud className="w-4 h-4" />} label="Probabilidad de lluvia" value={`${data.precipitation_probability}%`} />
          <TinyStat icon={<Wind className="w-4 h-4" />} label="Humedad" value={`${data.cloudCover}%`} />
          <TinyStat icon={<Waves className="w-4 h-4" />} label="Índice de UV" value={`${data.uvIndex}`} />
        </div>

        <SectionTitle>Condiciones Detalladas</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5">
          <BigCard icon={<Waves className="w-5 h-5" />} title="Oleaje">
            <KV k="Altura" v={`${data.waveHeight} m`} />
            <KV k="Periodo" v={`${data.wavePeriod ?? 8}s`} />
          </BigCard>
          <BigCard icon={<Wind className="w-5 h-5" />} title="Viento">
            <KV k="Velocidad" v={`${(data.wind_speed ?? 0 * 3.6).toFixed(1)} km/h`} />
            <KV k="Ráfagas" v={`${((data.wind_speed ?? 0) * 1.3 * 3.6).toFixed(1)} km/h`} />
          </BigCard>
          <BigCard icon={<Thermometer className="w-5 h-5" />} title="Temperatura">
            <KV k="Max" v={`${data.maxTemperature ?? 0}°C`} />
            <KV k="Min" v={`${data.minTemperature ?? 0}°C`} />
          </BigCard>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Helpers ---------- */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[1px] w-4 bg-[#0D3B66]/40" />
      <h2 className="text-2xl font-semibold text-slate-900">{children}</h2>
      <div className="flex-1 h-[1px] bg-slate-200/70" />
    </div>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border px-3 py-1 text-xs text-slate-600 bg-white shadow-sm">{children}</span>;
}
function SummaryCard({ title, value, color }: { title: string; value: string; color: "blue"|"teal"|"emerald"|"slate"; }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal-100 text-teal-700",
    emerald: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4 relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1 ${color==="blue"?"bg-blue-500":color==="teal"?"bg-teal-500":color==="emerald"?"bg-emerald-500":"bg-slate-400"}`} />
      <div className="text-xs text-slate-500">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
    </div>
  );
}
function BigCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3 text-[#0D3B66]">
        <div className="p-2 rounded-xl bg-[#0D3B66]/10">{icon}</div>
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600 mt-1.5">
      <span>{k}</span>
      <span className="text-slate-900 font-semibold">{v}</span>
    </div>
  );
}
function TinyStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4">
      <div className="flex items-center gap-2 text-slate-600">
        <div className="p-1.5 rounded-lg bg-slate-100">{icon}</div>
        <div className="text-sm">{label}</div>
      </div>
      <div className="text-slate-900 font-semibold mt-2">{value}</div>
    </div>
  );
}

/* ---------- utils ---------- */
function qualifyNow(d: WeatherDay | null): string {
  if (!d) return "—";
  const h = d.waveHeight ?? 0;
  const w = d.wind_speed ?? 0;
  if (h >= 1.2 && w < 8) return "Bueno";
  if (h >= 0.7) return "Aceptable";
  return "Calmo";
}
