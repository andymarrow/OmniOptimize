import Hero from "./_components/Hero";
import TrustedBy from "./_components/TrustedBy";
import FeaturesBento from "./_components/FeaturesBento";

export default function Home() {
  return (
    <main className="flex-1 overflow-x-hidden">
      <Hero />
      <TrustedBy />
      <FeaturesBento />
      
      {/* Spacer for Footer */}
      <div className="py-20 bg-slate-50 dark:bg-[#020617]"></div>
    </main>
  );
}