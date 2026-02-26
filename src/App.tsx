import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { InboxPage } from "@/pages/inbox-page";
import { RequestDetailPage } from "@/pages/request-detail-page";
import { ClientDetailPage } from "@/pages/client-detail-page";
import { InvoicesPage } from "@/pages/invoices-page";
import { PaymentsPage } from "@/pages/payments-page";
import { AdminUsersPage } from "@/pages/admin-users-page";
import { NotFoundPage } from "@/pages/not-found-page";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/inbox" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
