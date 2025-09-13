import React from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";

export default function InfoSection() {
  const { infoData } = useApi();

  if (!infoData) return null;

  return (
    <section className="flex flex-col md:flex-row items-start justify-between md:items-center md:justify-between md:gap-x-12 gap-y-6 px-4 md:px-20 pb-2">
      {/* Image Section */}
      <div className="w-full md:w-1/3 flex justify-start md:self-start md:-ml-8 lg:-ml-20">
        <img
          src={infoData.bike_image}
          alt="Bike Info"
          className="w-48 sm:w-56 md:w-[480px] lg:w-[800px] max-w-full h-auto md:h-[480px] lg:h-[600px] object-contain rounded-md"
        />
      </div>

      {/* Content Section */}
      <div
        className="w-full md:w-2/3 text-center text-base md:text-lg lg:text-2xl"
        style={{ lineHeight: "3rem" }}
      >
        <p className="mb-6 px-4 md:px-12 font-medium">{infoData.description}</p>
              <div className="flex justify-center">
          <Link to="/about">
            <button className="bg-[#07435c] text-white font-semibold px-10 py-1 rounded-md shadow-md hover:opacity-90 transition">
              {infoData.button_text}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
