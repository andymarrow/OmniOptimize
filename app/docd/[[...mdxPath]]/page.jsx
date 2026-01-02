import Index from "../index.mdx";
import Guides from "../guides.mdx";
import Api from "../api.mdx";
import About from "../about.mdx";

const pages = {
  index: Index,
  guides: Guides,
  api: Api,
  about: About,
};

export const metadata = {
  title: "Omni SDK Docs",
  description: "Omni SDK Documentation",
};

export default function Page({ params }) {
  const pageKey = params.mdxPath?.[0] || "index";
  const MDXComponent = pages[pageKey] || Index;

  return <MDXComponent />;
}
