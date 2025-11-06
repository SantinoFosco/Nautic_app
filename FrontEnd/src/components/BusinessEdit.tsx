import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type FormState = {
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  socials: string;
  schedule: string;
  description: string;
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
};

export default function BusinessEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id_dueno = localStorage.getItem("ownerId");

  useEffect(() => {
    if (!id_dueno) {
      navigate("/login");
      return;
    }

    async function loadBusiness() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/business_owner/my_business?id_dueno=${id_dueno}`
        );
        if (!res.ok) throw new Error("Error al traer el negocio");
        const data = await res.json();
        if (data.length > 0) {
          const n = data[0];
          setForm({
            name: n.nombre_fantasia || "",
            type: n.rubro || "",
            address: n.direccion || "",
            phone: n.telefono || "",
            email: n.email || "",
            socials: n.sitio_web || "",
            schedule: n.horarios || "",
            description: n.descripcion || "",
          });
        }
      } catch (err: any) {
        setError("No se pudo cargar el negocio.");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [id_dueno, navigate]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id_dueno) return;

    const params = new URLSearchParams({
      id_dueno,
      nombre_fantasia: form.name,
      rubro: form.type,
      telefono: form.phone,
      email: form.email,
      direccion: form.address,
      sitio_web: form.socials,
      horarios: form.schedule,
      descripcion: form.description,
    });

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/business_owner/update_business?${params.toString()}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Error al guardar");
      const json = await res.json();
      alert(json.message);
      navigate("/business");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("No se pudo guardar el negocio.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-600">
        Cargando datos del negocio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7FAFC] flex flex-col items-center pb-16">
      {/* Tarjeta de título */}
      <div className="w-full max-w-5xl mt-10 px-6">
        <div className="bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-10 text-center">
          <h1 className="text-[28px] md:text-[32px] leading-[38px] font-extrabold text-[#0b2849]">
            Editar negocio
          </h1>
        </div>
      </div>

      {/* Contenido apilado */}
      <form onSubmit={onSave} className="w-full max-w-5xl mt-10 px-6 space-y-12">
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

            <select
              name="type"
              value={form.type}
              onChange={onChange}
              className="biz-input"
              required
            >
              <option value="">Tipo de negocio</option>
              <option value="Escuela de surf">Escuela de surf</option>
              <option value="Escuela de kayak">Escuela de kayak</option>
              <option value="Tienda náutica">Tienda náutica</option>
              <option value="Otro">Otro</option>
            </select>

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
              placeholder="Teléfono"
              className="biz-input"
            />
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email de contacto"
              className="biz-input"
            />
            <input
              name="socials"
              value={form.socials}
              onChange={onChange}
              placeholder="Sitio web o redes"
              className="biz-input"
            />
            <input
              name="schedule"
              value={form.schedule}
              onChange={onChange}
              placeholder="Horarios"
              className="biz-input"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Descripción"
              rows={4}
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
