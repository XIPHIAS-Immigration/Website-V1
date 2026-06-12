import ContentAdminClient from "@/components/ContentAdmin/ContentAdminClient";
import { getContentAdminSession, hasContentAdminConfig } from "@/lib/content-admin/auth";
import { listContentAdminItems } from "@/lib/content-admin/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ContentAdminPage() {
  const session = await getContentAdminSession();
  const items = session ? await listContentAdminItems() : [];

  return (
    <ContentAdminClient
      initialItems={items}
      isAuthenticated={Boolean(session)}
      configReady={hasContentAdminConfig()}
      username={session?.username}
    />
  );
}
