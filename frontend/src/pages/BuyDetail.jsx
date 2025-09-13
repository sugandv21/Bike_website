// src/pages/BuyDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import ccImg from "../assets/images/cc.png";
import locationImg from "../assets/images/location.png";

/* ---------------- Vite env + axios instance ---------------- */
export const getApiBase = () => import.meta?.env?.VITE_API_BASE || "";
export const API_BASE = getApiBase().replace(/\/$/, ""); // remove trailing slash

export const api = axios.create({
  baseURL: API_BASE || undefined,
  // optional: timeout: 10000,
});

/* Add request interceptor to attach Authorization header from localStorage */
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore localStorage errors
  }
  return config;
}, (error) => Promise.reject(error));

/* ---------------- Component ---------------- */
export default function BuyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(null);

  const [creatingBooking, setCreatingBooking] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [errorInfo, setErrorInfo] = useState(null);
  const [bikeNotFound, setBikeNotFound] = useState(false);
  const [hasBookedTestRide, setHasBookedTestRide] = useState(false);

  useEffect(() => {
    fetchBike();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Normalize/make absolute URLs for paths returned by API.
  // If the path is already an absolute URL (starts with http), return as-is.
  const makeUrl = (path) => {
    if (!path) return "";
    if (typeof path !== "string") return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // if it's relative like "/media/..." or "media/..." and API_BASE is set, prefix API_BASE
    const withSlash = path.startsWith("/") ? path : `/${path}`;
    if (!API_BASE) return withSlash;
    return `${API_BASE}${withSlash}`.replace(/([^:]\/)\/+/g, "$1");
  };

  // Helper used both when setting initial active image and building thumbnails
  const normUrl = (p) => {
    if (!p) return null;
    if (typeof p !== "string") return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return makeUrl(p);
  };

  // Choose an initial image: prefer featured -> variant1..5 -> gallery entries
  const pickInitialFromData = (data) => {
    if (!data) return null;
    const candidates = [
      data.featured_image_url ?? data.featured_image,
      data.variant_image1_url ?? data.variant_image1,
      data.variant_image2_url ?? data.variant_image2,
      data.variant_image3_url ?? data.variant_image3,
      data.variant_image4_url ?? data.variant_image4,
      data.variant_image5_url ?? data.variant_image5,
      ...(Array.isArray(data.gallery_urls) ? data.gallery_urls : (Array.isArray(data.gallery) ? data.gallery : []))
    ].filter(Boolean);
    return candidates.length ? candidates[0] : null;
  };

  async function fetchBike() {
    setLoading(true);
    setBike(null);
    setBikeNotFound(false);
    setErrorInfo(null);

    const url = `/buybikes/${id}/`; // relative to api base
    try {
      console.info("[BuyDetail] GET", url);
      const res = await api.get(url);
      setBike(res.data);

      // set active image using normalized URL so thumbnail equality checks work
      const initial = pickInitialFromData(res.data);
      setActiveImg(initial ? normUrl(initial) : null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.warn(`[BuyDetail] Bike not found (404): ${id}`);
        setBikeNotFound(true);
      } else {
        console.error("[BuyDetail] GET failed:", {
          message: err.message,
          status: err.response ? err.response.status : null,
          data: err.response ? err.response.data : null,
        });
        setErrorInfo({
          triedUrl: makeUrl(url),
          message: err.message,
          status: err.response ? err.response.status : null,
          data: err.response ? err.response.data : null,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const ownersText = Array.isArray(bike?.owners) ? bike.owners.join(", ") : bike?.owners || bike?.owner || "-";

  // Book test ride
  const handleBookTestRide = async () => {
    if (!bike) return;
    setCreatingBooking(true);

    try {
      const payload = {
        buybike: bike.id,
        test_drive_fee: 1000,
        amount: bike.price || 0,
      };

      const candidates = ["/bookings/", "/booking/", "/api/bookings/"];
      let booking = null;
      let lastError = null;

      for (const endpoint of candidates) {
        try {
          console.info("[BookTestRide] POST", endpoint, payload);
          const res = await api.post(endpoint, payload);
          console.info("[BookTestRide] response", res.status, res.data);

          const data = res.data;
          if (data) {
            if (data.id) {
              booking = data;
            } else if (data.booking && data.booking.id) {
              booking = data.booking;
            } else if (data.data && data.data.id) {
              booking = data.data;
            } else if (typeof data === "object" && Object.keys(data).length === 1 && data[Object.keys(data)[0]]?.id) {
              booking = Object.values(data)[0];
            }
          }

          if (booking && booking.id) break;
          lastError = { endpoint, status: res.status, data };
        } catch (err) {
          const status = err.response?.status;
          console.warn("[BookTestRide] POST failed", endpoint, { status, data: err.response?.data, message: err.message });
          if (status === 401 || status === 403) {
            throw new Error("Authentication required. Please login and try again.");
          }
          lastError = { endpoint, status, data: err.response?.data, message: err.message };
          continue;
        }
      }

      if (!booking || !booking.id) {
        const serverMsg = lastError?.data?.detail || lastError?.data || lastError?.message;
        const userMsg = serverMsg ? `Server response: ${JSON.stringify(serverMsg)}` : "backend did not return id.";
        throw new Error(userMsg);
      }

      setHasBookedTestRide(true);
      alert("Test ride booked successfully! You can proceed to Buy Now.");
    } catch (err) {
      console.error("handleBookTestRide error:", err);
      const friendly = (err?.message && err.message.length < 500) ? err.message : "Could not book test ride. Check console & network tab.";
      alert(`Could not book test ride. ${friendly}`);
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleBuyNow = () => {
    if (!bike) return;
    setCreatingOrder(true);

    try {
      const testdrive = hasBookedTestRide ? 1 : 0;
      navigate(`/payment/product/${bike.id}?testdrive=${testdrive}`);
    } catch (err) {
      console.error("handleBuyNow error:", err);
      alert("Could not proceed to payment. Check console.");
    } finally {
      setTimeout(() => setCreatingOrder(false), 200);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading bike...</div>;

  if (bikeNotFound) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <div className="font-semibold text-yellow-800 mb-2">Bike not found</div>
          <div className="text-sm text-gray-700">The bike you requested (id: {id}) does not exist.</div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded">Back</button>
            <button onClick={fetchBike} className="px-4 py-2 border rounded">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700 mb-2">Could not load bike details</div>

          {errorInfo ? (
            <div className="text-sm text-gray-800 mb-3">
              Tried: <code>{errorInfo.triedUrl}</code>
              <br />
              Status: {errorInfo.status ?? "no response"}
              <br />
              Error: {errorInfo.message}
              {errorInfo.data && (
                <>
                  <div className="mt-2 font-medium">Server response:</div>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify(errorInfo.data, null, 2)}</pre>
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-700 mb-3">Unknown error — check console and network tab.</div>
          )}

          <div className="flex gap-2">
            <button onClick={fetchBike} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
            <button onClick={() => window.open(API_BASE || "/", "_blank")} className="px-4 py-2 border rounded">Open API base</button>
          </div>
        </div>
      </div>
    );
  }


  const thumbnails = [
    bike.featured_image_url ?? bike.featured_image,
    bike.variant_image1_url ?? bike.variant_image1,
    bike.variant_image2_url ?? bike.variant_image2,
    bike.variant_image3_url ?? bike.variant_image3,
    bike.variant_image4_url ?? bike.variant_image4,
    bike.variant_image5_url ?? bike.variant_image5,
    ...(Array.isArray(bike.gallery_urls) ? bike.gallery_urls : (Array.isArray(bike.gallery) ? bike.gallery : []))
  ]
    .map(normUrl)
    .filter(Boolean);

  return (
    <div className="max-w-8xl mx-auto px-6 md:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
  {/* Main media (takes 2 cols on lg) */}
  <div className="lg:col-span-2">
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="rounded-lg overflow-hidden bg-gray-50">
        {/* Responsive image container:
            - mobile: h-64, sm: h-80, md: h-[380px], lg: h-[450px]
            - center & contain image, with optional dark overlay when bg image present */}
        <div
          className="relative w-full h-64 sm:h-80 md:h-[380px] lg:h-[450px] flex items-center justify-center bg-gray-100"
          style={{
            backgroundImage: bike.card_bg_image_url ? `url(${makeUrl(bike.card_bg_image_url)})` : undefined,
            backgroundSize: bike.card_bg_image_url ? "cover" : undefined,
            backgroundPosition: bike.card_bg_image_url ? "center" : undefined,
          }}
        >
          {bike.card_bg_image_url && (
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          )}

          {activeImg ? (
            <img
              src={activeImg}
              alt={bike.title}
              className="relative z-10 w-full h-full object-contain p-4 sm:p-6"
            />
          ) : (
            <div className="relative z-10 text-gray-500">No image</div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 overflow-x-auto px-2 py-2 bg-[#e1f0fb]">
          {thumbnails.map((t, idx) => (
            <button
              key={`${t}-${idx}`}
              onClick={() => setActiveImg(t)}
              className={`ms-2 flex-shrink-0 w-28 sm:w-32 md:w-32 h-20 sm:h-24 rounded-md overflow-hidden border ${activeImg === t ? "ring-2 ring-[#0b6a99]" : "border-gray-200"}`}
              title={`View image ${idx + 1}`}
            >
              <img src={t} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>

  <aside className="space-y-6">
    <div className="bg-white rounded-lg p-6 shadow border">
      <div className="text-lg md:text-2xl font-semibold text-[#0b4b58]">{bike.title}</div>

      <div className="flex items-center gap-2 text-md md:text-xl text-gray-600 mt-2">
        <img src={ccImg} alt="cc" className="w-5 h-5 object-contain" />
        <span>
          {bike.kilometers ? `${bike.kilometers} Km` : "-"} • {ownersText}
        </span>
      </div>

      <div className="mt-4 text-center">
        <div className="text-md md:text-xl font-bold">₹ {Number(bike.price || 0).toLocaleString()}</div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {bike.location_obj?.image_url ? (
          <img
            src={bike.location_obj.image_url}
            alt={bike.location_obj.name ?? "location"}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = locationImg;
            }}
          />
        ) : null}

        <div className="font-medium text-md md:text-xl">{bike.location_obj?.name ?? "-"}</div>
      </div>

     <div className="flex flex-col items-stretch gap-3 mt-10">
  <button
    onClick={handleBookTestRide}
    disabled={creatingBooking}
    className={`relative overflow-hidden py-3 rounded-lg ${creatingBooking ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-b from-[#1bb4f5] to-[#235a72]"} w-full`}
  >
    <div className="text-md md:text-2xl font-medium">
      {creatingBooking ? "Creating booking..." : "Book Test Ride"}
    </div>
    <div className="text-md md:text-xl mt-1">₹1000/- Refundable for Next Three Days</div>
  </button>

  <div className="text-lg mt-4">Interested in Buying this Bike ?</div>

  <button
    onClick={handleBuyNow}
    disabled={creatingOrder}
    className={`text-md md:text-xl py-3 my-16 text-white ${creatingOrder ? "bg-gray-400 cursor-not-allowed" : "bg-[#235A72] rounded-3xl"} w-full`}
  >
    {creatingOrder ? "Proceeding..." : "Buy Now"}
  </button>
</div>

    </div>
  </aside>
</div>




      {/* OVERVIEW */}
      <div className="mt-6">
  <div className="rounded-xl border shadow-xl bg-white p-6">
    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6">Bike OverView</h3>

    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-[310px] flex-shrink-0">
        <div className="bg-[#d9d9d9] rounded-md p-4 text-sm md:text-base lg:text-lg [&_*]:text-sm md:[&_*]:text-base lg:[&_*]:text-lg">
          <Row label="Bike Brand" value={bike.brand || "-"} link />
          <Hr />
          <Row label="Bike Model" value={bike.bike_model || bike.category || "-"} link />
          <Hr />
          <Row label="Bike Variant" value={bike.bike_variant || (bike.engine_cc ? `${bike.engine_cc}CC` : "-")} link />
          <Hr />
          <Row label="Make Year" value={bike.year || "-"} link />
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm md:text-base lg:text-xl [&>*]:text-sm md:[&>*]:text-base lg:[&>*]:text-lg">
          <div>
            <Row label="Refurbished" value={yesNo(bike.refurbished)} link />
            <Hr />
            <Row label="RTO State" value={bike.rto_state || bike.location_obj?.name || "-"} link />
            <Hr />
            <Row label="RTO City" value={bike.rto_city || "-"} link />
            <Hr />
            <Row label="Registration Year" value={bike.registration_year || "-"} />
          </div>

          <div>
            <Row label="Kilometers" value={bike.kilometers ? `${bike.kilometers}Km` : "-"} link />
            <Hr />
            <Row label="Owners" value={ownersText} link />
            <Hr />
            <Row label="Transmission" value={bike.transmission || "-"} link />
            <Hr />
            <Row label="Fuel Type" value={bike.fuel_type || "-"} link />
          </div>

          <div>
            <Row label="Registration Certificate" value={yesNo(bike.registration_certificate)} link />
            <Hr />
            <Row label="Finance" value={yesNo(bike.finance)} link />
            <Hr />
            <Row label="Insurance" value={yesNo(bike.insurance)} link />
            <Hr />
            <Row label="Warrenty" value={yesNo(bike.warranty)} link />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* LAST SECTION: 3-step images from admin */}
      <div className="mt-4 ">
        <ThreeStepSection
          heading={bike?.last_section?.heading ?? bike?.common_heading ?? "Book This Bike in 3 Easy Steps"}
          items={bike?.last_section?.images ?? bike?.section_images ?? null}
          fetchUrl="/last-section/"
        />
      </div>

      {/* BIKE SPECIFICATION - last section */}
      <div className="mt-2">
        <BikeSpecification bike={bike} />
      </div>
    </div>
  );
}

/* Helpers */
function Row({ label, value, link }) {
  return (
    <div className="flex justify-between items-center py-2">
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <div className={`text-sm font-semibold ${link ? "text-[#07435c]" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}
function Hr() {
  return <div className="border-t border-gray-300" />;
}
function yesNo(v) {
  return v === true || v === "Yes" || v === "yes" ? "Yes" : v === false || v === "No" || v === "no" ? "No" : v || "-";
}

/* ---------------- ThreeStepSection (inlined) ----------------
   - Uses bike.last_section or bike.section_images if available
   - Otherwise fetches fetchUrl (default /last-section/) via api
   - Normalizes common field names and sorts by order
   - Renders arrows BETWEEN items on desktop (not inside cards)
----------------------------------------------------------------*/
function ThreeStepSection({ heading, items = null, fetchUrl = "/last-section/" }) {
  const [data, setData] = React.useState(items);
  const [loading, setLoading] = React.useState(!items);
  const [error, setError] = React.useState(null);
  const [localHeading, setLocalHeading] = React.useState(heading);

  React.useEffect(() => {
    if (items) {
      setData(items);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await api.get(fetchUrl);
        if (!mounted) return;
        const payload = (res && res.data) ? res.data : [];
        const imgs = payload.images ?? (Array.isArray(payload) ? payload : []);
        setData(imgs);
        if (!localHeading && payload.heading) setLocalHeading(payload.heading);
      } catch (err) {
        console.error("ThreeStepSection fetch failed", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [items, fetchUrl]);

  const normalized = (data || [])
    .map((it, idx) => {
      const rawUrl = it.image_url ?? it.image ?? it.img ?? it.image_url_full ?? "";

      const image_url = rawUrl && !rawUrl.startsWith("http") && API_BASE ? `${API_BASE}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}` : rawUrl;
      return {
        id: it.id ?? idx,
        image_url,
        title: it.title ?? it.image_title ?? it.caption ?? `Step ${idx + 1}`,
        order: Number.isFinite(+it.order_no) ? +it.order_no : (Number.isFinite(+it.order) ? +it.order : (it.order === 0 ? 0 : (it.position ?? idx))),
      };
    })
    .sort((a, b) => (a.order - b.order));

  if (loading) return <div className="py-8 text-center">Loading section...</div>;
  if (error) return <div className="py-8 text-center text-red-600">Could not load section</div>;

  const DesktopArrow = () => (
    <div className="hidden md:flex items-center px-4">
      <svg width="72" height="24" viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M2 12H62" stroke="#0b4b58" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M54 4L62 12L54 20" stroke="#0b4b58" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  return (
    <section className="w-full max-w-10xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">{localHeading ?? "Book This Bike in 3 Easy Steps"}</h2>
      </div>

      <div className="bg-white p-6 ">
        {/* Desktop: row with arrows between items. Mobile: stacked column. */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-6">
          {normalized.length === 0 ? (
            <div className="text-center text-sm text-gray-500 w-full py-6">No steps available</div>
          ) : (
            // Build interleaved structure: [item, arrow, item, arrow, item]
            normalized.flatMap((it, idx) => {
              const itemNode = (
                <div key={`item-${it.id}`} className="flex-1 flex flex-col items-center text-center gap-3" aria-label={`Step ${idx + 1}: ${it.title}`}>
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {it.image_url ? (
                      <img src={it.image_url} alt={it.title || `step-${idx + 1}`} loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-sm text-gray-400 px-2">No image</div>
                    )}
                  </div>

                  <div className="text-base md:text-lg font-medium">{it.title}</div>
                </div>
              );

              // if last item, just return the item; otherwise return [item, arrow]
              if (idx < normalized.length - 1) {
                return [itemNode, <div key={`arrow-${idx}`} className="flex items-center"><DesktopArrow /></div>];
              }
              return itemNode;
            })
          )}
        </div>

        {/* mobile stacked arrows (unchanged) */}
        <div className="md:hidden mt-4 flex flex-col items-center gap-6">
          {normalized.length > 1 && normalized.slice(0, normalized.length - 1).map((_, i) => (
            <div key={`m-arrow-${i}`} className="w-full flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 4v12" stroke="#0b4b58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 10l-6 6-6-6" stroke="#0b4b58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

 /* ---------------- BikeSpecification component ----------------*/
function SpecCell({ label, value }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-800 mb-2">{label}</div>
      <div className="text-[#0b4b58] font-medium">{value ?? "-"}</div>
    </div>
  );
}

function BikeSpecification({ bike }) {
  // map fields with fallbacks
  const spec = {
    type: bike?.category || bike?.type || bike?.bike_model || "-",
    color: bike?.color || "-",
    fuel_type: bike?.fuel_type || "-",
    ignition_type: bike?.ignition_type || "-",
    transmission_type: bike?.transmission ? (typeof bike.transmission === "string" ? bike.transmission : bike.transmission) : "-",
    front_brake_type: bike?.front_brake_type || "-",
    rear_brake_type: bike?.rear_brake_type || "-",
    abs: (bike?.abs === true || bike?.abs === "Yes" || bike?.abs === "yes") ? "Yes" : ((bike?.abs === false || bike?.abs === "No" || bike?.abs === "no") ? "No" : "-"),
    odometer: bike?.odometer || "-",
    wheel_type: bike?.wheel_type || bike?.wheeletype || "-",
  };

  return (
    <section className="w-full max-w-10xl mx-auto px-2 py-6">
      <div className="rounded-xl border shadow-xl bg-[#fcfafc] p-6">
        <h3 className="text-xl font-semibold mb-6">Bike Specification</h3>

        <div className="space-y-8">
          {/* first row - many columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-x-6 gap-y-6 items-start">
            <SpecCell label="Type" value={spec.type} />
            <SpecCell label="Color" value={spec.color} />
            <SpecCell label="Fuel Type" value={spec.fuel_type} />
            <SpecCell label="Ignition Type" value={spec.ignition_type} />
            <SpecCell label="Transmission Type" value={spec.transmission_type} />
            <SpecCell label="Front Brake Type" value={spec.front_brake_type} />
            <SpecCell label="Rear Brake Type" value={spec.rear_brake_type} />
          </div>

          {/* second row - fewer columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-x-2 gap-y-6 items-start">
            <SpecCell label="ABS" value={spec.abs} />
            <SpecCell label="Odometer" value={spec.odometer} />
            <SpecCell label="Wheeltype" value={spec.wheel_type} />
          </div>
        </div>
      </div>
    </section>
  );
}
