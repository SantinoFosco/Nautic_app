import { useState } from "react";
import { useNavigate } from "react-router-dom";
import businessIllustration from "../assets/business_illustration.svg";
import { createBusiness } from "../api/businessOwner"; // 👈 conexión al backend

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

  const [loading, setLoading] = useState(false);

  // 🔹 Actualiza los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 Enviar formulario al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verifica que el dueño esté logueado
    const id_dueno = localStorage.getItem("ownerId");
    if (!id_dueno) {
      alert("No hay un dueño logueado. Iniciá sesión primero.");
      navigate("/login");
      return;
    }

    try {
      // Enviamos los datos al backend FastAPI
      const res = await createBusiness({
        id_dueno,
        nombre_fantasia: formData.name,
        rubro: formData.type,
        sitio_web: formData.socials,
        telefono: formData.phone,
        email: formData.email,
        direccion: formData.city,
        horarios: formData.schedule,
        descripcion: formData.description,
      });

      console.log("✅ Negocio creado correctamente:", res);
      alert("Negocio creado correctamente ✅");

      // 🔹 Redirige a la pantalla de éxito
      navigate("/business-success");
    } catch (err: any) {
      console.error("❌ Error al crear negocio:", err);
      alert("Error al crear el negocio. Verificá los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔹 Layout en dos columnas (azul 40% / formulario 60%)
    <div className="grid w-full h-[calc(100vh-64px)] grid-cols-[40%_60%] overflow-hidden">
      {/* Columna izquierda: imagen azul */}
      <div className="flex justify-center items-center bg-[#59b7ff]">
        <img
          src={businessIllustration}
          alt="Ilustración negocio"
          className="w-[70%] max-w-[380px] h-auto object-contain"
        />
      </div>

      {/* Columna derecha: formulario */}
      <div className="flex justify-center items-center bg-white">
        <div className="w-full max-w-md px-8">
          {/* Encabezado */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#0b2849]">
              Registrá tu negocio
            </h2>
            <p className="text-gray-600 text-sm">
              Completá los datos de tu escuela o emprendimiento
            </p>
          </div>

          {/* Formulario */}
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
              <option value="Escuela de surf">Escuela de surf</option>
              <option value="Escuela de kayak">Escuela de kayak</option>
              <option value="Tienda náutica">Tienda náutica</option>
              <option value="Otro">Otro</option>
            </select>

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

            {/* Botones */}
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