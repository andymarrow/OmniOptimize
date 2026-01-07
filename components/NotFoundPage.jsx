"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import explorerCat from "@/assets/explorer-cat.webp";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="font-serif flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20 px-4">
      {/* 404 Heading */}
      <h1 className="text-7xl font-bold text-foreground mb-2">404</h1>

      {/* Page Not Found */}
      <h2 className="text-3xl font-bold text-foreground mb-2">
        Page Not Found
      </h2>
      {/* Explorer Cat Image */}
      <div className="relative size-[clamp(200px,50vw,300px)] mb-8">
        <Image
          src={explorerCat}
          alt="Friendly feline explorer"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Subtitle */}
      <p className="text-lg text-muted-foreground mb-12 text-center max-w-md">
        Don't worry, our friendly feline explorer is on the case!
      </p>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-full transition-colors duration-200 flex items-center gap-2"
      >
        Go Back
      </button>
    </div>
  );
}
