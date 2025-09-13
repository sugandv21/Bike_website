// src/components/AboutSection1.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function normalizePayload(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (payload && payload.results && Array.isArray(payload.results)) return payload.results[0] || null;
  if (payload && payload.data && typeof payload.data === "object") return payload.data;
  if (typeof payload === "object") return payload;
  return null;
}

function buildUrl(base, path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!base) return path;
  const cleanedBase = base.replace(/\/+$/, "");
  const cleanedPath = path.replace(/^\/+/, "");
  return `${cleanedBase}/${cleanedPath}`;
}

export default function AboutSection1({ apiUrl = "/api/about/section1/" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      // Read Vite env and detect dev mode
      const rawViteBase = (import.meta.env?.VITE_API_BASE_URL || "").trim();
      const isDev = Boolean(import.meta.env?.DEV);

      // primary URL (uses env if set, otherwise uses relative path)
      const primaryBase = rawViteBase || "";
      const primaryUrl = buildUrl(primaryBase, apiUrl);

      // safe dev fallback (only used automatically in dev)
      const devFallbackBase = "http://127.0.0.1:8000";
      const fallbackUrl = buildUrl(devFallbackBase, apiUrl);

      console.debug("AboutSection1: attempting fetch", { primaryBase, apiUrl, primaryUrl, isDev, fallbackUrl });

      async function tryFetch(url) {
        try {
          const res = await axios.get(url);
          return { ok: true, res };
        } catch (err) {
          return { ok: false, err };
        }
      }

      // 1) Try primary URL
      const first = await tryFetch(primaryUrl);
      if (first.ok) {
        const obj = normalizePayload(first.res?.data);
        if (!obj && first.res?.data) console.warn("AboutSection1: unexpected response shape", first.res.data);
        if (mounted) setData(obj);
        if (mounted) setLoading(false);
        return;
      }

      // If primary failed, log details
      console.warn("AboutSection1: primary fetch failed", {
        url: primaryUrl,
        message: first.err?.message,
        code: first.err?.code,
        responseStatus: first.err?.response?.status,
      });

      // 2) If in dev, try fallback to localhost backend (useful when VITE_API_BASE_URL not set and vite isn't proxying)
      if (isDev && primaryUrl !== fallbackUrl) {
        console.debug("AboutSection1: attempting dev fallback fetch to", fallbackUrl);
        const second = await tryFetch(fallbackUrl);
        if (second.ok) {
          const obj = normalizePayload(second.res?.data);
          if (!obj && second.res?.data) console.warn("AboutSection1: unexpected response shape (fallback)", second.res.data);
          if (mounted) setData(obj);
          if (mounted) setLoading(false);
          return;
        }

        console.warn("AboutSection1: fallback fetch also failed", {
          url: fallbackUrl,
          message: second.err?.message,
          code: second.err?.code,
          responseStatus: second.err?.response?.status,
        });
      }

      // nothing worked — surface the first error (or fallback error) to the UI
      const errToShow = first.err || new Error("Failed to fetch About section");
      if (mounted) setError(errToShow);
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading) {
    return (
      <section className="w-full py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto h-40 flex items-center justify-center">Loading section…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto h-40 flex flex-col items-center justify-center text-red-600">
          <div>Failed to load About section.</div>
          <div className="text-sm text-gray-500 mt-2">Check console / network for details.</div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const heading = data.heading || data.title || "About Us";
  const content = data.content || data.body || "";
  const imageUrl = data.image_url || data.image || null;
  const alt = data.alt_text || data.alt || heading;

  return (
    <section className="w-full py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 flex justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                console.warn("AboutSection1: image failed to load", imageUrl);
              }}
              className="w-full h-auto max-w-md object-contain rounded-xl shadow"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">No image</div>
          )}
        </div>

        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-900 mb-6">{heading}</h2>
          <div className="text-gray-700 text-base md:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </section>
  );
}
