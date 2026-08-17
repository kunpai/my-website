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
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}