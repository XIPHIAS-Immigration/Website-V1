"use client";

import React from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ChevronLeft,
  Compass,
  FileCheck2,
  Globe2,
  GraduationCap,
  Home,
  Route,
} from "lucide-react";

type Props = { defaultOpen?: boolean };
type FloatingLayout = {
  right: number;
  bottom: number;
  buttonSize: number;
  stackGap: number;
  panelWidth: number;
  panelHeight: number;
};

function getFloatingLayout(width: number): FloatingLayout {
  if (width < 640) {
    return {
      right: 12,
      bottom: 12,
      buttonSize: 52,
      stackGap: 10,
      panelWidth: 360,
      panelHeight: 460,
    };
  }

  if (width < 1024) {
    return {
      right: 14,
      bottom: 14,
      buttonSize: 54,
      stackGap: 10,
      panelWidth: 372,
      panelHeight: 520,
    };
  }

  return {
    right: 20,
    bottom: 20,
    buttonSize: 58,
    stackGap: 12,
    panelWidth: 390,
    panelHeight: 560,
  };
}

function BubbleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10h10" />
      <path d="M7 14h6" />
      <path d="M21 11a8 8 0 0 1-8 8H6l-3 3v-7a8 8 0 1 1 18-4Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function ChatWidget({ defaultOpen = false }: Props) {
  const url = process.env.NEXT_PUBLIC_N8N_CHAT_URL;
  const useInternalXia =
    process.env.NEXT_PUBLIC_XIA_LITE_MODE !== "n8n";

  const [open, setOpen] = React.useState(defaultOpen);
  const [shouldLoadFrame, setShouldLoadFrame] = React.useState(defaultOpen);
  const [expanded, setExpanded] = React.useState(false);
  const [layout, setLayout] = React.useState<FloatingLayout>(() =>
    getFloatingLayout(1280),
  );

  React.useEffect(() => {
    const applyLayout = () => {
      const next = getFloatingLayout(window.innerWidth);
      setLayout(next);

      const root = document.documentElement;
      root.style.setProperty("--floating-chat-right", `${next.right}px`);
      root.style.setProperty(
        "--floating-chat-bottom",
        `calc(${next.bottom}px + env(safe-area-inset-bottom, 0px))`,
      );
      root.style.setProperty("--floating-chat-size", `${next.buttonSize}px`);
      root.style.setProperty("--floating-chat-gap", `${next.stackGap}px`);
    };
    applyLayout();

    const onResize = () => window.requestAnimationFrame(applyLayout);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      const root = document.documentElement;
      root.style.removeProperty("--floating-chat-right");
      root.style.removeProperty("--floating-chat-bottom");
      root.style.removeProperty("--floating-chat-size");
      root.style.removeProperty("--floating-chat-gap");
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (expanded) setExpanded(false);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("xiphias-chat-state", { detail: { open } }),
    );
  }, [open]);

  React.useEffect(
    () => () => {
      window.dispatchEvent(
        new CustomEvent("xiphias-chat-state", { detail: { open: false } }),
      );
    },
    [],
  );

  const z = 2147483000;
  const bottomWithSafeArea = `calc(${layout.bottom}px + env(safe-area-inset-bottom, 0px))`;
  const panelBottom = `calc(${bottomWithSafeArea} + ${layout.buttonSize + layout.stackGap}px)`;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        aria-controls={shouldLoadFrame ? "xiphias-chat-frame" : undefined}
        onClick={() =>
          setOpen((v) => {
            const next = !v;
            if (next) setShouldLoadFrame(true);
            else setExpanded(false);
            return next;
          })
        }
        style={{
          position: "fixed",
          right: layout.right,
          bottom: bottomWithSafeArea,
          width: layout.buttonSize,
          height: layout.buttonSize,
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 9999,
          background: "linear-gradient(135deg, #ceaf23ec 0%, #f0d043 100%)",
          color: "#000000",
          boxShadow:
            "0 12px 28px rgba(12,36,90,0.35), 0 2px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: expanded ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 140ms ease, filter 140ms ease",
          zIndex: z,
        }}
        title={open ? "Close chat" : "Chat with us"}
      >
        {open ? <CloseIcon /> : <BubbleIcon />}
      </button>

      {shouldLoadFrame && !useInternalXia && url && (
        <iframe
          id="xiphias-chat-frame"
          title="XIPHIAS Chat"
          src={url}
          loading="lazy"
          style={{
            position: "fixed",
            right: layout.right,
            bottom: panelBottom,
            width: `min(${layout.panelWidth}px, calc(100vw - ${layout.right * 2}px))`,
            height: `min(${layout.panelHeight}px, calc(100vh - ${layout.bottom * 2 + 16}px))`,
            display: open ? "block" : "none",
            border: "1px solid rgba(28,87,180,0.2)",
            borderRadius: 14,
            boxShadow: "0 18px 40px rgba(0,0,0,.22)",
            background: "#fff",
            zIndex: z - 1,
            contain: "layout style paint",
          }}
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      )}

      {shouldLoadFrame && useInternalXia && (
        <>
        {open && expanded ? (
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.38)",
              backdropFilter: "blur(3px)",
              zIndex: z - 2,
            }}
          />
        ) : null}
        <div
          id="xiphias-chat-frame"
          style={{
            position: "fixed",
            top: expanded ? 12 : undefined,
            left: expanded ? 12 : undefined,
            right: expanded ? 12 : layout.right,
            bottom: expanded ? "calc(12px + env(safe-area-inset-bottom, 0px))" : panelBottom,
            width: expanded ? "auto" : `min(${layout.panelWidth}px, calc(100vw - ${layout.right * 2}px))`,
            height: expanded ? "auto" : `min(${layout.panelHeight}px, calc(100vh - ${layout.bottom * 2 + 16}px))`,
            display: open ? "block" : "none",
            border: "1px solid rgba(28,87,180,0.2)",
            borderRadius: expanded ? 16 : 14,
            boxShadow: expanded ? "0 24px 70px rgba(0,0,0,.34)" : "0 18px 40px rgba(0,0,0,.22)",
            background: "#fff",
            zIndex: z - 1,
            contain: "layout style paint",
            overflow: "hidden",
          }}
        >
          <InternalXiaPanel
            expanded={expanded}
            onToggleExpanded={() => setExpanded((value) => !value)}
            onClose={() => {
              setExpanded(false);
              setOpen(false);
            }}
          />
        </div>
        </>
      )}
    </>
  );
}

