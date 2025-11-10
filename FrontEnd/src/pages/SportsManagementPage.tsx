import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { listSports, toggleSportStatus, SportInfo } from "../api/admin";

export default function SportsManagementPage() {
  const [sports, setSports] = useState<SportInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSports = async () => {
    setLoading(true);
    try {
      const data = await listSports();
      setSports(data);
    } catch (err) {
      console.error("Error al cargar deportes:", err);
      alert("No se pudieron cargar los deportes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleToggle = async (id: number) => {
    if (
      !confirm("¿Estás seguro de que quieres cambiar el estado de este deporte?")
    ) {
      return;
    }
    try {
      await toggleSportStatus(id);
      // Recarga la lista para mostrar el nuevo estado
      fetchSports();
    } catch (err) {
      alert("No se pudo actualizar el estado.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#0b2849] mb-2">
            Gestionar Deportes
          </h2>
          <p className="text-gray-500">
            Activa, desactiva o crea nuevos deportes en la plataforma.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/crear-deporte")}
          className="bg-[#0b2849] text-white font-semibold px-5 py-2 rounded-md hover:bg-[#143b6b] transition"
        >
          Crear Nuevo Deporte
        </button>
      </div>

      {/* === Tabla de Deportes === */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <table className="w-full table-auto">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Nombre del Deporte
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
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && sports.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                  No se encontraron deportes.
                </td>
              </tr>
            )}
            {sports.map((sport) => (
              <tr key={sport.id} className="border-b border-gray-100">
                <td className="px-6 py-4 font-medium text-[#0b2849]">
                  {sport.nombre}
                </td>
                <td className="px-6 py-4">
                  {sport.activo ? (
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
                    onClick={() => handleToggle(sport.id)}
                    className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition text-sm"
                  >
                    {sport.activo ? "Desactivar" : "Activar"}
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