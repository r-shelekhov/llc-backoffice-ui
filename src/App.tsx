import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { InboxPage } from "@/pages/inbox-page";
import { RequestDetailPage } from "@/pages/request-detail-page";
import { BookingsPage } from "@/pages/bookings-page";
import { BookingDetailPage } from "@/pages/booking-detail-page";
import { BookingNewPage } from "@/pages/booking-new-page";
import { ClientDetailPage } from "@/pages/client-detail-page";
import { InvoicesPage } from "@/pages/invoices-page";
import { InvoiceDetailPage } from "@/pages/invoice-detail-page";
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
            <Route path="conversations/:id" element={<RequestDetailPage />} />
            <Route path="requests/:id" element={<Navigate to="/inbox" replace />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/new" element={<BookingNewPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
