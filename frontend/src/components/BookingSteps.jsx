// src/components/BookingSteps.jsx
import React, { useEffect, useState } from "react";
import { api, API_BASE } from "../lib/api";

export default function BookingSteps({ max = 3 }) {
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSteps() {
      setLoading(true);
      setError(null);
      try {
        // build request path carefully: if API_BASE includes "/api", use relative path without duplicating
        const path = (API_BASE ? `${API_BASE}/booking-steps/` : "/booking-steps/");
        if (import.meta.env.DEV) console.info("[BookingSteps] GET", path);
        const res = await api.get(path);
        if (!mounted) return;
        // server should return an array
        setSteps(Array.isArray(res.data) ? res.data.slice(0, max) : []);
      } catch (err) {
        // log more detail for easier debugging
        console.error("BookingSteps fetch failed", err);
        if (!mounted) return;
        const status = err.response?.status;
        const data = err.response?.data;
        setError({
          message: err.message,
          status,
          data,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchSteps();
    return () => { mounted = false; };
  }, [max]);

  if (loading) return <div className="py-8 text-center">Loading steps…</div>;
  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        Failed to load steps
        <div className="text-xs mt-2">{error.status ? `HTTP ${error.status}` : ""}</div>
        {error.data && <pre className="text-xs max-w-md mx-auto mt-2 overflow-auto">{JSON.stringify(error.data, null, 2)}</pre>}
      </div>
    );
  }
  if (!steps || steps.length === 0) return null;

  return (
    <section className="my-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-xl md:text-2xl font-semibold mb-6">Book This Bike in 3 Easy Steps</h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {steps.map((s, idx) => (
            <div key={s.id ?? `step-${idx}`} className="flex-1 max-w-sm">
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title || `step-${idx+1}`} className="w-36 h-36 object-contain mb-4" />
                ) : (
                  <div className="w-36 h-36 bg-gray-100 rounded flex items-center justify-center mb-4 text-gray-400">No image</div>
                )}

                <div className="text-lg font-semibold">{s.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
