import Link from "next/link";
import { ArticleShell } from "@/components/article-shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Jev vs ChatGPT",
  "A neutral comparison of Jev's bounded decision role with generative LLMs such as ChatGPT, plus a practical architecture for using both.",
  "/jev-vs-chatgpt",
);

export default function JevVsChatGPTPage() {
  return (
    <ArticleShell
      title="Jev vs ChatGPT"
      description="Jev and generative LLMs solve different parts of a workflow. Jev is optimized for bounded typed decisions; ChatGPT-style models are optimized for flexible generated language and broader open-ended tasks."
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Jev</th>
              <th>ChatGPT-style LLM</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Primary output</td>
              <td>Typed Choice, Score, or Noul decisions</td>
              <td>Generated text, code, structured output, tool calls</td>
            </tr>
            <tr>
              <td>Open-ended writing</td>
              <td>Not the target shape</td>
              <td>Core strength</td>
            </tr>
            <tr>
              <td>Routing</td>
              <td>Natural fit when candidates are bounded</td>
              <td>Possible, but broader than necessary for many cases</td>
            </tr>
            <tr>
              <td>Scoring</td>
              <td>Explicit ordered rubric primitive</td>
              <td>Usually prompted or constrained into a schema</td>
            </tr>
            <tr>
              <td>Explanations</td>
              <td>No free-form explanation output</td>
              <td>Can explain, summarize, and write prose</td>
            </tr>
            <tr>
              <td>Control flow</td>
              <td>Designed to feed ordinary program branches</td>
              <td>Often used when language generation is itself the task</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>The useful question is not “which one wins?”</h2>
      <p>
        The useful question is which part of your workflow is a bounded
        decision and which part genuinely requires generation. A support system
        may use Jev to route a ticket and a generative model to draft the reply.
        A research pipeline may use Jev to filter thousands of candidates and a
        generative model to synthesize the small set that remains.
      </p>

      <h2>A practical combined architecture</h2>
      <div className="callout">
        input → Jev filter / route / score → generative LLM only where text or
        open-ended reasoning is needed
      </div>

      <h2>About speed and cost claims</h2>
      <p>
        TypeSafe publishes benchmark and workflow results showing large
        differences for System One-shaped tasks. Those are TypeSafe&apos;s own
        measurements and depend on task shape, model choice, state size, and
        network conditions. JevHub therefore does not turn a single headline
        multiplier into a universal “Jev is X times faster” claim.
      </p>
      <p>
        For your own workload, start with the{" "}
        <Link href="/tools/jev-cost-calculator">cost calculator</Link> and run a
        representative evaluation rather than extrapolating from a demo.
      </p>

      <h2>When Jev is the cleaner fit</h2>
      <ul>
        <li>You already know the allowed labels or routes.</li>
        <li>You need a semantic score against a specific rubric.</li>
        <li>You need a cheap pre-filter before a more expensive model.</li>
        <li>You want uncertainty attached to a decision your code can threshold.</li>
      </ul>

      <h2>When a generative LLM is the cleaner fit</h2>
      <ul>
        <li>The output itself is prose, code, a plan, or a summary.</li>
        <li>The useful answer space cannot be specified in advance.</li>
        <li>The user needs an explanation, conversation, or creative response.</li>
      </ul>

      <p>
        Next: read <Link href="/what-is-jev">What is Jev?</Link>, follow the{" "}
        <Link href="/getting-started">quickstart</Link>, or browse{" "}
        <Link href="/templates">decision templates</Link>.
      </p>
    </ArticleShell>
  );
}
