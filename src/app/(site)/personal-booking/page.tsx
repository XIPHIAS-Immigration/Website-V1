import type { Metadata } from "next";
import ConsultationBookingClient from "@/components/PersonalBooking/ConsultationBookingClient";
import { getProductConfig } from "@/lib/payments/product-catalog";
import {
  CONSULTATION_DURATION_MINUTES,
  CONSULTATION_PRODUCT_TYPE,
} from "@/lib/consultations/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Senior Immigration Advisor Consultation",
  description:
    "Schedule and pay for a private 60-minute immigration strategy consultation with a XIPHIAS senior advisor.",
  alternates: {
    canonical: "https://www.xiphiasimmigration.com/personal-booking",
  },
  openGraph: {
    title: "Book a Senior Advisor Consultation | XIPHIAS Immigration",
    description:
      "Choose an available appointment, provide your consultation objectives and complete secure JioPay checkout.",
    url: "https://www.xiphiasimmigration.com/personal-booking",
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [
      {
        url: "https://www.xiphiasimmigration.com/images/avtar/varun-singh-md-xiphias.jpg",
        width: 1200,
        height: 630,
        alt: "XIPHIAS senior advisor consultation",
      },
    ],
  },
};

export default function PersonalBookingPage() {
  const product = getProductConfig(CONSULTATION_PRODUCT_TYPE);
  const priceInr = product?.priceInr || 25_000;

  return (
    <>
      <ConsultationBookingClient
        initialPriceInr={priceInr}
        initialDurationMinutes={CONSULTATION_DURATION_MINUTES}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "XIPHIAS Senior Advisor Strategy Consultation",
            provider: {
              "@type": "Organization",
              name: "XIPHIAS Immigration",
              url: "https://www.xiphiasimmigration.com",
            },
            offers: {
              "@type": "Offer",
              price: priceInr,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </>
  );
}
