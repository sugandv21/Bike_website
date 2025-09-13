import React, { useEffect, useState } from "react";
import axios from "axios";


export default function AboutPage() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const ENDPOINT = `${API_BASE}/about/`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(ENDPOINT)
      .then((res) => {
        if (!mounted) return;
        // Normalise payloads that might come as array / results / data
        const payload = normalizePayload(res.data);
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Failed fetching About data", err);
        setError(err);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ENDPOINT]);

  function normalizePayload(payload) {
    if (!payload) return null;
    if (Array.isArray(payload)) return payload[0] || null;
    if (payload && payload.results && Array.isArray(payload.results)) return payload.results[0] || null;
    if (payload && payload.data) return payload.data;
    return payload;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-red-600">Unable to load content. Please check admin or API.</div>
      </div>
    );
  }

  const s1 = data.section1 || {};
  const s2 = data.section2 || {};
  const s3 = data.section3 || {};

  return (
    <main className="px-6 md:px-12 lg:px-24 py-12 max-w-7xl mx-auto">
      {/* Section 1: Image left, text right */}
      <section className="flex flex-col md:flex-row items-center gap-8 mb-12">
        {/* left image */}
        <div className="w-full md:w-1/2">
          <img
            src={s1.image}
            alt={s1.title || "About image"}
            className="w-full h-auto rounded-3xl object-cover shadow-md"
            loading="lazy"
          />
        </div>

        {/* right text */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">
            {s1.title}
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {s1.content}
          </p>
        </div>
      </section>

      {/* Section 2: Wide rounded image with overlay text bottom-left */}
      <section className="mb-12">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-lg">
          <img
            src={s2.background_image}
            alt={s2.overlay_title || "Banner"}
            className="w-full h-56 md:h-44 lg:h-72 object-cover filter brightness-90"
            loading="lazy"
          />

          {/* overlay bubble (example a small white circle like the design) */}
          <div className="absolute left-6 top-6 w-10 h-10 rounded-full bg-white/90 blur-[0.5px]" />

          {/* overlay text at bottom-left */}
          <div className="absolute left-6 bottom-6 max-w-md bg-white/30 backdrop-blur-md p-4 rounded-xl">
            <h3 className="font-semibold text-slate-900 text-lg">{s2.overlay_title}</h3>
            <p className="text-slate-700 text-sm mt-2">{s2.overlay_text}</p>
          </div>
        </div>
      </section>

      {/* Section 3: left text, right 2x2 images grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-slate-800 mb-3">{s3.title}</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{s3.content}</p>
        </div>

        {/* Section 3 images (fixed) */}
<div className="lg:col-span-2 grid grid-cols-2 gap-4">
  {(() => {
    // debug: inspect the incoming images shape
    console.log("Section3 images payload:", s3.images);

    const imgs = Array.isArray(s3.images) ? s3.images.slice(0, 4) : [];

    return imgs.map((item, idx) => {
      // support both: item can be a string URL OR an object { image: 'url', ... }
      const url =
        typeof item === "string"
          ? item
          : item && (item.image || item.url || item.file) // common variants
          ? (item.image || item.url || item.file)
          : "";

      if (!url) return null; // skip empty entries

      return (
        <div
          key={idx}
          className={`rounded-xl overflow-hidden ${idx === 1 ? "self-end" : ""} shadow`}
        >
          <img
            src={url}
            alt={`gallery-${idx}`}
            className="w-full h-48 md:h-56 object-cover"
            loading="lazy"
          />
        </div>
      );
    });
  })()}
</div>

      </section>

      {/* Small footer spacing */}
      <div className="h-12" />
    </main>
  );
}
