import { HeroGreeting } from "@/components/HeroGreeting";
import { HomeStats } from "@/components/HomeStats";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { SmartReorder } from "@/components/SmartReorder";
import { UpcomingDelivery } from "@/components/UpcomingDelivery";

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroGreeting />
      <HomeStats />
      <RecommendationCarousel />
      <div className="grid gap-4 md:grid-cols-2">
        <SmartReorder />
        <UpcomingDelivery />
      </div>
    </div>
  );
}
