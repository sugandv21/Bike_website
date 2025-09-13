// src/components/Testimonials.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Testimonials({ apiUrl = "/testimonials/" }) {
  const [data, setData] = useState({ section: null, testimonials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await axios.get(apiUrl);
        if (!mounted) return;
        setData(resp.data || { section: null, testimonials: [] });
      } catch (err) {
        console.error("Failed to load testimonials", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading) return null;

  const section = data.section || {
    title: "Real Stories From our Happy Customer",
    subtitle:
      "Their words drive us forward and inspire others to join the movement.",
  };

  const testimonials = (data.testimonials || []).slice(0, 3);

  return (
    <section className="py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-sm sm:text-md md:text-lg text-teal-700 mb-8">
            {section.subtitle}
          </p>
        )}

        {/* grid: auto-rows-fr makes each row equal height so cards align */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-14 auto-rows-fr">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="relative mx-auto md:mx-0 w-full h-full max-w-md md:max-w-none"
            >
              {/* gradient shadow placed behind the card and sized to the card */}
              <div
                className="absolute inset-0 rounded-2xl z-0 transform translate-x-2 translate-y-2"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(6,182,180,0.12), rgba(6,182,180,0.38))",
                  filter: "blur(10px)",
                }}
                aria-hidden="true"
              />

              {/* white card fills the available height */}
              <div className="relative z-20 bg-white rounded-2xl overflow-hidden ml-0 mt-0 shadow-sm h-full flex flex-col">
                {/* Top image - fixed height so all cards look consistent */}
                {t.image_url ? (
                  <div className="w-full h-40 md:h-56 overflow-hidden flex-shrink-0">
                    <img
                      src={t.image_url}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 md:h-56 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full" />
                  </div>
                )}

                {/* Name + role */}
                <div className="px-4 py-3 text-center">
                  <h4 className="text-teal-900  text-md md:text-xl font-bold ">
                    {t.name}
                    {t.role ? (
                      <span className="block  text-md md:text-xl font-bold  md:inline  text-gray-700">
                        {" "}
                        — {t.role}
                      </span>
                    ) : null}
                  </h4>
                </div>

                {/* Quote area grows to fill remaining space; scrolls if long */}
                <div className="p-4 flex-1 overflow-auto">
                  <blockquote className="text-gray-800 text-md md:text-xl font-bold leading-relaxed">
                    “{t.quote}”
                  </blockquote>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
