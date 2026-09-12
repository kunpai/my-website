import 'bootstrap/dist/css/bootstrap.css';
import '@/styles/globals.css'
import Layout from '@/components/layout';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';
import { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, SITE_URL } from '@/components/seo';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Defaults; individual pages override these via <Seo /> (same keys). */}
        <title key="title">{SITE_NAME}</title>
        <meta key="description" name="description" content={DEFAULT_DESCRIPTION} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
        <meta key="og:title" property="og:title" content={SITE_NAME} />
        <meta key="og:description" property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta key="og:url" property="og:url" content={SITE_URL + '/'} />
        <meta key="og:image" property="og:image" content={DEFAULT_IMAGE} />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content={SITE_NAME} />
        <meta key="twitter:description" name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta key="twitter:image" name="twitter:image" content={DEFAULT_IMAGE} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title="Kunal Pai — Blog" href="/rss.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
      </Head>
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </>
  )
}
