// src/components/HomeBanner.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * HomeBanner
 * - Fetches banner data from /homepage-banner/
 * - Row 1: title (left) and logo (right)
 * - Row 2: centered 3 columns: [icon] [value (big, stacked above caption)]
 *
 * Expects banner to include:
 *  - title
 *  - logo_url
 *  - background_image_url (optional)
 *  - stats: [{ id, icon_url, value, caption, is_visible }]
 *
 * The pickIconForStat helper keeps earlier selection logic if you used banner.* special images.
 */
export default function HomeBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get("/homepage-banner/");
        if (!mounted) return;
        setBanner(data);
      } catch (err) {
        console.error("Failed to fetch banner", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!banner) return null;

  const stats = (banner.stats || []).filter((s) => s.is_visible).slice(0, 3); // use first 3

  const pickIconForStat = (stat) => {
    const cap = (stat.caption || "").toLowerCase();
    if (cap.includes("rating") && banner.star_image_url) return banner.star_image_url;
    if ((cap.includes("experience") || cap.includes("year")) && banner.badge_image_url) return banner.badge_image_url;
    if ((cap.includes("bike") || cap.includes("purchased")) && banner.bike_image_url) return banner.bike_image_url;
    return stat.icon_url || null;
  };

  return (
    <div className="px-4 md:px-8 py-8">
      <div
        className="rounded-3xl border-2 border-blue-400 overflow-hidden relative"
        style={{
          background: banner.background_image_url
            ? `url(${banner.background_image_url}) center/cover no-repeat`
            : "linear-gradient(180deg,#10a8a3,#0e6c69)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
        }}
      >
        {/* Container padding + width control */}
        <div className="max-w-7xl mx-auto p-4 md:p-6">

          {/* Row 1: Title (left) + Logo (right) */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center">
              {/* optional bike image left of title (small) */}
              {banner.bike_image_url && (
                <img src={banner.bike_image_url} alt="bike" className="w-16 h-auto object-contain mr-3 hidden md:block" />
              )}
              <h3 className="text-white text-lg md:text-2xl font-semibold">{banner.title}</h3>
            </div>

            <div className="flex items-center">
              {banner.logo_url && (
                <img src={banner.logo_url} alt="logo" className="w-36 h-auto object-contain" />
              )}
            </div>
          </div>

          {/* Row 2: centered 3 columns */}
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch w-full">
              {stats.map((s) => {
                const icon = pickIconForStat(s);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-center bg-transparent px-2 md:px-6 py-4 rounded-md"
                  >
                    {/* icon on left */}
                    <div className="flex-none mr-4">
                      {icon ? (
                        <img src={icon} alt={s.caption} className="w-24 h-24 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-black/10" />
                      )}
                    </div>

                    {/* value (large) above caption (small) stacked in column */}
                    <div className="flex flex-col text-left">
                      <div className="text-2xl md:text-3xl font-bold text-black/90">{s.value}</div>
                      <div className="text-sm md:text-base text-black/80 mt-1">{s.caption}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
