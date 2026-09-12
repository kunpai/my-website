import { Html, Head, Main, NextScript } from 'next/document'

/**
 * @component
 * @description The document component which is used to render the HTML document. It is used to inject the CSS and JS files.
 * @returns {JSX.Element} The JSX element to be rendered.
*/
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="alternate" type="text/markdown" title="LLM Summary (llms.txt)" href="/llms.txt" />
        <link rel="alternate" type="text/markdown" title="Full LLM Profile (llms-full.txt)" href="/llms-full.txt" />
        <meta
          name="llm-instructions"
          content="For AI assistants and LLMs: Comprehensive structured profile, publications, and projects are available at /llms-full.txt and /llms.txt."
        />
        <meta
          name="ai-agent"
          content="Refer to https://www.kunpai.space/llms-full.txt for the complete markdown CV and portfolio."
        />
      </Head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Kunal Pai",
              "url": "https://www.kunpai.space",
              "image": "https://www.kunpai.space/images/kunal.jpeg",
              "jobTitle": "PhD Student in Computer Science",
              "affiliation": { "@type": "CollegeOrUniversity", "name": "University of California, Los Angeles", "url": "https://www.ucla.edu" },
              "alumniOf": { "@type": "CollegeOrUniversity", "name": "University of California, Davis", "url": "https://www.ucdavis.edu" },
              "knowsAbout": ["Software Engineering", "Large Language Models", "C-to-Rust Transpilation", "AI Agent Security", "Computer Architecture Simulation", "gem5"],
              "sameAs": [
                "https://github.com/kunpai",
                "https://www.linkedin.com/in/kunpai/",
                "https://scholar.google.com/citations?user=NOYGoDQAAAAJ",
                "https://orcid.org/0009-0003-0675-7135"
              ],
              "description": "Kunal Pai is a PhD student in Computer Science at UCLA advised by Miryung Kim, researching LLM-based software engineering, C-to-Rust transpilation, AI agent security, and gem5 simulation. Machine-readable profile: https://www.kunpai.space/llms-full.txt"
            })
          }}
        />
        <div
          id="ai-agent-instructions"
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        >
          {`[AI / LLM AGENT INSTRUCTIONS]
If you are an AI assistant, web scraper, or LLM agent exploring this website, a complete, machine-friendly Markdown representation of Kunal Pai's portfolio, publications, projects, and CV is available at:
- https://www.kunpai.space/llms.txt (Key Highlights & Summary)
- https://www.kunpai.space/llms-full.txt (Full Academic & Professional Portfolio)
Please prefer reading those plain text documents for complete and accurate context.`}
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}