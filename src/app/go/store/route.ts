import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";


export function GET() {
  const response = NextResponse.redirect(SITE.storeUrl, 307);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "public, max-age=300");
  return response;
}
