import React from "react";
import ProductHero from "./_components/ProductHero";
import StickyShowcase from "./_components/StickyShowcase";
import FeatureGrid from "./_components/FeatureGrid";
import IntegrationTicker from "./_components/IntegrationTicker";
import SolutionsCTA from "../solutions/_components/SolutionsCTA";

export const metadata = {
  title: "Product | OmniOptimize",
  description: "Explore the features of the OmniOptimize platform.",
};

export default function ProductPage() {
  return (
    <main className="flex-1">
      <ProductHero />
      <IntegrationTicker />
      <StickyShowcase />
      <FeatureGrid />
      <SolutionsCTA />
    </main>
  );
}