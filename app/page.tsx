"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Timeline from "@/components/sections/Timeline";
import PrizePool from "@/components/sections/PrizePool";
import Tracks from "@/components/sections/Tracks";
import Rules from "@/components/sections/Rules";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import FloatingNav from "@/components/ui/FloatingNav";
import FloatingSocials from "@/components/ui/FloatingSocials";
import Scene from "@/components/canvas/Scene";
import GlobalParticles from "@/components/canvas/GlobalParticles";
import HeroSceneContent from "@/components/canvas/HeroSceneContent";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white selection:bg-primary selection:text-black noise-overlay relative">
      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene>
          <GlobalParticles />
          <HeroSceneContent mousePosition={mousePosition} />
        </Scene>
      </div>

      <FloatingNav />
      <FloatingSocials />

      <div className="relative z-10">
        <Hero />
        <div className="relative bg-black/20 backdrop-blur-sm border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,1)]">
          <PrizePool />
          <About />
          <Timeline />
          <Tracks />
          <Rules />
          <FAQ />
          <Footer />
        </div>
      </div>
    </main>
  );
}
