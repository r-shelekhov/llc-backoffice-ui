import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { pathname } = useLocation();
  const isFullBleed = pathname === "/inbox";
  const isDetailPage = /^\/(bookings|invoices)\/[^/]+$/.test(pathname);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-y-auto",
          !isFullBleed && !isDetailPage && "p-6",
          isFullBleed && "overflow-hidden"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
