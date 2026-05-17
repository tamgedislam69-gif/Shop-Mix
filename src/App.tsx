/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import WishlistPage from './pages/WishlistPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { AnimatePresence } from 'motion/react';
import WhatsAppButton from './components/WhatsAppButton';

import { HelmetProvider } from 'react-helmet-async';
import BackToTop from './components/BackToTop';
import PromoPopup from './components/PromoPopup';
import Preloader from './components/Preloader';
import CheckoutModal from './components/CheckoutModal';
import { AdminProcessSettings } from './components/AdminProcessSettings';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useApp();
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-grow pt-[104px] md:pt-[136px]">
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
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
      <PromoPopup />
      <Preloader />
      <CheckoutModal />
      <AdminProcessSettings />
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
