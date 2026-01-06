import React from "react";
import PricingHeader from "./_components/PricingHeader";
import PricingTiers from "./_components/PricingTiers";
import ComparisonTable from "./_components/ComparisonTable";
import PricingFAQ from "./_components/PricingFAQ";
import SolutionsCTA from "../solutions/_components/SolutionsCTA"; // Reusing CTA

export const metadata = {
  title: "Pricing | OmniOptimize",
  description: "Simple pricing for teams of all sizes.",
};

export default function PricingPage() {
  return (
    <main className="flex-1">
      <PricingHeader />
      <PricingTiers />
      <ComparisonTable />
      <PricingFAQ />
      <SolutionsCTA />
    </main>
  );
}