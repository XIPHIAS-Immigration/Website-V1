// Central testimonial data + types for the carousel

export type Testimonial = {
    name: string;
    role: string;
    image?: string;    // optional avatar path/url (unused for initials-only)
    text: string;      // short quote
    rating?: number;   // 1..5
    verified?: boolean;
  };
  
  export const TESTIMONIALS_PRO: Testimonial[] = [
    {
      name: "Aarav Mehta",
      role: "Software Engineer · Bengaluru",
      text: "Crystal-clear steps and fast follow-ups. I always knew what documents were needed ahead of time.",
      rating: 5,
      verified: true,
    },
    {
      name: "Isabella Rossi",
      role: "Product Manager · Milan",
      text: "Super organized and responsive. The process felt simple and well structured from day one.",
      rating: 5,
      verified: true,
    },
    {
      name: "Hanson Deck",
      role: "UX Designer · Dubai",
      text: "Felt genuinely supported throughout. Communication was proactive and timelines were met.",
      rating: 5,
    },
    {
      name: "Thomas R. Toe",
      role: "Project Manager · Toronto",
      text: "Straight answers and no fluff. Turnaround was faster than expected with zero last-minute surprises.",
      rating: 4,
    },
    {
      name: "Jane Doe",
      role: "Marketing Lead · London",
      text: "Professional and on time. Exactly the partner we needed to move quickly with confidence.",
      rating: 5,
      verified: true,
    },
    {
      name: "Noah Williams",
      role: "Analyst · Auckland",
      text: "They handled the complexity and kept me focused only on what mattered. Huge time saver.",
      rating: 5,
    },
    {
      name: "Maya Patel",
      role: "Founder · Ahmedabad",
      text: "Checklists were spot-on. Every submission went through the first time—no bounce backs.",
      rating: 5,
    },
    {
      name: "David Kim",
      role: "Consultant · Singapore",
      text: "Structured, efficient, and friendly. I appreciated the clarity on fees and timelines.",
      rating: 5,
    },
    {
      name: "Elena Popov",
      role: "Researcher · Lisbon",
      text: "Great at translating rules into plain language. The weekly progress notes were gold.",
      rating: 4,
      verified: true,
    },
    {
      name: "Lucas García",
      role: "Engineer · Valencia",
      text: "Everything was tracked and documented. Zero friction, even across time zones.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Operations · Doha",
      text: "They anticipated requests before they came up. That made all the difference.",
      rating: 5,
    },
    {
      name: "Owen Martin",
      role: "Designer · Melbourne",
      text: "Polite, precise, and fast. The portal updates kept me calm through the process.",
      rating: 5,
    },
  ];
  