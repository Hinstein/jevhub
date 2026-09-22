import { IdeaValidatorPage } from "@/components/idea-validator/idea-validator-page";
import { pageMetadata } from "@/lib/metadata";

const path = "/apps/startup-idea-validator";

export const metadata = pageMetadata(
  "Startup Idea Validator: Score Your Idea with Jev AI",
  "Describe your startup or product idea, choose your goal, and get an instant 8-factor score powered by Jev. No signup required.",
  path,
);

export default function StartupIdeaValidatorPage() {
  return <IdeaValidatorPage locale="en" />;
}
