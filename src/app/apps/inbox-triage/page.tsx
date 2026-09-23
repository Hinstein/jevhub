import { InboxTriagePage } from "@/components/inbox-triage/inbox-triage-page";
import { pageMetadata } from "@/lib/metadata";

const path = "/apps/inbox-triage";

export const metadata = pageMetadata(
  "AI Email Triage Demo: Sort Messages by Action with Jev",
  "Explore six sample emails sorted into reply, review, and read-later queues. Preview an illustrative result or try live Jev when available. No Gmail connection or signup.",
  path,
);

export default function InboxTriageRoute() {
  return <InboxTriagePage locale="en" />;
}
