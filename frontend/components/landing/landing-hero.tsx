"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

// Dynamically import shaders to prevent SSR errors (WebGL/Canvas requires browser APIs)
const Shader = dynamic(() => import("shaders/react").then((mod) => mod.Shader), { ssr: false });
const Swirl = dynamic(() => import("shaders/react").then((mod) => mod.Swirl), { ssr: false });
const ChromaFlow = dynamic(() => import("shaders/react").then((mod) => mod.ChromaFlow), { ssr: false });
const FlutedGlass = dynamic(() => import("shaders/react").then((mod) => mod.FlutedGlass), { ssr: false });
const FilmGrain = dynamic(() => import("shaders/react").then((mod) => mod.FilmGrain), { ssr: false });

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#EFEFEF]">

      {/* Animated WebGL Shader Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none w-full h-full">
        <Shader className="w-full h-full">
          <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
          <ChromaFlow
            baseColor="#ffffff"
            downColor="#ff5f03"
            leftColor="#ff5f03"
            rightColor="#ff5f03"
            upColor="#ff5f03"
            momentum={13}
            radius={3.5}
          />
          <FlutedGlass
            aberration={0.61}
            angle={31}
            frequency={8}
            highlight={0.12}
            highlightSoftness={0}
            lightAngle={-90}
            refraction={4}
            shape="rounded"
            softness={1}
            speed={0.15}
          />
          <FilmGrain strength={0.05} />
        </Shader>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20">

        <div className="text-[13px] sm:text-[14px] text-gray-900 font-semibold tracking-wider uppercase mb-5 sm:mb-8">
          Waras — Portal GIS
        </div>

        <h1 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)] max-w-[1100px]">
          Satu peta untuk keputusan daerah yang lebih baik.
        </h1>

        {/* CTA Row */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">

          {/* Orange Button with Text Roll and Rotated Arrow - routes to Login */}
          <Link href="/auth/login" className="group flex items-center gap-3 bg-primary hover:bg-primary/80 text-primary-foreground text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
            <span className="overflow-hidden h-[20px] relative inline-block">
              <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                <span className="h-[20px] flex items-center">Buka Dashboard</span>
                <span className="h-[20px] flex items-center">Buka Dashboard</span>
              </span>
            </span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-primary transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg] shrink-0">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

        </div>

      </div>

    </section>
  );
}
