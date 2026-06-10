// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XIPHIAS Immigration",
    short_name: "XIPHIAS",
    description: "Residency, Citizenship & Global Mobility",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b1220",
    lang: "en",
    shortcuts: [
      {
        name: "Open X-Hub",
        short_name: "Hub",
        description: "Client and partner portal",
        url: "/x-hub",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Eligibility Check",
        short_name: "Eligibility",
        description: "Run a quick eligibility check",
        url: "/eligibility",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
      },
    ],
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      // Maskable version (TS only allows one purpose value)
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
