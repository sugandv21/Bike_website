import React, { createElement, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo1.png";



export default function SellBike() {
  const API_BASE = useMemo(() => (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").trim(), []);
  const ENDPOINT = useMemo(() => `${API_BASE.replace(/\/$/, "")}/api/sellbike/`, [API_BASE]);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE.replace(/\/$/, ""),
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }),
    [API_BASE]
  );

  // data / fetch state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // form state
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [year, setYear] = useState("");
  const [kms, setKms] = useState("");
  const [owner, setOwner] = useState("");

  const [activeField, setActiveField] = useState(null); 
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);

  const containerRef = useRef(null);
  const fieldRefs = useRef({});

  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [priceResult, setPriceResult] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

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

  const parseList = (thing) => {
    if (!thing) return [];
    if (Array.isArray(thing)) return thing.map((s) => String(s).trim()).filter(Boolean);
    if (typeof thing === "string") {
      return thing
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

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


  useEffect(() => {
    const source = axios.CancelToken.source();
    setLoading(true);
    setFetchError(null);
    api
      .get("/api/sellbike/", { cancelToken: source.token })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error("[SellBike] fetch failed", err);
        setFetchError(err);
      })
      .finally(() => setLoading(false));

    return () => {
      source.cancel("component unmounted");
    };
  }, [api]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchInput), 180);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  useEffect(() => {
    const onDocClick = (e) => {
      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(e.target)) {
        setActiveField(null);
        setSearchInput("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActiveField(null);
        setIsPriceModalOpen(false);
        setPriceError(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isPriceModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isPriceModalOpen]);

 
  if (loading) return <p className="text-center mt-10 text-xl">Loading...</p>;
  if (fetchError)
    return (
      <div className="text-center mt-10">
        <p className="text-red-600">Error loading SellBike page. See console for details.</p>
      </div>
    );
  if (!data) return null;

  const brandOptions = parseList(data.brand_options);
  const modelOptions = parseList(data.model_options);
  const variantOptions = parseList(data.variant_options);
  const kmsOptions = parseList(data.kms_options);
  const ownerOptions = parseList(data.owner_options);

  const optionsMap = {
    brand: brandOptions,
    model: modelOptions,
    variant: variantOptions,
    kms: kmsOptions,
    owner: ownerOptions,
  };

  const filteredOptions = activeField && optionsMap[activeField]
    ? optionsMap[activeField].filter((opt) => opt.toLowerCase().includes((debouncedSearch || "").toLowerCase()))
    : [];


  const openFieldDropdown = (field) => {
    setActiveField((prev) => (prev === field ? null : field));
    setSearchInput("");
  };

  const handleSelectOption = (field, value) => {
    if (field === "brand") setBrand(value);
    if (field === "model") setModel(value);
    if (field === "variant") setVariant(value);
    if (field === "kms") setKms(value);
    if (field === "owner") setOwner(value);
    setActiveField(null);
    setSearchInput("");
  };

  const handleApplyYearFromDropdown = (val) => {
    const cleaned = String(val).replace(/\D/g, "");
    setYear(cleaned);
    setActiveField(null);
    setSearchInput("");
  };

  const handleGetPrice = async () => {
    setPriceError(null);
    setPriceResult(null);

    if (!brand || !model || !year) {
      setPriceError("Please choose Brand, Model and enter Year to get a price.");
      setIsPriceModalOpen(true);
      return;
    }
    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1950 || yearNum > new Date().getFullYear()) {
      setPriceError(`Enter a valid year between 1950 and ${new Date().getFullYear()}`);
      setIsPriceModalOpen(true);
      return;
    }

    setPriceLoading(true);
    setIsPriceModalOpen(true);

    const payload = {
      brand,
      model,
      variant,
      year: yearNum,
      kms: kms ? parseInt(String(kms).replace(/\D/g, ""), 10) : null,
      owner: owner ? parseInt(String(owner).replace(/\D/g, ""), 10) : null,
    };

    try {
      // straightforward post - adjust if your backend path differs
      const res = await api.post("/api/sellbike/price/", payload);
      if (res && res.data && (typeof res.data.price === "number" || res.data.price)) {
        setPriceResult({ amount: res.data.price, currency: res.data.currency || "INR", meta: res.data });
      } else {
        const fallback = fallbackCalculatePrice({ brand, model, variant, year, kmsDriven: kms, ownerCount: owner });
        setPriceResult({ amount: fallback, currency: "INR", meta: { fallback: true } });
      }
    } catch (err) {
      console.error("[SellBike] Price fetch error:", err);
      const fallback = fallbackCalculatePrice({ brand, model, variant, year, kmsDriven: kms, ownerCount: owner });
      setPriceResult({ amount: fallback, currency: "INR", meta: { fallback: true, error: err?.message || "" } });
    } finally {
      setPriceLoading(false);
    }
  };

  const closePriceModal = () => {
    setIsPriceModalOpen(false);
    setPriceError(null);
    setPriceResult(null);
  };


  const renderDropdownFor = (field) => {
    if (activeField !== field) return null;
    if (field === "year") {
      return (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Enter year"
          className="absolute left-0 mt-1 w-full sm:w-64 bg-white border-2 border-[#235A72] rounded-lg shadow-lg z-[9999] p-3"
          style={{ minWidth: 180 }}
        >
          <label className="block text-sm mb-2 font-medium">Enter Year</label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min="1950"
              max={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter year"
              className="flex-1 p-2 border border-gray-200 rounded"
              aria-label="Enter year"
            />
            <button
              onClick={() => handleApplyYearFromDropdown(year)}
              className="px-3 py-2 rounded bg-[#235A72] text-white font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        role="dialog"
        aria-modal="false"
        aria-label={`${field} options`}
        className="absolute -left-10 mt-10 w-full sm:w-64 bg-white border-4 border-[#235A72] rounded-lg shadow-lg z-[9999] p-2"
        style={{ minWidth: 180 }}
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search ${field}...`}
          className="w-full p-2 mb-2 border border-gray-200 rounded"
          aria-label={`Search ${field}`}
        />
        <div>
          {filteredOptions.length ? (
            filteredOptions.map((opt, i) => (
              <button
                key={i}
                role="option"
                onClick={() => handleSelectOption(field, opt)}
                className="w-full text-left px-2 py-1 hover:bg-[#235A72] hover:text-white rounded mb-1"
              >
                {opt}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center">No options</p>
          )}
        </div>
      </div>
    );
  };


  const howItWorks = Array.isArray(data.how_it_works) ? data.how_it_works : [];

  return (
    <div className="w-full" ref={containerRef}>
      {/* Top Banner */}
      <div className="relative">
        <img src={extractUrl(data.top_banner_image)} alt="Top Banner" className="w-full h-[150px] sm:h-[300px] md:h-[350px] lg:h-[400px] object-cover" loading="lazy" />
        <div className="absolute inset-0 flex items-center justify-start bg-black/10">
          <p
            className="text-black mx-4 sm:mx-10 backdrop-blur-40 text-base sm:text-xl md:text-4xl font-bold max-w-xl p-4 sm:p-6 bg-[#D9D9D9]/30 rounded text-center"
            style={{ textShadow: "2px 2px 4px #2794C2", lineHeight: "3.5rem" }}
            dangerouslySetInnerHTML={{ __html: (data.top_banner_text || "").replace(/\n/g, "<br />") }}
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="relative my-6 md:my-8 border-4 md:border-8 border-[#235A72] rounded-xl md:rounded-2xl mx-2 sm:mx-4">
        <img src={extractUrl(data.second_banner_image)} alt="Second Banner" className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover rounded-xl sm:rounded-2xl" loading="lazy" />

        <div className="absolute top-3 md:top-6 left-1/2 transform -translate-x-1/2 text-dark w-[90%] flex items-center justify-center gap-2">

  <h2
    className="text-lg sm:text-2xl md:text-3xl font-bold text-center"
    dangerouslySetInnerHTML={{ __html: data.second_banner_top_text || "" }}
  />
    <img
    src={logo}
    alt="Site logo"
    className="w-10 h-10 sm:w-12 sm:h-12 md:w-44 md:h-48 object-contain"
    loading="lazy"
  />
</div>


        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center px-2">
          <div className="absolute inset-0 top-0 left-1/2 transform -translate-x-1/2 w-full max-w-7xl h-auto bg-black opacity-50 filter blur-[5px] rounded-[20px]" />

          <div className="relative z-10 w-full max-w-7xl px-1 sm:px-6 py-4 flex flex-col items-center gap-2">
            <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center mb-2">Enter Your Details</p>

            <div className="bg-white bg-opacity-90 shadow-lg rounded-2xl px-1 sm:px-6 py-3 flex flex-wrap gap-3 items-center justify-center w-full overflow-visible">

              {/* Brand */}
              <div className="relative" style={{ minWidth: 140 }}>
                <button
                  ref={(el) => (fieldRefs.current.brand = el)}
                  onClick={() => openFieldDropdown("brand")}
                  className="text-left p-2 sm:p-3 text-xs sm:text-sm md:text-base font-bold focus:outline-none bg-transparent w-full sm:w-auto"
                  aria-haspopup="listbox"
                  aria-expanded={activeField === "brand"}
                >
                  {brand || "Brand Name"}
                </button>
                {renderDropdownFor("brand")}
              </div>

              {/* Model */}
              <div className="relative" style={{ minWidth: 160 }}>
                <button
                  ref={(el) => (fieldRefs.current.model = el)}
                  onClick={() => openFieldDropdown("model")}
                  className="text-left p-2 sm:p-3 text-xs sm:text-sm md:text-base font-bold focus:outline-none bg-transparent w-full sm:w-auto"
                  aria-haspopup="listbox"
                  aria-expanded={activeField === "model"}
                >
                  {model || "Model"}
                </button>
                {renderDropdownFor("model")}
              </div>

              {/* Variant */}
              <div className="relative" style={{ minWidth: 140 }}>
                <button
                  ref={(el) => (fieldRefs.current.variant = el)}
                  onClick={() => openFieldDropdown("variant")}
                  className="text-left p-2 sm:p-3 text-xs sm:text-sm md:text-base font-bold focus:outline-none bg-transparent w-full sm:w-auto"
                  aria-haspopup="listbox"
                  aria-expanded={activeField === "variant"}
                >
                  {variant || "Variant"}
                </button>
                {renderDropdownFor("variant")}
              </div>

              {/* Year */}
              <div className="relative" style={{ minWidth: 120 }}>
                <input
                  ref={(el) => (fieldRefs.current.year = el)}
                  type="text"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                  onFocus={() => openFieldDropdown("year")}
                  className="p-2 sm:p-3 text-xs sm:text-sm md:text-base font-bold text-black placeholder-black focus:outline-none bg-transparent w-20 sm:w-28"
                  placeholder="year"
                />
                {renderDropdownFor("year")}
              </div>

              {/* KMs */}
              <div className="relative" style={{ minWidth: 140 }}>
                <button
                  ref={(el) => (fieldRefs.current.kms = el)}
                  onClick={() => openFieldDropdown("kms")}
                  className="text-left p-2 sm:p-3 text-xs sm:text-sm md:text-base font-bold focus:outline-none bg-transparent w-full sm:w-auto"
                  aria-haspopup="listbox"
                  aria-expanded={activeField === "kms"}
                >
                  {kms || "KMs Driven"}
                </button>
                {renderDropdownFor("kms")}
              </div>

              {/* Owner */}
              <div className="relative" style={{ minWidth: 120 }}>
                <button
                  ref={(el) => (fieldRefs.current.owner = el)}
                  onClick={() => openFieldDropdown("owner")}
                  className="text-left p-2 sm:p-3 text-xs sm:text-sm md:text-base font-bold focus:outline-none bg-transparent w-full sm:w-auto"
                  aria-haspopup="listbox"
                  aria-expanded={activeField === "owner"}
                >
                  {owner || "Owner"}
                </button>
                {renderDropdownFor("owner")}
              </div>

              {/* Get Price */}
              <div className="flex items-center ml-2">
                <button
                  onClick={handleGetPrice}
                  disabled={priceLoading}
                  className="ml-3 bg-[#d9d9d9] hover:bg-[#e0e0e0] text-black px-6 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition-colors duration-200"
                >
                  {priceLoading ? "Checking..." : "Get Price"}
                </button>
              </div>

            </div>
          </div>
        </div>

<div
  className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 p-2 text-sm sm:text-base md:text-lg z-0 backdrop-blur-[7.5px] bg-white/80 rounded"
  style={{ borderRadius: 10 }}
>
  <p className="text-center text-black font-medium">
    {data.second_banner_bottom_text}{" "}
    <Link to="/contact" className="text-[#235A72] font-semibold underline">
      Click here
    </Link>
  </p>
</div>





        
      </div>

      {/* Price Modal rendered via Portal so it escapes stacking contexts */}
      {isPriceModalOpen &&
        createPortal(
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={closePriceModal} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg z-[100000] border-8 border-[#235A72]">
              <button aria-label="Close" onClick={closePriceModal} className="absolute right-3 top-3 rounded px-2 py-1 hover:bg-gray-100">
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-3">Estimated Price</h3>
              {priceLoading ? (
                <p>Calculating price…</p>
              ) : priceError ? (
                <div className="text-red-600"><p>{priceError}</p></div>
              ) : priceResult ? (
                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    {priceResult.currency === "INR" || !priceResult.currency ? "₹" : `${priceResult.currency} `} {Number(priceResult.amount).toLocaleString()}
                  </p>
                  {priceResult.meta?.fallback && <p className="text-sm text-gray-600">Estimate Price</p>}
                  <div className="mt-4 flex gap-2">
                    <button onClick={closePriceModal} className="px-4 py-2 rounded bg-[#235A72] text-white font-semibold">Close</button>
                  </div>
                </div>
              ) : (
                <p>No price available.</p>
              )}
            </div>
          </div>,
          document.body
        )}

     {/* Section 3 - How It Works */}
      <div className="text-center py-8 sm:py-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
          {data.third_title}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {data.how_it_works.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="flex flex-col items-center p-2 sm:p-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-32 sm:w-48 md:w-56 h-auto object-contain mb-3 sm:mb-4"
                />
                <p className="text-lg sm:text-xl md:text-2xl font-medium">
                  {item.title}
                </p>
              </div>

              {/* Show > only if not the last item */}
              {index < data.how_it_works.length - 1 && (
                <span className="text-3xl sm:text-4xl lg:text-9xl font-bold text-black mx-2">
                  &lt;
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
