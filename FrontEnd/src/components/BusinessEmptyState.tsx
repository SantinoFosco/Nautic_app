import "../index.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import shopImg from "../assets/shop.svg";
import { listMyBusinesses } from "../api/businessOwner";

export default function BusinessEmptyState() {
  const navigate = useNavigate();

  // Estados locales
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    try {
      const id_dueno = localStorage.getItem("ownerId");
      const storedName = localStorage.getItem("ownerName"); // ✅ nombre real
      const email = localStorage.getItem("ownerEmail");

      if (!id_dueno) {
        console.warn("No hay usuario logueado, redirigiendo al login...");
        navigate("/login");
        return;
      }

      // 🔹 Mostramos primero el nombre guardado, o el email si no existe
      if (storedName) {
        setOwnerName(storedName);
      } else if (email) {
        setOwnerName(email.split("@")[0]);
      } else {
        setOwnerName("Usuario");
      }

      // 🔹 Llamada al backend para traer los negocios del dueño
      listMyBusinesses(id_dueno)
        .then((res) => {
          if (Array.isArray(res)) setBusinesses(res);
          else console.warn("Formato inesperado de respuesta:", res);
        })
        .catch((err) => {
          console.error("Error al traer negocios:", err);
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("Error general:", err);
      setLoading(false);
    }
  }, [navigate]);

  // 🔹 Estado: cargando
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-64px)] bg-white text-gray-600">
        Cargando negocios...
      </div>
    );
  }

  // 🔹 Estado: con negocios registrados
  if (businesses.length > 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-white text-center">
        <h2 className="text-3xl font-bold text-[#0b2849] mb-2">
          ¡Bienvenido, {ownerName}!
        </h2>
        <p className="text-gray-600 mb-8">
          Ya tenés {businesses.length} negocio
          {businesses.length > 1 ? "s" : ""} registrado
          {businesses.length > 1 ? "s" : ""}.
        </p>

        <button
          onClick={() => navigate("/business-register")}
          className="bg-[#0b2849] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#143b6b] transition"
        >
          Crear otro negocio
        </button>
      </div>
    );
  }

  // 🔹 Estado: sin negocios (pantalla vacía)
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)] bg-white px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[#0b2849] mb-2">
        ¡Hola, {ownerName}!
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#0b2849] mb-3">
        Empecemos por tu primer negocio
      </h2>
      <p className="text-gray-600 mb-10 max-w-md">
        Publicalo para que aparezca en el mapa y recibas consultas.
      </p>

      <div className="relative mb-10">
        <img
          src={shopImg}
          alt="Negocio vacío"
          className="w-48 h-auto mx-auto drop-shadow-sm"
        />
      </div>

      <p className="text-gray-700 text-base mb-8">
        Todavía no tenés negocios registrados
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => navigate("/business-register")}
          className="bg-[#0b2849] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#143b6b] transition"
        >
          Crear mi negocio
        </button>
        <button
          disabled
          className="bg-gray-100 text-gray-500 font-semibold py-2 px-6 rounded-full cursor-not-allowed"
        >
          Invitar a mi equipo
        </button>
      </div>
    </div>
  );
}
