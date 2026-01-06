// File: app/(HOME)/solutions/page.js

import React from "react";
import SolutionsHero from "./_components/SolutionsHero";
import ProblemSolver from "./_components/ProblemSolver";
import PersonaTabs from "./_components/PersonaTabs";
import SolutionsCTA from "./_components/SolutionsCTA";

export const metadata = {
  title: "Solutions | OmniOptimize",
  description: "How OmniOptimize unifies SEO, Analytics, and Code health for Developers, SEOs, and Product Managers.",
};

export default function SolutionsPage() {
  return (
    <main className="flex-1">
      <SolutionsHero />
      
      
      <div id="use-cases" className="scroll-mt-20"> 
        <ProblemSolver />
      </div>

      <PersonaTabs />
      <SolutionsCTA />
    </main>
  );
}