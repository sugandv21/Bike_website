// src/pages/SellBike.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SellBike() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").trim();
  const ENDPOINT = `${API_BASE.replace(/\/$/, "")}/api/sellbike/`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [year, setYear] = useState("");
  const [kms, setKms] = useState("");
  const [owner, setOwner] = useState("");

  // Price modal state
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [priceResult, setPriceResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const absolutify = (url) => {
    if (!url) return "";
    if (/^(https?:)?\/\//i.test(url)) return url;
    try {
      const origin = new URL(API_BASE).origin;
      return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
    } catch {
      return `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
    }
  };

  const extractUrl = (val) => {
    if (!val) return "";
    if (typeof val === "string") return absolutify(val);
    if (typeof val === "object") {
      const url = val.image || val.url || val.file || "";
      return url ? absolutify(url) : "";
    }
    return "";
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(ENDPOINT)
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
      })
      .catch((err) => {
        console.error("[SellBike] Failed fetching SellBike data", err);
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ENDPOINT]);

  if (loading) return <p className="text-center mt-10 text-xl">Loading...</p>;

  if (error)
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">Error loading SellBike page. See console for details.</p>
      </div>
    );

  if (!data) return null;

  const parseCSV = (text) =>
    (text || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const brandOptions = parseCSV(data.brand_options);
  const modelOptions = parseCSV(data.model_options);
  const variantOptions = parseCSV(data.variant_options);
  const kmsOptions = parseCSV(data.kms_options);
  const ownerOptions = parseCSV(data.owner_options);

  const howItWorks = Array.isArray(data.how_it_works) ? data.how_it_works : [];

  const fallbackCalculatePrice = ({ brand, model, variant, year, kmsDriven, ownerCount }) => {
    const base = 50000;
    const brandFactor = (brand ? brand.length : 3) * 200;
    const modelFactor = (model ? model.length : 3) * 150;
    const variantFactor = (variant ? variant.length : 2) * 100;
    const yearNum = parseInt(year, 10) || 2015;
    const ageFactor = Math.max(0, new Date().getFullYear() - yearNum) * 800;
    const kmsNum = parseInt((kmsDriven || "").replace(/\D/g, ""), 10) || 10000;
    const kmsFactor = Math.min(20000, Math.floor(kmsNum / 1000) * 400);
    const ownerFactor = (ownerCount ? parseInt(ownerCount, 10) : 1) * 1500;
    const computed = Math.max(2000, base + brandFactor + modelFactor + variantFactor - ageFactor - kmsFactor - ownerFactor);
    return Math.round(computed / 100) * 100;
  };

  const handleGetPrice = async () => {
    setPriceError(null);
    setPriceResult(null);

    if (!brand || !model || !year) {
      setPriceError("Please choose Brand, Model and enter Year to get a price.");
      setIsModalOpen(true);
      return;
    }

    setPriceLoading(true);
    setIsModalOpen(true);

    const payload = { brand, model, variant, year, kms, owner };
    try {
      const priceUrl = `${ENDPOINT.replace(/\/$/, "")}/price/`;
      const res = await axios.post(priceUrl, payload, { timeout: 10000 });
      if (res && res.data && (res.data.price || typeof res.data.price === "number")) {
        setPriceResult({
          amount: res.data.price,
          currency: res.data.currency || "INR",
          meta: res.data,
        });
      } else {
        const fallback = fallbackCalculatePrice({ brand, model, variant, year, kmsDriven: kms, ownerCount: owner });
        setPriceResult({ amount: fallback, currency: "INR", meta: { fallback: true } });
      }
    } catch (err) {
      const fallback = fallbackCalculatePrice({ brand, model, variant, year, kmsDriven: kms, ownerCount: owner });
      setPriceResult({ amount: fallback, currency: "INR", meta: { fallback: true, error: err?.message || "" } });
    } finally {
      setPriceLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPriceError(null);
  };

  return (
    <div className="w-full">
      {/* Top Banner */}
      <div className="relative">
        <img
          src={extractUrl(data.top_banner_image)}
          alt="Top Banner"
          className="w-full h-[150px] sm:h-[300px] md:h-[350px] lg:h-[400px] object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-start bg-black/10">
          <p
            className="text-black mx-4 sm:mx-10 backdrop-blur-40 text-base sm:text-xl md:text-3xl lg:text-5xl max-w-xl p-4 sm:p-6 bg-[#D9D9D9]/30 rounded text-center md:text-left"
            style={{ textShadow: "2px 2px 4px #2794C2" }}
          >
            {data.top_banner_text}
          </p>
        </div>
      </div>

      {/* Second Banner */}
      <div className="relative my-6 md:my-8 border-4 md:border-8 border-[#235A72] rounded-xl md:rounded-2xl mx-2 sm:mx-4">
        <img
          src={extractUrl(data.second_banner_image)}
          alt="Second Banner"
          className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover rounded-xl sm:rounded-2xl"
          loading="lazy"
        />

        {/* Update badge (top-right) */}
        <div className="absolute top-3 right-3 z-20">
          <span
            title="Update"
            className="inline-block px-3 py-1 rounded-full text-sm sm:text-base font-semibold"
            style={{
              background: "linear-gradient(180deg, #ffffff, #D9D9D9)",
              color: "#0a0a8b",
              boxShadow: "0 3px 8px rgba(37,90,114,0.18)",
              fontFamily: "'Sonsie One', cursive",
            }}
          >
            Update
          </span>
        </div>

        <div className="absolute top-3 md:top-6 left-1/2 transform -translate-x-1/2 text-center text-dark w-[90%]">
          <h2
            className="text-lg sm:text-2xl md:text-3xl font-bold"
            dangerouslySetInnerHTML={{ __html: data.second_banner_top_text || "" }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/10 px-2">
          {/* Restored compact pill-style form */}
          <div className="bg-white shadow-lg rounded-lg lg:rounded-4xl px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap gap-0 items-center w-full max-w-6xl justify-center overflow-hidden">
            {/* Each control visually separated by a thin vertical rule; small placeholders inside */}
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="appearance-none p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none border-r border-[#c8c8c8] bg-transparent"
            >
              <option value="">Brand Name</option>
              {brandOptions.length ? brandOptions.map((b, i) => <option key={i} value={b}>{b}</option>) : <option value="">-</option>}
            </select>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="appearance-none p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none border-r border-[#c8c8c8] bg-transparent"
            >
              <option value="">Model</option>
              {modelOptions.length ? modelOptions.map((m, i) => <option key={i} value={m}>{m}</option>) : <option value="">-</option>}
            </select>

            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="appearance-none p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none border-r border-[#c8c8c8] bg-transparent"
            >
              <option value="">Variant</option>
              {variantOptions.length ? variantOptions.map((v, i) => <option key={i} value={v}>{v}</option>) : <option value="">-</option>}
            </select>

            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year"
              className="p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none border-r border-[#c8c8c8] bg-transparent w-20 sm:w-28"
            />

            <select
              value={kms}
              onChange={(e) => setKms(e.target.value)}
              className="appearance-none p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none border-r border-[#c8c8c8] bg-transparent"
            >
              <option value="">KMs Driven</option>
              {kmsOptions.length ? kmsOptions.map((k, i) => <option key={i} value={k}>{k}</option>) : <option value="">-</option>}
            </select>

            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="appearance-none p-2 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none bg-transparent"
            >
              <option value="">Owner</option>
              {ownerOptions.length ? ownerOptions.map((o, i) => <option key={i} value={o}>{o}</option>) : <option value="">-</option>}
            </select>

            <button
              onClick={handleGetPrice}
              disabled={priceLoading}
              className="ml-3 bg-[#d9d9d9] hover:bg-[#e0e0e0] text-black px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold"
            >
              {priceLoading ? "Checking..." : "Get Price"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-white/40 backdrop-blur-xl rounded-lg p-2 text-sm sm:text-base md:text-lg">
          <p className="text-center text-black font-medium">{data.second_banner_bottom_text}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="text-center py-8 sm:py-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">{data.third_title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {howItWorks.length ? (
            howItWorks.map((item, idx) => {
              const id = item?.id ?? idx;
              const title = item?.title ?? "";
              const imgUrl = extractUrl(item?.image);
              return (
                <div key={id} className="flex flex-col items-center p-2 sm:p-4">
                  <img src={imgUrl} alt={title || `how-it-${idx}`} className="w-32 sm:w-48 md:w-56 h-auto object-contain mb-3 sm:mb-4" loading="lazy" />
                  <p className="text-lg sm:text-xl md:text-2xl font-medium">{title}</p>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-slate-600">No steps configured yet.</p>
          )}
        </div>
      </div>

      {/* Price Modal */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg z-10">
            <button aria-label="Close" onClick={closeModal} className="absolute right-3 top-3 rounded px-2 py-1 hover:bg-gray-100">✕</button>
            <h3 className="text-lg font-semibold mb-3">Estimated Price</h3>
            {priceLoading ? (
              <p>Calculating price…</p>
            ) : priceError ? (
              <div className="text-red-600"><p>{priceError}</p></div>
            ) : priceResult ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  {priceResult.currency === "INR" || !priceResult.currency ? "₹" : `${priceResult.currency} `}{priceResult.amount.toLocaleString()}
                </p>
                {priceResult.meta?.fallback && <p className="text-sm text-gray-600">Estimate Price</p>}
                <div className="mt-4 flex gap-2">
                  <button onClick={closeModal} className="px-4 py-2 rounded bg-[#235A72] text-white font-semibold">Close</button>
                </div>
              </div>
            ) : (
              <p>No price available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
