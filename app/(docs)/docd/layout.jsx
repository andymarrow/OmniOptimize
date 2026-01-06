import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style-prefixed.css";
const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>;

const navbar = <Navbar logo={<b>Omni SDK</b>} />;

const footer = <Footer>© {new Date().getFullYear()} Omni</Footer>;

export default async function DocsLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="nextra-theme-docs">
          <Layout
            banner={banner}
            navbar={navbar}
            pageMap={await getPageMap("/docd")}
            footer={footer}
          >
            {children}
          </Layout>
        </div>
      </body>
    </html>
  );
}
