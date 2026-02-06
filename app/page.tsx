import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Timeline from "@/components/sections/Timeline";
import Tracks from "@/components/sections/Tracks";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import FloatingNav from "@/components/ui/FloatingNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black noise-overlay">
      <FloatingNav />
      <Hero />
      <div className="relative z-10 bg-black/80 backdrop-blur-3xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,1)]">
        <About />
        <Timeline />
        <Tracks />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
