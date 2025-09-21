// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ApiProvider } from "./context/ApiContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BuyPage from "./pages/BuyPage";
import BuyDetail from "./pages/BuyDetail";
import Payment from "./pages/Payment";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import SellBike from "./pages/SellBike";

export default function App() {
  return (
    <ApiProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/buy" element={<BuyPage />} />
            <Route path="/buy/:id" element={<BuyDetail />} />

            <Route path="/payment/booking/:bookingId" element={<Payment />} />
            <Route path="/payment/product/:productId" element={<Payment />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sell" element={<SellBike />} />
            <Route
              path="*"
              element={
                <div className="min-h-[60vh] flex items-center justify-center p-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
                    <p className="text-gray-600">Sorry — the page you requested does not exist.</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ApiProvider>
  );
}
