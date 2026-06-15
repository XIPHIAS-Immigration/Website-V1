"use client";

import React from "react";
import {
  ArrowRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { TOPMATE_BOOKING_URL } from "@/lib/topmate";

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
  const [pillExpanded, setPillExpanded] = React.useState(false);
  const pillTimerRef  = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /* Auto-expand pill on mount, collapse after 5 s */
  React.useEffect(() => {
    const start = setTimeout(() => {
      setPillExpanded(true);
      pillTimerRef.current = setTimeout(() => setPillExpanded(false), 5000);
    }, 1000);
    return () => {
      clearTimeout(start);
      if (pillTimerRef.current)  clearTimeout(pillTimerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const onPillMouseEnter = () => {
    if (open) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (pillTimerRef.current)  { clearTimeout(pillTimerRef.current); pillTimerRef.current = null; }
    setPillExpanded(true);
  };
  const onPillMouseLeave = () => {
    if (open) return;
    hoverTimerRef.current = setTimeout(() => setPillExpanded(false), 400);
  };

  const z = 2147483000;
  const bottomWithSafeArea = `calc(${layout.bottom}px + env(safe-area-inset-bottom, 0px))`;
  const panelBottom = `calc(${bottomWithSafeArea} + ${layout.buttonSize + layout.stackGap}px)`;

  /* whether pill text is visible */
  const showPill = pillExpanded && !open;

  return (
    <>
      {/* Pulse glow ring — sits behind the button, anchored to the icon position */}
      {!open && !expanded && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            right: layout.right,
            bottom: bottomWithSafeArea,
            width: layout.buttonSize,
            height: layout.buttonSize,
            borderRadius: 9999,
            background: "rgba(240, 208, 67, 0.45)",
            animation: "chatPulse 2.6s ease-out infinite",
            zIndex: z - 1,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Trigger button */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "How can I help you?"}
        aria-expanded={open}
        aria-controls={shouldLoadFrame ? "xiphias-chat-frame" : undefined}
        onMouseEnter={onPillMouseEnter}
        onMouseLeave={onPillMouseLeave}
        onClick={() =>
          setOpen((v) => {
            const next = !v;
            if (next) { setShouldLoadFrame(true); setPillExpanded(false); }
            else setExpanded(false);
            return next;
          })
        }
        style={{
          position: "fixed",
          right: layout.right,
          bottom: bottomWithSafeArea,
          height: layout.buttonSize,
          /* pill expands leftward — right edge stays anchored */
          maxWidth: showPill ? 230 : layout.buttonSize,
          minWidth: layout.buttonSize,
          width: "auto",
          overflow: "hidden",
          whiteSpace: "nowrap",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 9999,
          background: open
            ? "linear-gradient(135deg,#1c57b4 0%,#0f3a8a 100%)"
            : "linear-gradient(135deg, #ceaf23ec 0%, #f0d043 100%)",
          color: open ? "#ffffff" : "#1a1000",
          boxShadow: "0 12px 28px rgba(12,36,90,0.35), 0 2px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: expanded ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: showPill ? 8 : 0,
          padding: showPill ? `0 18px 0 14px` : "0",
          transition: [
            "max-width 380ms cubic-bezier(0.34,1.56,0.64,1)",
            "padding 380ms cubic-bezier(0.34,1.56,0.64,1)",
            "gap 380ms ease",
            "background 200ms ease",
            "transform 140ms ease",
            "filter 140ms ease",
          ].join(", "),
          zIndex: z,
        }}
      >
        {open ? (
          <CloseIcon />
        ) : (
          <>
            <Sparkles
              size={22}
              strokeWidth={1.8}
              style={{ flexShrink: 0, transition: "transform 200ms ease" }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                opacity: showPill ? 1 : 0,
                maxWidth: showPill ? 140 : 0,
                overflow: "hidden",
                transition: "opacity 220ms ease 120ms, max-width 380ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              How can I help?
            </span>
            {showPill && (
              <ArrowRight
                size={13}
                strokeWidth={2.5}
                style={{ flexShrink: 0, opacity: 0.7 }}
              />
            )}
          </>
        )}
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
    title: "How can I help?",
    subtitle: "",
  },
  browse: {
    title: "What would you like to explore?",
    subtitle: "",
  },
  process: {
    title: "Plan the next step",
    subtitle: "",
  },
  business: {
    title: "Business and partner services",
    subtitle: "",
  },
  routeGoal: {
    title: "What is your main goal?",
    subtitle: "",
  },
  routeRegion: {
    title: "Preferred destination",
    subtitle: "",
  },
  routeBudget: {
    title: "Budget range",
    subtitle: "",
  },
  routeFamily: {
    title: "Applicant profile",
    subtitle: "",
  },
  routeReview: {
    title: "Ready to shortlist",
    subtitle: "",
  },
};

const GUIDE_OPTIONS: Record<GuideScreen, GuideOption[]> = {
  home: [
    {
      label: "Programmes",
      eyebrow: "Programmes",
      description: "Explore residency, citizenship, skilled migration, and corporate routes.",
      icon: "compass",
      next: "browse",
    },
    {
      label: "Countries covered",
      eyebrow: "Countries",
      description: "View available countries grouped by immigration pathway.",
      icon: "globe",
      message: "what countries do you offer immigration",
    },
    {
      label: "Find my route",
      eyebrow: "Eligibility",
      description: "Answer a guided route check and receive a focused shortlist.",
      icon: "route",
      next: "routeGoal",
    },
    {
      label: "XIA Intelligence",
      eyebrow: "Assessment",
      description: "Open the guided XIPHIAS route, deep analysis, and US visa assessment suite.",
      icon: "compass",
      href: "/xia-intelligence",
    },
    {
      label: "Documents and process",
      eyebrow: "Documents",
      description: "Prepare documents, risk review, and advisor verification.",
      icon: "docs",
      next: "process",
    },
    {
      label: "Business / partner",
      eyebrow: "Business",
      description: "Corporate immigration, referrals, and B2G mobility support.",
      icon: "briefcase",
      next: "business",
    },
    {
      label: "Talk to advisor",
      eyebrow: "Advisor",
      description: "Book a paid consultation through the existing Topmate flow.",
      icon: "calendar",
      href: TOPMATE_BOOKING_URL,
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
      href: TOPMATE_BOOKING_URL,
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
      href: TOPMATE_BOOKING_URL,
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

function normalizeGuideCommand(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function optionSearchText(option: GuideOption) {
  return normalizeGuideCommand([option.label, option.eyebrow, option.description].filter(Boolean).join(" "));
}

function getOptionByScreen(screen: GuideScreen, index: number) {
  return GUIDE_OPTIONS[screen]?.[index];
}

function findTypedGuideOption(value: string, screen: GuideScreen) {
  const command = normalizeGuideCommand(value);
  if (!command) return null;

  const numberMatch = command.match(/^(?:option\s*)?([1-9])$/);
  if (numberMatch) {
    const option = GUIDE_OPTIONS[screen]?.[Number(numberMatch[1]) - 1];
    if (option) return option;
  }

  const currentScreenOption = GUIDE_OPTIONS[screen]?.find((option) => {
    const label = normalizeGuideCommand(option.label);
    const eyebrow = normalizeGuideCommand(option.eyebrow ?? "");
    const search = optionSearchText(option);
    return command === label || command === eyebrow || search.split(" ").includes(command);
  });
  if (currentScreenOption) return currentScreenOption;

  const directRoutes: { terms: string[]; option?: GuideOption }[] = [
    { terms: ["residency", "residence", "golden visa", "live abroad"], option: getOptionByScreen("browse", 0) },
    { terms: ["citizenship", "second passport", "passport"], option: getOptionByScreen("browse", 1) },
    { terms: ["skilled", "skilled migration", "work abroad", "work visa", "job"], option: getOptionByScreen("browse", 2) },
    { terms: ["programme", "programmes", "program", "programs", "browse programs"], option: getOptionByScreen("home", 0) },
    { terms: ["corporate", "corporate immigration", "company", "business"], option: getOptionByScreen("browse", 3) },
    { terms: ["country", "countries", "destinations", "where"], option: getOptionByScreen("home", 1) },
    { terms: ["eligibility", "find route", "find my route", "assessment"], option: getOptionByScreen("home", 2) },
    { terms: ["documents", "document", "process", "checklist"], option: getOptionByScreen("home", 3) },
    { terms: ["partner", "b2b", "b2g", "institution"], option: getOptionByScreen("home", 4) },
    { terms: ["advisor", "consultation", "consult", "book", "call"], option: getOptionByScreen("home", 5) },
  ];

  return (
    directRoutes.find(({ terms, option }) => option && terms.some((term) => command === term || command.includes(term)))?.option ??
    null
  );
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
    const typedOption = findTypedGuideOption(message, screen);
    if (typedOption) {
      chooseOption(typedOption, message.trim());
      return;
    }
    await runQuery(message);
  }

  function chooseOption(option: GuideOption, typedLabel?: string) {
    if (typedLabel) setMessage("");
    const nextProfile = { ...routeProfile, ...(option.routePatch ?? {}) };
    if (option.routePatch) setRouteProfile(nextProfile);

    if (option.href) {
      const selectedLabel = typedLabel || option.label;
      setTurns((current) => [
        ...current,
        { id: chatId(), role: "user", text: selectedLabel },
        { id: chatId(), role: "assistant", text: `Opening ${option.label}.` },
      ]);
      window.setTimeout(() => {
        window.location.href = option.href!;
      }, 250);
      return;
    }

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
      void runQuery(option.message, typedLabel || option.label);
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
            <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 0.2 }}>XIA by XIPHIAS</div>
            <div style={{ marginTop: 3, fontSize: 12, color: "rgba(255,255,255,0.76)" }}>
              Programmes, visas, countries, and advisor routing
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
          <GuideMenu
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
          placeholder="Type a country, visa, or programme"
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

function GuideMenu({
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
  const isHome = screen === "home";

  return (
    <section
      className="xia-guide-shell"
      style={{
        border: "1px solid rgba(18,63,122,0.10)",
        borderRadius: 16,
        background: "#ffffff",
        boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: isHome
            ? "linear-gradient(135deg, rgba(8,34,71,0.96) 0%, rgba(18,63,122,0.96) 72%, rgba(216,181,69,0.82) 160%)"
            : "linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%)",
          color: isHome ? "#fff" : "#071a3a",
          padding: expanded ? "16px 18px 14px" : "14px",
        }}
      >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, color: "inherit", fontSize: expanded ? 18 : 15, fontWeight: 900 }}>
            {copy.title}
          </h3>
          {copy.subtitle ? (
            <p style={{ margin: "5px 0 0", color: isHome ? "rgba(255,255,255,0.78)" : "#52647f", fontSize: expanded ? 13.5 : 12.5, lineHeight: 1.5 }}>
              {copy.subtitle}
            </p>
          ) : null}
          {isRouteScreen(screen) ? <RouteProfileChips profile={routeProfile} /> : null}
        </div>
        {onBack ? (
          <button type="button" onClick={onBack} style={smallGhostButtonStyle}>
            <ChevronLeft size={14} strokeWidth={2.4} />
            Back
          </button>
        ) : null}
      </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 0,
          padding: 0,
        }}
        role="list"
      >
        {options.map((option, index) =>
          option.href ? (
            <a key={option.label} href={option.href} className="xia-guide-choice" style={guideChoiceStyle}>
              <GuideMenuItemContent option={option} index={index} />
            </a>
          ) : (
            <button
              key={option.label}
              type="button"
              className="xia-guide-choice"
              onClick={() => onChoose(option)}
              style={{ ...guideChoiceStyle, cursor: "pointer", textAlign: "left", width: "100%" }}
            >
              <GuideMenuItemContent option={option} index={index} />
            </button>
          ),
        )}
      </div>
      <style>{`
        .xia-guide-shell {
          animation: xiaGuideIn 220ms ease-out both;
        }
        .xia-guide-choice {
          position: relative;
          overflow: hidden;
          transition: background 160ms ease, color 160ms ease;
        }
        .xia-guide-choice:hover {
          background: #f6f9fe !important;
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

function GuideMenuItemContent({ option, index }: { option: GuideOption; index: number }) {
  return (
    <>
      <span style={{ alignItems: "center", display: "grid", gap: 10, gridTemplateColumns: "28px minmax(0, 1fr) auto", position: "relative", zIndex: 1 }}>
        <span
          style={{
            alignItems: "center",
            background: "#eef5ff",
            border: "1px solid rgba(18,63,122,0.16)",
            borderRadius: 999,
            color: "#123f7a",
            display: "inline-flex",
            fontSize: 11,
            fontWeight: 900,
            height: 28,
            justifyContent: "center",
            width: 28,
          }}
        >
          {index + 1}
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ color: "#0f172a", display: "block", fontSize: 13.5, fontWeight: 900, lineHeight: 1.35 }}>
            {option.label}
          </span>
        </span>
        <ArrowRight size={13} strokeWidth={2.8} style={{ color: "#123f7a", flexShrink: 0 }} />
      </span>
    </>
  );
}

const guideChoiceStyle: React.CSSProperties = {
  border: 0,
  borderTop: "1px solid #e8eef6",
  background: "transparent",
  color: "#0f172a",
  display: "block",
  minHeight: "auto",
  padding: "8px 14px",
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
        className="xia-chat-bubble"
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
      <style>{`
        .xia-chat-bubble {
          animation: xiaBubbleIn 180ms ease-out both;
        }
        @keyframes xiaBubbleIn {
          from { opacity: 0; transform: translateY(6px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
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
  const visiblePrograms = recommendation.recommendedPrograms.slice(0, expanded ? (isCountryOverview ? 6 : 4) : isCountryOverview ? 4 : 3);
  const moreCount = Math.max(0, recommendation.recommendedPrograms.length - visiblePrograms.length);
  const lead = conversationLead(recommendation);
  const conversationalIntent = ["greeting", "thanks", "assistant_help", "human_handoff"].includes(recommendation.intent);
  const actionLinks = recommendation.actions.slice(0, expanded ? 3 : 2);

  return (
    <div className="xia-response">
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ color: "#123f7a", fontSize: 10.5, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
          {formatIntentLabel(recommendation.intent)}
        </span>
        {typeof recommendation.confidence === "number" && !conversationalIntent ? (
          <span style={{ borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontSize: 10.5, fontWeight: 800, padding: "3px 7px" }}>
            Confidence {recommendation.confidence}
          </span>
        ) : null}
        {recommendation.handoffRequired ? (
          <span style={{ borderRadius: 999, background: "#fffbeb", color: "#92400e", fontSize: 10.5, fontWeight: 800, padding: "3px 7px" }}>
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

      {visiblePrograms.length ? (
        <div style={{ marginTop: 11 }}>
          <div style={{ color: "#64748b", fontSize: 10.5, fontWeight: 900, letterSpacing: 0.7, marginBottom: 7, textTransform: "uppercase" }}>
            {conversationalIntent ? "Suggested starting points" : isCountryOverview ? "Choose a pathway" : "Best matches"}
          </div>
          <div style={{ display: "grid", gap: 0 }}>
        {visiblePrograms.map((program, index) => {
          const href = getProgramHref(program, recommendation);
          const title = compactResultLabel(program.name);
          const country = program.country && !program.country.toLowerCase().includes("countries") ? program.country : "";
          return (
            <a
              key={`${program.name}-${program.country}`}
              href={href || "/eligibility"}
              className="xia-result-row"
              style={{
                alignItems: "flex-start",
                border: 0,
                borderTop: "1px solid #e8eef6",
                borderRadius: 0,
                background: "transparent",
                color: "#0f172a",
                display: "grid",
                gap: 8,
                gridTemplateColumns: "26px minmax(0, 1fr) auto",
                padding: "10px 0",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  alignItems: "center",
                  background: "#eef5ff",
                  border: "1px solid rgba(18,63,122,0.14)",
                  borderRadius: 999,
                  color: "#123f7a",
                  display: "inline-flex",
                  fontSize: 10.5,
                  fontWeight: 900,
                  height: 24,
                  justifyContent: "center",
                  width: 24,
                }}
              >
                {index + 1}
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: 12.6, lineHeight: 1.32 }}>{title}</strong>
                <span style={{ color: "#64748b", display: "block", fontSize: 11.4, lineHeight: 1.35, marginTop: 2 }}>
                  {isCountryOverview ? shortReason(program.reason, false, recommendation.intent) : [country, shortReason(program.reason, expanded, recommendation.intent)].filter(Boolean).join(" - ")}
                </span>
              </span>
              <span style={{ alignItems: "center", color: "#123f7a", display: "inline-flex", fontSize: 11.5, fontWeight: 900, gap: 4, marginTop: 2, whiteSpace: "nowrap" }}>
                Open <ArrowRight size={12} strokeWidth={2.7} />
              </span>
            </a>
          );
        })}
          </div>
      </div>
      ) : null}

      {moreCount > 0 ? (
        <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 11.7, fontWeight: 700 }}>
          {expanded ? `${moreCount} more option${moreCount === 1 ? "" : "s"} can be reviewed by an advisor.` : `More options are available in expanded view.`}
        </p>
      ) : null}

      {expanded && recommendation.sources?.length ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#64748b", fontSize: 10.5, fontWeight: 900, letterSpacing: 0.7, marginBottom: 6, textTransform: "uppercase" }}>
            Website pages checked
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
        {actionLinks.map((action, index) => {
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
      </div>
      <style>{`
        .xia-result-row {
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .xia-result-row:hover {
          transform: translateX(2px);
          background: #f8fbff !important;
        }
      `}</style>
    </div>
  );
}

function compactResultLabel(value: string) {
  return value
    .replace(/\s*[-–—]\s*Are you Eligible\??/i, "")
    .replace(/\s*[-–—]\s*What You Should Know.*$/i, "")
    .replace(/\s*[-–—]\s*.*Guide\)?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
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
