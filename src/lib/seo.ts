import type { Metadata } from "next";
import { faqs, navLinks, services, site } from "@/lib/content";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${site.domain}`,
);

export const defaultDescription =
  "Finance Buddy helps students track spending, set category budgets, forecast month-end balance, and avoid overspending — with privacy-first design and optional AI assistance.";

export const defaultOgImage = "/home/Strong Foundations.webp";

export const seoKeywords = [
  "student budgeting app",
  "micro budgeting for students",
  "expense tracker students",
  "monthly budget planner",
  "personal finance students",
  "allowance tracker",
  "spending forecast",
  "Finance Buddy",
] as const;

const sharedRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function pageTitle(title: string, path: string) {
  if (path === "/") {
    return `${site.name} | ${title}`;
  }
  return `${title} | ${site.name}`;
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageSeoInput): Metadata {
  const canonical = path;
  const resolvedTitle = pageTitle(title, path);

  return {
    title: path === "/" ? { absolute: resolvedTitle } : title,
    description,
    keywords: [...seoKeywords],
    alternates: {
      canonical,
      languages: {
        "en-AU": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_AU",
      url: canonical,
      siteName: site.name,
      title: resolvedTitle,
      description,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: `${site.name} — student micro-budgeting assistant`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [defaultOgImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : sharedRobots,
  };
}

export const rootMetadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${site.name} | Student Micro-Budgeting Made Simple`,
    template: `%s | ${site.name}`,
  },
  description: defaultDescription,
  keywords: [...seoKeywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  category: "finance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-AU": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: site.name,
    title: `${site.name} | Student Micro-Budgeting Made Simple`,
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${site.name} — student micro-budgeting assistant`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Student Micro-Budgeting Made Simple`,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  robots: sharedRobots,
};

type FaqItem = {
  question: string;
  answer: string;
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: site.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/Logo.png"),
    description: site.tagline,
    email: site.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: site.email,
        contactType: "customer service",
        availableLanguage: ["English"],
      },
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: site.name,
    url: absoluteUrl("/"),
    description: defaultDescription,
    inLanguage: "en-AU",
    publisher: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
}

export function faqPageJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function servicesItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} features`,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.title,
      url: absoluteUrl(`/what-we-do#${service.id}`),
    })),
  };
}

export const sitemapRoutes = [
  ...navLinks.map((link) => ({
    path: link.href,
    changeFrequency:
      link.href === "/"
        ? ("weekly" as const)
        : ("monthly" as const),
    priority: link.href === "/" ? 1 : 0.8,
  })),
  {
    path: "/privacy",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
  {
    path: "/terms",
    changeFrequency: "yearly" as const,
    priority: 0.3,
  },
];

export const homeFaqs = faqs.slice(0, 4);
