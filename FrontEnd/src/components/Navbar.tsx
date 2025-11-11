import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserRound, ShieldCheck } from "lucide-react";
import logo from "../assets/nautic-logo.png";
import { apiFormPOST } from "../api/client";
import { listMyBusinesses } from "../api/businessOwner";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [hasBusiness, setHasBusiness] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await apiFormPOST("/user/logout", {}); // borra la sesión del middleware
    } finally {
      localStorage.removeItem("ownerId");
      localStorage.removeItem("ownerEmail");
      localStorage.removeItem("userType");
      localStorage.removeItem("hasBusiness");
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const storedType = localStorage.getItem("userType");
    setUserType(storedType);
    setHasBusiness(localStorage.getItem("hasBusiness") === "true");
  }, [location.pathname]);

  const handleProfileClick = async () => {
    const storedType = localStorage.getItem("userType");
    if (!storedType) return navigate("/login");
    if (storedType === "admin") return navigate("/admin-dashboard");

    const ownerId = localStorage.getItem("ownerId");
    if (!ownerId) return navigate("/login");

    try {
      const negocio = await listMyBusinesses(ownerId);
      localStorage.setItem("hasBusiness", "true");
      setHasBusiness(true);

      if ((negocio.estado || "").toLowerCase() === "pendiente") {
        alert("Tu negocio está pendiente de habilitación. Te avisaremos cuando sea aprobado.");
      }

      navigate("/business-edit");
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes(": 404")) {
        localStorage.setItem("hasBusiness", "false");
        setHasBusiness(false);
        navigate("/business");
        return;
      }
      if (msg.includes(": 403")) {
        alert("Tu negocio está pendiente de aprobación.");
        return;
      }
      if (msg.includes(": 401")) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      navigate("/login");
    }
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-[#F5C518] font-semibold"
      : "text-white hover:text-[#F5C518] transition";

  return (
    <nav
      className={`
        fixed top-0 inset-x-0 z-[1000]
        bg-[#0D3B66] text-white shadow-md h-16
        flex items-center justify-between px-8
      `}
      role="navigation"
      aria-label="Nautic main"
    >
      {/* IZQUIERDA: Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Nautic" className="h-10 w-auto object-contain" />
      </div>

      {/* CENTRO: menú (centrado óptico) */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <ul className="flex items-center gap-10 text-sm">
          <li>
            <Link to="/" className={isActive("/")}>Mapa</Link>
          </li>
          <li>
            <Link to="/spots" className={isActive("/spots")}>Spots</Link>
          </li>
          <li>
            <Link to="/negocios" className={isActive("/negocios")}>Negocios</Link>
          </li>
        </ul>
      </div>

      {/* DERECHA: Acciones o perfil */}
      {userType ? (
        <div className="flex items-center gap-3">
          <button
            onClick={handleProfileClick}
            className="border border-white/80 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-white hover:text-[#0D3B66] transition-colors"
          >
            {userType === "admin" ? (
              <>
                <ShieldCheck className="w-5 h-5 inline-block mr-1" />
                Panel admin
              </>
            ) : (
              <>
                <UserRound className="w-5 h-5 inline-block mr-1" />
                {hasBusiness ? "Mi negocio" : "Mis datos"}
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="border border-white/80 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-white hover:text-[#0D3B66] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className={`
              border border-white/80 text-white px-4 py-2 rounded-md
              text-sm font-medium hover:bg-white hover:text-[#0D3B66]
              transition-colors
            `}
          >
            Registrar negocio
          </Link>
          <Link
            to="/login"
            className={`
              border border-white/80 text-white px-4 py-2 rounded-md
              text-sm font-medium hover:bg-white hover:text-[#0D3B66]
              transition-colors
            `}
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
