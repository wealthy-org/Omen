import HeroSection from "@/components/landing/HeroSection";
import StatsOverview from "@/components/landing/StatsOverview";
import TrendingMarketsTeaser from "@/components/landing/TrendingMarketsTeaser";
import FeaturePillars from "@/components/landing/FeaturePillars";
import QuestsTeaser from "@/components/landing/QuestsTeaser";
import OnboardingJourney from "@/components/landing/OnboardingJourney";
import AirdropBanner from "@/components/landing/AirdropBanner";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-stretch gap-4 sm:gap-6 animate-in fade-in duration-300">
      <HeroSection />
      <StatsOverview />
      <TrendingMarketsTeaser />
      <FeaturePillars />
      <QuestsTeaser />
      <OnboardingJourney />
      <AirdropBanner />
    </div>
  );
}
