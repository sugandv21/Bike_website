import React from "react";
import { useApi } from "../../context/ApiContext";

export default function SupportSection() {
  const { supportData } = useApi();

  // normalize supportData to always be an array of items
  const items = Array.isArray(supportData)
    ? supportData
    : supportData && supportData.results
    ? supportData.results
    : supportData
    ? [supportData]
    : [];

  if (items.length === 0) return null;

  // Tweak these values to nudge visuals for your asset sizes
  const ITEM_HEIGHT = 520; // container height for each column
  // UP item positions (pixels from top of the item container)
  const ARROW_TOP_UP = 24;
  const CIRCLE_TOP_UP = 236;
  const TEXT_TOP_UP = 90;

  // DOWN item positions (pixels from top of the item container)
  const ARROW_BOTTOM_DOWN = 150; // distance from bottom
  const CIRCLE_TOP_DOWN = 40;
  const TEXT_TOP_DOWN = 156;

  return (
    <section className="py-12 px-6 md:px-20 bg-white">
      <div className="max-w-7xl mx-auto relative">
        <h3 className="text-center text-2xl md:text-3xl font-bold mb-16">
          Get the Support You Need
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {items.map((item) => {
            const isDown = item.arrow === "down";

            return (
              <div
                key={item.id}
                className="relative w-full"
                style={{ height: ITEM_HEIGHT }}
              >
                {/* ---------- ARROW (positioned independently) ---------- */}
                {item.arrow_image_url && (
                  <img
                    src={item.arrow_image_url}
                    alt={`${item.title} arrow`}
                    loading="lazy"
                    className="absolute object-contain pointer-events-none"
                    style={{
                      zIndex: 0,
                      width: 280,
                      height: 360,
                      left: "58%",
                      transform: "translateX(-50%)",
                      ...(isDown
                        ? { bottom: ARROW_BOTTOM_DOWN } // anchored from bottom
                        : { top: ARROW_TOP_UP }), // anchored from top
                    }}
                  />
                )}

                {/* ---------- CIRCLE (positioned independently) ---------- */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-lg"
                  style={{
                    zIndex: 20,
                    width: 120,
                    height: 120,
                    ...(isDown ? { top: CIRCLE_TOP_DOWN } : { top: CIRCLE_TOP_UP }),
                  }}
                >
                  <img
                    src={item.image_url ?? item.image}
                    alt={item.title}
                    loading="lazy"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* ---------- TEXT (positioned independently) ---------- */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-center px-14"
                  style={{
                    zIndex: 30,
                    width: 260,
                    ...(isDown ? { top: TEXT_TOP_DOWN } : { top: TEXT_TOP_UP }),
                  }}
                >
                  <h4 className="text-[#07435c] font-semibold text-lg">
                    {item.title}
                  </h4>

                  {item.subtitle && (
                    <p className="text-sm text-gray-700 font-medium">
                      {item.subtitle}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
