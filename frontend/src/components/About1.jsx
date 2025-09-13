import React from "react";

export default function About1({ data }) {
  if (!data) return null;

  return (
    <section className="flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 md:px-12 py-12 gap-10">
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={data.image}
          alt={data.title}
          className="w-72 md:w-96 lg:w-[420px] h-auto object-contain"
        />
      </div>

      <div className="w-full md:w-1/2 text-center md:text-left">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#215671] mb-4">
          {data.title}
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">
          {data.content}
        </p>
      </div>
    </section>
  );
}
