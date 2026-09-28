import { Hero } from "@/components/home/Hero";
import {
  ClosingSection,
  DiscoverBlock,
  ExperienceSection,
  FeaturedSection,
  TiersSection,
  UniversesSection,
  WholesaleTeaser
} from "@/components/home/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DiscoverBlock />
      <FeaturedSection />
      <UniversesSection />
      <ExperienceSection />
      <TiersSection />
      <WholesaleTeaser />
      <ClosingSection />
    </>
  );
}
