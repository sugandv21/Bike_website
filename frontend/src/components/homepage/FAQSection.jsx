import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FAQSection({ apiUrl = "/faqs/" }) {
  const [faqs, setFaqs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(apiUrl);

        // Handle both plain array or paginated response
        if (Array.isArray(data)) {
          setFaqs(data);
        } else if (data.results) {
          setFaqs(data.results);
        } else {
          setFaqs([]);
        }
      } catch (err) {
        console.error("Failed to load FAQs", err);
      }
    })();
  }, [apiUrl]);

  const toggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-[#e6fbfc] p-6 md:p-10 rounded-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              onClick={() => toggle(faq.id)}
              className="cursor-pointer"
            >
              <div className="bg-white text-md md:text-xl rounded-md shadow-[2px_4px_6px_rgba(0,0,0,0.3)] p-4 font-medium">
                <span>
                  {idx + 1}. {faq.question}
                </span>
                {activeId === faq.id && (
                  <p className="mt-5 text-md md:text-xl font-normal text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
