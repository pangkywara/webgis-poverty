import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingAbout() {
  return (
    <section id="about" className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden w-full">
      <div className="w-full max-w-[1440px] mx-auto">

        {/* Badge Row */}
        <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">
            1
          </span>
          <span className="text-[12px] sm:text-[13px] font-medium text-gray-900 border border-gray-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
            Introducing Waras GIS
          </span>
        </div>

        {/* Heading */}
        <div className="px-5 sm:px-8 lg:px-12">
          <h2 className="font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 mb-12 sm:mb-16 lg:mb-28 text-[clamp(1.5rem,4vw,3.2rem)] max-w-[900px]">
            Kecerdasan spasial terpadu, menyajikan <br className="hidden sm:block" />
            visualisasi data yang akurat & interaktif.
          </h2>
        </div>

        {/* Content Area - Mobile & Tablet Stacked */}
        <div className="lg:hidden px-5 sm:px-8 flex flex-col gap-8">
          <div className="flex flex-col items-start gap-4">
            <p className="text-[15px] sm:text-[17px] leading-[1.6] font-medium text-gray-900 max-w-[600px]">
              Melalui integrasi data kemiskinan daerah, tata guna lahan, dan jaringan fasilitas pengisian energi, kami membantu mewujudkan tata ruang wilayah yang transparan dan berbasis data.
            </p>

            {/* About Button with Text Roll and Arrow - routes to Login */}
            <Link href="/auth/login" className="group flex items-center gap-3 bg-primary hover:bg-primary/80 text-primary-foreground text-[13px] font-medium rounded-full pl-5 pr-2 py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer mt-2">
              <span className="overflow-hidden h-[20px] relative inline-block">
                <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                  <span className="h-[20px] flex items-center">Pelajari Selengkapnya</span>
                  <span className="h-[20px] flex items-center">Pelajari Selengkapnya</span>
                </span>
              </span>
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg] shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Images */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
            <img
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85"
              alt="Analisis spasial tim perencanaan"
              className="w-full sm:w-[45%] aspect-[438/346] rounded-xl sm:rounded-2xl object-cover"
            />
            <img
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85"
              alt="Stasiun kerja visualisasi GIS"
              className="w-full sm:w-[55%] aspect-[900/600] rounded-xl sm:rounded-2xl object-cover"
            />
          </div>
        </div>

        {/* Content Area - Desktop Grid */}
        <div className="hidden lg:grid grid-cols-[26%_1fr_48%] items-end gap-6 xl:gap-8 px-8 lg:px-12">

          {/* Left Column Image */}
          <div className="w-full">
            <img
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85"
              alt="Analisis spasial tim perencanaan"
              className="w-full aspect-[438/346] rounded-2xl object-cover shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            />
          </div>

          {/* Center Column Copy & CTA */}
          <div className="flex flex-col items-start justify-between self-start h-full pl-6 pr-4">
            <p className="text-[16px] xl:text-[18px] leading-[1.65] font-medium text-gray-900 whitespace-nowrap">
              Melalui integrasi data kemiskinan daerah,<br />
              tata guna lahan, dan jaringan SPBU/EV,<br />
              kami membantu pengambilan keputusan.
            </p>

            {/* About Button - routes to Login */}
            <Link href="/auth/login" className="group flex items-center gap-3 bg-primary hover:bg-primary/80 text-primary-foreground text-[13px] font-medium rounded-full pl-5 pr-2 py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer mt-8">
              <span className="overflow-hidden h-[20px] relative inline-block">
                <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                  <span className="h-[20px] flex items-center">Pelajari Selengkapnya</span>
                  <span className="h-[20px] flex items-center">Pelajari Selengkapnya</span>
                </span>
              </span>
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:rotate-[-45deg] shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Right Column Image */}
          <div className="w-full">
            <img
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85"
              alt="Stasiun kerja visualisasi GIS"
              className="w-full aspect-[3/2] rounded-2xl object-cover shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
