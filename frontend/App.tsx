import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clerkPublishableKey } from "./config";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import KebunPage from "./pages/KebunPage";
import PanenPage from "./pages/PanenPage";
import PupukPage from "./pages/PupukPage";
import LaporanPage from "./pages/LaporanPage";
import PaketPage from "./pages/PaketPage";
import PaymentPage from "./pages/PaymentPage";
import AkunPage from "./pages/AkunPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPaketPage from "./pages/admin/AdminPaketPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  if (!clerkPublishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 bg-card rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-foreground">Konfigurasi Diperlukan</h1>
          <p className="text-muted-foreground">
            Silakan atur <code className="bg-muted px-2 py-1 rounded">clerkPublishableKey</code> di file{" "}
            <code className="bg-muted px-2 py-1 rounded">frontend/config.ts</code>
          </p>
          <p className="text-sm text-muted-foreground">
            Anda dapat menemukan publishable key di Infrastructure tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kebun"
              element={
                <ProtectedRoute>
                  <KebunPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/panen"
              element={
                <ProtectedRoute>
                  <PanenPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pupuk"
              element={
                <ProtectedRoute>
                  <PupukPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/laporan"
              element={
                <ProtectedRoute>
                  <LaporanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paket"
              element={
                <ProtectedRoute>
                  <PaketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/akun"
              element={
                <ProtectedRoute>
                  <AkunPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/paket"
              element={
                <ProtectedRoute>
                  <AdminPaketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute>
                  <AdminPaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
