import { useNavigate } from "react-router-dom";
import { apiFormPOST } from "../api/client";

export default function LogoutButton({ to = "/login" }: { to?: string }) {
  const navigate = useNavigate();
  const onClick = async () => {
    try { await apiFormPOST("/user/logout", {}); } finally {
      // limpiar restos locales si usabas localStorage
      localStorage.removeItem("ownerId");
      localStorage.removeItem("ownerEmail");
      localStorage.removeItem("userType");
      localStorage.removeItem("hasBusiness");
      navigate(to, { replace: true });
    }
  };
  return <button className="btn btn-outline btn-sm" onClick={onClick}>Cerrar sesión</button>;
}
