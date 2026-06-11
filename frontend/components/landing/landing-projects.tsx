import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LinkIcon } from "@/components/landing/link-icon";

export function LandingProjects() {
  return (
    <section id="projects" className="bg-[#F5F5F5] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28 w-full">
      <div className="w-full max-w-[1440px] mx-auto">

        {/* Badge Row */}
        <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">
            2
          </span>
          <span className="text-[12px] sm:text-[13px] font-medium text-gray-900 border border-gray-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
            Modul Peta Visual
          </span>
        </div>

        {/* Heading */}
        <div className="px-5 sm:px-8 lg:px-12 mb-10 sm:mb-14 lg:mb-16">
          <h2 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)]">
            Modul Sistem
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7 px-5 sm:px-8 lg:px-12">

          {/* Card 1: Poverty Map - links to Login */}
          <Link href="/auth/login" className="flex flex-col group cursor-pointer text-left">
            {/* Media Container */}
            <div className="relative aspect-[329/246] rounded-2xl overflow-hidden bg-[#1a1d2e] shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />

              {/* Hover expandable white circle button */}
              <div className="absolute bottom-4 left-4 h-9 bg-white text-gray-900 rounded-full flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-9 group-hover:w-[148px] px-2.5 justify-between shadow-md">
                <span className="text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pl-1 text-gray-900">
                  Buka Peta
                </span>
                <LinkIcon className="w-3.5 h-3.5 shrink-0 text-gray-900 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] -rotate-45 group-hover:rotate-0" />
              </div>
            </div>

            {/* Descriptions */}
            <p className="text-[13px] sm:text-[14px] text-gray-600 mt-4 leading-relaxed font-normal">
              Sistem analisis kemiskinan terpadu dengan visualisasi statistik desil wilayah dan indeks prioritas bantuan.
            </p>
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 mt-1">
              Peta & Statistik Kemiskinan
            </h3>
          </Link>

          {/* Card 2: Gas Station Map - links to Login */}
          <Link href="/auth/login" className="flex flex-col group cursor-pointer text-left">
            {/* Media Container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#6b6b6b] shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />

              {/* Hover expandable dark circle button */}
              <div className="absolute bottom-4 left-4 h-9 bg-gray-900 text-white rounded-full flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-9 group-hover:w-[168px] px-2.5 justify-between shadow-md">
                <span className="text-[13px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pl-1 text-white">
                  Buka Peta
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-white transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] -rotate-45 group-hover:rotate-0" />
              </div>
            </div>

            {/* Descriptions */}
            <p className="text-[13px] sm:text-[14px] text-gray-600 mt-4 leading-relaxed font-normal">
              Pemetaan stasiun pengisian energi (SPBU & EV Charger) beserta rincian fasilitas bengkel dan status operasional 24 jam.
            </p>
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 mt-1">
              Peta SPBU, EV Charger & Bengkel
            </h3>
          </Link>

        </div>

      </div>
    </section>
  );
}
