import { useState } from "react";
import { PendingBusiness } from "../api/admin"; 


type Props = {
  business: PendingBusiness;
  onClose: () => void;
  onReject: (id: number) => Promise<void>;
};

export default function RejectBusinessModal({
  business,
  onClose,
  onReject,
}: Props) {
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onReject(business.id_negocio);
    setLoading(false);
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-red-700">Rechazar negocio</h3>
        <p className="text-sm text-gray-600 mt-2">
          ¿Estás seguro de que querés rechazar{" "}
          <strong>{business.nombre_fantasia}</strong>?
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Esta acción eliminará la solicitud permanentemente.
        </p>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
          >
            {loading ? "Eliminando..." : "Sí, rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}