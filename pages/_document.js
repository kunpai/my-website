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
        <title>Kunal Pai</title>
        <meta name="description" content="Kunal Pai's personal website." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}