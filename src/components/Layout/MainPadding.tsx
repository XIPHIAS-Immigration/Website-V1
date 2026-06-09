'use client';
import { usePathname } from 'next/navigation';

export default function MainPadding() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <div style={{ height: 'var(--header-h, 120px)' }} aria-hidden="true" />;
}
