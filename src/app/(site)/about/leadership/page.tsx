import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Expertise & Leadership – XIPHIAS Immigration',
  description: 'Meet the leadership team and senior advisors at XIPHIAS Immigration — 17+ years of expertise in residency, citizenship and global mobility.',
  alternates: { canonical: '/about/leadership' },
};

export default function LeadershipPage() {
  redirect('/teams');
}
