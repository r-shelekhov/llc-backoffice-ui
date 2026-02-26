import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { pathname } = useLocation();
  const isFullBleed = pathname === "/inbox";

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className={cn(
            "flex-1",
            isFullBleed
              ? "overflow-hidden pt-14"
              : "overflow-y-auto p-6 pt-20"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
