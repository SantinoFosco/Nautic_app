import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import ForecastPage from "./components/ForecastPage";
import Register from "./components/Register";
import Login from "./components/Login";
import BusinessRegister from "./components/BusinessRegister";
import BusinessSuccess from "./components/BusinessSuccess";
import BusinessEdit from "./components/BusinessEdit";
import AdminDashboard from "./pages/AdminDashboard";
import BusinessPanel from "./components/BusinessPanel";
import BusinessEmptyState from "./components/BusinessEmptyState";
import FAQ from "./components/FAQ";
import BusinessesPage from "./pages/BusinessesPage";
import SpotsPage from "./pages/SpotsPage";
import PendingBusinessesPage from "./pages/PendingBusinessesPage";
import SportsManagementPage from "./pages/SportsManagementPage";
import CreateSportPage from "./pages/CreateSportPage";
import SpotsManagementPage from "./pages/SpotsManagementPage";
import CreateSpotPage from "./pages/CreateSpotPage";
import AdminAllBusinessesPage from "./pages/AdminAllBusinessesPage"; // 👈 Importar

function Layout() {
  const location = useLocation();

  // 🔹 Páginas que deben mostrarse en "pantalla completa" 
  const isFullScreen =
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname === "/business-register";

  return (
    <div
      className={
        isFullScreen
          ? "flex flex-col min-h-screen bg-white"
          : "flex flex-col min-h-screen bg-[#f7fafc]"
      }
    >
      {/* 🔹 Navbar visible en todas las páginas */}
      <Navbar />

      {/* 🔹 Contenedor principal */}
      <main
        className={
          isFullScreen
            ? "flex flex-1 justify-center items-stretch bg-white mt-[64px]"
            : "flex flex-1 mt-16"
        }
      >
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/forecast/:name" element={<ForecastPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/business-register" element={<BusinessRegister />} />
          <Route path="/business-success" element={<BusinessSuccess />} />
          <Route path="/business-edit" element={<BusinessEdit />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/negocios-pendientes" element={<PendingBusinessesPage />} />
          <Route path="/admin/deportes" element={<SportsManagementPage />} />
          <Route path="/admin/crear-deporte" element={<CreateSportPage />} />
          <Route path="/admin/spots" element={<SpotsManagementPage />} />
          <Route path="/admin/crear-spot" element={<CreateSpotPage />} />
          <Route path="/business-empty" element={<BusinessEmptyState />} />
          <Route path="/business" element={<BusinessPanel />} />
          <Route path="/spots" element={<SpotsPage />} />
          <Route path="/negocios" element={<BusinessesPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin/todos-negocios" element={<AdminAllBusinessesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
