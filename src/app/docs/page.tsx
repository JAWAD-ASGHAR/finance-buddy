import { DocsDocument } from "@/components/sections/DocsDocument";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMcpDocsSections, docsPage } from "@/lib/docs-content";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

const docsDescription =
  "Connect Finance Buddy to Cursor with a personal API key — set up MCP in a few steps and manage budgets and expenses from your AI assistant.";

export const metadata = createPageMetadata({
  title: "Documentation",
  description: docsDescription,
  path: "/docs",
});

function resolveMcpHttpUrl() {
  const configured = process.env.NEXT_PUBLIC_MCP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return "https://finance-buddy.duckdns.org/mcp";
}

export default function DocsPage() {
  const sections = buildMcpDocsSections(resolveMcpHttpUrl());

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Documentation", path: "/docs" },
        ])}
      />
      <DocsDocument
        eyebrow={docsPage.eyebrow}
        title={docsPage.title}
        titleAccent={docsPage.titleAccent}
        updated={docsPage.updated}
        intro={docsPage.intro}
        sections={sections}
      />
    </>
  );
}
