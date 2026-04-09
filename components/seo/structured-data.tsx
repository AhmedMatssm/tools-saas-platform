import Script from 'next/script';

export function StructuredData({ data }: { data: any }) {
  return (
    <Script
      id={`json-ld-${Math.random().toString(36).substring(7)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="afterInteractive"
    />
  );
}
