import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  FileDown,
  Network,
  Flame,
  TrendingUp,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronRight,
  Radio,
  Globe,
  X,
} from "lucide-react";

// ---------- Mock data ----------

const ROLES = [
  { id: "constable", label: "Constable", clearance: 1 },
  { id: "inspector", label: "Inspector", clearance: 2 },
  { id: "sp", label: "SP / Admin", clearance: 3 },
];

const STRINGS = {
  en: {
    title: "SCRB Crime Intelligence",
    subtitle: "Karnataka State Police · Conversational Analysis Console",
    stationsOnline: "1,142 stations connected",
    placeholder: "Ask about patterns, suspects, hotspots, or forecasts…",
    exportPdf: "Export conversation",
    exported: "Conversation exported as PDF",
    reasoning: "View reasoning",
    hideReasoning: "Hide reasoning",
    tabHotspot: "Hotspots",
    tabNetwork: "Network",
    tabPredict: "Forecast",
    tabAudit: "Audit trail",
    restricted: "Restricted for your clearance",
    restrictedSub: "Ask your station SP to elevate your access to view this module.",
    listening: "Listening…",
    contextChip: "Continuing thread on",
    emptyPanel: "Ask a question to populate this panel.",
    welcome:
      "Namaskara. I'm the SCRB assistant. Try: “chain snatching hotspots in Bengaluru”, “connections to Ravi Kumar”, or “predict spikes next month”.",
  },
  kn: {
    title: "SCRB ಅಪರಾಧ ಗುಪ್ತಚರ",
    subtitle: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ · ಸಂಭಾಷಣಾ ವಿಶ್ಲೇಷಣಾ ವೇದಿಕೆ",
    stationsOnline: "1,142 ಠಾಣೆಗಳು ಸಂಪರ್ಕಿತ",
    placeholder: "ಮಾದರಿಗಳು, ಶಂಕಿತರು, ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳ ಬಗ್ಗೆ ಕೇಳಿ…",
    exportPdf: "ಸಂಭಾಷಣೆ ರಫ್ತು ಮಾಡಿ",
    exported: "ಸಂಭಾಷಣೆ PDF ಆಗಿ ರಫ್ತಾಗಿದೆ",
    reasoning: "ತರ್ಕ ನೋಡಿ",
    hideReasoning: "ತರ್ಕ ಮರೆಮಾಡಿ",
    tabHotspot: "ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",
    tabNetwork: "ಜಾಲ",
    tabPredict: "ಮುನ್ಸೂಚನೆ",
    tabAudit: "ಆಡಿಟ್ ಟ್ರೇಲ್",
    restricted: "ನಿಮ್ಮ ಅಧಿಕಾರ ಮಟ್ಟಕ್ಕೆ ನಿರ್ಬಂಧಿತ",
    restrictedSub: "ಈ ಮಾಡ್ಯೂಲ್ ವೀಕ್ಷಿಸಲು ನಿಮ್ಮ ಠಾಣೆ SP ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    listening: "ಆಲಿಸುತ್ತಿದೆ…",
    contextChip: "ಮುಂದುವರಿಕೆ",
    emptyPanel: "ಈ ಫಲಕವನ್ನು ತುಂಬಲು ಪ್ರಶ್ನೆ ಕೇಳಿ.",
    welcome:
      "ನಮಸ್ಕಾರ. ನಾನು SCRB ಸಹಾಯಕ. ಪ್ರಯತ್ನಿಸಿ: “ಬೆಂಗಳೂರಿನಲ್ಲಿ ಚೈನ್ ಸ್ನ್ಯಾಚಿಂಗ್ ಹಾಟ್‌ಸ್ಪಾಟ್”, “ರವಿ ಕುಮಾರ್ ಜೊತೆ ಸಂಪರ್ಕಗಳು”.",
  },
};

const HOTSPOTS = [
  { area: "Shivajinagar, Bengaluru", crime: "Chain snatching", count: 34, trend: "up" },
  { area: "Majestic, Bengaluru", crime: "Chain snatching", count: 27, trend: "up" },
  { area: "Yeshwanthpur", crime: "Chain snatching", count: 19, trend: "down" },
  { area: "Hebbal", crime: "Chain snatching", count: 12, trend: "flat" },
];

