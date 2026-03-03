import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { InboxPage } from "@/pages/inbox-page";
import { BookingsPage } from "@/pages/bookings-page";
import { BookingDetailPage } from "@/pages/booking-detail-page";
import { BookingNewPage } from "@/pages/booking-new-page";
import { ClientsPage } from "@/pages/clients-page";
import { ClientDetailPage } from "@/pages/client-detail-page";
import { BillingPage } from "@/pages/billing-page";
import { InvoiceDetailPage } from "@/pages/invoice-detail-page";
import { AdminUsersPage } from "@/pages/admin-users-page";
import { NotFoundPage } from "@/pages/not-found-page";

function ConversationRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/inbox?id=${id}`} replace />;
}

function InvoiceRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/billing/${id}`} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/inbox" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="my-queue" element={<InboxPage myConversationsOnly />} />
            <Route path="conversations/:id" element={<ConversationRedirect />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/new" element={<BookingNewPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="billing/:id" element={<InvoiceDetailPage />} />
            <Route path="invoices" element={<Navigate to="/billing" replace />} />
            <Route path="invoices/:id" element={<InvoiceRedirect />} />
            <Route path="payments" element={<Navigate to="/billing" replace />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
