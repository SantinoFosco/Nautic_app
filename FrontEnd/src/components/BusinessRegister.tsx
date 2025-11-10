import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import businessIllustration from "../assets/business_illustration.svg";
import { createBusiness, listSports } from "../api/businessOwner";

export default function BusinessRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    city: "",
    phone: "",
    email: "",
    socials: "",
    schedule: "",
    description: "",
  });

  const [selectedSports, setSelectedSports] = useState<number[]>([]);
  const [sportsOptions, setSportsOptions] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Traer los deportes desde el backend
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await listSports();
        setSportsOptions(res);
      } catch (err) {
        console.error("❌ Error al obtener los deportes:", err);
      }
    };
    fetchSports();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Manejo de checkboxes (máx. 3 deportes)
  const handleSportsChange = (value: number) => {
    setSelectedSports((prev) => {
      if (prev.includes(value)) {
        return prev.filter((id) => id !== value);
      } else {
        if (prev.length >= 3) {
          alert("Solo podés seleccionar hasta 3 deportes.");
          return prev;
        }
        return [...prev, value];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const id_dueno = localStorage.getItem("ownerId");
    if (!id_dueno) {
      alert("No hay un dueño logueado. Iniciá sesión primero.");
      navigate("/login");
      return;
    }

    if (selectedSports.length === 0) {
      alert("Debes seleccionar al menos un deporte.");
      setLoading(false);
      return;
    }

    // ✅ Convertimos los IDs seleccionados (1 principal + opcionales)
    const [id_deporte1, id_deporte2, id_deporte3] = [
      Number(selectedSports[0]),
      selectedSports[1] ? Number(selectedSports[1]) : undefined,
      selectedSports[2] ? Number(selectedSports[2]) : undefined,
    ];

    try {
      // ✅ Armamos payload limpio
      const payload = {
        id_dueno: String(id_dueno),
        nombre_fantasia: formData.name,
        rubro: formData.type,
        sitio_web: formData.socials,
        telefono: formData.phone,
        email: formData.email,
        direccion: formData.city,
        horarios: formData.schedule,
        descripcion: formData.description,
        id_deporte1,
        ...(id_deporte2 ? { id_deporte2 } : {}),
        ...(id_deporte3 ? { id_deporte3 } : {}),
      };

      const res = await createBusiness(payload);
      console.log("✅ Negocio creado correctamente:", res);
      alert("Negocio creado correctamente ✅");
      navigate("/business-success");
    } catch (err) {
      console.error("❌ Error al crear negocio:", err);
      alert("Error al crear el negocio. Verificá los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full h-[calc(100vh-64px)] grid-cols-[40%_60%] overflow-hidden">
      <div className="flex justify-center items-center bg-[#59b7ff]">
        <img
          src={businessIllustration}
          alt="Ilustración negocio"
          className="w-[70%] max-w-[380px] h-auto object-contain"
        />
      </div>

      <div className="flex justify-center items-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#0b2849]">Registrá tu negocio</h2>
            <p className="text-gray-600 text-sm">
              Completá los datos de tu escuela o emprendimiento
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              name="name"
              placeholder="Nombre del negocio"
              value={formData.name}
              onChange={handleChange}
              className="input validator py-2"
              required
            />

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#0b2849] outline-none transition"
              required
            >
              <option value="">Tipo de negocio</option>
              <option value="Escuela de surf">Escuela</option>
              <option value="Escuela de kayak">Tienda</option>
              <option value="Tienda náutica">Alquiler</option>
            </select>

            <label className="mt-2 text-gray-700 font-semibold text-sm">
              Seleccioná los deportes relacionados al negocio
            </label>

            <div className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-800 focus-within:ring-2 focus-within:ring-[#0b2849] transition">
              <div className="grid grid-cols-2 gap-2">
                {sportsOptions.map((sport) => (
                  <label
                    key={sport.id}
                    className={`flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 border transition ${
                      selectedSports.includes(sport.id)
                        ? "border-[#0b2849] bg-[#eaf2fb]"
                        : "border-gray-200 hover:border-[#0b2849]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={sport.id}
                      checked={selectedSports.includes(sport.id)}
                      onChange={() => handleSportsChange(sport.id)}
                      className="accent-[#0b2849] w-4 h-4"
                    />
                    <span className="text-sm">{sport.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <input
              name="city"
              placeholder="Dirección / Ciudad"
              value={formData.city}
              onChange={handleChange}
              className="input validator py-2"
            />

            <input
              name="phone"
              placeholder="Teléfono / WhatsApp"
              value={formData.phone}
              onChange={handleChange}
              className="input validator py-2"
            />

            <input
              type="email"
              name="email"
              placeholder="Email de contacto"
              value={formData.email}
              onChange={handleChange}
              className="input validator py-2"
            />

            <input
              name="socials"
              placeholder="Redes sociales / web"
              value={formData.socials}
              onChange={handleChange}
              className="input validator py-2"
            />

            <input
              name="schedule"
              placeholder="Horario"
              value={formData.schedule}
              onChange={handleChange}
              className="input validator py-2"
            />

            <textarea
              name="description"
              placeholder="Descripción"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#0b2849] outline-none resize-none transition"
            />

            <div className="flex justify-between gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0b2849] hover:bg-[#143b6b]"
                } text-white font-semibold py-2 rounded-full transition w-full`}
              >
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/business")}
                className="bg-gray-100 text-gray-600 font-semibold py-2 rounded-full hover:bg-gray-200 transition w-full"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
