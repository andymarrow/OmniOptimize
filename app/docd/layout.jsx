"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Github, Package } from "lucide-react";
import ThemeToggle from "@/components/Themetoggle";

const navItems = [
  { href: "/docd", label: "Welcome" },
  { href: "/docd/guides", label: "Guides" },
  { href: "/docd/api", label: "API Reference" },
  { href: "/docd/about", label: "About" },
];

export default function DocsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-5 group">
            <div className="h-8 w-8 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105">
              <BookOpen size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none text-foreground">
                OmniOptimize
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Omni SDK Docs
              </span>
            </div>
          </Link>

          <Separator className="mb-6" />

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`px-3 py-2.5 rounded-md transition-all border-l-3 font-medium ${
                      isActive
                        ? "border-l-brand-600 text-brand-600"
                        : "border-l-transparent text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <nav className="border-b bg-card px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">Omni SDK</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* GitHub Link */}

            {/* NPM Link */}
            <a
              href="https://www.npmjs.com/package/omnioptimize"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title="NPM Package"
            >
              <Package className="w-5 h-5 text-foreground/70 hover:text-foreground" />
            </a>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Card className="m-8 p-8 border-0 shadow-none">
            <article className="prose dark:prose-invert max-w-none">
              {children}
            </article>
          </Card>
        </div>
      </main>
    </div>
  );
}
