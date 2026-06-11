import { NextResponse } from "next/server";

import { readContentAdminImage } from "@/lib/content-admin/store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params:
    | {
        bucket: string;
        fileName: string;
      }
    | Promise<{
        bucket: string;
        fileName: string;
      }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { bucket, fileName } = await Promise.resolve(context.params);
  const image = await readContentAdminImage(bucket, fileName);

  if (!image) {
    return NextResponse.json({ ok: false, message: "Image not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${image.fileName.replace(/"/g, "")}"`,
      "Content-Type": image.contentType,
    },
  });
}
