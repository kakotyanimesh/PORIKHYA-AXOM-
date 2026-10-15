import { LandingNav } from "@/components/landingpage/landing-nav";
import { Hero } from "@/components/landingpage/hero";
import { Ticker } from "@/components/landingpage/ticker";
// import { HowItWorks } from "@/components/landingpage/how-it-works";
import { SneakPeek } from "@/components/landingpage/sneak-peek";
import { Coverage } from "@/components/landingpage/coverage";
import { Pricing } from "@/components/landingpage/pricing";
import { Faq } from "@/components/landingpage/faq";
import { Cta } from "@/components/landingpage/cta";
import { Footer } from "@/components/landingpage/footer";

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <LandingNav />

      <main>
        <Hero />
        <h1 className="text-red-900">animesh</h1>
        <Ticker />
        {/*<HowItWorks />*/}
        <SneakPeek />
        <Coverage />
        <Pricing />
        <Faq />
        <Cta />
      </main>

      <Footer />
    </div>
  );
}
