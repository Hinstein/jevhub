import type { Metadata } from "next";
import { InternationalizedPage } from "@/components/internationalized-pages";
import { intlMetadata, intlRoutePath, intlStaticParams } from "@/i18n/intl-route";

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return intlStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return intlMetadata("fr", intlRoutePath((await params).slug));
}

export default async function FrenchLocalizedPage({ params }: Props) {
  return <InternationalizedPage locale="fr" path={intlRoutePath((await params).slug)} />;
}
