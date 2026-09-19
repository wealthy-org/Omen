import HeroSection from "@/components/landing/HeroSection";
import InfraMarquee from "@/components/landing/InfraMarquee";
import StatsOverview from "@/components/landing/StatsOverview";
import TrendingMarketsTeaser from "@/components/landing/TrendingMarketsTeaser";
import SignalGapVisualizer from "@/components/landing/SignalGapVisualizer";
import ProtocolFlow from "@/components/landing/ProtocolFlow";
import LandingActivityStream from "@/components/landing/LandingActivityStream";
import LandingFAQ from "@/components/landing/LandingFAQ";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-stretch gap-6 sm:gap-10 animate-in fade-in duration-300">
      <HeroSection />
      <InfraMarquee />
      <StatsOverview />
      <TrendingMarketsTeaser />
      <SignalGapVisualizer />
      <ProtocolFlow />
      <LandingActivityStream />
      <LandingFAQ />
    </div>
  );
}
