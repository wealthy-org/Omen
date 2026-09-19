import HeroSection from "@/components/landing/HeroSection";
import InfraMarquee from "@/components/landing/InfraMarquee";
import StatsOverview from "@/components/landing/StatsOverview";
import TrendingMarketsTeaser from "@/components/landing/TrendingMarketsTeaser";
import ProtocolFlow from "@/components/landing/ProtocolFlow";
import LiveActivityExplorer from "@/components/landing/LiveActivityExplorer";
import SignalGapVisualizer from "@/components/landing/SignalGapVisualizer";
import LandingFAQ from "@/components/landing/LandingFAQ";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-stretch gap-6 sm:gap-10">
      <HeroSection />
      <InfraMarquee />
      <StatsOverview />
      <TrendingMarketsTeaser />
      <ProtocolFlow />
      <LiveActivityExplorer />
      <SignalGapVisualizer />
      <LandingFAQ />
    </div>
  );
}
