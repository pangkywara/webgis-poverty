import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingAbout } from "@/components/landing/landing-about";
import { LandingProjects } from "@/components/landing/landing-projects";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary selection:text-primary-foreground">
      <LandingHeader />
      <LandingHero />
      <LandingAbout />
      <LandingProjects />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
