import Image from "next/image";
import { SITE } from "@/lib/site";

type LogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  size?: number;
};

export function Logo({
  alt = SITE.name,
  className,
  priority = false,
  size = 32,
}: LogoProps) {
  return (
    <Image
      className={className}
      src={SITE.logoPath}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
    />
  );
}
