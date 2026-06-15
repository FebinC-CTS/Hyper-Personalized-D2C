import { HeroGreeting } from "@/components/HeroGreeting";
import { HomeStats } from "@/components/HomeStats";
import { HydrationCard } from "@/components/HydrationCard";
import { AutoReplenish } from "@/components/AutoReplenish";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { SmartReorder } from "@/components/SmartReorder";
import { UpcomingDelivery } from "@/components/UpcomingDelivery";

export default function Home() {
  return (
    <div className="space-y-8">
      <HeroGreeting />
      <HomeStats />
      <HydrationCard />
      <RecommendationCarousel />
      <div className="grid gap-4 md:grid-cols-2">
        <AutoReplenish />
        <UpcomingDelivery />
      </div>
      <SmartReorder />
    </div>
  );
}
