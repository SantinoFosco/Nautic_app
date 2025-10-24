import { useState } from "react";
import { useNavigate } from "react-router-dom";
import businessIllustration from "../assets/business_illustration.svg";

export default function BusinessRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    city: "",
    coordinates: "",
    phone: "",
    email: "",
    socials: "",
    schedule: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    navigate("/business");
  };

  return (
    // 🔹 grid fija sin scroll, 40/60
    <div className="grid w-full h-[calc(100vh-64px)] grid-cols-[40%_60%] overflow-hidden">
      {/* izquierda */}
      <div className="flex justify-center items-center bg-[#59b7ff]">
        <img
          src={businessIllustration}
          alt="Ilustración negocio"
          className="w-[70%] max-w-[380px] h-auto object-contain"
        />
      </div>

      {/* derecha */}
      <div className="flex justify-center items-center bg-white">
        <div className="w-full max-w-md px-8">
          {/* encabezado */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#0b2849]">Registrate</h2>
            <p className="text-gray-600 text-sm">
              Completá los datos de tu escuela o emprendimiento
            </p>
          </div>

          {/* formulario compacto */}
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
              name="coordinates"
              placeholder="Coordenadas (lat, long)"
              value={formData.coordinates}
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
                className="bg-[#0b2849] text-white font-semibold py-2 rounded-full hover:bg-[#143b6b] transition w-full"
              >
                Enviar solicitud
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

