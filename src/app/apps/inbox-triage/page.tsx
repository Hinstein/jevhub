import { InboxTriagePage } from "@/components/inbox-triage/inbox-triage-page";
import { pageMetadata } from "@/lib/metadata";

const path = "/apps/inbox-triage";

export const metadata = pageMetadata(
  "AI Email Triage Demo: Sort Messages by Action with Jev",
  "Try a live Jev email triage demo with six sample messages, then paste one email to see suggested reply, review, and read-later queues. No Gmail connection or signup.",
  path,
);

export default function InboxTriageRoute() {
  return <InboxTriagePage locale="en" />;
}