type XiaApiResponse = {
  recommendation?: {
    intent: string;
    summary: string;
    criteria?: string[];
    confidence?: number;
    handoffRequired: boolean;
    recommendedPrograms: {
      name: string;
      country?: string;
      reason: string;
      score: number;
      href?: string;
    }[];
    actions: { label: string; href: string; type?: "primary" | "secondary" }[];
    sources?: { label: string; href: string }[];
    evidence?: { title: string; href: string; excerpt: string }[];
  };
};

type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  recommendation?: XiaApiResponse["recommendation"];
};

type GuideScreen =
  | "home"
  | "browse"
  | "process"
  | "business"
  | "routeGoal"
  | "routeRegion"
  | "routeBudget"
  | "routeFamily"
  | "routeReview";

type RouteProfile = {
  goal?: string;
  region?: string;
  budget?: string;
  family?: string;
};

type GuideOption = {
  label: string;
  description: string;
  eyebrow?: string;
  href?: string;
  icon: GuideIconName;
  message?: string;
  next?: GuideScreen;
  routePatch?: Partial<RouteProfile>;
  action?: "recommendRoute";
};

type GuideIconName =
  | "badge"
  | "briefcase"
  | "building"
  | "calendar"
  | "compass"
  | "docs"
  | "globe"
  | "graduation"
  | "home"
  | "route";

const GUIDE_COPY: Record<GuideScreen, { title: string; subtitle: string }> = {
  home: {
    title: "Welcome to XIPHIAS",
    subtitle: "Choose a service area and we will guide you to the right program, country, or advisor.",
  },
  browse: {
    title: "Explore immigration pathways",
    subtitle: "Select a category to view programs, countries, and route details.",
  },
  process: {
    title: "Plan your next step",
    subtitle: "Move from eligibility to documents, review, and case tracking.",
  },
  business: {
    title: "Business and partner services",
    subtitle: "Support for companies, referral partners, and institutional mobility programs.",
  },
  routeGoal: {
    title: "Find the right route",
    subtitle: "Answer a few quick questions and XIA will shortlist suitable options.",
  },
  routeRegion: {
    title: "Preferred destination",
    subtitle: "Choose a region or keep the search open.",
  },
  routeBudget: {
    title: "Budget range",
    subtitle: "This helps separate investment routes from work, study, and business options.",
  },
  routeFamily: {
    title: "Applicant profile",
    subtitle: "Tell us whether this is for you alone or for family inclusion.",
  },
  routeReview: {
    title: "Ready to shortlist",
    subtitle: "Review your choices and generate a focused recommendation.",
  },
};

