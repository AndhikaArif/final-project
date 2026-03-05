import HeroCarousel from "@/components/hero-carousel";
import FeaturedProperties from "@/components/featured-properties";
import CitiesSection from "@/components/cities-section";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <HeroCarousel />
      <div className="mt-24 px-6">
        <CitiesSection />

        <div className="mt-24">
          <FeaturedProperties />
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
