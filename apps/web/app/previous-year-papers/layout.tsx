import type { Metadata } from "next";
import { Footer } from "@/components/landingpage/footer";
import { SITE_URL } from "@/lib/site";
import { LandingNav } from "@/components/landingpage/landing-nav";
import { PromoRail } from "@/components/pyq/promo-rail";

// Public, crawlable shell — deliberately NOT under the (user) group, whose
// layout redirects anonymous visitors to /signin (Googlebot has no session).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function PreviousYearPapersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNav />

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-10 px-5 pt-24 pb-20 sm:pt-28 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main>{children}</main>

        {/* sticky marketing rail — LandingNav is fixed h-16, so offset clears it */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PromoRail />
        </aside>
      </div>

      <Footer />
    </div>
  );
}
