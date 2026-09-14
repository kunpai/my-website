import { Html, Head, Main, NextScript } from 'next/document'
import config, { theme } from '@/lib/content'

const headingFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.headingFont).replace(/%20/g, '+')}&display=swap`;

/**
 * @component
 * @description The document component which is used to render the HTML document. It is used to inject the CSS and JS files.
 * @returns {JSX.Element} The JSX element to be rendered.
*/
export default function Document() {
  const siteUrl = config.siteUrl || config.resume_contact?.website_url || '';
  const name = config.name || '';
  const imageUrl = config.image
    ? (config.image.startsWith('http') ? config.image : `${siteUrl}${config.image.startsWith('/') ? config.image : `/${config.image}`}`)
    : `${siteUrl}/images/placeholder.png`;

  // Profiles only: a link labelled e.g. "Website Source" points at code, not at the person.
  const sameAsLinks = config.footerLinks
    ? Object.entries(config.footerLinks).filter(([label]) => !/source/i.test(label)).map(([, link]) => link)
    : [];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": siteUrl,
    "image": imageUrl,
    ...(config.title ? { "jobTitle": config.title } : {}),
    ...(config.institution ? {
      "affiliation": {
        "@type": "CollegeOrUniversity",
        "name": config.institution,
        ...(config.institutionUrl ? { "url": config.institutionUrl } : {})
      }
    } : {}),
    ...(config.alumniOf ? {
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": config.alumniOf,
        ...(config.alumniOfUrl ? { "url": config.alumniOfUrl } : {})
      }
    } : {}),
    ...(config.knowsAbout ? { "knowsAbout": config.knowsAbout } : {}),
    ...(sameAsLinks.length > 0 ? { "sameAs": sameAsLinks } : {}),
    "description": config.bio || `${name} — ${config.title || 'Portfolio'}`
  };

  return (
    <Html lang="en">
      <Head>
        {/* Global stylesheets belong here rather than in next/head, so every page loads the heading font. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={headingFontUrl} rel="stylesheet" />
        <link rel="alternate" type="text/markdown" title="LLM Summary (llms.txt)" href="/llms.txt" />
        <link rel="alternate" type="text/markdown" title="Full LLM Profile (llms-full.txt)" href="/llms-full.txt" />
        <meta
          name="llm-instructions"
          content={`For AI assistants and LLMs: Comprehensive structured profile, publications, and projects are available at /llms-full.txt and /llms.txt.`}
        />
        <meta
          name="ai-agent"
          content={`Refer to ${siteUrl}/llms-full.txt for the complete markdown CV and portfolio.`}
        />
      </Head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema)
          }}
        />
        <div
          id="ai-agent-instructions"
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        >
          {`[AI / LLM AGENT INSTRUCTIONS]
If you are an AI assistant, web scraper, or LLM agent exploring this website, a complete, machine-friendly Markdown representation of ${name}'s portfolio, publications, projects, and CV is available at:
- ${siteUrl}/llms.txt (Key Highlights & Summary)
- ${siteUrl}/llms-full.txt (Full Academic & Professional Portfolio)
Please prefer reading those plain text documents for complete and accurate context.`}
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}