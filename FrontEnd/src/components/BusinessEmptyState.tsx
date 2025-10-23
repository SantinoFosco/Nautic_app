import '../index.css'; 
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import shopImg from "../assets/shop.svg"; 

export default function BusinessEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)] bg-white px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-[#0b2849] mb-2">
        ¡Hola, Lorem!
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
          onClick={() => navigate("/crear-negocio")}
          className="bg-[#0b2849] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#143b6b] transition"
        >
          Crear mi negocio
        </button>
        <button
          onClick={() => navigate("/invitar-equipo")}
          className="bg-gray-100 text-gray-500 font-semibold py-2 px-6 rounded-full cursor-default"
          disabled
        >
          Invitar a mi equipo
        </button>
      </div>
    </div>
  );
}
