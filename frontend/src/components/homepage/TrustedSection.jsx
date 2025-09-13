import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TrustedSection({ apiUrl = "/trusted-section/" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await axios.get(apiUrl);
        if (!mounted) return;
        setData(resp.data);
      } catch (err) {
        console.error("Failed to fetch trusted section", err);
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.message;
        setError({ status, detail });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading) return null;

  if (error) {
    return (
      <section className="py-8 px-4">
        <div className="w-full text-center text-red-600">
          <p>Could not load trusted section. ({error.status || "?"})</p>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const { title, description, image_url } = data;

  return (
    <section className="py-2 md:py-2 px-0">
      {/* full screen width container */}
      <div className="w-full">
        <div className="bg-[#0f4951] rounded-none overflow-hidden w-full">
          <div className="flex flex-col md:flex-row items-center w-full">
            {/* Left text */}
            <div className="md:w-1/2 w-full flex items-center">
              <div className="px-6 md:px-12  text-center ">
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                  {title}
                </h3>
                <p className="text-sm md:text-2xl text-white/90 max-w-2xl leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Right image */}
            <div className="md:w-1/2 w-full flex justify-center px-6 md:px-12 py-2">
              {image_url ? (
                <div className="rounded-xl overflow-hidden" style={{ width: 500, maxWidth: "100%" }}>
                  <img
                    src={image_url}
                    alt={title}
                    className="w-full h-auto object-cover rounded-xl border-4 border-white"
                    style={{
                      boxShadow:
                        "6px 6px 25px rgba(255,255,255,0.9), -3px -3px 10px rgba(255,255,255,0.6)",
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

