<<<<<<< HEAD
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-black text-5xl">HOME PAGE</h1>
=======
import LandingSearch from "@/components/landing-search";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* HERO */}
      <h1 className="text-4xl font-bold mb-4">Find your perfect stay</h1>

      <p className="mb-8">
        Compare prices, check availability, and book instantly
      </p>

      {/* SEARCH FORM */}
      <LandingSearch />
>>>>>>> main
    </div>
  );
}
