import '../index.css'; 
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import surfImg from "../assets/surf.svg"; 

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", formData);
    // Lógica de login (por ahora simulada)
    navigate("/");
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)]">
      {/* Izquierda - Formulario */}
      <div className="flex flex-col justify-center items-center w-1/2 bg-white px-6 md:px-20">
        <div className="w-full max-w-sm">
          <h2 className="text-4xl font-bold text-[#0b2849] text-center mb-2">
            Bienvenido de nuevo!
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Entrá a tu cuenta para gestionar tus negocios.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="input validator"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="input validator pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              className="bg-[#0b2849] text-white py-2 rounded-full font-semibold hover:bg-[#143b6b] transition mt-2"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-4">
            ¿Todavía no tenés cuenta?{" "}
            <Link to="/register" className="text-[#0b2849] font-medium hover:underline">
              Creá una ahora
            </Link>
          </p>
        </div>
      </div>

      {/* Derecha - Imagen */}
      <div className="flex justify-center items-center w-1/2 bg-[#41B1E3]">
        <img
          src={surfImg}
          alt="Ilustración surfista"
          className="w-[80%] max-w-[480px] h-auto object-contain"
        />
      </div>
    </div>
  );
}
