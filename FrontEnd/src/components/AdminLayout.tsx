import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Timer, ListChecks, Users } from "lucide-react";

// Componente hijo para el Sidebar
function SidebarItem({
  label,
  icon,
  path,
}: {
  label: string;
  icon: ReactNode;
  path: string;
}) {
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full text-left ${
        active
          ? "bg-[#0b2849] text-white"
          : "text-[#0b2849] hover:bg-[#0b2849] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

// Layout principal
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#f8fafc]">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-white text-[#0b2849] flex flex-col border-r border-gray-200">
        <nav className="flex flex-col gap-2 px-4 py-8 text-sm">
          <SidebarItem
            label="Dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            path="/admin-dashboard"
          />
          <SidebarItem
            label="Negocios pendientes"
            icon={<Timer className="w-4 h-4" />}
            path="/admin/negocios-pendientes"
          />
          <SidebarItem
            label="Todos los negocios"
            icon={<ListChecks className="w-4 h-4" />}
            path="/admin/todos-negocios"
          />
          <SidebarItem
            label="Deportes"
            icon={<Users className="w-4 h-4" />}
            path="/admin/deportes"
          />
        </nav>
      </aside>

        {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 bg-[#f8fafc] px-10 py-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}