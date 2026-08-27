import Head from 'next/head';

const SITE_URL = 'https://greencompass.app';

export default function Seo({ title, description, path = '/' }) {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = title.includes('Green Compass') ? title : `${title} — Green Compass`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Green Compass" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_URL}/og.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="800" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/og.jpg`} />
      <meta name="twitter:site" content="@GreenCompassApp" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Green Compass',
            url: SITE_URL,
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web, iOS, Android',
            description,
          }),
        }}
      />
    </Head>
  );
}