const NETWORK_NODES = [
  { id: "ravi", label: "Ravi Kumar", x: 210, y: 60, tag: "Suspect" },
  { id: "suresh", label: "Suresh M.", x: 90, y: 150, tag: "Associate" },
  { id: "anita", label: "Anita R.", x: 330, y: 150, tag: "Associate" },
  { id: "fence1", label: "Pawn Shop – KR Market", x: 210, y: 230, tag: "Location" },
  { id: "case1", label: "FIR #2291/25", x: 60, y: 260, tag: "Case" },
  { id: "case2", label: "FIR #2340/25", x: 360, y: 260, tag: "Case" },
];
const NETWORK_EDGES = [
  ["ravi", "suresh"],
  ["ravi", "anita"],
  ["ravi", "fence1"],
  ["suresh", "case1"],
  ["anita", "case2"],
];

const FORECAST = [
  { area: "KR Puram", crimeType: "Vehicle theft", confidence: 82 },
  { area: "Peenya Industrial Area", crimeType: "Burglary", confidence: 74 },
  { area: "Electronic City", crimeType: "Chain snatching", confidence: 61 },
];

// canned responses keyed by trigger keywords
const RESPONSES = [
  {
    keywords: ["hotspot", "chain snatching", "snatching"],
    type: "hotspot",
    entity: "Chain snatching — Bengaluru",
    en: "Chain-snatching incidents cluster around four zones in Bengaluru, with Shivajinagar and Majestic trending upward over the last 30 days. I've plotted counts and trend direction in the Hotspots panel.",
    kn: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಚೈನ್ ಸ್ನ್ಯಾಚಿಂಗ್ ಪ್ರಕರಣಗಳು ನಾಲ್ಕು ವಲಯಗಳಲ್ಲಿ ಕೇಂದ್ರೀಕೃತವಾಗಿವೆ. ಶಿವಾಜಿನಗರ ಮತ್ತು ಮೆಜೆಸ್ಟಿಕ್ ಹೆಚ್ಚಳ ತೋರಿಸುತ್ತಿವೆ.",
    audit: [
      "Query parsed → intent: spatial_pattern, crime_type: chain_snatching, region: Bengaluru",
      "Entities matched → 4 station jurisdictions, 92 FIRs (last 90 days)",
      "Data sources → CCTNS records, station-wise FIR index",
      "Confidence: 91%",
    ],
  },
  {
    keywords: ["ravi", "connection", "network", "suspect"],
    type: "network",
    entity: "Ravi Kumar",
    en: "Ravi Kumar links to two known associates and a pawn shop in KR Market flagged in two separate FIRs. I've rendered the relationship graph in the Network panel.",
    kn: "ರವಿ ಕುಮಾರ್ ಎರಡು ಸಹಚರರೊಂದಿಗೆ ಮತ್ತು KR ಮಾರ್ಕೆಟ್‌ನ ಪಾನ್ ಶಾಪ್‌ನೊಂದಿಗೆ ಸಂಪರ್ಕ ಹೊಂದಿದ್ದಾರೆ.",
    audit: [
      "Query parsed → intent: entity_network, subject: Ravi Kumar",
      "Entities matched → 2 associates, 1 location, 2 linked FIRs",
      "Data sources → Criminal network graph DB, FIR cross-references",
      "Confidence: 87%",
    ],
    minClearance: 2,
  },
  {
    keywords: ["predict", "forecast", "spike", "next month"],
    type: "predict",
    entity: "Next-30-day forecast",
    en: "Based on seasonal and historical patterns, three areas show elevated risk for the coming month. Confidence scores are in the Forecast panel — treat sub-70% as early-warning, not certainty.",
    kn: "ಋತುಮಾನ ಮಾದರಿಗಳ ಆಧಾರದ ಮೇಲೆ, ಮುಂದಿನ ತಿಂಗಳಿಗೆ ಮೂರು ಪ್ರದೇಶಗಳಲ್ಲಿ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ.",
    audit: [
      "Query parsed → intent: predictive_forecast, horizon: 30_days",
      "Model → gradient-boosted time series over 3yr station data",
      "Data sources → CCTNS, seasonal calendar, past hotspot deltas",
      "Confidence: model-level 74% (see per-area scores)",
    ],
    minClearance: 3,
  },
];

const FALLBACK = {
  en: "I can help you explore crime patterns, criminal networks, hotspots, and predictive forecasts. Try asking about a crime type, an area, or a suspect name.",
  kn: "ನಾನು ಅಪರಾಧ ಮಾದರಿಗಳು, ಜಾಲಗಳು, ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು ಮತ್ತು ಮುನ್ಸೂಚನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
};

