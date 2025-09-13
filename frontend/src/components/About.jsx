import React from "react";

export default function About({ about_section1, about_section2, about_section3 }) {
  return (
    <div className="container mx-auto py-10 px-4">
      {/* Section 1 */}
      {about_section1 && (
        <div className="grid md:grid-cols-2 items-center gap-6 mb-12">
          <div>
            <img
              src={about_section1.image}
              alt="Section1"
              className="w-100 h-100 lg:mx-24 rounded"
            />
          </div>
          <div className="text-lg md:text-xl">
            <h2 className="mb-3 text-2xl md:text-3xl font-bold text-[#07435C]">
              {about_section1.title}
            </h2>
            <p className="text-[#07435C] leading-relaxed">{about_section1.description}</p>
          </div>
        </div>
      )}

      {/* Section 2 - Banner */}
      {about_section2 && (
        <div className="relative mb-12">
          <img
            src={about_section2.image}
            alt="Banner"
            className="w-full h-full lg:h-80 rounded shadow-md"
          />
          {(about_section2.overlay_title || about_section2.overlay_description) && (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/40 text-white p-6 rounded">
              {about_section2.overlay_title && (
                <h6 className="mb-2 text-lg md:text-xl font-bold">
                  {about_section2.overlay_title}
                </h6>
              )}
              {about_section2.overlay_description && (
                <p className="text-base md:text-lg text-center">
                  {about_section2.overlay_description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {about_section3 && (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="mb-3 text-2xl md:text-3xl font-bold text-[#07435C]">
              {about_section3.title}
            </h2>
            <p className="text-lg md:text-xl text-[#07435C] leading-relaxed">
              {about_section3.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {about_section3.images?.[0] && (
              <img
                src={about_section3.images[0]}
                alt="Image 1"
                className="rounded shadow-md"
              />
            )}
            {about_section3.images?.[1] && (
              <img
                src={about_section3.images[1]}
                alt="Image 2"
                className="rounded shadow-md"
              />
            )}
            {about_section3.images?.[2] && (
              <img
                src={about_section3.images[2]}
                alt="Image 3"
                className="rounded shadow-md"
              />
            )}
            {about_section3.images?.[3] && (
              <img
                src={about_section3.images[3]}
                alt="Image 4"
                className="rounded shadow-md"
              />
            )}
          </div>


          
        </div>
      )}
    </div>
  );
}
