import { Outlet } from "react-router-dom";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
