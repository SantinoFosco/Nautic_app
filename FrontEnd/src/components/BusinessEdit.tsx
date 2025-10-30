import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* --------- State --------- */
type FormState = {
  // Negocio
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  socials: string;
  schedule: string;
  description: string;
  logoUrl?: string;

  // Dueño / responsable
  ownerName: string;
  ownerLast: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword?: string;
};

const EMPTY: FormState = {
  name: "",
  type: "",
  address: "",
  phone: "",
  email: "",
  socials: "",
  schedule: "",
  description: "",
  ownerName: "",
  ownerLast: "",
  ownerEmail: "",
  ownerPhone: "",
};

/* --------- Helpers --------- */
const S = (v: any) => (typeof v === "string" ? v : v ?? "") as string;
function normalizePayload(data: any): FormState {
  const owner = data?.owner ?? data?.contact ?? data?.responsable ?? {};
  return {
    name: S(data?.name ?? data?.nombre),
    type: S(data?.type ?? data?.tipo ?? data?.category),
    address: S(data?.address ?? data?.direccion ?? data?.location),
    phone: S(data?.phone ?? data?.telefono),
    email: S(data?.email),
    socials: S(data?.socials ?? data?.redes ?? data?.website ?? data?.web),
    schedule: S(data?.schedule ?? data?.horario ?? data?.opening_hours),
    description: S(data?.description ?? data?.descripcion),
    logoUrl: S(data?.logoUrl ?? data?.logo ?? data?.image),

    ownerName: S(owner?.firstName ?? owner?.nombre ?? owner?.name),
    ownerLast: S(owner?.lastName ?? owner?.apellido ?? owner?.surname),
    ownerEmail: S(owner?.email),
    ownerPhone: S(owner?.phone ?? owner?.telefono),
    ownerPassword: "", // nunca se trae por seguridad queda vacío
  };
}
const apiBase = () =>
  (import.meta as any)?.env?.VITE_API_URL ||
  (import.meta as any)?.env?.VITE_BACKEND_URL ||
  "";

/* ===================== Vista apilada ===================== */
export default function BusinessEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let abort = false;
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`${apiBase()}/api/business/${id}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (abort) return;
        const mapped = normalizePayload(data);
        setForm((p) => ({ ...p, ...mapped }));
        setPreview(mapped.logoUrl || null);
      } catch {
        if (!abort) setError("No se pudo cargar el negocio. Podés editar igual.");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const pickFile = () => inputRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : form.logoUrl || null);
  };

  // Guardar: podés separar en 2 endpoints si querés (owner vs business)
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    navigate("/business");
  };

  const Title = () => {
    // Como en la captura: “Escuela de Surf "Nombre"”
    if (form.type?.toLowerCase() === "escuela" && form.name)
      return <>Escuela de Surf “{form.name}”</>;
    if (form.name) return <>{form.name}</>;
    return <>Editar negocio</>;
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7FAFC] flex flex-col items-center pb-16">
      {/* Tarjeta de título */}
      <div className="w-full max-w-5xl mt-10 px-6">
        <div className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-10 text-center">
          <h1 className="text-[28px] md:text-[32px] leading-[38px] font-extrabold text-[#0b2849]">
            <Title />
          </h1>
        </div>
      </div>

      {/* Contenido apilado (scroll natural) */}
      <form onSubmit={onSave} className="w-full max-w-5xl mt-10 px-6 space-y-12">
        {loading && (
          <p className="text-sm text-slate-500">Cargando datos…</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Card: Contacto del responsable */}
        <section className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-10">
          <div className="grid grid-cols-1 gap-3">
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={onChange}
              placeholder="Nombre"
              className="biz-input"
              required
            />
            <input
              name="ownerLast"
              value={form.ownerLast}
              onChange={onChange}
              placeholder="Apellido"
              className="biz-input"
              required
            />
            <input
              name="ownerEmail"
              type="email"
              value={form.ownerEmail}
              onChange={onChange}
              placeholder="Email"
              className="biz-input"
              required
            />
            <input
              name="ownerPhone"
              value={form.ownerPhone}
              onChange={onChange}
              placeholder="Telefono"
              className="biz-input"
            />
            <input
              name="ownerPassword"
              type="password"
              value={form.ownerPassword || ""}
              onChange={onChange}
              placeholder="Contraseña"
              className="biz-input"
            />
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#0b2849] text-white font-semibold hover:bg-[#123b69] transition"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => navigate("/business")}
              className="px-6 py-3 rounded-full bg-[#ECEFF3] text-[#7A8796] font-semibold hover:bg-[#E4E9EF] transition"
            >
              Cancelar
            </button>
          </div>
        </section>

        {/* Card: Información del negocio */}
        <section className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-10">
          <div className="grid grid-cols-1 gap-3">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Nombre del negocio"
              className="biz-input"
              required
            />

            <input
              name="type"
              value={form.type}
              onChange={onChange}
              placeholder="Escuela"
              className="biz-input"
            />

            <input
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Dirección"
              className="biz-input"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Telefono"
              className="biz-input"
            />

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
              className="biz-input"
            />

            <input
              name="socials"
              value={form.socials}
              onChange={onChange}
              placeholder="Redes sociales/pagina web"
              className="biz-input"
            />

            <input
              name="schedule"
              value={form.schedule}
              onChange={onChange}
              placeholder="Lunes a domingos, 9 a 19 h"
              className="biz-input"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Descripción"
              rows={5}
              className="biz-textarea"
            />
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#0b2849] text-white font-semibold hover:bg-[#123b69] transition"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => navigate("/business")}
              className="px-6 py-3 rounded-full bg-[#ECEFF3] text-[#7A8796] font-semibold hover:bg-[#E4E9EF] transition"
            >
              Cancelar
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
