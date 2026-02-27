import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { pathname } = useLocation();
  const isFullBleed = pathname === "/inbox";

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1",
          isFullBleed ? "overflow-hidden" : "overflow-y-auto p-6"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
