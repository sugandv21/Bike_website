// src/pages/Payment.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import amazonImg from "../assets/images/amazonpay.png";
import phonepeImg from "../assets/images/phonepay.png";
import gpayImg from "../assets/images/gpay.png";
import paytmImg from "../assets/images/paytm.png";

// <-- Put your success GIF here. Replace path if needed. -->
import bookingSuccessGif from "../assets/images/payment.gif";

/* Safe API base detection (works for CRA & Vite) */
const getApiBase = () => {
  try {
    if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) {
      return process.env.REACT_APP_API_BASE;
    }
  } catch (e) {}
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) {
      return import.meta.env.VITE_API_BASE;
    }
  } catch (e) {}
  return "";
};
const API_BASE = getApiBase().replace(/\/$/, "");
const makeUrl = (path) => {
  if (!path.startsWith("/")) path = `/${path}`;
  if (!API_BASE) return path;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, "$1");
};

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", type: "text" },
  { id: "netbanking", label: "NetBanking", type: "text" },
  { id: "gpay", label: "GPay", type: "image", src: gpayImg },
  { id: "paytm", label: "Paytm", type: "image", src: paytmImg },
  { id: "phonepe", label: "PhonePe", type: "image", src: phonepeImg },
  { id: "amazon", label: "AmazonPay", type: "image", src: amazonImg },
];