const GUIDE_OPTIONS: Record<GuideScreen, GuideOption[]> = {
  home: [
    {
      label: "Browse programs",
      eyebrow: "Programs",
      description: "Explore residency, citizenship, skilled migration, and corporate routes.",
      icon: "compass",
      next: "browse",
    },
    {
      label: "Countries covered",
      eyebrow: "Destinations",
      description: "View available countries grouped by immigration pathway.",
      icon: "globe",
      message: "what countries do you offer immigration",
    },
    {
      label: "Find my route",
      eyebrow: "Eligibility",
      description: "Answer quick cards and receive a focused shortlist.",
      icon: "route",
      next: "routeGoal",
    },
    {
      label: "Documents and process",
      eyebrow: "Preparation",
      description: "Prepare documents, risk review, and advisor verification.",
      icon: "docs",
      next: "process",
    },
    {
      label: "Business / partner",
      eyebrow: "Organizations",
      description: "Corporate immigration, referrals, and B2G mobility support.",
      icon: "briefcase",
      next: "business",
    },
    {
      label: "Talk to advisor",
      eyebrow: "Consultation",
      description: "Book a paid consultation through the existing Topmate flow.",
      icon: "calendar",
      href: "/booking",
    },
  ],
  browse: [
    {
      label: "Residency",
      eyebrow: "Live abroad",
      description: "Investment, business, remote worker, and long-stay routes.",
      icon: "home",
      href: "/residency",
    },
    {
      label: "Citizenship",
      eyebrow: "Second passport",
      description: "CBI, donation, real estate, descent, and passport routes.",
      icon: "badge",
      href: "/citizenship",
    },
    {
      label: "Skilled migration",
      eyebrow: "Work abroad",
      description: "Canada, Australia, UK, EU, UAE, and skilled worker routes.",
      icon: "graduation",
      href: "/skilled",
    },
    {
      label: "Corporate immigration",
      eyebrow: "Teams",
      description: "Entity setup, staff transfer, visas, and global mobility.",
      icon: "building",
      href: "/corporate",
    },
    {
      label: "Compare country groups",
      eyebrow: "Overview",
      description: "See all available countries grouped by pathway.",
      icon: "globe",
      message: "what countries do you offer immigration",
    },
  ],
  process: [
    {
      label: "Check eligibility",
      eyebrow: "Assessment",
      description: "Complete the structured eligibility checker.",
      icon: "route",
      href: "/eligibility",
    },
    {
      label: "Book document review",
      eyebrow: "Advisor review",
      description: "Have an advisor verify requirements and document gaps.",
      icon: "calendar",
      href: "/booking",
    },
    {
      label: "Open XIPHIAS Hub",
      eyebrow: "Portal",
      description: "Track documents, milestones, messages, and case status.",
      icon: "docs",
      href: "/x-hub",
    },
    {
      label: "Risk review",
      eyebrow: "Due diligence",
      description: "Review source of funds, PEP, sanctions, and risk flags.",
      icon: "badge",
      message: "risk due diligence source of funds PEP sanctions review",
    },
  ],
  business: [
    {
      label: "Corporate programs",
      eyebrow: "Companies",
      description: "Entity setup, transfers, work permits, and expansion.",
      icon: "building",
      href: "/corporate",
    },
    {
      label: "Partner portal",
      eyebrow: "Referrals",
      description: "Submit referrals and track partner case progress.",
      icon: "briefcase",
      href: "/x-hub/partners",
    },
    {
      label: "B2G / institution",
      eyebrow: "Institutions",
      description: "Bulk inquiry, dashboards, reports, and secure exchange.",
      icon: "globe",
      href: "/x-hub/b2g",
    },
    {
      label: "Partner with us",
      eyebrow: "Apply",
      description: "Open the public partnership intake page.",
      icon: "route",
      href: "/partner-with-us",
    },
  ],
  routeGoal: [
    {
      label: "Live abroad",
      eyebrow: "Residency",
      description: "Residence through investment, business, remote work, study, or family routes.",
      icon: "home",
      next: "routeRegion",
      routePatch: { goal: "residency" },
    },
    {
      label: "Get a second passport",
      eyebrow: "Citizenship",
      description: "Citizenship by investment, descent, or long-term naturalization planning.",
      icon: "badge",
      next: "routeRegion",
      routePatch: { goal: "citizenship" },
    },
    {
      label: "Work abroad",
      eyebrow: "Skilled migration",
      description: "Skilled worker, employer-sponsored, and points-based pathways.",
      icon: "graduation",
      next: "routeRegion",
      routePatch: { goal: "skilled migration" },
    },
    {
      label: "Move or hire staff",
      eyebrow: "Corporate",
      description: "Entity setup, intra-company transfer, and corporate mobility.",
      icon: "building",
      next: "routeRegion",
      routePatch: { goal: "corporate immigration" },
    },
  ],
  routeRegion: [
    {
      label: "Europe",
      eyebrow: "Region",
      description: "EU/Schengen and nearby European programs.",
      icon: "globe",
      next: "routeBudget",
      routePatch: { region: "Europe" },
    },
    {
      label: "Canada / USA",
      eyebrow: "North America",
      description: "Skilled, business, and corporate mobility options.",
      icon: "globe",
      next: "routeBudget",
      routePatch: { region: "Canada or United States" },
    },
    {
      label: "UAE / GCC",
      eyebrow: "Middle East",
      description: "Residency, golden visa, company setup, and work permits.",
      icon: "globe",
      next: "routeBudget",
      routePatch: { region: "UAE or GCC" },
    },
    {
      label: "Open to suggestions",
      eyebrow: "Flexible",
      description: "Let XIA rank options by fit, timeline, and documents.",
      icon: "compass",
      next: "routeBudget",
      routePatch: { region: "open to suggestions" },
    },
  ],
  routeBudget: [
    {
      label: "Under USD 100k",
      eyebrow: "Low investment",
      description: "Usually better for work, study, remote, or business-light routes.",
      icon: "route",
      next: "routeFamily",
      routePatch: { budget: "under USD 100k" },
    },
    {
      label: "USD 100k-300k",
      eyebrow: "Moderate",
      description: "May fit select citizenship, residency, or business routes.",
      icon: "route",
      next: "routeFamily",
      routePatch: { budget: "USD 100k to 300k" },
    },
    {
      label: "USD 300k-500k",
      eyebrow: "Investor",
      description: "Can unlock more investment-led residency or citizenship routes.",
      icon: "route",
      next: "routeFamily",
      routePatch: { budget: "USD 300k to 500k" },
    },
    {
      label: "Not investment-led",
      eyebrow: "Profile based",
      description: "Use work, study, family, company, or remote-work eligibility.",
      icon: "briefcase",
      next: "routeFamily",
      routePatch: { budget: "not investment-led" },
    },
  ],
  routeFamily: [
    {
      label: "Include family",
      eyebrow: "Family",
      description: "Spouse, children, or dependents should be considered.",
      icon: "home",
      next: "routeReview",
      routePatch: { family: "include family" },
    },
    {
      label: "Individual applicant",
      eyebrow: "Single applicant",
      description: "Shortlist routes for one principal applicant.",
      icon: "route",
      next: "routeReview",
      routePatch: { family: "individual applicant" },
    },
  ],
  routeReview: [
    {
      label: "Generate shortlist",
      eyebrow: "Recommendation",
      description: "Use my answers to find relevant XIPHIAS programs and next steps.",
      icon: "compass",
      action: "recommendRoute",
    },
    {
      label: "Complete full eligibility",
      eyebrow: "Detailed check",
      description: "Open the structured eligibility assessment.",
      icon: "route",
      href: "/eligibility",
    },
    {
      label: "Book advisor call",
      eyebrow: "Consultation",
      description: "Speak with an advisor using the Topmate booking flow.",
      icon: "calendar",
      href: "/booking",
    },
  ],
};

