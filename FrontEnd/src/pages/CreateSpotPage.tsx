import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { createSpot } from "../api/admin";
import { ArrowLeft } from "lucide-react";

export default function CreateSpotPage() {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSpot({
        nombre,
        tipo,
        lat: Number(lat),
        lon: Number(lon),
      });
      alert("¡Spot creado con éxito!");
      navigate("/admin/spots");
    } catch (err) {
      console.error("Error al crear spot:", err);
      alert("No se pudo crear el spot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <button
        onClick={() => navigate("/admin/spots")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0b2849] font-medium mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Gestionar Spots
      </button>

      <h2 className="text-3xl font-bold text-[#0b2849] mb-2">
        Crear nuevo Spot
      </h2>
      <p className="text-gray-500 mb-8">
        Ingresa los datos principales del spot para habilitarlo en la plataforma.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-xl shadow border border-gray-200 p-8 space-y-6"
      >
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="biz-input"
              placeholder="Ej: Playa Grande"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="biz-input"
              placeholder="Ej: Playa, Lago, Río"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="biz-input"
                placeholder="-38.005500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="biz-input"
                placeholder="-57.542600"
                required
              />
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0b2849] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#143b6b] transition disabled:bg-gray-400"
          >
            {loading ? "Creando..." : "Crear Spot"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