export default function Payment() {
  const { bookingId, productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const testDriveFlag = params.get("testdrive") === "1";

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null);
  const [booking, setBooking] = useState(null);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [attemptedUrls, setAttemptedUrls] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("paytm");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    if (bookingId) {
      setMode("booking");
      fetchBookingOrFallback(bookingId);
    } else if (productId) {
      setMode("product");
      fetchProductOrFallback(productId);
    } else {
      setError("No bookingId or productId provided in URL.");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, productId, location.search]);

  useEffect(() => {
    // lock body scroll while success modal visible
    if (showSuccessModal) {
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevBodyOverflow || "";
      };
    }
    return undefined;
  }, [showSuccessModal]);

  useEffect(() => {
    // cleanup timeout on unmount
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    };
  }, []);

  /* Attempt booking fetch across common paths (/bookings/:id/ and /api/bookings/:id/) */
  async function fetchBookingOrFallback(id) {
    setLoading(true);
    setError(null);
    setAttemptedUrls([]);
    const candidates = [
      makeUrl(`/bookings/${id}/`),
      makeUrl(`/api/bookings/${id}/`),
      makeUrl(`/bookings/${id}`),
      makeUrl(`/api/bookings/${id}`),
    ];

    for (const url of candidates) {
      try {
        console.info("[Payment] Trying booking GET", url);
        setAttemptedUrls((s) => [...s, url]);
        const res = await axios.get(url);
        setBooking(res.data);
        setLoading(false);
        return;
      } catch (err) {
        console.warn("[Payment] booking GET failed", { url, status: err.response?.status, message: err.message });
        continue;
      }
    }

    // all candidates failed
    setLoading(false);
    setError("Booking not found (404) or backend unreachable. Check attempted URLs below.");
  }

  /* Attempt product fetch across common paths (/buybikes/:id/ and /api/buybikes/:id/) */
  async function fetchProductOrFallback(id) {
    setLoading(true);
    setError(null);
    setAttemptedUrls([]);
    const candidates = [
      makeUrl(`/buybikes/${id}/`),
      makeUrl(`/api/buybikes/${id}/`),
      makeUrl(`/buybikes/${id}`),
      makeUrl(`/api/buybikes/${id}`),
    ];

    for (const url of candidates) {
      try {
        console.info("[Payment] Trying product GET", url);
        setAttemptedUrls((s) => [...s, url]);
        const res = await axios.get(url);
        setProduct(res.data);
        setLoading(false);
        return;
      } catch (err) {
        console.warn("[Payment] product GET failed", { url, status: err.response?.status, message: err.message });
        continue;
      }
    }

    setLoading(false);
    setError("Product not found (404) or backend unreachable. Check attempted URLs below.");
  }

  const subtotal = useMemo(() => {
    if (mode === "booking" && booking) return Number(booking.amount || 0);
    if (mode === "product" && product) return Number(product.price || 0);
    return 0;
  }, [mode, booking, product]);

  const testDriveFee = useMemo(() => {
    // booking provides server value
    if (mode === "booking" && booking) return Number(booking.test_drive_fee || 0);
    // product flow uses query param passed from BuyDetail
    if (mode === "product") return testDriveFlag ? 1000 : 0;
    return 0;
  }, [mode, booking, product, testDriveFlag]);

  const gst = useMemo(() => {
    if (mode === "booking" && booking) return Number(booking.gst_amount || 0);
    return Number((subtotal * 0.18).toFixed(2));
  }, [mode, booking, subtotal]);

  const grandTotal = useMemo(() => {
    if (mode === "booking" && booking) return Number(booking.total_amount || subtotal + gst + testDriveFee);
    return Number((subtotal + gst + testDriveFee).toFixed(2));
  }, [mode, booking, subtotal, gst, testDriveFee]);

  const showSuccessThenRedirect = () => {
    setShowSuccessModal(true);
    // wait 2s then go to homepage
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccessModal(false);
      successTimeoutRef.current = null;
      navigate("/");
    }, 2200);
  };

  const handleConfirm = async () => {
    setProcessing(true);
    setError(null);

    try {
      if (mode === "booking" && booking) {
        // confirm lightweight endpoint
        const candidates = [
          makeUrl(`/bookings/${booking.id}/confirm-payment/`),
          makeUrl(`/api/bookings/${booking.id}/confirm-payment/`),
        ];
        let ok = false;
        for (const url of candidates) {
          try {
            await axios.post(url, {});
            ok = true;
            break;
          } catch (err) {
            console.warn("Confirm POST failed", url, err.response?.status);
            continue;
          }
        }
        if (!ok) throw new Error("Could not confirm booking (endpoint not found).");
        // show modal then redirect to homepage
        showSuccessThenRedirect();
        return;
      }

      if (mode === "product" && productId) {
        // create booking on server (try /bookings/ and /api/bookings/)
        const createCandidates = [makeUrl("/bookings/"), makeUrl("/api/bookings/")];
        let created = null;
        for (const url of createCandidates) {
          try {
            const payload = {
              buybike: Number(productId),
              test_drive_fee: testDriveFlag ? 1000 : 0, // pass test drive fee according to query param
            };
            const res = await axios.post(url, payload);
            created = res.data;
            break;
          } catch (err) {
            console.warn("Create booking POST failed", url, err.response?.status);
            continue;
          }
        }
        if (!created || !created.id) throw new Error("Booking creation failed (no id). See console.");
        // optionally confirm (same logic as above)
        const confirmCandidates = [
          makeUrl(`/bookings/${created.id}/confirm-payment/`),
          makeUrl(`/api/bookings/${created.id}/confirm-payment/`),
        ];
        for (const url of confirmCandidates) {
          try {
            await axios.post(url, {});
            break;
          } catch (err) {
            continue;
          }
        }
        // show modal then redirect to homepage
        showSuccessThenRedirect();
        return;
      }

      throw new Error("Invalid flow");
    } catch (err) {
      console.error("handleConfirm error:", err);
      setError(err?.response?.data?.detail || err?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  // Render
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <>
      <div className="max-w-8xl mx-auto px-4 sm:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* left */}
          <div className="lg:col-span-8">
            <div className="rounded-lg border border-[#0b5f78] p-6 bg-white shadow-sm">
              <h2 className="text-center text-lg font-semibold text-[#07435c] mb-6">Select Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                    onClick={() => setSelectedMethod(m.id)}
                  >
                    <div className="flex items-center gap-4">
                      {m.type === "image" ? (
                        <div className="w-12 h-10 flex items-center justify-center rounded-md bg-white border">
                          <img src={m.src} alt={m.label} className="max-h-8 object-contain" />
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-800">{m.label}</div>
                      )}
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 border-[#0b4b58] flex items-center justify-center ${
                        selectedMethod === m.id ? "bg-[#0b4b58]" : "bg-white"
                      }`}
                    >
                      {selectedMethod === m.id && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* right */}
          <div className="lg:col-span-4">
            <div className="rounded-lg border border-gray-200 p-6 pb-60 bg-white shadow-sm">
              <div className="text-sm text-gray-500 mb-4">Order Summary</div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><div>SubTotal</div><div>Rs.{subtotal.toFixed(2)}</div></div>
                <div className="flex justify-between"><div>GST (18%)</div><div>Rs.{gst.toFixed(2)}</div></div>
                <div className="flex justify-between"><div>Test Drive</div><div>Rs.{testDriveFee.toFixed(2)}</div></div>

                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <div className="text-base font-semibold">Grand Total</div>
                  <div className="text-base font-bold">Rs.{grandTotal.toFixed(2)}</div>
                </div>
              </div>

              {error && <div className="mt-3 text-sm text-red-600">{String(error)}</div>}

              <button
                onClick={handleConfirm}
                disabled={processing}
                className={`mt-6 w-full rounded-full py-3 text-white font-medium ${processing ? "bg-gray-400" : "bg-[#07435c]"}`}
              >
                {processing ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
{showSuccessModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    role="dialog"
    aria-modal="true"
    aria-label="Booking confirmed"
  >
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl w-full max-w-xl mx-auto text-center border-2 border-blue-500">
      <div className="flex justify-center mb-4">
        <img
          src={bookingSuccessGif}
          alt="Booking Confirmed"
          className="w-40 h-40 md:w-48 md:h-48 object-contain"
        />
      </div>
      <h3 className="text-2xl md:text-3xl font-semibold text-[#07435c] mb-3">
        Booking Confirmed
      </h3>
      <p className="text-lg md:text-xl text-gray-700">
        The Bike is Yours — Enjoy Your Journey
      </p>
    </div>
  </div>
)}

    </>
  );
}
