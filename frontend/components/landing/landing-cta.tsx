import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="bg-white py-24 sm:py-32 relative overflow-hidden w-full border-t border-gray-100">
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative flex flex-col items-center justify-center text-center">

        {/* Left Side ASCII Art - Enlarged Variant */}
        <div className="absolute left-2 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none z-10 select-none opacity-25">
          <pre className="text-[10px] sm:text-[13px] md:text-[14px] leading-[1.15] font-mono text-gray-400 text-left">
{`         .  
        ...  
       ..\\\\/ . 
      ..AAA.AA 
     ......AA .  
    ..A .AAAAA . 
     ..A .AAAA * .          ..A .    ..hA\\/h . 
       .  . .             .. * .   .. V . Vh . 
          . .             . . . .  .. h A - V . 
         A .              . ..A A .   .V . V4 . 
        4V44A.*.VVV       A444V4---AA 
       ..A4\\\\----.V .    .AAAA444444A4V444A... 
      A.--444444444V4444A..* .AVA 
      ..V--AAA. V4.......      ..A . 
     ... A44V4 ..               ... 
    ..  . VVV . 
   . 
`}
          </pre>
        </div>

        {/* Right Side ASCII Art - Enlarged Variant */}
        <div className="absolute right-2 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none z-10 select-none opacity-25">
          <pre className="text-[10px] sm:text-[13px] md:text-[14px] leading-[1.15] font-mono text-gray-400 text-left">
{`            A 
           -.  
          ..A . 
         A444A . 
        ..A . 4 . 
        .... AA .                 . 
       ..A .AAAA .              ..A .     . . . 
       .....AAAA  .      .      ..AA .    .A .AVA . 
        .  . A .       ..A .   .. .V4 .  .4V44A . 
           . A .      ..A4V .   A44444444V4 . 
            4V4V4.--AA 
           ..AAAA444444A4V444A... 
          A.AVAAAAA4A4A.... 
         A4 ..V.AVA 
        ..V4V4A... 
       ..A... 
      ..A . 
     ..  . 
    . 
`}
          </pre>
        </div>

        {/* Center Heading */}
        <h2 className="font-medium leading-[1.12] tracking-[-0.03em] text-gray-900 text-[clamp(1.75rem,5vw,3.5rem)] max-w-[850px] mb-10 sm:mb-12 relative z-20">
          Kelola data pemetaan daerah Anda <br className="hidden sm:block" /> tanpa hambatan.
        </h2>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 relative z-20">
          {/* Orange Button */}
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

          {/* Outline Button */}
          <Link href="/auth/login" className="group flex items-center gap-3 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
            <span className="overflow-hidden h-[20px] relative inline-block">
              <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                <span className="h-[20px] flex items-center">Pelajari Dokumentasi</span>
                <span className="h-[20px] flex items-center text-white">Pelajari Dokumentasi</span>
              </span>
            </span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 text-white flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:bg-white group-hover:text-gray-900 group-hover:rotate-[-45deg] shrink-0">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}