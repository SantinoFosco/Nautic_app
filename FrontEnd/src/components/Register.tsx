import "../index.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import kayakImg from "../assets/kayak.svg";
import { registerOwner } from "../api/businessOwner"; // ✅ conexión con el back

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    contraseña: "",
    repetirContraseña: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    contraseña: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let valid = true;
    let newErrors = { email: "", contraseña: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingresá un correo electrónico válido";
      valid = false;
    }

    if (formData.contraseña !== formData.repetirContraseña) {
      newErrors.contraseña = "Las contraseñas no coinciden";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 🔹 Llamada al backend
      const res = await registerOwner({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.contraseña.trim(),
      });

      console.log("✅ Registro exitoso:", res);
      alert(res.message);

      // 🔹 Guardamos info útil en localStorage
      // ⚠️ Ajuste: el backend devuelve un objeto completo dentro de "id_dueno"
      localStorage.setItem("ownerId", String(res.id_dueno.id));
      localStorage.setItem("ownerEmail", formData.email);
      localStorage.setItem("ownerName", formData.nombre);

      // 🔹 Redirige al login
      navigate("/login");
    } catch (err: any) {
      console.error("❌ Error en registro:", err);
      alert(err.message || "Error al registrar el usuario");
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)]">
      {/* Columna izquierda */}
      <div className="flex flex-col justify-center items-center w-1/2 bg-white px-6 md:px-20">
        <div className="w-full max-w-sm">
          <h2 className="text-4xl font-bold text-[#0b2849] leading-tight text-center mb-2">
            Registrate
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Vas a poder publicar y administrar tus negocios en el mapa.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              className="input validator"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <input
              className="input validator"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
            <input
              className={`input validator ${errors.email ? "border-red-500" : ""}`}
              type="email"
              name="email"
              placeholder="mail@site.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="validator-hint text-red-500 text-sm">{errors.email}</div>
            )}
            <input
              className="input validator"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
            <input
              className="input validator"
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />
            <input
              className={`input validator ${errors.contraseña ? "border-red-500" : ""}`}
              type="password"
              name="repetirContraseña"
              placeholder="Repetir contraseña"
              value={formData.repetirContraseña}
              onChange={handleChange}
              required
            />
            {errors.contraseña && (
              <div className="validator-hint text-red-500 text-sm">
                {errors.contraseña}
              </div>
            )}

            <button
              type="submit"
              className="bg-[#0b2849] text-white py-2 rounded-full font-semibold hover:bg-[#143b6b] transition mt-2"
            >
              Crear cuenta
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-4">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-[#0b2849] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="flex justify-center items-center w-1/2 bg-[#41B1E3]">
        <img
          src={kayakImg}
          alt="Ilustración kayak"
          className="w-[80%] max-w-[480px] h-auto object-contain"
        />
      </div>
    </div>
  );
}
