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
      </Head>
      <body>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/honeypot" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} rel="nofollow">Do not click</a>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}