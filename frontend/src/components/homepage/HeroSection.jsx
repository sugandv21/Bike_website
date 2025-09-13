import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";

export default function HeroSection() {
  const { heroData } = useApi();

  const [currentIndex, setCurrentIndex] = useState(0);

  const bikeImages = (heroData && heroData.bike_images) || [];

  useEffect(() => {
    if (bikeImages.length === 0) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bikeImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [bikeImages]);

  if (!heroData) return null;

  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-2 md:px-20 py-2">
      <div className="md:w-1/2 text-center space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#07435c]">
          {heroData.title}
        </h2>
        <p
          className="text-xl md:text-2xl px-6 md:px-14"
          style={{ lineHeight: "2.6rem" }}
        >
          {heroData.description}
        </p>

        {/* Link to buy page */}
        <div className="flex justify-center">
          <Link
            to="/buy"
            className="bg-[#07435c] text-white font-semibold text-lg md:text-xl px-6 py-3 rounded-md shadow-md hover:opacity-70 transition inline-block"
            aria-label="Go to Buy page"
          >
            {heroData.button_text || "Buy Now"}
          </Link>
        </div>
      </div>

      <div className="relative md:w-1/2 flex justify-center mt-8 md:mt-0">
        <img
          src={heroData.trapezoid_image_url || heroData.trapezoid_image}
          alt="Trapezoid Background"
          className="absolute top-16 w-80 md:w-[600px] h-auto md:h-[380px] rounded-lg"
        />

        {/* Make the bike image area clickable too */}
        <Link
          to="/buy"
          className="relative w-60 md:w-[700px] h-40 md:h-[550px] flex items-center justify-center"
          aria-label="View Bikes on Buy page"
        >
          {bikeImages.length > 0 ? (
            <img
              src={
                bikeImages[currentIndex].image_url ||
                bikeImages[currentIndex].image
              }
              alt={`Bike ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-opacity duration-700 ease-in-out"
            />
          ) : (
            <img
              src={heroData.bike_image || ""}
              alt="Bike placeholder"
              className="max-w-full max-h-full object-contain opacity-60"
            />
          )}
        </Link>
      </div>
    </section>
  );
}
