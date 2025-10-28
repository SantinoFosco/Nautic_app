import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import ForecastPage from "./components/ForecastPage";
import Register from "./components/Register";
import Login from "./components/Login";
import Business from "./components/BusinessEmptyState";
import BusinessRegister from "./components/BusinessRegister";
import BusinessSuccess from "./components/BusinessSuccess";

function Layout() {
  const location = useLocation();

  // 🔹 Páginas que deben mostrarse en "pantalla completa" (sin fondo gris)
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
          <Route path="/business" element={<Business />} />
          <Route path="/business-register" element={<BusinessRegister />} />
          <Route path="/business-success" element={<BusinessSuccess />} />
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
