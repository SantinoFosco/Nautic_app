import "../index.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import shopImg from "../assets/shop.svg";
import { listMyBusinesses } from "../api/businessOwner";

export default function BusinessEmptyState() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    const id_dueno = localStorage.getItem("ownerId");
    const storedName = localStorage.getItem("ownerName");
    const email = localStorage.getItem("ownerEmail");

    if (!id_dueno) {
      navigate("/login");
      return;
    }

    setOwnerName(storedName || email?.split("@")[0] || "Usuario");

    listMyBusinesses(id_dueno)
      .then((res) => {
        if (Array.isArray(res)) setBusinesses(res);
      })
      .catch((err) => console.error("Error al traer negocios:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-64px)] bg-[#f9fafb] text-gray-600">
        Cargando negocios...
      </div>
    );

  // 🟩 Con negocios registrados
  if (businesses.length > 0)
    return (
      <div className="w-full flex justify-center bg-[#f9fafb] min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center text-center max-w-2xl w-full py-12 px-4">
          <h1 className="text-3xl font-bold text-[#0b2849] mb-2">
            ¡Bienvenido, {ownerName}!
          </h1>
          <p className="text-gray-600 mb-8">
            Ya tenés {businesses.length} negocio
            {businesses.length > 1 ? "s" : ""} registrado
            {businesses.length > 1 ? "s" : ""}.
          </p>

          <div className="grid gap-4 w-full max-w-md">
            {businesses.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition text-left"
              >
                <h3 className="text-lg font-bold text-[#0b2849] mb-1">
                  {b.nombre_fantasia}
                </h3>
                <p className="text-sm text-gray-600">{b.rubro}</p>
                {b.direccion && (
                  <p className="text-sm text-gray-500 mt-1">📍 {b.direccion}</p>
                )}
                {b.lat && b.lon && (
                  <p className="text-sm text-gray-500 mt-1">
                    ({b.lat.toFixed(3)}, {b.lon.toFixed(3)})
                  </p>
                )}
                <button
                  onClick={() => navigate(`/map?lat=${b.lat}&lon=${b.lon}`)}
                  className="mt-3 text-sm text-[#0b2849] font-semibold hover:underline"
                >
                  Ver en el mapa →
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/business-register")}
            className="mt-10 bg-[#0b2849] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#143b6b] transition"
          >
            Crear otro negocio
          </button>
        </div>
      </div>
    );

  // 🟦 Sin negocios registrados
  return (
    <div className="w-full flex justify-center bg-[#f9fafb] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col items-center text-center max-w-md w-full py-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0b2849] mb-2">
          ¡Hola, {ownerName}!
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#0b2849] mb-3">
          Empecemos por tu primer negocio
        </h2>
        <p className="text-gray-600 mb-10 max-w-md">
          Publicalo para que aparezca en el mapa y recibas consultas.
        </p>

        <img
          src={shopImg}
          alt="Negocio vacío"
          className="w-48 h-auto mx-auto mb-10 drop-shadow-sm"
        />

        <p className="text-gray-700 text-base mb-8">
          Todavía no tenés negocios registrados
        </p>

        <button
          onClick={() => navigate("/business-register")}
          className="bg-[#0b2849] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#143b6b] transition"
        >
          Crear mi negocio
        </button>
      </div>
    </div>
  );
}
