import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" aria-label="XIPHIAS Immigration home" className="inline-block">
      <Image
        src="/images/logo/xiphias-immigration.png"
        alt="XIPHIAS Immigration"
        width={2304}
        height={2023}
        priority
        className="h-9 w-auto sm:h-10"
        sizes="(max-width: 640px) 36px, 40px"
      />
    </Link>
  );
}
