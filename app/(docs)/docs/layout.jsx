import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style-prefixed.css";
import styles from "./docs.module.css";
import { Sparkles, Github, Package } from "lucide-react";

//fonts
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Documentation",
  description:
    "Complete SDK documentation for OmniOptimize - the all-in-one website optimization platform.",
};

const banner = (
  <Banner storageKey="omni-sdk-banner">
    🎉 OmniOptimize SDK v0.3.0 released - Check out the new features!
  </Banner>
);

const navbar = (
  <Navbar
    logo={
      <div className={styles.navbarBrand}>
        <div className={styles.navbarLogo}>
          <Sparkles size={14} fill="currentColor" />
        </div>
        <div className={styles.navbarTextGroup}>
          <span className={styles.navbarText}>OmniOptimize</span>
          <span className={styles.navbarSubtext}>Analytics SDK</span>
        </div>
      </div>
    }
  />
);

const footer = (
  <Footer>
    <div className={styles.footerContent}>
      <div>
        <span className={styles.footerBrand}>OmniOptimize SDK</span>
        <span className={styles.footerCopy}>© {new Date().getFullYear()}</span>
      </div>
      <div className={styles.footerLinks}>
        <a
          href="https://www.npmjs.com/package/@omni-analytics/sdk"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          <Package size={16} />
          npm
        </a>
      </div>
    </div>
  </Footer>
);

export default async function DocsLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#10b981" />
      </Head>
      <body
        className={`bg-background text-foreground ${inter.variable} ${playfair.variable} ${inter.className}`}
      >
        <div className={`nextra-theme-docs ${styles.docsContainer}`}>
          <Layout
            banner={banner}
            navbar={navbar}
            pageMap={await getPageMap("/docs")}
            footer={footer}
            docsRepositoryBase="https://github.com/andymarrow/OmniOptimize/tree/main/app"
          >
            {children}
          </Layout>
        </div>
      </body>
    </html>
  );
}
