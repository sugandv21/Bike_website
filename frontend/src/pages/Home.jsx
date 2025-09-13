import React from "react";
import HeroSection from "../components/homepage/HeroSection";
import InfoSection from "../components/homepage/InfoSection";
import SupportSection from "../components/homepage/SupportSection";
import HomeBikes from "../components/homepage/HomeBikes";
import HomeBanner from "../components/homepage/HomeBanner";
import Testimonials from "../components/homepage/Testimonials";
import TrustedSection from "../components/homepage/TrustedSection";
import FAQSection from "../components/homepage/FAQSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <InfoSection />
      <SupportSection />
      <HomeBikes />
      <HomeBanner />
      <Testimonials />
      <TrustedSection />
      <FAQSection />
    </main>
  );
}
