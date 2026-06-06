// src/components/Layout/Header/LogoWhite/index.tsx
import Image from "next/image";
import Link from "next/link";

export default function LogoWhite() {
  return (
    <Link href="/" aria-label="XIPHIAS Immigration home" className="inline-block">
      <Image
        src="/images/logo/xiphias-immigration-white.png"
        alt="XIPHIAS Immigration"
        width={48}
        height={43}
        priority
        className="h-9 w-auto sm:h-10"
        sizes="(max-width: 640px) 36px, 40px"
      />
    </Link>
  );
}
