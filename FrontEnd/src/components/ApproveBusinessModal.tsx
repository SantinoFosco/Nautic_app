import { useState } from "react";
import { PendingBusiness } from "../api/admin";


type Props = {
  business: PendingBusiness;
  onClose: () => void;
  onApprove: (id: number, lat: number, lon: number) => Promise<void>;
};

export default function ApproveBusinessModal({
  business,
  onClose,
  onApprove,
}: Props) { 
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lat || !lon) {
      alert("Por favor, ingresá latitud y longitud.");
      return;
    }
    setLoading(true);
    await onApprove(business.id_negocio, parseFloat(lat), parseFloat(lon));
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-bold text-[#0b2849]">
          Aprobar negocio: {business.nombre_fantasia}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Para activar el negocio en el mapa, por favor ingresá sus coordenadas.
          Puedes obtenerlas de Google Maps.
        </p>

        <div className="mt-4 text-sm">
          <strong>Dirección:</strong> {business.direccion}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Latitud
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="biz-input mt-1" 
              placeholder="-38.0055"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Longitud
            </label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="biz-input mt-1" 
              placeholder="-57.5426"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? "Aprobando..." : "Aprobar y Activar"}
          </button>
        </div>
      </form>
    </div>
  );
}