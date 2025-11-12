import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Thermometer, Wind, Waves, Cloud } from "lucide-react";

type Sport = "surf" | "kite";
type Spot = { name: string; lat: number; lon: number; sports: Sport[] };
type sportsScore = { sport: string; score: number };

type WeatherDay = {
  wavePeriod?: number;
  waveHeight?: number;
  waterTemperature?: number;
  feelsLikeMinTemperature?: number;
  feelsLikeMaxTemperature?: number;
  minTemperature?: number;
  maxTemperature?: number;
  cloudCover?: number;
  wind_gustValue?: number;
  wind_speed?: number;
  precipitation_qpfCuantity?: number;
  precipitation_probability?: number;
  uvIndex?: number;
};

export default function ForecastPage() {
  const { name = "" } = useParams();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [day] = useState(0);
  const [data, setData] = useState<WeatherDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kayakScore, setKayakScore] = useState<sportsScore | null>(null);
  const [surfScore, setSurfScore] = useState<sportsScore | null>(null);
  const [kiteScore, setKiteScore] = useState<sportsScore | null>(null);

  // 🟦 Traer lista de spots desde el backend
  useEffect(() => {
    fetch("http://localhost:8000/spot/list?day=0")
      .then((r) => r.json())
      .then(setSpots)
      .catch(() => console.warn("No se pudieron cargar los spots"));
  }, []);

  const spot = useMemo(
    () =>
      spots.find(
        (s) => s.name.toLowerCase() === decodeURIComponent(name).toLowerCase()
      ),
    [spots, name]
  );

  // 🟦 Traer datos climáticos desde backend
  useEffect(() => {
    if (!spot) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/spot/general_weather?lat=${spot.lat}&lon=${spot.lon}&day=${day}`
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

  // 🟦 Traer puntuaciones de deportes
  useEffect(() => {
    if (!spot) return;
    const url = `http://localhost:8000/spot/sportspoints?lat=${spot.lat}&lon=${spot.lon}&day=${day}`;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Normalizar payload: admite { sport, score } o { deporte, ponderacion }
        const raw = Array.isArray(json?.scores) ? json.scores : json;
        const list: sportsScore[] = raw
          .map((r: Record<string, unknown>) => ({
            sport: String(r.sport ?? r.deporte ?? "").toLowerCase(),
            score: Number(r.score ?? r.ponderacion ?? 0),
          }))
          .filter((item: sportsScore) => item.sport && Number.isFinite(item.score));

        const find = (...names: string[]) => {
          const s = list.find((x) => names.includes(x.sport));
          return s ? { sport: s.sport, score: s.score } : { sport: names[0], score: 0 };
        };

        setKayakScore(find("kayak"));
        setSurfScore(find("surf"));
        setKiteScore(find("kite", "kitesurf"));
      } catch (e) {
        console.error("[sportspoints] error:", e);
        setKayakScore({ sport: "kayak", score: 0 });
        setSurfScore({ sport: "surf", score: 0 });
        setKiteScore({ sport: "kitesurf", score: 0 });
      }
    })();
  }, [spot, day]);

  if (!spot) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#0D3B66] hover:underline"
        >
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
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#0D3B66] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Map
          </Link>
          <div className="text-[#0D3B66] font-semibold">Nautic</div>
          <div className="flex gap-2">
            <Chip>Surf</Chip>
            <Chip>Kite</Chip>
            <Chip>Kayak</Chip>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            {spot.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {Math.abs(spot.lat).toFixed(2)}°S, {Math.abs(spot.lon).toFixed(2)}°W
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {kayakScore && kayakScore.score !== 0 && (
              <SummaryCard
                title="Puntuación Kayak"
                value={kayakScore.score}
              />
            )}
            {surfScore && surfScore.score !== 0 && (
              <SummaryCard
                title="Puntuación Surf"
                value={surfScore.score}
              />
            )}
            {kiteScore && kiteScore.score !== 0 && (
              <SummaryCard
                title="Puntuación Kite"
                value={kiteScore.score}
              />
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-10">
        <SectionTitle>Condiciones Generales</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TinyStat
            icon={<Thermometer className="w-4 h-4" />}
            label="Temperatura"
            value={`${data.maxTemperature ?? 0}°C`}
          />
          <TinyStat
            icon={<Cloud className="w-4 h-4" />}
            label="Probabilidad de lluvia"
            value={`${data.precipitation_probability ?? 0}%`}
          />
          <TinyStat
            icon={<Wind className="w-4 h-4" />}
            label="Humedad"
            value={`${data.cloudCover ?? 0}%`}
          />
          <TinyStat
            icon={<Waves className="w-4 h-4" />}
            label="Índice de UV"
            value={`${data.uvIndex ?? 0}`}
          />
        </div>

        <SectionTitle>Condiciones Detalladas</SectionTitle>
        <div className="grid md:grid-cols-3 gap-5">
          <BigCard icon={<Waves className="w-5 h-5" />} title="Oleaje">
            <KV k="Altura" v={`${Number(data.waveHeight ?? 0).toFixed(1)} m`} />
            <KV k="Periodo" v={`${Number(data.wavePeriod ?? 0).toFixed(0)} s`} />
          </BigCard>
          <BigCard icon={<Wind className="w-5 h-5" />} title="Viento">
            <KV k="Velocidad" v={`${data.wind_speed ?? 0} km/h`} />
            <KV k="Ráfagas" v={`${data.wind_gustValue ?? 0} km/h`} />
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
  return (
    <span className="rounded-full border px-3 py-1 text-xs text-slate-600 bg-white shadow-sm">
      {children}
    </span>
  );
}
function scoreColor(score: number) {
  if (score >= 75) return { text: "text-emerald-700", accent: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" };
  if (score >= 50) return { text: "text-amber-600", accent: "bg-amber-500", badge: "bg-amber-100 text-amber-700" };
  if (score >= 25) return { text: "text-orange-600", accent: "bg-orange-500", badge: "bg-orange-100 text-orange-700" };
  return { text: "text-red-600", accent: "bg-red-500", badge: "bg-red-100 text-red-700" };
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  const color = scoreColor(value);

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4 relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${color.accent}`}
      />
      <div className="text-xs text-slate-500">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${color.badge}`}>{value.toFixed(0)}/100</div>
      <div className={`mt-2 text-sm font-semibold ${color.text}`}>
        {value >= 75
          ? "Excelente"
          : value >= 50
          ? "Bueno"
          : value >= 25
          ? "Regular"
          : "Pobre"}
      </div>
    </div>
  );
}
function BigCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
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
function TinyStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
