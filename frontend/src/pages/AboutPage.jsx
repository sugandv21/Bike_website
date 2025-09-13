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
    if (payload && payload.results && Array.isArray(payload.results))
      return payload.results[0] || null;
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
        <div className="text-red-600">
          Unable to load content. Please check admin or API.
        </div>
      </div>
    );
  }

  const s1 = data.section1 || {};
  const s2 = data.section2 || {};
  const s3 = data.section3 || {};

  return (
    <main className="px-6 md:px-12 lg:px-12 py-12 max-w-7xl mx-auto">
      <section className="flex flex-col md:flex-row items-start gap-16 mb-12">
        <div className="w-full md:w-1/2">
          <img
            src={s1.image}
            alt={s1.title || "About image"}
            className="w-full h-auto max-h-[550px] "
            loading="lazy"
          />
        </div>

        <div className="w-full md:w-1/2 text-center ">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">
            {s1.title}
          </h2>
          <p
            className="text-slate-600 text-lg md:text-xl"
            style={{ lineHeight: "2" }}
          >
            {s1.content}
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-lg">
          <img
            src={s2.background_image}
            alt={s2.overlay_title || "Banner"}
            className="w-full h-56 md:h-44 lg:h-72 object-cover filter brightness-90"
            loading="lazy"
          />

          <div className="absolute right-6 bottom-6 text-center max-w-md bg-white/50 backdrop-blur-md p-4 rounded-xl">
            <h3 className="font-semibold text-slate-900 text-lg">
              {s2.overlay_title}
            </h3>
            <p className="text-slate-700 text-sm mt-2">{s2.overlay_text}</p>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-20 text-center">
        <div className="lg:col-span-1">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
            {s3.title}
          </h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line text-md md:text-lg">
            {s3.content}
          </p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            {s3.images[0] && (
              <div className="rounded-xl overflow-hidden shadow">
                <img
                  src={
                    s3.images[0].image ||
                    s3.images[0].url ||
                    s3.images[0].file ||
                    s3.images[0]
                  }
                  alt="gallery-0"
                  className="w-full h-48 md:h-56 object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {s3.images.slice(1, 3).map((item, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden shadow">
                  <img
                    src={item.image || item.url || item.file || item}
                    alt={`gallery-${idx + 1}`}
                    className="w-full h-32 md:h-40 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          {s3.images[3] && (
            <div className="rounded-xl overflow-hidden shadow flex">
              <img
                src={
                  s3.images[3].image ||
                  s3.images[3].url ||
                  s3.images[3].file ||
                  s3.images[3]
                }
                alt="gallery-3"
                className="w-80 object-cover h-[calc(14rem+10rem+1rem)] md:h-[calc(14rem+10rem+1rem)]"
              />
            </div>
          )}
        </div>
      </section>

      <div className="h-12" />
    </main>
  );
}
