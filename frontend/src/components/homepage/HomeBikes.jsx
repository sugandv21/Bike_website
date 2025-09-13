import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ccImg from "../../assets/images/cc.png";

export default function HomeBikes({ ids = [1, 2, 3], highlightFirst = true }) {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchByCsv = async (idsArr) => {
    const csv = idsArr.join(",");
    const resp = await axios.get("/buybikes/", { params: { ids: csv } });
    const data = resp.data;
    return Array.isArray(data) ? data : data.results ? data.results : [];
  };

  const fetchIndividually = async (idsArr) => {
    const results = [];
    for (const id of idsArr) {
      try {
        const r = await axios.get(`/buybikes/${id}/`);
        results.push(r.data);
      } catch (err) {
        console.warn(`Failed to fetch bike id ${id}`, err);
      }
    }
    return results;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        let list = [];
        try {
          list = await fetchByCsv(ids);
        } catch (err) {
          console.warn("CSV fetch failed, falling back to individual fetch", err);
        }

        if (!Array.isArray(list) || list.length === 0) {
          list = await fetchIndividually(ids);
        }

        if (mounted) {
          const byId = {};
          list.forEach((item) => {
            if (item && item.id !== undefined) byId[item.id] = item;
          });

          const ordered = ids.map((id) => byId[id]).filter(Boolean);
          setBikes(ordered);
        }
      } catch (err) {
        console.error("Failed to fetch home bikes", err);
        if (mounted) setError("Unable to load bikes");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(ids)]);

  return (
    <section className="py-12 px-6">
      <h2 className="text-3xl font-bold text-center mb-8">Our Few Bikes</h2>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {bikes.map((b, i) => (
            <Link key={b.id} to={`/buy/${b.id}`} className="group">
              <article className="relative rounded-lg overflow-hidden shadow-md flex flex-col h-full transition-transform transform hover:-translate-y-1">
                <div className="relative h-64 flex items-center justify-center bg-gradient-to-b from-[#0f172a]/5 to-transparent">
                  {b.card_bg_image_url && (
                    <img
                      src={b.card_bg_image_url}
                      alt="card bg"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 1 }}
                    />
                  )}

                  <img
                    src={b.featured_image_url ?? b.featured_image ?? ""}
                    alt={b.title}
                    className="relative max-h-44 object-contain p-4 z-10"
                  />

                  {b.is_booked && (
                    <span className="absolute left-3 top-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full z-20">
                      Booked
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 flex-1 flex flex-col justify-between bg-[#e6fffe] ${
                    highlightFirst && i === 0
                      ? "border-2 border-violet-500"
                      : ""
                  }`}
                  style={{ borderRadius: 6 }}
                >
                  <div>
                    <h3 className="text-center font-semibold text-lg md:text-2xl mb-2">
                      {b.title}
                    </h3>

                    <div className="flex items-center justify-center gap-2 text-sm md:text-xl text-gray-900">
                      <div className="flex items-center gap-1">
                        <img src={ccImg} alt="cc" className="w-6 h-6" />
                        <span>{b.kilometers ?? "-"} Km</span>
                      </div>

                      <div>•</div>
                      <div>{b.fuel_type ?? ""}</div>
                      <div>•</div>
                      <div>{b.owner ?? ""}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {/* price stays centered */}
                    <div className="text-md md:text-2xl font-bold text-center">
                      ₹ {Number(b.price ?? 0).toLocaleString()}
                    </div>

                    {/* location row spans full width and is left aligned */}
                    <div className="flex items-center gap-2 mt-3 justify-start text-sm w-full">
                      {b.location_obj?.image_url && (
                        <img
                          src={b.location_obj.image_url}
                          alt={b.location_obj?.name}
                          className="w-5 h-5 object-cover rounded-full"
                        />
                      )}
                      <div className="text-md md:text-2xl text-gray-800">
                        {b.location_obj?.name ?? ""}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
