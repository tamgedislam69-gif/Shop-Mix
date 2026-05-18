/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const WhatsAppButton = lazy(() => import('./components/WhatsAppButton'));
const BackToTop = lazy(() => import('./components/BackToTop'));
const PromoPopup = lazy(() => import('./components/PromoPopup'));
const Preloader = lazy(() => import('./components/Preloader'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const AdminProcessSettings = lazy(() => import('./components/AdminProcessSettings').then(m => ({ default: m.AdminProcessSettings })));

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
  </div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useApp();
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 selection:bg-primary/20 selection:text-primary">
      <Suspense fallback={<div className="h-20 bg-white shadow-sm border-b border-gray-100" />}>
        <Header />
      </Suspense>
      <main className="flex-grow pt-[104px] md:pt-[136px]">
        <Suspense fallback={<SuspenseFallback />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/track-order" element={<OrderTrackingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/secret-admin-access/*" 
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <WhatsAppButton />
        <BackToTop />
        <PromoPopup />
        <Preloader />
        <CheckoutModal />
        <AdminProcessSettings />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </HelmetProvider>
  );
}
