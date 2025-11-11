import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  listAdminSpots,
  toggleSpotStatus,
  type SpotAdminInfo,
} from "../api/admin";

export default function SpotsManagementPage() {
  const [spots, setSpots] = useState<SpotAdminInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const data = await listAdminSpots();
      setSpots(data);
    } catch (err) {
      console.error("Error al cargar spots:", err);
      alert("No se pudieron cargar los spots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleToggle = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de que querés cambiar el estado de este spot?"
      )
    ) {
      return;
    }

    try {
      await toggleSpotStatus(id);
      fetchSpots();
    } catch (err) {
      alert("No se pudo actualizar el estado del spot.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b2849] mb-2">
            Gestionar Spots
          </h2>
          <p className="text-gray-500">
            Consulta, activa o crea nuevos spots en la plataforma.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/crear-spot")}
          className="bg-[#0b2849] text-white font-semibold px-5 py-2 rounded-md hover:bg-[#143b6b] transition"
        >
          Crear nuevo Spot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200">
        <table className="w-full table-auto">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Coordenadas
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Cargando spots...
                </td>
              </tr>
            )}
            {!loading && spots.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No se encontraron spots.
                </td>
              </tr>
            )}
            {spots.map((spot) => (
              <tr key={spot.id} className="border-b border-gray-100">
                <td className="px-6 py-4 font-medium text-[#0b2849]">
                  {spot.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {spot.tipo || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {spot.lat.toFixed(4)}, {spot.lon.toFixed(4)}
                </td>
                <td className="px-6 py-4">
                  {spot.activo ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      Activo
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggle(spot.id)}
                    className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm"
                  >
                    {spot.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

