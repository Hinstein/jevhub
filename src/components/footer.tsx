import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>JevHub</strong>
          <p>{SITE.disclaimer}</p>
        </div>
        <div>
          <Link href="/what-is-jev">What is Jev?</Link>
          {" · "}
          <Link href="/pricing">Pricing</Link>
          {" · "}
          <Link href="/ecosystem">Ecosystem</Link>
        </div>
      </div>
    </footer>
  );
}
