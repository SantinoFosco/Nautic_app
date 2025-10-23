import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import ForecastPage from "./components/ForecastPage";
import Register from "./components/Register";

function Layout() {
  const location = useLocation();
  const isFullScreen = location.pathname === "/register";

  return (
    <div
      className={
        isFullScreen
          ? "flex flex-col min-h-screen bg-white"
          : "flex flex-col min-h-screen bg-[#f7fafc]"
      }
    >
      <Navbar />

      <main
        className={
          isFullScreen
            ? // 🔹 layout especial para /register (pantalla completa)
              "flex flex-1 justify-center items-stretch bg-white mt-[64px]" 
            : // 🔹 layout normal
              "flex flex-1 mt-16"
        }
      >
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/forecast/:name" element={<ForecastPage />} />
          <Route path="/register" element={<Register />} />
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
