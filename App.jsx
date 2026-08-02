import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Plus, CalendarDays, BarChart3, Menu, X, ChevronLeft,
  ChevronRight, Search, Trash2, Pencil, TrendingUp, TrendingDown, Flame,
  Trophy, Wallet, Target, Sparkles, Clock, Users, Handshake, PiggyBank,
  Building2, BookOpen, ChevronDown, Check, Settings as SettingsIcon,
  Download, RotateCcw, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const C = {
  bg: "#0A0A0C",
  bgSoft: "#111114",
  card: "#151518",
  card2: "#1B1B20",
  border: "#27272E",
  borderSoft: "#1E1E24",
  text: "#F3F1EA",
  textDim: "#9A98A3",
  textFaint: "#5F5D68",
  gold: "#D4AF37",
  goldSoft: "#E8CD6B",
  goldDim: "#8A7226",
  green: "#3FCB8C",
  red: "#F0685E",
  blue: "#5B9EF2",
  purple: "#B08BF0",
};

const CATEGORIES = [
  "Freelancing", "Video Editing", "Graphic Design", "Web Development",
  "AI Services", "Affiliate Marketing", "Reselling", "Digital Products",
  "Content Creation", "Social Media", "Local Business", "Online Tutoring",
  "E-commerce", "Other",
];

const RESULTS = [
  { id: "excellent", label: "Excellent", emoji: "🔥", color: C.gold },
  { id: "good", label: "Good", emoji: "✅", color: C.green },
  { id: "average", label: "Average", emoji: "🙂", color: C.blue },
  { id: "failed", label: "Failed", emoji: "❌", color: C.red },
  { id: "experiment", label: "Experiment", emoji: "🧪", color: C.purple },
];

const ALLOC_CATEGORIES = [
  { id: "brand", label: "Brand Investment", icon: Building2, color: C.gold },
  { id: "learning", label: "Learning & Tools", icon: BookOpen, color: C.blue },
  { id: "emergency", label: "Emergency / Reserve", icon: PiggyBank, color: C.purple },
  { id: "content", label: "Content / Creator Expenses", icon: Sparkles, color: C.textDim },
  { id: "reinvest", label: "Business Reinvestment", icon: TrendingUp, color: C.green },
  { id: "personal", label: "Personal Savings", icon: Wallet, color: C.goldSoft },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function fmtINR(n, currency = "₹") {
  const v = Math.round(Number(n) || 0);
  return currency + v.toLocaleString("en-IN");
}

function dayNumberFromDate(startDate) {
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  const t0 = new Date(today.toDateString());
  const diff = Math.floor((t0 - start) / 86400000) + 1;
  return Math.min(365, Math.max(1, diff));
}

function resultMeta(id) {
  return RESULTS.find(r => r.id === id) || RESULTS[2];
}

// ---------- storage helpers (browser localStorage, persists per-device) ----------
const STORE_PREFIX = "eyj:";
async function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
async function saveJSON(key, value) {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("storage save failed", key, e);
  }
}

