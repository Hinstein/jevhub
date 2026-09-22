import { redirectToStore } from "@/lib/store-redirect";

export function GET() {
  return redirectToStore();
}
