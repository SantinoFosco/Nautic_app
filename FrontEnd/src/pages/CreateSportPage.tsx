import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { createSport } from "../api/admin";
import { ArrowLeft } from "lucide-react";

// Estado inicial para una variable
const varTemplate = { umbral_min: 0, umbral_max: 0, peso: 0, operador: "between" };

export default function CreateSportPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Estados para las 3 variables importantes
  const [windSpeed, setWindSpeed] = useState(varTemplate);
  const [waveHeight, setWaveHeight] = useState(varTemplate);
  const [windGust, setWindGust] = useState(varTemplate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Armamos el payload de 'variables' que el backend espera
      const payloadDeVariables = [
        { nombre_variable: "wind_speed", ...windSpeed },
        { nombre_variable: "waveHeight", ...waveHeight },
        { nombre_variable: "wind_gustValue", ...windGust },
      ];

      await createSport({
        nombre,
        descripcion,
        variables: payloadDeVariables,
      });

      alert("¡Deporte creado con éxito!");
      navigate("/admin/deportes"); // Vuelve a la lista
    } catch (err) {
      console.error("Error al crear deporte:", err);
      alert("No se pudo crear el deporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
        <button
        onClick={() => navigate("/admin/deportes")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0b2849] font-medium mb-4 transition-colors" >
        <ArrowLeft className="w-4 h-4" />
        Volver a Gestionar Deportes
      </button>
      <h2 className="text-3xl font-bold text-[#0b2849] mb-2">
        Crear Nuevo Deporte
      </h2>
      <p className="text-gray-500 mb-8">
        Define las reglas principales para el cálculo del puntaje.
      </p>

      <form onSubmit={handleSubmit} className="w-4/4 mx-auto bg-white rounded-xl shadow border border-gray-200 p-8 space-y-8" >
        {/* Sección 1: Datos Generales */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0b2849]">
            Datos Generales
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Deporte
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="biz-input" // 👈 Estilo reutilizado
              placeholder="Ej: Surf"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="biz-textarea" // 👈 Estilo reutilizado
              rows={3}
              placeholder="Una breve descripción del deporte"
            />
          </div>
        </section>

        {/* Sección 2: Variables */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-[#0b2849]">
            Variables Principales
          </h3>

          {/* Grupo Viento */}
          <VariableInputGroup
            label="Velocidad del Viento (wind_speed)"
            state={windSpeed}
            setState={setWindSpeed}
          />
          {/* Grupo Olas */}
          <VariableInputGroup
            label="Altura de Olas (waveHeight)"
            state={waveHeight}
            setState={setWaveHeight}
          />
          {/* Grupo Ráfagas */}
          <VariableInputGroup
            label="Ráfaga de Viento (wind_gustValue)"
            state={windGust}
            setState={setWindGust}
          />
        </section>

        {/* Botón de envío */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0b2849] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#143b6b] transition disabled:bg-gray-400"
          >
            {loading ? "Creando..." : "Crear Deporte"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

// === Componente Auxiliar para el Formulario ===
function VariableInputGroup({ label, state, setState }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      // Convierte a número si es umbral o peso
      [name]: name === "operador" ? value : Number(value),
    }));
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <label className="block text-base font-medium text-gray-800 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-3">
        {/* Operador */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Operador</label>
          <select
            name="operador"
            value={state.operador}
            onChange={handleChange}
            className="biz-input" // 👈 Estilo reutilizado
          >
            <option value="between">Entre (between)</option>
            <option value="min">Mínimo (min)</option>
            <option value="max">Máximo (max)</option>
          </select>
        </div>
        {/* Umbral Mínimo */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Umbral Mín.</label>
          <input
            type="number"
            name="umbral_min"
            value={state.umbral_min}
            onChange={handleChange}
            className="biz-input"
          />
        </div>
        {/* Umbral Máximo */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Umbral Máx.</label>
          <input
            type="number"
            name="umbral_max"
            value={state.umbral_max}
            onChange={handleChange}
            className="biz-input"
          />
        </div>
        {/* Peso */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Peso</label>
          <input
            type="number"
            name="peso"
            value={state.peso}
            onChange={handleChange}
            className="biz-input"
          />
        </div>
      </div>
    </div>
  );
}