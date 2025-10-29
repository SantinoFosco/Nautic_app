import { useNavigate } from "react-router-dom";
import successIllustration from "../assets/success_check.svg";

export default function BusinessSuccess() {
  const navigate = useNavigate();

  return (
    // 🔹 Aísla el flex del App con un div "w-full"
    <div className="w-full flex justify-center items-center h-[calc(100vh-64px)] bg-white">
      <div className="flex flex-col items-center text-center">
        <img
          src={successIllustration}
          alt="Solicitud enviada"
          className="w-[140px] h-[140px] mb-6"
        />

        <h2 className="text-2xl font-bold text-[#0b2849] mb-2">
          Solicitud enviada
        </h2>

        <p className="text-gray-600 mb-8">
          Tu negocio está pendiente de aprobación
        </p>

        <button
          onClick={() => navigate("/business")}
          className="bg-[#0b2849] text-white font-semibold py-2 px-8 rounded-full hover:bg-[#143b6b] transition"
        >
          Ir a mi panel
        </button>
      </div>
    </div>
  );
}