function matchResponse(query) {
  const q = query.toLowerCase();
  return RESPONSES.find((r) => r.keywords.some((k) => q.includes(k)));
}

// ---------- UI subcomponents ----------

function TrendArrow({ trend }) {
  if (trend === "up") return <span className="text-rose-400 text-xs font-mono">▲ rising</span>;
  if (trend === "down") return <span className="text-emerald-400 text-xs font-mono">▼ falling</span>;
  return <span className="text-slate-400 text-xs font-mono">— steady</span>;
}

function HotspotPanel({ t }) {
  const max = Math.max(...HOTSPOTS.map((h) => h.count));
  return (
    <div className="space-y-3">
      {HOTSPOTS.map((h) => (
        <div key={h.area} className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-100">{h.area}</span>
            <TrendArrow trend={h.trend} />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{h.crime}</div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${(h.count / max) * 100}%` }}
            />
          </div>
          <div className="text-right text-xs font-mono text-amber-300 mt-1">{h.count} cases / 30d</div>
        </div>
      ))}
    </div>
  );
}

function NetworkPanel() {
  return (
    <svg viewBox="0 0 420 300" className="w-full h-auto">
      {NETWORK_EDGES.map(([a, b], i) => {
        const na = NETWORK_NODES.find((n) => n.id === a);
        const nb = NETWORK_NODES.find((n) => n.id === b);
        return (
          <line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="#475569"
            strokeWidth="1.5"
          />
        );
      })}
      {NETWORK_NODES.map((n) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.tag === "Suspect" ? 26 : 20}
            fill={n.tag === "Suspect" ? "#F2A93B" : n.tag === "Case" ? "#1E293B" : "#334155"}
            stroke={n.tag === "Suspect" ? "#F2A93B" : "#64748B"}
            strokeWidth="1.5"
          />
          <text
            x={n.x}
            y={n.y + (n.tag === "Suspect" ? 42 : 36)}
            textAnchor="middle"
            fontSize="10"
            fontFamily="IBM Plex Mono, monospace"
            fill="#CBD5E1"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ForecastPanel() {
  return (
    <div className="space-y-3">
      {FORECAST.map((f) => (
        <div key={f.area} className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-100">{f.area}</span>
            <span className="font-mono text-xs text-amber-300">{f.confidence}%</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{f.crimeType}</div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${f.confidence}%`,
                backgroundColor: f.confidence > 75 ? "#FB7185" : "#F2A93B",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditPanel({ trail }) {
  if (!trail) return null;
  return (
    <ol className="space-y-2 font-mono text-xs text-slate-300">
      {trail.map((line, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-slate-600">{String(i + 1).padStart(2, "0")}</span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
}

function RestrictedPanel({ t }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 text-slate-400">
      <Lock size={22} className="text-slate-500" />
      <div className="text-sm text-slate-300">{t.restricted}</div>
      <div className="text-xs max-w-[220px]">{t.restrictedSub}</div>
    </div>
  );
}

function Message({ msg, t, onToggleReasoning }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-amber-400 text-slate-900 rounded-br-sm"
            : "bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-sm"
        }`}
      >
        {msg.contextOf && (
          <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-amber-300/80 font-mono">
            <ChevronRight size={10} /> {t.contextChip} {msg.contextOf}
          </div>
        )}
        <div>{msg.text}</div>
        {msg.audit && (
          <button
            onClick={() => onToggleReasoning(msg.id)}
            className="mt-2 flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors"
          >
            {msg.showReasoning ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {msg.showReasoning ? t.hideReasoning : t.reasoning}
          </button>
        )}
        {msg.showReasoning && (
          <div className="mt-2 pt-2 border-t border-slate-700/60">
            <AuditPanel trail={msg.audit} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Main App ----------

export default function App() {
  const [lang, setLang] = useState("en");
  const [role, setRole] = useState(ROLES[1]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("hotspot");
  const [lastEntity, setLastEntity] = useState(null);
  const scrollRef = useRef(null);
  const t = STRINGS[lang];

  const [messages, setMessages] = useState([
    { id: "m0", role: "ai", text: STRINGS.en.welcome },
  ]);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === "m0" ? { ...m, text: STRINGS[lang].welcome } : m))
    );
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const tabPanels = {
    hotspot: { label: t.tabHotspot, icon: Flame, min: 1, render: () => <HotspotPanel t={t} /> },
    network: { label: t.tabNetwork, icon: Network, min: 2, render: () => <NetworkPanel /> },
    predict: { label: t.tabPredict, icon: TrendingUp, min: 3, render: () => <ForecastPanel /> },
    audit: {
      label: t.tabAudit,
      icon: ShieldCheck,
      min: 1,
      render: () => {
        const lastAi = [...messages].reverse().find((m) => m.audit);
        return lastAi ? <AuditPanel trail={lastAi.audit} /> : (
          <div className="text-sm text-slate-500">{t.emptyPanel}</div>
        );
      },
    },
  };

  function send(text) {
    const query = text.trim();
    if (!query) return;
    const userMsg = { id: `u${Date.now()}`, role: "user", text: query };
    const match = matchResponse(query);

    let aiMsg;
    if (match) {
      const allowed = !match.minClearance || role.clearance >= match.minClearance;
      aiMsg = {
        id: `a${Date.now()}`,
        role: "ai",
        text: allowed ? match[lang] : (lang === "en"
          ? "That analysis requires a higher clearance level. I can share a summary, but the full module is restricted for your role."
          : "ಆ ವಿಶ್ಲೇಷಣೆಗೆ ಹೆಚ್ಚಿನ ಅಧಿಕಾರ ಮಟ್ಟದ ಅಗತ್ಯವಿದೆ."),
        audit: allowed ? match.audit : null,
        contextOf: lastEntity && match.type !== "hotspot" ? null : null,
      };
      if (allowed) {
        setActiveTab(match.type);
        setLastEntity(match.entity);
      }
    } else {
      aiMsg = { id: `a${Date.now()}`, role: "ai", text: FALLBACK[lang] };
    }

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  }

  function toggleReasoning(id) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showReasoning: !m.showReasoning } : m))
    );
  }

  function handleMic() {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      send("Show me chain snatching hotspots in Bengaluru");
    }, 1400);
  }

  function handleExport() {
    setToast(t.exported);
    setTimeout(() => setToast(null), 2600);
  }

  const activePanel = tabPanels[activeTab];
  const panelAllowed = role.clearance >= activePanel.min;

  return (
    <div className="w-full h-full min-h-[640px] bg-slate-950 text-slate-100 flex flex-col font-sans" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-400 flex items-center justify-center text-slate-900 font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            KSP
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.title}</div>
            <div className="text-[11px] text-slate-400">{t.subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1 font-mono">
            <Radio size={11} /> {t.stationsOnline}
          </div>

          <select
            value={role.id}
            onChange={(e) => setRole(ROLES.find((r) => r.id === e.target.value))}
            className="bg-slate-800 border border-slate-700 text-xs rounded-md px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setLang(lang === "en" ? "kn" : "en")}
            className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 hover:border-amber-400/60 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <Globe size={12} /> {lang === "en" ? "EN / ಕನ" : "ಕನ / EN"}
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs bg-amber-400 text-slate-900 font-medium rounded-md px-3 py-1.5 hover:bg-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <FileDown size={13} /> {t.exportPdf}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Chat column */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m) => (
              <Message key={m.id} msg={m} t={t} onToggleReasoning={toggleReasoning} />
            ))}
            {listening && (
              <div className="flex justify-end">
                <div className="text-xs font-mono text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> {t.listening}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-amber-400">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder={t.placeholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              <button
                onClick={handleMic}
                aria-label="Voice input"
                className={`p-1.5 rounded-lg transition-colors ${
                  listening ? "bg-amber-400 text-slate-900" : "text-slate-400 hover:text-amber-300"
                }`}
              >
                <Mic size={16} />
              </button>
              <button
                onClick={() => send(input)}
                aria-label="Send"
                className="p-1.5 rounded-lg bg-amber-400 text-slate-900 hover:bg-amber-300 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Chain snatching hotspots", "Connections to Ravi Kumar", "Predict spikes next month"].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] text-slate-400 border border-slate-700 rounded-full px-2.5 py-1 hover:border-amber-400/60 hover:text-amber-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="w-[300px] shrink-0 flex flex-col bg-slate-900/40">
          <div className="flex border-b border-slate-800">
            {Object.entries(tabPanels).map(([key, p]) => {
              const Icon = p.icon;
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono border-b-2 transition-colors ${
                    active
                      ? "border-amber-400 text-amber-300"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon size={14} />
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {panelAllowed ? activePanel.render() : <RestrictedPanel t={t} />}
          </div>
        </div>
      </div>

      {toast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <ShieldCheck size={13} className="text-emerald-400" /> {toast}
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-300">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
