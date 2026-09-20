import Link from "next/link";
import type { JevTemplate } from "@/types/template";

export function TemplateCard({ template }: { template: JevTemplate }) {
  return (
    <Link className="card card-link" href={`/templates/${template.slug}`}>
      <div className="badges">
        {template.primitives.map((primitive) => (
          <span className="badge" key={primitive}>
            {primitive}
          </span>
        ))}
      </div>
      <h3>{template.title}</h3>
      <p>{template.description}</p>
    </Link>
  );
}
