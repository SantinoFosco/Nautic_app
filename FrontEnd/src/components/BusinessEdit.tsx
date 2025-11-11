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

type ProfileState = {
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string;
  fecha_creacion: string | null;
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
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id_dueno = localStorage.getItem("ownerId");
  const hasBusiness = localStorage.getItem("hasBusiness") === "true";

  useEffect(() => {
    if (!id_dueno) {
      navigate("/login");
      return;
    }

    if (!hasBusiness) {
      navigate("/business");
      return;
    }

    async function loadData() {
      try {
        const [profileRes, businessRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/business_owner/profile?id_dueno=${id_dueno}`),
          fetch(`http://127.0.0.1:8000/business_owner/my_business?id_dueno=${id_dueno}`),
        ]);

        if (!profileRes.ok) {
          throw new Error("Error al cargar los datos del usuario");
        }
        const profileData = await profileRes.json();
        setProfile({
          nombre: profileData.nombre ?? "",
          apellido: profileData.apellido ?? "",
          telefono: profileData.telefono ?? "",
          email: profileData.email ?? "",
          fecha_creacion: profileData.fecha_creacion ?? null,
        });

        if (!businessRes.ok) {
          if (businessRes.status === 404) {
            navigate("/business");
            return;
          }
          if (businessRes.status === 403) {
            setError("Tu negocio aún está pendiente de aprobación.");
            return;
          }
          throw new Error("Error al traer el negocio");
        }

        const businessJson = await businessRes.json();
        const negocio = Array.isArray(businessJson) ? businessJson[0] : businessJson;
        if (negocio) {
          setForm({
            name: negocio.nombre_fantasia || "",
            type: negocio.rubro || "",
            address: negocio.direccion || "",
            phone: negocio.telefono || "",
            email: negocio.email || "",
            socials: negocio.sitio_web || "",
            schedule: negocio.horarios || "",
            description: negocio.descripcion || "",
          });
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [hasBusiness, id_dueno, navigate]);

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
      <div className="w-full max-w-6xl mt-10 px-6 space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel perfil */}
          <section className="flex-1 bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-8 py-8">
            <h2 className="text-2xl font-bold text-[#0b2849] mb-4">Perfil</h2>
            {profile ? (
              <dl className="space-y-4 text-sm text-gray-700">
                <div>
                  <dt className="font-semibold text-[#0b2849] uppercase text-xs tracking-wide">
                    Nombre completo
                  </dt>
                  <dd>{profile.nombre} {profile.apellido}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#0b2849] uppercase text-xs tracking-wide">
                    Email
                  </dt>
                  <dd>{profile.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#0b2849] uppercase text-xs tracking-wide">
                    Teléfono
                  </dt>
                  <dd>{profile.telefono || "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#0b2849] uppercase text-xs tracking-wide">
                    Fecha de registro
                  </dt>
                  <dd>
                    {profile.fecha_creacion
                      ? new Date(profile.fecha_creacion).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-500 text-sm">No se pudo cargar el perfil.</p>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("ownerId");
                localStorage.removeItem("ownerEmail");
                localStorage.removeItem("userType");
                localStorage.removeItem("hasBusiness");
                navigate("/");
              }}
              className="mt-6 inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#0b2849]/40 text-[#0b2849] text-sm font-semibold hover:bg-[#0b2849] hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </section>

          {/* Panel negocio */}
          <section className="flex-[1.5] bg-white border border-[#E9EFF6] rounded-[16px] shadow-md px-6 md:px-10 py-8">
            <h2 className="text-2xl font-bold text-[#0b2849] mb-4">Datos del negocio</h2>
            <form onSubmit={onSave} className="space-y-8">
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
                  <option value="Escuela">Escuela</option>
                  <option value="Tienda">Tienda</option>
                  <option value="Alquiler">Alquiler</option>
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

              <div className="flex flex-wrap items-center gap-3">
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
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
