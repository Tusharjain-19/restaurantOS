import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { KitchenProtectedRoute } from "@/components/auth/KitchenProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AppLayout from "@/layouts/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const POS = lazy(() => import("@/pages/POS"));
const Tables = lazy(() => import("@/pages/Tables"));
const Kitchen = lazy(() => import("@/pages/Kitchen"));
const Billing = lazy(() => import("@/pages/Billing"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Reports = lazy(() => import("@/pages/Reports"));
const Staff = lazy(() => import("@/pages/Staff"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SuperAdmin = lazy(() => import("@/pages/SuperAdmin"));

const KitchenLogin = lazy(() => import("@/pages/kitchen/Login"));



const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />

              <Route path="/" element={
                <ProtectedRoute><AppLayout /></ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pos" element={<POS />} />
                <Route path="tables" element={<Tables />} />
                <Route path="kitchen" element={<Kitchen />} />
                <Route path="billing" element={<Billing />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="reports" element={<Reports />} />
                <Route path="staff" element={<Staff />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerProfile />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="/kitchen/login" element={<KitchenLogin />} />

              <Route path="super-admin" element={<SuperAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
