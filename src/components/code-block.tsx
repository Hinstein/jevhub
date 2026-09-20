import { CopyButton } from "@/components/copy-button";

type Props = {
  code: string;
  templateSlug?: string;
};

export function CodeBlock({ code, templateSlug }: Props) {
  return (
    <div className="code-wrap">
      <CopyButton text={code} templateSlug={templateSlug} />
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
}
