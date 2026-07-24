import ContentAdminPreviewClient from "@/components/ContentAdmin/ContentAdminPreviewClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "Draft Preview | Content Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentAdminPreviewPage() {
  return <ContentAdminPreviewClient />;
}