function chatId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildRouteQuery(profile: RouteProfile) {
  return [
    "Please shortlist suitable XIPHIAS immigration options. Keep the answer concise.",
    profile.goal ? `Goal: ${profile.goal}.` : "",
    profile.region ? `Destination preference: ${profile.region}.` : "",
    profile.budget ? `Budget: ${profile.budget}.` : "",
    profile.family ? `Applicant type: ${profile.family}.` : "",
    "Return the strongest matches only with one practical next step.",
  ]
    .filter(Boolean)
    .join(" ");
}

function InternalXiaPanel({
  expanded,
  onToggleExpanded,
  onClose,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}) {
  const [message, setMessage] = React.useState("");
  const [turns, setTurns] = React.useState<ChatTurn[]>([]);
  const [screen, setScreen] = React.useState<GuideScreen>("home");
  const [routeProfile, setRouteProfile] = React.useState<RouteProfile>({});
  const [customOpen, setCustomOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns, loading]);

  async function runQuery(value: string, label = value) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    setMessage("");
    setCustomOpen(false);
    setTurns((current) => [...current, { id: chatId(), role: "user", text: label }]);

    try {
      const res = await fetch("/api/platform/xia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as XiaApiResponse;
      const recommendation = data.recommendation;
      setTurns((current) => [
        ...current,
        {
          id: chatId(),
          role: "assistant",
          text: recommendation?.summary ?? "I could not retrieve a confident advisory result. Staff review is recommended.",
          recommendation,
        },
      ]);
    } catch {
      setTurns((current) => [
        ...current,
        {
          id: chatId(),
          role: "assistant",
          text: "I could not reach the advisory service. Please try again or book a consultation.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runQuery(message);
  }

  function chooseOption(option: GuideOption) {
    const nextProfile = { ...routeProfile, ...(option.routePatch ?? {}) };
    if (option.routePatch) setRouteProfile(nextProfile);

    if (option.action === "recommendRoute") {
      void runQuery(buildRouteQuery(nextProfile), "Generate shortlist");
      return;
    }

    if (option.next) {
      if (option.next === "routeGoal") setRouteProfile({});
      setScreen(option.next);
      setTurns([]);
      return;
    }
    if (option.message) {
      void runQuery(option.message, option.label);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          background: "linear-gradient(135deg, #082247 0%, #123f7a 70%, #d8b545 170%)",
          color: "#fff",
          padding: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 0.2 }}>XIPHIAS Advisor</div>
            <div style={{ marginTop: 3, fontSize: 12, color: "rgba(255,255,255,0.76)" }}>
              Program guidance with source-backed checks
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={onToggleExpanded}
              aria-label={expanded ? "Collapse chat" : "Expand chat"}
              title={expanded ? "Collapse chat" : "Expand chat"}
              style={{
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                cursor: "pointer",
                height: 30,
                padding: "0 10px",
                fontSize: 11,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              title="Close chat"
              style={{
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                cursor: "pointer",
                height: 30,
                width: 30,
                fontSize: 16,
                fontWeight: 900,
                lineHeight: "28px",
              }}
            >
              x
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <GuideCards
            screen={screen}
            expanded={expanded}
            routeProfile={routeProfile}
            onBack={screen === "home" ? undefined : () => setScreen("home")}
            onChoose={chooseOption}
          />

          {turns.map((turn) => (
            <ChatBubble key={turn.id} turn={turn} expanded={expanded} />
          ))}

          {loading ? (
            <div
              style={{
                width: "fit-content",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                padding: "10px 12px",
                fontSize: 12,
                color: "#475569",
              }}
            >
              Checking programs and fit...
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setScreen("home");
              setTurns([]);
              setRouteProfile({});
              setCustomOpen(false);
            }}
            style={footerButtonStyle(false)}
          >
            Start over
          </button>
          <span style={{ color: "#64748b", fontSize: 12, fontWeight: 800, padding: "8px 2px" }}>
            You can also type naturally.
          </span>
        </div>
        <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask XIA about a country or pathway"
          style={{
            minWidth: 0,
            flex: 1,
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            padding: "10px 11px",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            border: 0,
            borderRadius: 10,
            background: "#123f7a",
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
            padding: "0 14px",
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? "..." : "Send"}
        </button>
        </form>
      </div>
    </div>
  );
}

function GuideCards({
  screen,
  expanded,
  routeProfile,
  onBack,
  onChoose,
}: {
  screen: GuideScreen;
  expanded: boolean;
  routeProfile: RouteProfile;
  onBack?: () => void;
  onChoose: (option: GuideOption) => void;
}) {
  const copy = GUIDE_COPY[screen];
  const options = GUIDE_OPTIONS[screen];

  return (
    <section
      className="xia-guide-shell"
      style={{
        border: "1px solid rgba(18,63,122,0.12)",
        borderRadius: 18,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        boxShadow: "0 16px 34px rgba(15,23,42,0.08)",
        padding: expanded ? 18 : 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, color: "#071a3a", fontSize: expanded ? 18 : 15, fontWeight: 900 }}>
            {copy.title}
          </h3>
          <p style={{ margin: "5px 0 0", color: "#52647f", fontSize: expanded ? 13.5 : 12.5, lineHeight: 1.5 }}>
            {copy.subtitle}
          </p>
          {isRouteScreen(screen) ? <RouteProfileChips profile={routeProfile} /> : null}
        </div>
        {onBack ? (
          <button type="button" onClick={onBack} style={smallGhostButtonStyle}>
            <ChevronLeft size={14} strokeWidth={2.4} />
            Back
          </button>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: expanded ? "repeat(2, minmax(0, 1fr))" : "1fr",
          marginTop: 12,
        }}
      >
        {options.map((option) =>
          option.href ? (
            <a key={option.label} href={option.href} className="xia-guide-card" style={guideCardStyle}>
              <GuideCardContent option={option} />
            </a>
          ) : (
            <button
              key={option.label}
              type="button"
              className="xia-guide-card"
              onClick={() => onChoose(option)}
              style={{ ...guideCardStyle, cursor: "pointer", textAlign: "left", width: "100%" }}
            >
              <GuideCardContent option={option} />
            </button>
          ),
        )}
      </div>
      <style>{`
        .xia-guide-shell {
          animation: xiaGuideIn 220ms ease-out both;
        }
        .xia-guide-card {
          position: relative;
          overflow: hidden;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        .xia-guide-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(216,181,69,0.14), rgba(18,63,122,0.04));
          opacity: 0;
          transition: opacity 160ms ease;
          pointer-events: none;
        }
        .xia-guide-card:hover {
          transform: translateY(-2px);
          border-color: rgba(18,63,122,0.28) !important;
          box-shadow: 0 14px 26px rgba(15,23,42,0.10);
          background: #ffffff !important;
        }
        .xia-guide-card:hover::after {
          opacity: 1;
        }
        @keyframes xiaGuideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function isRouteScreen(screen: GuideScreen) {
  return screen.startsWith("route");
}

function RouteProfileChips({ profile }: { profile: RouteProfile }) {
  const chips = [
    profile.goal ? `Goal: ${profile.goal}` : "",
    profile.region ? `Destination: ${profile.region}` : "",
    profile.budget ? `Budget: ${profile.budget}` : "",
    profile.family ? `Applicant: ${profile.family}` : "",
  ].filter(Boolean);

  if (!chips.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {chips.map((chip) => (
        <span
          key={chip}
          style={{
            border: "1px solid rgba(18,63,122,0.14)",
            borderRadius: 999,
            background: "#f1f6ff",
            color: "#123f7a",
            fontSize: 11,
            fontWeight: 800,
            padding: "5px 8px",
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function GuideCardContent({ option }: { option: GuideOption }) {
  return (
    <>
      <span style={{ alignItems: "flex-start", display: "flex", gap: 11, position: "relative", zIndex: 1 }}>
        <span
          style={{
            alignItems: "center",
            background: "linear-gradient(135deg, #123f7a 0%, #1e5aa8 100%)",
            borderRadius: 12,
            boxShadow: "0 8px 18px rgba(18,63,122,0.18)",
            color: "#fff",
            display: "inline-flex",
            flex: "0 0 auto",
            height: 36,
            justifyContent: "center",
            width: 36,
          }}
        >
          <GuideIcon name={option.icon} />
        </span>
        <span style={{ minWidth: 0 }}>
          {option.eyebrow ? (
            <span style={{ color: "#b08918", display: "block", fontSize: 10, fontWeight: 900, letterSpacing: 0.7, textTransform: "uppercase" }}>
              {option.eyebrow}
            </span>
          ) : null}
          <span style={{ color: "#0f172a", display: "block", fontSize: 13.5, fontWeight: 900, marginTop: option.eyebrow ? 2 : 0 }}>
            {option.label}
          </span>
          <span style={{ color: "#5c6d86", display: "block", fontSize: 12, lineHeight: 1.45, marginTop: 4 }}>
            {option.description}
          </span>
          <span style={{ alignItems: "center", color: "#123f7a", display: "inline-flex", gap: 5, fontSize: 11.5, fontWeight: 900, marginTop: 9 }}>
            {option.href ? "Open" : "Continue"}
            <ArrowRight size={13} strokeWidth={2.7} />
          </span>
        </span>
      </span>
    </>
  );
}

function GuideIcon({ name }: { name: GuideIconName }) {
  const props = { size: 18, strokeWidth: 2.3 };
  switch (name) {
    case "badge":
      return <BadgeCheck {...props} />;
    case "briefcase":
      return <BriefcaseBusiness {...props} />;
    case "building":
      return <Building2 {...props} />;
    case "calendar":
      return <CalendarCheck {...props} />;
    case "docs":
      return <FileCheck2 {...props} />;
    case "globe":
      return <Globe2 {...props} />;
    case "graduation":
      return <GraduationCap {...props} />;
    case "home":
      return <Home {...props} />;
    case "route":
      return <Route {...props} />;
    case "compass":
    default:
      return <Compass {...props} />;
  }
}

const guideCardStyle: React.CSSProperties = {
  border: "1px solid rgba(18,63,122,0.12)",
  borderRadius: 14,
  background: "linear-gradient(180deg, #ffffff 0%, #f6f9fe 100%)",
  color: "#0f172a",
  display: "block",
  minHeight: 98,
  padding: "14px 14px",
  textDecoration: "none",
};

const smallGhostButtonStyle: React.CSSProperties = {
  alignItems: "center",
  border: "1px solid #dbe3ef",
  borderRadius: 999,
  background: "#fff",
  color: "#123f7a",
  cursor: "pointer",
  display: "inline-flex",
  gap: 3,
  fontSize: 11,
  fontWeight: 900,
  padding: "6px 9px",
};

function footerButtonStyle(active: boolean): React.CSSProperties {
  return {
    border: active ? "1px solid #123f7a" : "1px solid #dbe3ef",
    borderRadius: 999,
    background: active ? "#123f7a" : "#f8fafc",
    color: active ? "#fff" : "#123f7a",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 900,
    padding: "8px 10px",
  };
}

function ChatBubble({ turn, expanded }: { turn: ChatTurn; expanded: boolean }) {
  const isUser = turn.role === "user";
  const recommendation = turn.recommendation;
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: isUser ? "86%" : "96%",
          border: isUser ? "1px solid #123f7a" : "1px solid #e2e8f0",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "#123f7a" : "#fff",
          boxShadow: isUser ? "none" : "0 8px 20px rgba(15,23,42,0.06)",
          color: isUser ? "#fff" : "#0f172a",
          padding: "11px 12px",
        }}
      >
        {recommendation ? (
          <RecommendationView recommendation={recommendation} expanded={expanded} />
        ) : (
          <PlainMessage text={turn.text} isUser={isUser} />
        )}
      </div>
    </div>
  );
}

function PlainMessage({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (isUser || lines.length < 2) {
    return <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{text}</p>;
  }

  return (
    <div style={{ fontSize: 13, lineHeight: 1.55 }}>
      <p style={{ margin: 0, fontWeight: 800 }}>{lines[0]}</p>
      <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
        {lines.slice(1).map((line) => (
          <li key={line} style={{ marginTop: 3 }}>
            {line.replace(/^\d+\.\s*/, "")}
          </li>
        ))}
      </ol>
    </div>
  );
}

function RecommendationView({
  recommendation,
  expanded,
}: {
  recommendation: NonNullable<XiaApiResponse["recommendation"]>;
  expanded: boolean;
}) {
  const isCountryOverview = recommendation.intent === "country_overview";
  const visiblePrograms = recommendation.recommendedPrograms.slice(0, expanded ? 3 : isCountryOverview ? 3 : 2);
  const primaryAction = recommendation.actions[0];
  const moreCount = Math.max(0, recommendation.recommendedPrograms.length - visiblePrograms.length);
  const lead = conversationLead(recommendation);
  const conversationalIntent = ["greeting", "thanks", "assistant_help", "human_handoff"].includes(recommendation.intent);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ color: "#123f7a", fontSize: 11, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
          {formatIntentLabel(recommendation.intent)}
        </span>
        {typeof recommendation.confidence === "number" && !conversationalIntent ? (
          <span style={{ borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 800, padding: "3px 7px" }}>
            Confidence {recommendation.confidence}
          </span>
        ) : null}
        {recommendation.handoffRequired ? (
          <span style={{ borderRadius: 999, background: "#fffbeb", color: "#92400e", fontSize: 11, fontWeight: 800, padding: "3px 7px" }}>
            Advisor review
          </span>
        ) : null}
      </div>

      <p style={{ margin: "9px 0 0", fontSize: 13.5, fontWeight: 900, color: "#0f172a", lineHeight: 1.45 }}>
        {lead.title}
      </p>
      <p style={{ margin: "5px 0 0", color: "#334155", fontSize: 12.5, lineHeight: 1.55 }}>
        {lead.body}
      </p>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {visiblePrograms.map((program) => {
          const href = getProgramHref(program, recommendation);
          const CardTag = href ? "a" : "div";
          return (
          <CardTag
            key={`${program.name}-${program.country}`}
            href={href || undefined}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#f8fafc",
              color: "#0f172a",
              display: "block",
              padding: 10,
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ fontSize: 13, lineHeight: 1.35 }}>{program.name}</strong>
              {program.score >= 70 ? (
                <span style={{ color: "#047857", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>
                  Good fit
                </span>
              ) : null}
            </div>
            {program.country ? <div style={{ marginTop: 2, color: "#64748b", fontSize: 12 }}>{program.country}</div> : null}
            <p style={{ margin: "7px 0 0", color: "#475569", fontSize: 12, lineHeight: 1.45 }}>
              {shortReason(program.reason, expanded, recommendation.intent)}
            </p>
            {href ? (
              <span style={{ alignItems: "center", color: "#123f7a", display: "inline-flex", fontSize: 11.5, fontWeight: 900, gap: 5, marginTop: 8 }}>
                Open details <ArrowRight size={13} strokeWidth={2.7} />
              </span>
            ) : null}
          </CardTag>
        );
        })}
      </div>

      {moreCount > 0 ? (
        <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 12, fontWeight: 700 }}>
          {expanded ? `${moreCount} more option${moreCount === 1 ? "" : "s"} available after advisor review.` : `I kept this short. Expand to see one more option.`}
        </p>
      ) : null}

      {expanded && recommendation.sources?.length ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 900, marginBottom: 6, textTransform: "uppercase" }}>
            Checked against
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {recommendation.sources.slice(0, 4).map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              style={{
                border: "1px solid #dbe3ef",
                borderRadius: 999,
                color: "#123f7a",
                display: "inline-flex",
                fontSize: 11,
                fontWeight: 800,
                maxWidth: "100%",
                overflow: "hidden",
                padding: "5px 8px",
                textDecoration: "none",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </a>
          ))}
          </div>
        </div>
      ) : null}

      <p style={{ margin: "10px 0 0", color: "#334155", fontSize: 12.5, lineHeight: 1.5 }}>
        {nextPrompt(recommendation)}
      </p>

      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 7 }}>
        {recommendation.actions.slice(0, expanded ? 3 : 2).map((action, index) => {
          const primary = action.type === "primary" || index === 0;
          return (
            <a
              key={action.href}
              href={action.href}
              style={{
                border: primary ? "1px solid #123f7a" : "1px solid #dbe3ef",
                borderRadius: 9,
                background: primary ? "#123f7a" : "#fff",
                color: primary ? "#fff" : "#123f7a",
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              {action.label}
            </a>
          );
        })}
        {primaryAction ? null : (
          <a
            href="/booking"
            style={{
              border: "1px solid #123f7a",
              borderRadius: 9,
              background: "#123f7a",
              color: "#fff",
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Book consultation
          </a>
        )}
      </div>
    </div>
  );
}

function formatIntentLabel(intent: string) {
  if (intent === "greeting" || intent === "thanks" || intent === "assistant_help") return "XIA assistant";
  if (intent === "human_handoff") return "Advisor handoff";
  if (intent === "country_overview") return "Country coverage";
  if (intent === "program_advisory") return "Program shortlist";
  if (intent === "document_readiness") return "Document planning";
  if (intent === "risk_review") return "Risk review";
  return intent.replaceAll("_", " ");
}

function conversationLead(recommendation: NonNullable<XiaApiResponse["recommendation"]>) {
  if (recommendation.intent === "greeting" || recommendation.intent === "assistant_help") {
    return {
      title: "Hi, I am XIA. How can I help?",
      body: recommendation.summary,
    };
  }

  if (recommendation.intent === "thanks") {
    return {
      title: "Glad to help.",
      body: recommendation.summary,
    };
  }

  if (recommendation.intent === "human_handoff") {
    return {
      title: "Yes, I can help you reach an advisor.",
      body: recommendation.summary,
    };
  }

  if (recommendation.intent === "country_overview") {
    return {
      title: "Yes. XIPHIAS covers multiple immigration pathways.",
      body: "I grouped the options by route type so you can choose the direction first instead of reading a long country dump.",
    };
  }

  if (recommendation.handoffRequired) {
    return {
      title: "I found a possible direction, but it needs advisor review.",
      body: shorten(recommendation.summary, 118),
    };
  }

  return {
    title: "Based on your answers, I would start with these options.",
    body: shorten(recommendation.summary, 118),
  };
}

function nextPrompt(recommendation: NonNullable<XiaApiResponse["recommendation"]>) {
  if (recommendation.intent === "greeting" || recommendation.intent === "assistant_help") {
    return "You can type something like: I want Europe residency for my family under 300k.";
  }
  if (recommendation.intent === "thanks") {
    return "Tell me your destination, goal, or budget whenever you are ready.";
  }
  if (recommendation.intent === "human_handoff") {
    return "If you share your country and goal first, the advisor call can be more focused.";
  }
  if (recommendation.intent === "country_overview") {
    return "Tell me a country, budget, or goal and I can narrow this down.";
  }
  if (recommendation.handoffRequired) {
    return "You can ask a follow-up, or book an advisor to verify eligibility and documents.";
  }
  return "Want me to compare these by cost, timeline, family inclusion, or documents?";
}

function shorten(value: string, max: number) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function shortReason(value: string, expanded = false, intent?: string) {
  if (intent === "country_overview") {
    return expanded
      ? shorten(value.replace(/^Countries:\s*/i, "Countries include: "), 150)
      : "Open this pathway to see available countries and program pages.";
  }
  const [main, criteria] = value.split("Criteria:");
  const selected = main.trim() || criteria?.trim() || value;
  return shorten(selected.replace(/^Why Choose This Route\s*-?\s*/i, ""), expanded ? 180 : 92);
}

function getProgramHref(
  program: NonNullable<XiaApiResponse["recommendation"]>["recommendedPrograms"][number],
  recommendation: NonNullable<XiaApiResponse["recommendation"]>,
) {
  if (program.href) return program.href;
  const bySource = recommendation.sources?.find((source) => source.label === program.name);
  if (bySource?.href) return bySource.href;
  const byEvidence = recommendation.evidence?.find((item) => item.title === program.name);
  return byEvidence?.href ?? "";
}
