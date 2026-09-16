import HeroSection from "@/components/landing/HeroSection";
import StatsOverview from "@/components/landing/StatsOverview";
import FeaturePillars from "@/components/landing/FeaturePillars";
import TrendingMarketsTeaser from "@/components/landing/TrendingMarketsTeaser";
import QuestsTeaser from "@/components/landing/QuestsTeaser";
import AirdropBanner from "@/components/landing/AirdropBanner";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center gap-6 sm:gap-8 animate-in fade-in duration-300">
      <HeroSection />
      <StatsOverview />
      <FeaturePillars />
      <TrendingMarketsTeaser />
      <QuestsTeaser />
      <AirdropBanner />
    </div>
  );
}
