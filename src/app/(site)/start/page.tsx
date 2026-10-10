// src/app/(site)/start/page.tsx
// The front door lives inside XIA. This address opens it over the homepage, so
// old links and bookmarks still land in the right place.

import { redirect } from "next/navigation";

export default function StartPage() {
  redirect("/?xia=1");
}
