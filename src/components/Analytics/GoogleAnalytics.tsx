import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      {/* Load GA4 library */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />

      {/* Initialize GA4 */}
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Disable automatic page_view; we will send page_view manually on route changes
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
