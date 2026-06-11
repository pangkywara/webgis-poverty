import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[#0b0a09] text-gray-400 relative overflow-hidden pt-20 sm:pt-28">

      {/* 
        Gradient Layer matching image_7203fe.jpg:
        A smooth radial ambient glow originating from the center-bottom to softly illuminate 
        the giant typography, fading into a richer onyx black near the top.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center_bottom,_rgba(40,38,35,0.45)_0%,_rgba(11,10,9,0)_70%)] pointer-events-none z-0"></div>

      {/* 
        High-fidelity Film Grain Texture Overlay:
        Using a dense, fine-grained SVG noise filter pattern to replicate the textured, 
        premium look from the reference image.
      */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay z-10 select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="grainNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.15 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainNoise)" />
        </svg>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-20">

        {/* Top Info and Links columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pb-16 sm:pb-20">

          {/* Logo and Pitch */}
          <div className="col-span-2 flex flex-col items-start gap-4 pr-0 sm:pr-8">
            <div className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-[11px] tracking-tight">
              W
            </div>
            <p className="text-[14px] leading-relaxed text-gray-400 max-w-[320px] mt-2">
              Sistem Informasi Geografis terpadu untuk pemetaan statistik kemiskinan, tata guna lahan, dan jaringan fasilitas infrastruktur energi.
            </p>
          </div>

          {/* Column 1: Modul Peta */}
          <div className="flex flex-col items-start">
            <span className="text-[11px] tracking-wider text-gray-500 font-bold uppercase mb-4 sm:mb-5">
              Modul Peta
            </span>
            <div className="flex flex-col gap-2.5 sm:gap-3 text-[14px]">
              <a href="#projects" className="hover:text-white transition-colors duration-300">Peta Kemiskinan</a>
              <a href="#projects" className="hover:text-white transition-colors duration-300">Lahan & Jalan</a>
              <a href="#projects" className="hover:text-white transition-colors duration-300">SPBU & EV Charger</a>
              <Link href="/auth/login" className="hover:text-white transition-colors duration-300">Analisis Wilayah</Link>
            </div>
          </div>

          {/* Column 2: Dokumen & Kontak */}
          <div className="flex flex-col gap-8">
            {/* Dokumen */}
            <div className="flex flex-col items-start">
              <span className="text-[11px] tracking-wider text-gray-500 font-bold uppercase mb-4">
                Dokumen
              </span>
              <div className="flex flex-col gap-2.5 text-[14px]">
                <Link href="/auth/login" className="hover:text-white transition-colors duration-300">Pusat Bantuan</Link>
                <Link href="/auth/login" className="hover:text-white transition-colors duration-300 font-medium text-gray-300">Play by the Rules</Link>
                <Link href="/auth/login" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
              </div>
            </div>

            {/* Kontak */}
            <div className="flex flex-col items-start">
              <span className="text-[11px] tracking-wider text-gray-500 font-bold uppercase mb-4">
                Kontak
              </span>
              <div className="flex flex-col gap-2.5 text-[14px]">
                <Link href="/auth/login" className="hover:text-white transition-colors duration-300">Hubungi Kami</Link>
                <Link href="/auth/login" className="hover:text-white transition-colors duration-300">Keamanan Data</Link>
              </div>
            </div>
          </div>

        </div>

        {/* Giant typography section matching the second image layout */}
        <div className="w-full text-center select-none pointer-events-none overflow-hidden relative h-[10vw] sm:h-[12vw] flex items-end justify-center mt-8 sm:mt-16">
          <span className="text-[28vw] font-bold text-white leading-[0.7] tracking-normal block opacity-95 translate-y-[20%] select-none">
            Waras
          </span>
        </div>

      </div>

    </footer>
  );
}