// ---------- small UI atoms ----------
function Card({ children, style, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(160deg, ${C.card} 0%, ${C.card2} 100%)`,
        border: `1px solid ${C.borderSoft}`,
        boxShadow: "0 8px 24px -12px rgba(0,0,0,0.6)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <Card className="p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <span style={{ color: C.textDim, fontFamily: "Inter", fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: accent + "1A" }}>
          <Icon size={14} style={{ color: accent }} />
        </div>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: -0.3 }} className="truncate">
        {value}
      </div>
      {sub && <div style={{ color: C.textFaint, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>}
    </Card>
  );
}

function Pill({ children, color = C.textDim, bg }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{ fontSize: 11, fontFamily: "Inter", color, background: bg || color + "1A", border: `1px solid ${color}33` }}
    >
      {children}
    </span>
  );
}

function GoldButton({ children, onClick, full, small, variant = "solid", icon: Icon, type = "button" }) {
  const base = {
    fontFamily: "Inter",
    fontWeight: 600,
    borderRadius: 14,
    padding: small ? "8px 14px" : "13px 20px",
    fontSize: small ? 13 : 14.5,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: full ? "100%" : undefined,
    cursor: "pointer",
    transition: "transform .15s ease, opacity .15s ease",
  };
  const solid = { background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`, color: "#141108", border: "none" };
  const ghost = { background: "transparent", color: C.gold, border: `1px solid ${C.gold}55` };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...base, ...(variant === "solid" ? solid : ghost) }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {Icon && <Icon size={small ? 14 : 16} />}
      {children}
    </button>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={{ fontFamily: "Inter", fontSize: 12.5, color: C.textDim, fontWeight: 500 }}>
        {label} {required && <span style={{ color: C.gold }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  background: C.bgSoft,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "10px 12px",
  color: C.text,
  fontFamily: "Inter",
  fontSize: 14,
  outline: "none",
  width: "100%",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function TextArea(props) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 70, resize: "vertical", ...(props.style || {}) }} />;
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inputStyle, appearance: "none" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-auto"
        style={{
          maxWidth: wide ? 720 : 480,
          maxHeight: "92vh",
          overflowY: "auto",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 sticky top-0" style={{ background: C.card, borderBottom: `1px solid ${C.borderSoft}` }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: C.text, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.bgSoft }}>
            <X size={16} color={C.textDim} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- Journey stepper (signature element) ----------
const JOURNEY_STAGES = [
  { id: "idea", label: "Idea", check: () => true },
  { id: "action", label: "Action", check: (t) => t.entries > 0 },
  { id: "earning", label: "Earning", check: (t) => t.revenue > 0 },
  { id: "profit", label: "Profit", check: (t) => t.profit > 0 },
  { id: "saving", label: "Saving", check: (t) => t.saved > 0 },
  { id: "capital", label: "Capital", check: (t) => t.brandFund > 0 },
  { id: "brand", label: "Brand", check: (t) => t.brandFund >= 10000 },
  { id: "scale", label: "Scale", check: (t) => t.daysCompleted >= 100 },
];

function JourneyPath({ totals }) {
  const activeIdx = JOURNEY_STAGES.reduce((acc, s, i) => (s.check(totals) ? i : acc), 0);
  return (
    <div className="flex items-center w-full overflow-x-auto pb-1" style={{ gap: 0 }}>
      {JOURNEY_STAGES.map((s, i) => {
        const active = i <= activeIdx;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center shrink-0" style={{ width: 58 }}>
              <div
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background: active ? C.gold : "transparent",
                  border: `2px solid ${active ? C.gold : C.border}`,
                  boxShadow: active ? `0 0 10px ${C.gold}88` : "none",
                }}
              />
              <span style={{ fontSize: 9.5, fontFamily: "Inter", color: active ? C.goldSoft : C.textFaint, marginTop: 6, textAlign: "center", letterSpacing: 0.3, textTransform: "uppercase" }}>
                {s.label}
              </span>
            </div>
            {i < JOURNEY_STAGES.length - 1 && (
              <div className="h-[2px] flex-1 shrink-0" style={{ minWidth: 10, background: i < activeIdx ? C.gold : C.border, marginBottom: 16 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function YearRing({ day, size = 116 }) {
  const pct = day / 365;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#goldGrad)`} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.goldSoft} />
            <stop offset="100%" stopColor={C.gold} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.text }}>{String(day).padStart(3, "0")}</span>
        <span style={{ fontFamily: "Inter", fontSize: 10, color: C.textFaint, letterSpacing: 1 }}>/ 365</span>
      </div>
    </div>
  );
}

// ---------- Entry Form ----------
function EntryForm({ initial, defaultDay, onSave, onClose, currency }) {
  const [f, setF] = useState(() => initial || {
    id: rid(),
    day: defaultDay,
    date: new Date().toISOString().slice(0, 10),
    method: "",
    category: "",
    hours: "", minutes: "",
    investment: "", revenue: "",
    leads: "", clients: "",
    saved: "", brandFund: "",
    whatIDid: "", whatILearned: "",
    result: "good",
    notes: "",
    createdAt: Date.now(),
  });

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const canSave = f.method.trim() && f.category && f.day;

  const submit = () => {
    if (!canSave) return;
    onSave({
      ...f,
      day: Number(f.day),
      hours: Number(f.hours) || 0,
      minutes: Number(f.minutes) || 0,
      investment: Number(f.investment) || 0,
      revenue: Number(f.revenue) || 0,
      leads: Number(f.leads) || 0,
      clients: Number(f.clients) || 0,
      saved: Number(f.saved) || 0,
      brandFund: Number(f.brandFund) || 0,
    });
  };

  return (
    <Modal title={initial ? `Edit Day ${String(f.day).padStart(3,"0")}` : "Add Today's Result"} onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Day" required>
          <TextInput type="number" min={1} max={365} value={f.day} onChange={set("day")} />
        </Field>
        <Field label="Date" required>
          <TextInput type="date" value={f.date} onChange={set("date")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Earning Method" required>
          <TextInput placeholder="e.g. Video Editing" value={f.method} onChange={set("method")} />
        </Field>
        <Field label="Category" required>
          <Select value={f.category} onChange={set("category")} options={CATEGORIES} placeholder="Select category" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Time Spent">
          <div className="flex gap-2">
            <TextInput type="number" min={0} placeholder="hrs" value={f.hours} onChange={set("hours")} />
            <TextInput type="number" min={0} max={59} placeholder="mins" value={f.minutes} onChange={set("minutes")} />
          </div>
        </Field>
        <Field label={`Investment / Expenses (${currency})`}>
          <TextInput type="number" min={0} placeholder="0" value={f.investment} onChange={set("investment")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label={`Total Revenue (${currency})`}>
          <TextInput type="number" min={0} placeholder="0" value={f.revenue} onChange={set("revenue")} />
        </Field>
        <Field label="Leads Received">
          <TextInput type="number" min={0} placeholder="0" value={f.leads} onChange={set("leads")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Clients / Orders">
          <TextInput type="number" min={0} placeholder="0" value={f.clients} onChange={set("clients")} />
        </Field>
        <Field label={`Amount Saved (${currency})`}>
          <TextInput type="number" min={0} placeholder="0" value={f.saved} onChange={set("saved")} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label={`Brand Fund Contribution (${currency})`}>
          <TextInput type="number" min={0} placeholder="0" value={f.brandFund} onChange={set("brandFund")} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="What Did I Do?">
          <TextArea value={f.whatIDid} onChange={set("whatIDid")} placeholder="Describe today's work..." />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="What Did I Learn?">
          <TextArea value={f.whatILearned} onChange={set("whatILearned")} placeholder="Today's takeaway..." />
        </Field>
      </div>
      <div className="mt-3">
        <span style={{ fontFamily: "Inter", fontSize: 12.5, color: C.textDim, fontWeight: 500 }}>Result</span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {RESULTS.map((r) => (
            <button
              key={r.id}
              onClick={() => setF((p) => ({ ...p, result: r.id }))}
              style={{
                padding: "8px 12px", borderRadius: 10, fontSize: 13, fontFamily: "Inter",
                background: f.result === r.id ? r.color + "22" : C.bgSoft,
                border: `1px solid ${f.result === r.id ? r.color : C.border}`,
                color: f.result === r.id ? r.color : C.textDim,
              }}
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <Field label="Notes">
          <TextArea value={f.notes} onChange={set("notes")} placeholder="Optional notes..." />
        </Field>
      </div>
      <div className="mt-5 flex gap-3">
        <GoldButton full onClick={submit} icon={Check}>Save Today's Result</GoldButton>
      </div>
      {!canSave && <p style={{ color: C.textFaint, fontSize: 11.5, marginTop: 8, fontFamily: "Inter" }}>Fill in day, method and category to save.</p>}
    </Modal>
  );
}

// ---------- Daily result celebration card ----------
function ResultCelebration({ entry, currency, onClose }) {
  const profit = entry.revenue - entry.investment;
  const rm = resultMeta(entry.result);
  return (
    <Modal title="" onClose={onClose}>
      <div className="text-center -mt-2">
        <div style={{ fontSize: 32 }}>🎉</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, color: C.gold, marginTop: 6 }}>
          DAY {String(entry.day).padStart(3, "0")} COMPLETE
        </h2>
        <p style={{ color: C.textDim, fontSize: 13, marginTop: 2, fontFamily: "Inter" }}>{entry.method}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        {[
          ["Time", `${entry.hours}h ${entry.minutes}m`, C.textDim],
          ["Revenue", fmtINR(entry.revenue, currency), C.green],
          ["Expenses", fmtINR(entry.investment, currency), C.red],
          ["Profit", fmtINR(profit, currency), profit >= 0 ? C.green : C.red],
          ["Leads", entry.leads, C.blue],
          ["Clients", entry.clients, C.blue],
          ["Saved", fmtINR(entry.saved, currency), C.purple],
          ["Brand Fund", fmtINR(entry.brandFund, currency), C.gold],
        ].map(([l, v, col]) => (
          <div key={l} className="rounded-xl p-3" style={{ background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
            <div style={{ fontSize: 10.5, color: C.textFaint, fontFamily: "Inter", textTransform: "uppercase", letterSpacing: 0.4 }}>{l}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: col, fontWeight: 700, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Pill color={rm.color}>{rm.emoji} {rm.label}</Pill>
      </div>
      {entry.whatILearned && (
        <div className="mt-4">
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "Inter" }}>What I Learned</div>
          <p style={{ color: C.text, fontSize: 13.5, marginTop: 4, fontFamily: "Inter", lineHeight: 1.5 }}>{entry.whatILearned}</p>
        </div>
      )}
      <div className="mt-6">
        <GoldButton full onClick={onClose}>Continue the Journey</GoldButton>
      </div>
    </Modal>
  );
}

// ---------- Day detail modal (calendar) ----------
function DayDetail({ entry, day, currency, onEdit, onDelete, onClose }) {
  if (!entry) {
    return (
      <Modal title={`Day ${String(day).padStart(3, "0")}`} onClose={onClose}>
        <div className="text-center py-6">
          <p style={{ color: C.textDim, fontFamily: "Inter", fontSize: 14 }}>No entry logged for this day yet.</p>
        </div>
      </Modal>
    );
  }
  const profit = entry.revenue - entry.investment;
  const rm = resultMeta(entry.result);
  return (
    <Modal title={`Day ${String(entry.day).padStart(3, "0")}`} onClose={onClose}>
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: C.text }}>{entry.method}</div>
          <div style={{ color: C.textFaint, fontSize: 12, fontFamily: "Inter" }}>{entry.date} · {entry.category}</div>
        </div>
        <Pill color={rm.color}>{rm.emoji} {rm.label}</Pill>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {[
          ["Revenue", fmtINR(entry.revenue, currency), C.green],
          ["Expenses", fmtINR(entry.investment, currency), C.red],
          ["Profit", fmtINR(profit, currency), profit >= 0 ? C.green : C.red],
          ["Time", `${entry.hours}h ${entry.minutes}m`, C.textDim],
          ["Leads", entry.leads, C.blue],
          ["Clients", entry.clients, C.blue],
          ["Saved", fmtINR(entry.saved, currency), C.purple],
          ["Brand Fund", fmtINR(entry.brandFund, currency), C.gold],
        ].map(([l, v, col]) => (
          <div key={l} className="rounded-xl p-3" style={{ background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
            <div style={{ fontSize: 10.5, color: C.textFaint, fontFamily: "Inter", textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: col, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>
      {entry.whatIDid && (
        <div className="mt-4">
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", fontFamily: "Inter" }}>What I Did</div>
          <p style={{ color: C.text, fontSize: 13.5, marginTop: 3, fontFamily: "Inter" }}>{entry.whatIDid}</p>
        </div>
      )}
      {entry.whatILearned && (
        <div className="mt-3">
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", fontFamily: "Inter" }}>What I Learned</div>
          <p style={{ color: C.text, fontSize: 13.5, marginTop: 3, fontFamily: "Inter" }}>{entry.whatILearned}</p>
        </div>
      )}
      {entry.notes && (
        <div className="mt-3">
          <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", fontFamily: "Inter" }}>Notes</div>
          <p style={{ color: C.textDim, fontSize: 13, marginTop: 3, fontFamily: "Inter" }}>{entry.notes}</p>
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <GoldButton variant="ghost" onClick={onEdit} icon={Pencil} small>Edit</GoldButton>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ color: C.red, border: `1px solid ${C.red}44`, fontFamily: "Inter", fontSize: 13, background: "transparent" }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </Modal>
  );
}

// ==================================================================
// MAIN APP
// ==================================================================
export default function App() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({ startDate: new Date().toISOString().slice(0, 10), currency: "₹", targetBrandFund: 100000 });
  const [methodScores, setMethodScores] = useState({});
  const [allocations, setAllocations] = useState([]);

  const [view, setView] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    (async () => {
      const [e, s, ms, al] = await Promise.all([
        loadJSON("entries", []),
        loadJSON("settings", null),
        loadJSON("methodScores", {}),
        loadJSON("allocations", []),
      ]);
      setEntries(e);
      if (s) setSettings(s);
      setMethodScores(ms);
      setAllocations(al);
      setLoading(false);
    })();
  }, []);

  const persistEntries = useCallback((next) => {
    setEntries(next);
    saveJSON("entries", next);
  }, []);
  const persistSettings = useCallback((next) => {
    setSettings(next);
    saveJSON("settings", next);
  }, []);
  const persistScores = useCallback((next) => {
    setMethodScores(next);
    saveJSON("methodScores", next);
  }, []);
  const persistAlloc = useCallback((next) => {
    setAllocations(next);
    saveJSON("allocations", next);
  }, []);

  const currency = settings.currency || "₹";

  const totals = useMemo(() => {
    const t = { revenue: 0, expenses: 0, profit: 0, saved: 0, brandFund: 0, leads: 0, clients: 0, timeMinutes: 0, entries: entries.length };
    entries.forEach((e) => {
      t.revenue += Number(e.revenue) || 0;
      t.expenses += Number(e.investment) || 0;
      t.saved += Number(e.saved) || 0;
      t.brandFund += Number(e.brandFund) || 0;
      t.leads += Number(e.leads) || 0;
      t.clients += Number(e.clients) || 0;
      t.timeMinutes += (Number(e.hours) || 0) * 60 + (Number(e.minutes) || 0);
    });
    t.profit = t.revenue - t.expenses;
    t.daysCompleted = new Set(entries.map((e) => e.day)).size;
    return t;
  }, [entries]);

  const streaks = useMemo(() => {
    const days = [...new Set(entries.map((e) => e.day))].sort((a, b) => a - b);
    if (!days.length) return { current: 0, longest: 0 };
    let longest = 1, run = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i] === days[i - 1] + 1) { run++; longest = Math.max(longest, run); }
      else run = 1;
    }
    // current streak: consecutive run ending at the max day
    let current = 1;
    for (let i = days.length - 1; i > 0; i--) {
      if (days[i] === days[i - 1] + 1) current++;
      else break;
    }
    return { current, longest };
  }, [entries]);

  const nextDay = useMemo(() => {
    const suggested = dayNumberFromDate(settings.startDate);
    const maxLogged = entries.reduce((m, e) => Math.max(m, e.day), 0);
    return Math.min(365, Math.max(suggested, maxLogged + (entries.length ? 0 : 0)));
  }, [entries, settings.startDate]);

  const saveEntry = (data) => {
    const exists = entries.some((e) => e.id === data.id);
    let next;
    if (exists) {
      next = entries.map((e) => (e.id === data.id ? data : e));
    } else {
      // if a different entry already occupies this day, keep both is not allowed by spec (unique day) -> overwrite
      const dupIdx = entries.findIndex((e) => e.day === data.day && e.id !== data.id);
      if (dupIdx >= 0) {
        next = entries.map((e, i) => (i === dupIdx ? data : e));
      } else {
        next = [...entries, data];
      }
    }
    persistEntries(next);
    setShowAdd(false);
    setEditEntry(null);
    setCelebrate(data);
  };

  const deleteEntry = (id) => {
    persistEntries(entries.filter((e) => e.id !== id));
    setSelectedDay(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <FontLoader />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: C.gold, borderTopColor: "transparent" }} />
          <span style={{ color: C.textDim, fontFamily: "Inter", fontSize: 13 }}>Loading your journey...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, fontFamily: "Inter" }}>
      <FontLoader />
      <div className="max-w-5xl mx-auto pb-24">
        <Header settings={settings} totals={totals} streaks={streaks} />
        {entries.length === 0 && view === "dashboard" ? (
          <EmptyState onStart={() => setShowAdd(true)} />
        ) : (
          <>
            {view === "dashboard" && (
              <Dashboard totals={totals} streaks={streaks} entries={entries} settings={settings} currency={currency}
                onAdd={() => setShowAdd(true)} onOpenDay={(d) => setSelectedDay(d)} />
            )}
            {view === "calendar" && (
              <CalendarView entries={entries} onOpenDay={(d) => setSelectedDay(d)} />
            )}
            {view === "analytics" && (
              <Analytics entries={entries} currency={currency} />
            )}
            {view === "history" && (
              <HistoryView entries={entries} currency={currency}
                onEdit={(e) => setEditEntry(e)} onDelete={deleteEntry} />
            )}
            {view === "methods" && (
              <MethodsView entries={entries} currency={currency} methodScores={methodScores} onSaveScore={(m, sc) => persistScores({ ...methodScores, [m]: sc })} />
            )}
            {view === "brandfund" && (
              <BrandFundView totals={totals} settings={settings} currency={currency}
                onTarget={(v) => persistSettings({ ...settings, targetBrandFund: v })}
                allocations={allocations} onAddAlloc={(a) => persistAlloc([...allocations, a])}
                onDeleteAlloc={(id) => persistAlloc(allocations.filter((a) => a.id !== id))} />
            )}
            {view === "reports" && (
              <ReportsView entries={entries} currency={currency} streaks={streaks} totals={totals} />
            )}
            {view === "settings" && (
              <SettingsView settings={settings} onSave={persistSettings} entries={entries} />
            )}
          </>
        )}
      </div>

      <BottomNav view={view} setView={setView} onAdd={() => setShowAdd(true)} onMore={() => setMoreOpen(true)} />

      {moreOpen && (
        <MoreSheet
          onClose={() => setMoreOpen(false)}
          onNav={(v) => { setView(v); setMoreOpen(false); }}
        />
      )}

      {showAdd && (
        <EntryForm defaultDay={nextDay} currency={currency} onClose={() => setShowAdd(false)} onSave={saveEntry} />
      )}
      {editEntry && (
        <EntryForm initial={editEntry} currency={currency} onClose={() => setEditEntry(null)} onSave={saveEntry} />
      )}
      {celebrate && (
        <ResultCelebration entry={celebrate} currency={currency} onClose={() => setCelebrate(null)} />
      )}
      {selectedDay && (
        <DayDetail
          day={selectedDay}
          entry={entries.find((e) => e.day === selectedDay)}
          currency={currency}
          onEdit={() => { setEditEntry(entries.find((e) => e.day === selectedDay)); setSelectedDay(null); }}
          onDelete={() => { const e = entries.find((x) => x.day === selectedDay); if (e) deleteEntry(e.id); }}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function FontLoader() {
  useEffect(() => {
    const id = "eyj-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

function Header({ settings, totals, streaks }) {
  return (
    <div className="px-4 pt-6 pb-2 flex items-center justify-between">
      <div>
        <div style={{ fontFamily: "Inter", fontSize: 11, letterSpacing: 2, color: C.textFaint, textTransform: "uppercase" }}>365 Days</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>
          Earning Journey
        </h1>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: C.card, border: `1px solid ${C.borderSoft}` }}>
        <Flame size={14} style={{ color: streaks.current > 0 ? C.gold : C.textFaint }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.text, fontWeight: 700 }}>{streaks.current}</span>
      </div>
    </div>
  );
}

function EmptyState({ onStart }) {
  return (
    <div className="px-4 mt-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${C.gold}14`, border: `1px solid ${C.gold}33` }}>
        <Sparkles size={26} style={{ color: C.gold }} />
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, color: C.text, fontWeight: 700 }}>DAY 001 IS WAITING FOR YOU 🚀</h2>
      <p style={{ color: C.textDim, fontFamily: "Inter", fontSize: 14, marginTop: 8, maxWidth: 320, lineHeight: 1.6 }}>
        Start your first earning experiment today. Learn something, try something, track everything.
      </p>
      <div className="mt-6">
        <GoldButton onClick={onStart} icon={Plus}>Start Day 001</GoldButton>
      </div>
    </div>
  );
}

function Dashboard({ totals, streaks, entries, settings, currency, onAdd, onOpenDay }) {
  const day = Math.min(365, Math.max(1, entries.reduce((m, e) => Math.max(m, e.day), 0) || dayNumberFromDate(settings.startDate)));
  const recent = [...entries].sort((a, b) => b.day - a.day).slice(0, 5);
  const timeH = Math.floor(totals.timeMinutes / 60);

  return (
    <div className="px-4 mt-3 flex flex-col gap-4">
      <Card className="p-5 flex items-center gap-5 flex-wrap">
        <YearRing day={day} />
        <div className="flex-1 min-w-[160px] flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Completed" value={totals.daysCompleted} color={C.green} />
            <MiniStat label="Remaining" value={365 - totals.daysCompleted} color={C.textDim} />
            <MiniStat label="Streak" value={streaks.current} color={C.gold} icon={Flame} />
            <MiniStat label="Best Streak" value={streaks.longest} color={C.goldSoft} icon={Trophy} />
          </div>
        </div>
      </Card>

      <div>
        <SectionLabel>Journey Progress</SectionLabel>
        <Card className="p-5 mt-2">
          <JourneyPath totals={totals} />
        </Card>
      </div>

      <GoldButton full onClick={onAdd} icon={Plus}>Add Today's Result</GoldButton>

      <div>
        <SectionLabel>Financial Overview</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <StatCard icon={ArrowUpRight} label="Total Revenue" value={fmtINR(totals.revenue, currency)} accent={C.green} />
          <StatCard icon={ArrowDownRight} label="Total Expenses" value={fmtINR(totals.expenses, currency)} accent={C.red} />
          <StatCard icon={TrendingUp} label="Total Profit" value={fmtINR(totals.profit, currency)} accent={totals.profit >= 0 ? C.green : C.red} />
          <StatCard icon={PiggyBank} label="Total Saved" value={fmtINR(totals.saved, currency)} accent={C.purple} />
          <StatCard icon={Building2} label="Brand Fund" value={fmtINR(totals.brandFund, currency)} accent={C.gold} />
          <StatCard icon={Clock} label="Time Invested" value={`${timeH}h`} accent={C.blue} />
          <StatCard icon={Users} label="Total Leads" value={totals.leads} accent={C.blue} />
          <StatCard icon={Handshake} label="Clients / Orders" value={totals.clients} accent={C.blue} />
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <SectionLabel>Recent Entries</SectionLabel>
          <div className="flex flex-col gap-2 mt-2">
            {recent.map((e) => {
              const rm = resultMeta(e.result);
              const profit = e.revenue - e.investment;
              return (
                <Card key={e.id} className="p-3.5 flex items-center justify-between cursor-pointer" onClick={() => onOpenDay(e.day)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${C.gold}14`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.gold, fontWeight: 700 }}>
                      {String(e.day).padStart(3, "0")}
                    </div>
                    <div className="min-w-0">
                      <div style={{ color: C.text, fontSize: 13.5, fontFamily: "Inter", fontWeight: 600 }} className="truncate">{e.method}</div>
                      <div style={{ color: C.textFaint, fontSize: 11.5, fontFamily: "Inter" }}>{e.category}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: profit >= 0 ? C.green : C.red, fontWeight: 700 }}>
                      {fmtINR(profit, currency)}
                    </div>
                    <div style={{ fontSize: 11 }}>{rm.emoji}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} style={{ color }} />}
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: C.text, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: C.textFaint, fontFamily: "Inter", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontFamily: "Inter", fontSize: 11.5, color: C.textFaint, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{children}</div>;
}

// ---------- Calendar ----------
function CalendarView({ entries, onOpenDay }) {
  const byDay = useMemo(() => {
    const m = new Map();
    entries.forEach((e) => m.set(e.day, e));
    return m;
  }, [entries]);

  const statusOf = (d) => {
    const e = byDay.get(d);
    if (!e) return "none";
    const profit = e.revenue - e.investment;
    if (profit < 0) return "loss";
    if (e.result === "excellent" || e.result === "good") return "complete";
    return "partial";
  };
  const statusColor = { none: C.borderSoft, complete: C.green, partial: "#E0B93F", loss: C.red };

  return (
    <div className="px-4 mt-3">
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <Legend2 color={C.green} label="Completed" />
        <Legend2 color="#E0B93F" label="Partial" />
        <Legend2 color={C.red} label="Loss" />
        <Legend2 color={C.borderSoft} label="Not started" />
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5" style={{ gridTemplateColumns: "repeat(13, minmax(0,1fr))" }}>
          {Array.from({ length: 365 }, (_, i) => i + 1).map((d) => {
            const st = statusOf(d);
            return (
              <button
                key={d}
                onClick={() => onOpenDay(d)}
                title={`Day ${d}`}
                className="aspect-square rounded-md flex items-center justify-center"
                style={{
                  background: st === "none" ? "transparent" : statusColor[st] + "26",
                  border: `1px solid ${st === "none" ? C.borderSoft : statusColor[st]}`,
                }}
              >
                <span style={{ fontSize: 8.5, fontFamily: "'JetBrains Mono', monospace", color: st === "none" ? C.textFaint : statusColor[st] }}>{d}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
function Legend2({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span style={{ fontSize: 11.5, color: C.textDim, fontFamily: "Inter" }}>{label}</span>
    </div>
  );
}

// ---------- History ----------
function HistoryView({ entries, currency, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    let arr = entries.filter((e) =>
      !query || e.method.toLowerCase().includes(query.toLowerCase()) || e.category.toLowerCase().includes(query.toLowerCase())
    );
    const profit = (e) => e.revenue - e.investment;
    const sorters = {
      newest: (a, b) => b.day - a.day,
      oldest: (a, b) => a.day - b.day,
      revenue: (a, b) => b.revenue - a.revenue,
      profit: (a, b) => profit(b) - profit(a),
      saved: (a, b) => b.saved - a.saved,
      leads: (a, b) => b.leads - a.leads,
      clients: (a, b) => b.clients - a.clients,
      time: (a, b) => (b.hours * 60 + b.minutes) - (a.hours * 60 + a.minutes),
    };
    return arr.sort(sorters[sortBy]);
  }, [entries, query, sortBy]);

  return (
    <div className="px-4 mt-3">
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: C.textFaint }} />
          <TextInput placeholder="Search method or category" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {[["newest","Newest"],["oldest","Oldest"],["revenue","Top Revenue"],["profit","Top Profit"],["saved","Top Savings"],["leads","Most Leads"],["clients","Most Clients"],["time","Most Time"]].map(([id,label]) => (
          <button key={id} onClick={() => setSortBy(id)} className="shrink-0 px-3 py-1.5 rounded-full"
            style={{ fontSize: 12, fontFamily: "Inter", background: sortBy === id ? `${C.gold}1A` : C.card, color: sortBy === id ? C.gold : C.textDim, border: `1px solid ${sortBy === id ? C.gold + "55" : C.borderSoft}` }}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: C.textFaint, fontFamily: "Inter", fontSize: 13, textAlign: "center", marginTop: 30 }}>No entries found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e) => {
            const profit = e.revenue - e.investment;
            const rm = resultMeta(e.result);
            return (
              <Card key={e.id} className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.gold }}>D{String(e.day).padStart(3, "0")}</span>
                      <span style={{ fontSize: 11, color: C.textFaint, fontFamily: "Inter" }}>{e.date}</span>
                    </div>
                    <div style={{ color: C.text, fontSize: 14, fontFamily: "Inter", fontWeight: 600, marginTop: 2 }} className="truncate">{e.method}</div>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <Pill color={C.textDim}>{e.category}</Pill>
                      <Pill color={rm.color}>{rm.emoji} {rm.label}</Pill>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(e)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.bgSoft }}>
                      <Pencil size={13} color={C.textDim} />
                    </button>
                    <button onClick={() => onDelete(e.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.bgSoft }}>
                      <Trash2 size={13} color={C.red} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <MiniVal label="Rev" value={fmtINR(e.revenue, currency)} color={C.green} />
                  <MiniVal label="Exp" value={fmtINR(e.investment, currency)} color={C.red} />
                  <MiniVal label="Profit" value={fmtINR(profit, currency)} color={profit >= 0 ? C.green : C.red} />
                  <MiniVal label="Saved" value={fmtINR(e.saved, currency)} color={C.purple} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
function MiniVal({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: C.textFaint, fontFamily: "Inter", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// ---------- Analytics ----------
function Analytics({ entries, currency }) {
  const sorted = useMemo(() => [...entries].sort((a, b) => a.day - b.day), [entries]);

  let cumProfit = 0, cumSaved = 0, cumBrand = 0;
  const lineData = sorted.map((e) => {
    cumProfit += e.revenue - e.investment;
    cumSaved += e.saved;
    cumBrand += e.brandFund;
    return { day: e.day, revenue: e.revenue, cumProfit, cumSaved, cumBrand, leads: e.leads, clients: e.clients };
  });

  const monthly = useMemo(() => {
    const m = {};
    entries.forEach((e) => {
      const mi = new Date(e.date + "T00:00:00").getMonth();
      const key = MONTHS[mi] || "Unknown";
      if (!m[key]) m[key] = { month: key.slice(0, 3), revenue: 0, profit: 0 };
      m[key].revenue += e.revenue;
      m[key].profit += e.revenue - e.investment;
    });
    return MONTHS.map((mo) => m[mo] || { month: mo.slice(0, 3), revenue: 0, profit: 0 });
  }, [entries]);

  const methodData = useMemo(() => {
    const m = {};
    entries.forEach((e) => {
      if (!m[e.method]) m[e.method] = { name: e.method, revenue: 0, profit: 0 };
      m[e.method].revenue += e.revenue;
      m[e.method].profit += e.revenue - e.investment;
    });
    return Object.values(m).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [entries]);

  const pieColors = [C.gold, C.green, C.blue, C.purple, C.red, C.goldSoft, C.textDim, "#E0B93F"];

  const tipStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontFamily: "Inter", fontSize: 12, color: C.text };

  return (
    <div className="px-4 mt-3 flex flex-col gap-5">
      <ChartCard title="Daily Revenue">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={lineData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.gold} stopOpacity={0.4} />
                <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} labelFormatter={(l) => `Day ${l}`} />
            <Area type="monotone" dataKey="revenue" stroke={C.gold} fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cumulative Profit">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} labelFormatter={(l) => `Day ${l}`} />
            <Line type="monotone" dataKey="cumProfit" stroke={C.green} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ChartCard title="Savings Growth">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} labelFormatter={(l) => `Day ${l}`} />
              <Line type="monotone" dataKey="cumSaved" stroke={C.purple} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Brand Fund Growth">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} labelFormatter={(l) => `Day ${l}`} />
              <Line type="monotone" dataKey="cumBrand" stroke={C.gold} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Leads vs Clients">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
            <Bar dataKey="leads" fill={C.blue} radius={[4,4,0,0]} name="Leads" />
            <Bar dataKey="clients" fill={C.gold} radius={[4,4,0,0]} name="Clients" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.textFaint, fontSize: 9.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} />
              <Bar dataKey="revenue" fill={C.green} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Profit">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.textFaint, fontSize: 9.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} />
              <Bar dataKey="profit" fill={C.gold} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {methodData.length > 0 && (
        <ChartCard title="Earning Methods — Revenue Share">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={methodData} dataKey="revenue" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {methodData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={tipStyle} formatter={(v) => fmtINR(v, currency)} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
function ChartCard({ title, children }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <Card className="p-4 mt-2">{children}</Card>
    </div>
  );
}

// ---------- Methods ----------
function MethodsView({ entries, currency, methodScores, onSaveScore }) {
  const [openMethod, setOpenMethod] = useState(null);

  const data = useMemo(() => {
    const m = {};
    entries.forEach((e) => {
      if (!m[e.method]) m[e.method] = { method: e.method, category: e.category, tries: 0, revenue: 0, expenses: 0, leads: 0, clients: 0 };
      m[e.method].tries++;
      m[e.method].revenue += e.revenue;
      m[e.method].expenses += e.investment;
      m[e.method].leads += e.leads;
      m[e.method].clients += e.clients;
    });
    return Object.values(m).map((x) => ({ ...x, profit: x.revenue - x.expenses, avgProfit: (x.revenue - x.expenses) / x.tries }))
      .sort((a, b) => b.profit - a.profit);
  }, [entries]);

  if (data.length === 0) {
    return <div className="px-4 mt-10 text-center"><p style={{ color: C.textFaint, fontFamily: "Inter" }}>No earning methods logged yet.</p></div>;
  }

  return (
    <div className="px-4 mt-3 flex flex-col gap-2">
      {data.map((m) => {
        const sc = methodScores[m.method] || { potential: 5, time: 5, cost: 5, scalability: 5 };
        const overall = Math.round(((Number(sc.potential) + Number(sc.time) + Number(sc.cost) + Number(sc.scalability)) / 4) * 10) / 10;
        const open = openMethod === m.method;
        return (
          <Card key={m.method} className="p-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenMethod(open ? null : m.method)}>
              <div className="min-w-0">
                <div style={{ color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600 }} className="truncate">{m.method}</div>
                <div style={{ color: C.textFaint, fontSize: 11.5, fontFamily: "Inter" }}>{m.category} · {m.tries} tries</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: m.profit >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmtINR(m.profit, currency)}</div>
                  <div style={{ fontSize: 10, color: C.textFaint, fontFamily: "Inter" }}>total profit</div>
                </div>
                <ChevronDown size={16} color={C.textFaint} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <MiniVal label="Revenue" value={fmtINR(m.revenue, currency)} color={C.green} />
              <MiniVal label="Leads" value={m.leads} color={C.blue} />
              <MiniVal label="Clients" value={m.clients} color={C.blue} />
              <MiniVal label="Avg Profit" value={fmtINR(m.avgProfit, currency)} color={C.gold} />
            </div>
            {open && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                <div className="flex items-center justify-between mb-2">
                  <SectionLabel>Method Score</SectionLabel>
                  <Pill color={C.gold}>Overall {overall}/10</Pill>
                </div>
                {[["potential","Earning Potential"],["time","Time Efficiency"],["cost","Cost"],["scalability","Scalability"]].map(([k, label]) => (
                  <div key={k} className="flex items-center gap-3 mt-2">
                    <span style={{ width: 130, fontSize: 12.5, color: C.textDim, fontFamily: "Inter" }}>{label}</span>
                    <input type="range" min={1} max={10} value={sc[k]}
                      onChange={(e) => onSaveScore(m.method, { ...sc, [k]: Number(e.target.value) })}
                      style={{ flex: 1, accentColor: C.gold }} />
                    <span style={{ width: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text, textAlign: "right" }}>{sc[k]}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Brand Fund ----------
function BrandFundView({ totals, settings, currency, onTarget, allocations, onAddAlloc, onDeleteAlloc }) {
  const [targetInput, setTargetInput] = useState(settings.targetBrandFund);
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [allocCat, setAllocCat] = useState(ALLOC_CATEGORIES[0].id);
  const [allocAmt, setAllocAmt] = useState("");

  const progress = settings.targetBrandFund > 0 ? Math.min(100, (totals.brandFund / settings.targetBrandFund) * 100) : 0;

  const allocByCat = useMemo(() => {
    const m = {};
    allocations.forEach((a) => { m[a.category] = (m[a.category] || 0) + Number(a.amount); });
    return m;
  }, [allocations]);
  const allocTotal = Object.values(allocByCat).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 mt-3 flex flex-col gap-5">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={16} color={C.gold} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: C.text, fontWeight: 600 }}>Building Capital For My Brand</span>
        </div>
        <div className="flex items-end justify-between mt-4">
          <div>
            <div style={{ fontSize: 11, color: C.textFaint, fontFamily: "Inter", textTransform: "uppercase" }}>Current</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, color: C.gold, fontWeight: 700 }}>{fmtINR(totals.brandFund, currency)}</div>
          </div>
          <div className="text-right">
            <div style={{ fontSize: 11, color: C.textFaint, fontFamily: "Inter", textTransform: "uppercase" }}>Target</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.textDim, fontWeight: 600 }}>{fmtINR(settings.targetBrandFund, currency)}</div>
          </div>
        </div>
        <div className="mt-4 h-2.5 rounded-full overflow-hidden" style={{ background: C.bgSoft }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${C.goldSoft}, ${C.gold})`, transition: "width .5s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, fontFamily: "Inter" }}>{progress.toFixed(1)}% of target reached</div>
        <div className="mt-4 flex gap-2 items-center">
          <TextInput type="number" placeholder="Set new target" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} />
          <GoldButton small variant="ghost" onClick={() => onTarget(Number(targetInput) || 0)}>Set</GoldButton>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between">
          <SectionLabel>Money Allocation</SectionLabel>
          <button onClick={() => setShowAllocForm((s) => !s)} style={{ color: C.gold, fontFamily: "Inter", fontSize: 12.5 }}>{showAllocForm ? "Close" : "+ Add"}</button>
        </div>

        {showAllocForm && (
          <Card className="p-4 mt-2 flex flex-col gap-3">
            <Select value={allocCat} onChange={(e) => setAllocCat(e.target.value)} options={ALLOC_CATEGORIES.map((c) => c.label)} />
            <TextInput type="number" placeholder={`Amount (${currency})`} value={allocAmt} onChange={(e) => setAllocAmt(e.target.value)} />
            <GoldButton small onClick={() => {
              if (!allocAmt) return;
              const cat = ALLOC_CATEGORIES.find((c) => c.label === allocCat)?.id || ALLOC_CATEGORIES.find(c=>c.id===allocCat)?.id || allocCat;
              onAddAlloc({ id: rid(), category: ALLOC_CATEGORIES.find(c => c.label === allocCat)?.id || allocCat, amount: Number(allocAmt), date: new Date().toISOString().slice(0,10) });
              setAllocAmt("");
              setShowAllocForm(false);
            }}>Save Allocation</GoldButton>
          </Card>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {ALLOC_CATEGORIES.map((c) => {
            const amt = allocByCat[c.id] || 0;
            const pct = allocTotal > 0 ? (amt / allocTotal) * 100 : 0;
            const Icon = c.icon;
            return (
              <Card key={c.id} className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.color + "1A" }}>
                      <Icon size={14} style={{ color: c.color }} />
                    </div>
                    <span style={{ color: C.text, fontSize: 13.5, fontFamily: "Inter", fontWeight: 500 }}>{c.label}</span>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.text, fontWeight: 700 }}>{fmtINR(amt, currency)}</div>
                    <div style={{ fontSize: 10.5, color: C.textFaint, fontFamily: "Inter" }}>{pct.toFixed(0)}%</div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: C.bgSoft }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                </div>
              </Card>
            );
          })}
        </div>
        {allocations.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {[...allocations].reverse().slice(0, 6).map((a) => {
              const cat = ALLOC_CATEGORIES.find((c) => c.id === a.category);
              return (
                <div key={a.id} className="flex items-center justify-between px-1">
                  <span style={{ fontSize: 12, color: C.textDim, fontFamily: "Inter" }}>{cat?.label || a.category} · {a.date}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.text }}>{fmtINR(a.amount, currency)}</span>
                    <button onClick={() => onDeleteAlloc(a.id)}><Trash2 size={12} color={C.textFaint} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Reports (monthly + yearly) ----------
function ReportsView({ entries, currency, streaks, totals }) {
  const [monthIdx, setMonthIdx] = useState(new Date().getMonth());

  const monthEntries = entries.filter((e) => new Date(e.date + "T00:00:00").getMonth() === monthIdx);
  const mTotals = monthEntries.reduce((t, e) => {
    t.revenue += e.revenue; t.expenses += e.investment; t.saved += e.saved; t.brandFund += e.brandFund;
    t.leads += e.leads; t.clients += e.clients; t.time += e.hours * 60 + e.minutes;
    return t;
  }, { revenue: 0, expenses: 0, saved: 0, brandFund: 0, leads: 0, clients: 0, time: 0 });
  mTotals.profit = mTotals.revenue - mTotals.expenses;

  const bestDay = [...monthEntries].sort((a, b) => (b.revenue - b.investment) - (a.revenue - a.investment))[0];
  const worstDay = [...monthEntries].sort((a, b) => (a.revenue - a.investment) - (b.revenue - b.investment))[0];
  const methodTotals = {};
  monthEntries.forEach((e) => { methodTotals[e.method] = (methodTotals[e.method] || 0) + (e.revenue - e.investment); });
  const bestMethod = Object.entries(methodTotals).sort((a, b) => b[1] - a[1])[0];

  // Year-level leaderboard
  const byProfit = [...entries].sort((a, b) => (b.revenue - b.investment) - (a.revenue - a.investment));
  const byRevenue = [...entries].sort((a, b) => b.revenue - a.revenue);
  const bySaved = [...entries].sort((a, b) => b.saved - a.saved);
  const byLeads = [...entries].sort((a, b) => b.leads - a.leads);
  const byClients = [...entries].sort((a, b) => b.clients - a.clients);
  const byTime = [...entries].sort((a, b) => (b.hours*60+b.minutes) - (a.hours*60+a.minutes));
  const yearMethodTotals = {};
  entries.forEach((e) => {
    if (!yearMethodTotals[e.method]) yearMethodTotals[e.method] = { revenue: 0, profit: 0 };
    yearMethodTotals[e.method].revenue += e.revenue;
    yearMethodTotals[e.method].profit += e.revenue - e.investment;
  });
  const bestMethodYear = Object.entries(yearMethodTotals).sort((a, b) => b[1].profit - a[1].profit)[0];
  const worstMethodYear = Object.entries(yearMethodTotals).sort((a, b) => a[1].profit - b[1].profit)[0];

  const isDay365 = entries.some((e) => e.day === 365);

  return (
    <div className="px-4 mt-3 flex flex-col gap-5">
      <div>
        <SectionLabel>Monthly Report</SectionLabel>
        <Card className="p-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMonthIdx((m) => (m + 11) % 12)}><ChevronLeft size={16} color={C.textDim} /></button>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.text, fontSize: 15, fontWeight: 600 }}>{MONTHS[monthIdx]}</span>
            <button onClick={() => setMonthIdx((m) => (m + 1) % 12)}><ChevronRight size={16} color={C.textDim} /></button>
          </div>
          {monthEntries.length === 0 ? (
            <p style={{ color: C.textFaint, fontFamily: "Inter", fontSize: 13, textAlign: "center", padding: "12px 0" }}>No entries this month.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <MiniVal label="Revenue" value={fmtINR(mTotals.revenue, currency)} color={C.green} />
                <MiniVal label="Expenses" value={fmtINR(mTotals.expenses, currency)} color={C.red} />
                <MiniVal label="Profit" value={fmtINR(mTotals.profit, currency)} color={mTotals.profit >= 0 ? C.green : C.red} />
                <MiniVal label="Savings" value={fmtINR(mTotals.saved, currency)} color={C.purple} />
                <MiniVal label="Brand Fund" value={fmtINR(mTotals.brandFund, currency)} color={C.gold} />
                <MiniVal label="Leads / Clients" value={`${mTotals.leads} / ${mTotals.clients}`} color={C.blue} />
                <MiniVal label="Hours Worked" value={`${Math.floor(mTotals.time/60)}h`} color={C.textDim} />
                <MiniVal label="Entries" value={monthEntries.length} color={C.textDim} />
              </div>
              <div className="mt-4 pt-4 flex flex-col gap-1.5" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                {bestMethod && <ReportRow label="Best Method" value={bestMethod[0]} />}
                {bestDay && <ReportRow label="Best Day" value={`Day ${String(bestDay.day).padStart(3,"0")}`} />}
                {worstDay && (worstDay.revenue - worstDay.investment) < 0 && <ReportRow label="Worst Experiment" value={worstDay.method} />}
              </div>
            </>
          )}
        </Card>
      </div>

      <div>
        <SectionLabel>Performance Leaderboard</SectionLabel>
        <Card className="p-4 mt-2 flex flex-col gap-2.5">
          {byRevenue[0] && <ReportRow icon={Trophy} label="Highest Revenue Day" value={`D${byRevenue[0].day} · ${fmtINR(byRevenue[0].revenue, currency)}`} />}
          {byProfit[0] && <ReportRow icon={Trophy} label="Highest Profit Day" value={`D${byProfit[0].day} · ${fmtINR(byProfit[0].revenue-byProfit[0].investment, currency)}`} />}
          {bySaved[0] && <ReportRow icon={Trophy} label="Highest Savings Day" value={`D${bySaved[0].day} · ${fmtINR(bySaved[0].saved, currency)}`} />}
          {byLeads[0] && <ReportRow icon={Trophy} label="Most Leads Day" value={`D${byLeads[0].day} · ${byLeads[0].leads} leads`} />}
          {byClients[0] && <ReportRow icon={Trophy} label="Most Clients Day" value={`D${byClients[0].day} · ${byClients[0].clients} clients`} />}
          {byTime[0] && <ReportRow icon={Trophy} label="Most Time Invested" value={`D${byTime[0].day} · ${byTime[0].hours}h ${byTime[0].minutes}m`} />}
          {bestMethodYear && <ReportRow icon={Sparkles} label="Best Earning Method" value={bestMethodYear[0]} />}
          {worstMethodYear && worstMethodYear[1].profit < 0 && <ReportRow icon={X} label="Worst Experiment" value={worstMethodYear[0]} />}
        </Card>
      </div>

      {isDay365 && (
        <div>
          <SectionLabel>🏆 365 Days Complete</SectionLabel>
          <Card className="p-5 mt-2" style={{ borderColor: C.gold + "55" }}>
            <div className="grid grid-cols-2 gap-3">
              <MiniVal label="Total Revenue" value={fmtINR(totals.revenue, currency)} color={C.green} />
              <MiniVal label="Total Profit" value={fmtINR(totals.profit, currency)} color={C.green} />
              <MiniVal label="Total Savings" value={fmtINR(totals.saved, currency)} color={C.purple} />
              <MiniVal label="Total Brand Fund" value={fmtINR(totals.brandFund, currency)} color={C.gold} />
              <MiniVal label="Longest Streak" value={`${streaks.longest} days`} color={C.gold} />
              <MiniVal label="Days Completed" value={totals.daysCompleted} color={C.textDim} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
function ReportRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5" style={{ fontSize: 12.5, color: C.textDim, fontFamily: "Inter" }}>
        {Icon && <Icon size={12} color={C.gold} />} {label}
      </span>
      <span style={{ fontSize: 12.5, color: C.text, fontFamily: "Inter", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ---------- Settings ----------
function SettingsView({ settings, onSave, entries }) {
  const [local, setLocal] = useState(settings);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ settings, entries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "365-earning-journey-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 mt-3 flex flex-col gap-4">
      <Card className="p-5 flex flex-col gap-4">
        <Field label="Challenge Start Date">
          <TextInput type="date" value={local.startDate} onChange={(e) => setLocal({ ...local, startDate: e.target.value })} />
        </Field>
        <Field label="Currency Symbol">
          <TextInput value={local.currency} onChange={(e) => setLocal({ ...local, currency: e.target.value })} placeholder="₹" />
        </Field>
        <Field label="Target Brand Fund">
          <TextInput type="number" value={local.targetBrandFund} onChange={(e) => setLocal({ ...local, targetBrandFund: Number(e.target.value) || 0 })} />
        </Field>
        <GoldButton onClick={() => onSave(local)} icon={Check}>Save Settings</GoldButton>
      </Card>

      <Card className="p-5 flex flex-col gap-3">
        <SectionLabel>Data Management</SectionLabel>
        <GoldButton variant="ghost" onClick={exportData} icon={Download}>Export My Data (JSON)</GoldButton>
        <p style={{ color: C.textFaint, fontSize: 11.5, fontFamily: "Inter", lineHeight: 1.5 }}>
          Your data is stored privately and only visible to you. Nothing here is shared or exposed publicly.
        </p>
      </Card>
    </div>
  );
}

// ---------- Navigation ----------
function BottomNav({ view, setView, onAdd, onMore }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "add", label: "Add", icon: Plus, special: true },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "more", label: "More", icon: Menu },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <div className="max-w-md mx-auto flex items-center justify-between px-2 py-2 rounded-2xl"
        style={{ background: "rgba(21,21,24,0.92)", backdropFilter: "blur(12px)", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        {items.map((it) => {
          const Icon = it.icon;
          if (it.special) {
            return (
              <button key={it.id} onClick={onAdd} className="flex items-center justify-center rounded-2xl -mt-6"
                style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`, boxShadow: `0 6px 18px ${C.gold}55` }}>
                <Plus size={22} color="#141108" />
              </button>
            );
          }
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => (it.id === "more" ? onMore() : setView(it.id))} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <Icon size={19} color={active ? C.gold : C.textFaint} />
              <span style={{ fontSize: 9.5, fontFamily: "Inter", color: active ? C.gold : C.textFaint }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MoreSheet({ onClose, onNav }) {
  const items = [
    { id: "history", label: "365 Day History", icon: CalendarDays, desc: "Full searchable log of every entry" },
    { id: "methods", label: "Earning Methods", icon: Sparkles, desc: "Experiment database & scores" },
    { id: "brandfund", label: "Brand Fund", icon: Building2, desc: "Capital tracker & allocation" },
    { id: "reports", label: "Reports & Leaderboard", icon: Trophy, desc: "Monthly reports, yearly report" },
    { id: "settings", label: "Settings", icon: SettingsIcon, desc: "Start date, currency, target" },
  ];
  return (
    <Modal title="More" onClose={onClose}>
      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => onNav(it.id)} className="flex items-center gap-3 p-3 rounded-xl text-left" style={{ background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${C.gold}14` }}>
                <Icon size={17} color={C.gold} />
              </div>
              <div>
                <div style={{ color: C.text, fontFamily: "Inter", fontSize: 14, fontWeight: 600 }}>{it.label}</div>
                <div style={{ color: C.textFaint, fontFamily: "Inter", fontSize: 11.5 }}>{it.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
