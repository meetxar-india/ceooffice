import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "2mb" }));

const SECRET = process.env.SESSION_SECRET || "change-me-in-railway-variables";
if (SECRET === "change-me-in-railway-variables") console.warn("WARNING: set SESSION_SECRET in Railway variables for real use.");

// ---------- storage ----------
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const STORE = path.join(DATA_DIR, "store.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
const EMPTY = { users: [], objectives: [], projects: [], tasks: [], decisions: [], meetings: [], risks: [], onlyme: [], hottopics: [], stakeholders: [], metrics: [], commitments: [], updates: [], activity: [] };
function load() { try { return { ...EMPTY, ...JSON.parse(fs.readFileSync(STORE, "utf8")) }; } catch { return JSON.parse(JSON.stringify(EMPTY)); } }
function save(db) { fs.writeFileSync(STORE, JSON.stringify(db, null, 2)); }
function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().slice(0, 10); }
function dayOffset(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((new Date(a) - new Date(b)) / 86400000); }
function longDate() { return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

// ---------- auth helpers ----------
function hashPw(pw) { const s = crypto.randomBytes(16).toString("hex"); return s + ":" + crypto.scryptSync(pw, s, 64).toString("hex"); }
function verifyPw(pw, st) { try { const [s, dk] = st.split(":"); return crypto.timingSafeEqual(Buffer.from(dk), Buffer.from(crypto.scryptSync(pw, s, 64).toString("hex"))); } catch { return false; } }
function sign(u) { const e = Date.now() + 6048e5; const b = Buffer.from(u).toString("base64") + "." + e; return b + "." + crypto.createHmac("sha256", SECRET).update(b).digest("hex"); }
function verifyToken(t) { if (!t) return null; const i = t.lastIndexOf("."); const b = t.slice(0, i); if (crypto.createHmac("sha256", SECRET).update(b).digest("hex") !== t.slice(i + 1)) return null; const p = b.split("."); if (Date.now() > Number(p[1])) return null; return Buffer.from(p[0], "base64").toString(); }
function readCookie(req, n) { const raw = req.headers.cookie || ""; for (const part of raw.split(";")) { const i = part.indexOf("="); if (part.slice(0, i).trim() === n) return decodeURIComponent(part.slice(i + 1)); } return null; }

// ---------- seed ----------
function seed() {
  const db = load();
  if (db.users.length) return;
  const T = "rmx-office-2026";
  db.users = [
    { username: "abhinav", name: "Abhinav", role: "owner", title: "CEO", pw: hashPw(T), lastActive: null },
    { username: "mandeep", name: "Mandeep", role: "member", title: "Executive Assistant", pw: hashPw(T), lastActive: null },
    { username: "awadhesh", name: "Awadhesh", role: "member", title: "Chief of Staff", pw: hashPw(T), lastActive: null },
    { username: "neha", name: "Neha", role: "member", title: "Governance", pw: hashPw(T), lastActive: null },
    { username: "ishan", name: "Ishan", role: "member", title: "Systems", pw: hashPw(T), lastActive: null }
  ];
  const o1 = id(), o2 = id(), o3 = id();
  db.objectives = [
    { id: o1, title: "Close Project Hose on favorable terms", area: "Project Hose", ring: "1", owner: "Abhinav", horizon: "FY26", status: "on-track", progress: 55, notes: "FITT process, Deloitte advising", createdBy: "Abhinav", lastUpdate: today() },
    { id: o2, title: "Stand up RMX Metals trading vertical", area: "RMX Metals", ring: "2", owner: "Ishan", horizon: "FY26", status: "at-risk", progress: 25, notes: "Structure sign-off pending", createdBy: "Abhinav", lastUpdate: dayOffset(-9) },
    { id: o3, title: "Company-wide AI governance in place", area: "RMX", ring: "2", owner: "Ishan", horizon: "Q3", status: "on-track", progress: 40, notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.projects = [
    { id: id(), name: "Principal call + forward business plan", area: "Project Hose", objectiveId: o1, owner: "Abhinav", status: "active", priority: "high", liveWire: "yes", startDate: dayOffset(-20), dueDate: dayOffset(3), progress: 60, nextAction: "Confirm agenda with Deloitte", notes: "VDD underway", createdBy: "Abhinav", lastUpdate: dayOffset(-1) },
    { id: id(), name: "The Plan Beyond investor outreach", area: "Plan Beyond", objectiveId: "", owner: "Abhinav", status: "active", priority: "medium", liveWire: "no", startDate: dayOffset(-10), dueDate: dayOffset(7), progress: 30, nextAction: "Send Anupam Mittal approach", notes: "", createdBy: "Abhinav", lastUpdate: dayOffset(-2) },
    { id: id(), name: "RMX Metals onboarding", area: "RMX Metals", objectiveId: o2, owner: "Ishan", status: "blocked", priority: "medium", liveWire: "yes", startDate: dayOffset(-30), dueDate: dayOffset(-2), progress: 20, nextAction: "", notes: "Waiting on structure sign-off", createdBy: "Abhinav", lastUpdate: dayOffset(-9) },
    { id: id(), name: "AI tool subscription audit", area: "RMX", objectiveId: o3, owner: "Ishan", status: "active", priority: "high", liveWire: "no", startDate: dayOffset(-5), dueDate: dayOffset(5), progress: 40, nextAction: "Inventory subscriptions", notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.tasks = [
    { id: id(), title: "Draft principal call agenda", projectId: "", area: "Project Hose", owner: "Awadhesh", due: dayOffset(1), status: "open", priority: "high", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), title: "Prep board pack", projectId: "", area: "RMX", owner: "Neha", due: dayOffset(-1), status: "open", priority: "high", createdBy: "Abhinav", lastUpdate: dayOffset(-2) }
  ];
  db.decisions = [
    { id: id(), title: "RMX Metals ownership split sign-off", area: "RMX Metals", owner: "Abhinav", status: "open", options: "60/40 KR/Vaibhav as proposed, vs revised vesting", decision: "", rationale: "", decidedDate: "", reviewDate: dayOffset(-1), createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), title: "Keep BBI inside FITT scope or entertain KCM", area: "Project Hose", owner: "Abhinav", status: "open", options: "Single sale to FITT, vs carve-out BBI to KCM", decision: "", rationale: "", decidedDate: "", reviewDate: dayOffset(2), createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.meetings = [
    { id: id(), title: "Weekly leadership sync", date: today(), area: "RMX", attendees: "Abhinav, Awadhesh, Neha, Ishan", agenda: "Pipeline, governance, Metals", notes: "", actions: [{ text: "Circulate governance draft", owner: "Neha", due: dayOffset(-1), done: false }], createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.risks = [
    { id: id(), title: "Vertical integration break if BBI sold separately", area: "Project Hose", owner: "Abhinav", likelihood: "high", impact: "high", mitigation: "Keep BBI inside the FITT scope", status: "open", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.onlyme = [
    { id: id(), title: "Approve RMX Metals ownership split", area: "RMX Metals", from: "Vaibhav", type: "signoff", urgency: "high", due: dayOffset(-1), status: "pending", notes: "", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), title: "Sign off principal call agenda", area: "Project Hose", from: "Awadhesh", type: "approval", urgency: "high", due: dayOffset(1), status: "pending", notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.hottopics = [
    { id: id(), title: "KCM unsolicited inquiry targets BBI only", area: "Project Hose", category: "fire", heat: "hot", owner: "Abhinav", status: "open", notes: "Risk to vertical integration story", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), title: "FNA Group undercutting on pressure-wash hose", area: "BluBird", category: "competitor", heat: "hot", owner: "Awadhesh", status: "open", notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.stakeholders = [
    { id: id(), name: "FITT Group", type: "partner", lastTouch: dayOffset(-6), nextTouch: dayOffset(-1), openPromise: "Send forward business plan", owner: "Abhinav", notes: "Deloitte coordinating", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), name: "KR sir (Chairman)", type: "family", lastTouch: dayOffset(-2), nextTouch: today(), openPromise: "", owner: "Abhinav", notes: "", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), name: "Anupam Mittal", type: "investor", lastTouch: "", nextTouch: dayOffset(5), openPromise: "Send Plan Beyond approach", owner: "Abhinav", notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.metrics = [
    { id: id(), label: "Cash position", group: "cash", area: "RMX", value: "—", target: "", unit: "INR Cr", period: "Now", notes: "Update from finance", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), label: "BBI industrial + B2B revenue share", group: "northstar", area: "BBI", value: "49", target: "60", unit: "%", period: "FY26", notes: "", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), label: "RMX Metals first revenue", group: "bet", area: "RMX Metals", value: "0", target: "1", unit: "deal", period: "FY26", notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.commitments = [
    { id: id(), promise: "Send Anupam Mittal approach", to: "Plan Beyond / self", by: dayOffset(-1), area: "Plan Beyond", owner: "Abhinav", status: "open", notes: "", createdBy: "Abhinav", lastUpdate: today() },
    { id: id(), promise: "Forward business plan to FITT", to: "FITT Group", by: dayOffset(2), area: "Project Hose", owner: "Abhinav", status: "open", notes: "", createdBy: "Abhinav", lastUpdate: today() }
  ];
  db.updates = [{ id: id(), type: "daily", area: "All", who: "Abhinav", text: "Reviewed pipeline hygiene; flagged stale Metals item.", date: today() }];
  save(db);
}
seed();

// ---------- auth ----------
const seen = {};
function auth(req, res, next) {
  const u = verifyToken(readCookie(req, "sid"));
  const db = load(); const user = u && db.users.find((x) => x.username === u);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  const now = Date.now();
  if (!seen[u] || now - seen[u] > 3e5) { seen[u] = now; user.lastActive = new Date().toISOString(); save(db); }
  req.user = user; next();
}
function ownerOnly(req, res, next) { if (req.user.role !== "owner") return res.status(403).json({ error: "Owner access only" }); next(); }
function logAct(action, target, user) { const db = load(); db.activity.unshift({ id: id(), when: new Date().toISOString(), who: user.name, action, target }); db.activity = db.activity.slice(0, 300); save(db); }

// ---------- collection schemas ----------
const COLLECTIONS = {
  objectives: (b) => ({ title: b.title || "Untitled objective", area: b.area || "RMX", ring: b.ring || "2", owner: b.owner || "", horizon: b.horizon || "FY26", status: b.status || "on-track", progress: clamp(b.progress), notes: b.notes || "" }),
  projects: (b) => ({ name: b.name || "Untitled", area: b.area || "RMX", objectiveId: b.objectiveId || "", owner: b.owner || "", status: b.status || "active", priority: b.priority || "medium", liveWire: b.liveWire === "yes" ? "yes" : "no", startDate: b.startDate || "", dueDate: b.dueDate || "", progress: clamp(b.progress), nextAction: b.nextAction || "", notes: b.notes || "" }),
  tasks: (b) => ({ title: b.title || "Untitled task", projectId: b.projectId || "", area: b.area || "RMX", owner: b.owner || "", due: b.due || "", status: b.status || "open", priority: b.priority || "medium" }),
  decisions: (b) => ({ title: b.title || "Untitled decision", area: b.area || "RMX", owner: b.owner || "", status: b.status || "open", options: b.options || "", decision: b.decision || "", rationale: b.rationale || "", decidedDate: b.decidedDate || "", reviewDate: b.reviewDate || "" }),
  meetings: (b) => ({ title: b.title || "Meeting", date: b.date || today(), area: b.area || "RMX", attendees: b.attendees || "", agenda: b.agenda || "", notes: b.notes || "", actions: Array.isArray(b.actions) ? b.actions : [] }),
  risks: (b) => ({ title: b.title || "Risk", area: b.area || "RMX", owner: b.owner || "", likelihood: b.likelihood || "medium", impact: b.impact || "medium", mitigation: b.mitigation || "", status: b.status || "open" }),
  onlyme: (b) => ({ title: b.title || "Untitled", area: b.area || "RMX", from: b.from || "", type: b.type || "decision", urgency: b.urgency || "medium", due: b.due || "", status: b.status || "pending", notes: b.notes || "" }),
  hottopics: (b) => ({ title: b.title || "Untitled", area: b.area || "RMX", category: b.category || "competitor", heat: b.heat || "warm", owner: b.owner || "", status: b.status || "open", notes: b.notes || "" }),
  stakeholders: (b) => ({ name: b.name || "Unnamed", type: b.type || "customer", lastTouch: b.lastTouch || "", nextTouch: b.nextTouch || "", openPromise: b.openPromise || "", owner: b.owner || "", notes: b.notes || "" }),
  metrics: (b) => ({ label: b.label || "Metric", group: b.group || "northstar", area: b.area || "RMX", value: b.value || "", target: b.target || "", unit: b.unit || "", period: b.period || "", notes: b.notes || "" }),
  commitments: (b) => ({ promise: b.promise || "Promise", to: b.to || "", by: b.by || "", area: b.area || "RMX", owner: b.owner || "", status: b.status || "open", notes: b.notes || "" }),
  updates: (b) => ({ type: b.type || "daily", area: b.area || "All", text: b.text || "", date: today() })
};
function clamp(n) { n = Number(n) || 0; return Math.max(0, Math.min(100, n)); }
const SINGULAR = { objectives: "objective", projects: "project", tasks: "task", decisions: "decision", meetings: "meeting", risks: "risk", onlyme: "item", hottopics: "topic", stakeholders: "stakeholder", metrics: "metric", commitments: "commitment", updates: "update" };
function nameOf(i) { return i.name || i.title || i.label || i.promise || ""; }

// ---------- flag engine ----------
function F(level, rule, item, owner, area, detail) { return { level, rule, item, owner: owner || "", area: area || "", detail: detail || "" }; }
function computeFlags(db) {
  const t = today(); const f = [];
  for (const p of db.projects) {
    if (p.status === "done") continue;
    if (p.dueDate && p.dueDate < t) f.push(F("red", "Overdue project", p.name, p.owner, p.area, "Due " + p.dueDate));
    if (p.status === "blocked") f.push(F("red", "Blocked", p.name, p.owner, p.area, p.notes || "Unblock"));
    if (!p.owner) f.push(F("amber", "No owner", p.name, "", p.area, "Assign someone"));
    if (!p.nextAction) f.push(F("amber", "No next action", p.name, p.owner, p.area, "Define the next move"));
    if (p.lastUpdate && daysBetween(t, p.lastUpdate) > 7) f.push(F("amber", "Stale", p.name, p.owner, p.area, "No update in " + daysBetween(t, p.lastUpdate) + " days"));
  }
  for (const o of db.objectives) { if (o.status === "off-track") f.push(F("red", "Objective off-track", o.title, o.owner, o.area, "")); else if (o.status === "at-risk") f.push(F("amber", "Objective at-risk", o.title, o.owner, o.area, o.progress + "% done")); }
  for (const tk of db.tasks) if (tk.status !== "done" && tk.due && tk.due < t) f.push(F("red", "Overdue task", tk.title, tk.owner, tk.area, "Due " + tk.due));
  for (const d of db.decisions) if (d.status === "open" && d.reviewDate && d.reviewDate < t) f.push(F("amber", "Decision pending", d.title, d.owner, d.area, "Past review date"));
  for (const m of db.meetings) (m.actions || []).forEach((a) => { if (!a.done && a.due && a.due < t) f.push(F("amber", "Action overdue", a.text, a.owner, m.area, "From " + m.title)); });
  for (const r of db.risks) if (r.status === "open" && r.likelihood === "high" && r.impact === "high") f.push(F("red", "High risk", r.title, r.owner, r.area, r.mitigation || "No mitigation"));
  for (const q of db.onlyme) { if (q.status === "pending" && q.due && q.due < t) f.push(F("red", "CEO action overdue", q.title, "Abhinav", q.area, "From " + (q.from || "office"))); else if (q.status === "pending" && q.urgency === "high") f.push(F("amber", "Awaiting your call", q.title, "Abhinav", q.area, "From " + (q.from || "office"))); }
  for (const h of db.hottopics) { if (h.status === "open" && h.category === "fire") f.push(F("red", "Fire", h.title, h.owner, h.area, "")); else if (h.status === "open" && h.heat === "hot") f.push(F("amber", "Hot topic", h.title, h.owner, h.area, h.category)); }
  for (const s of db.stakeholders) if (s.nextTouch && s.nextTouch < t) f.push(F("amber", "Stakeholder owed a touch", s.name, s.owner, s.type, s.openPromise || ""));
  for (const c of db.commitments) if (c.status === "open" && c.by && c.by < t) f.push(F("red", "Commitment overdue", c.promise, c.owner, c.area, "To " + (c.to || "")));
  for (const m of db.metrics) if (m.group === "northstar" && m.target && Number(m.value) < Number(m.target)) f.push(F("amber", "Below target", m.label, "", m.area, m.value + "/" + m.target + " " + m.unit));
  f.sort((a, b) => (a.level === "red" ? 0 : 1) - (b.level === "red" ? 0 : 1));
  return f;
}

// ---------- auth routes ----------
function setSession(res, u, secure) { res.setHeader("Set-Cookie", "sid=" + encodeURIComponent(sign(u)) + "; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax" + (secure ? "; Secure" : "")); }
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const db = load(); const user = db.users.find((u) => u.username === (username || "").toLowerCase().trim());
  if (!user || !verifyPw(password || "", user.pw)) return res.status(401).json({ error: "Wrong username or password" });
  setSession(res, user.username, (req.headers["x-forwarded-proto"] || "").includes("https"));
  logAct("signed in", "", user); res.json({ name: user.name, role: user.role });
});
app.post("/api/logout", (req, res) => { res.setHeader("Set-Cookie", "sid=; HttpOnly; Path=/; Max-Age=0"); res.json({ ok: true }); });
app.get("/api/me", auth, (req, res) => res.json({ name: req.user.name, username: req.user.username, role: req.user.role, title: req.user.title }));

// ---------- data ----------
app.get("/api/data", auth, (req, res) => {
  const db = load(); const t = today(), in7 = dayOffset(7);
  const flags = computeFlags(db);
  const workload = {}; const bump = (o) => { if (o) workload[o] = (workload[o] || 0) + 1; };
  db.projects.forEach((p) => p.status !== "done" && bump(p.owner));
  db.tasks.forEach((k) => k.status !== "done" && bump(k.owner));
  const upcoming = [
    ...db.projects.filter((p) => p.status !== "done" && p.dueDate > t && p.dueDate <= in7).map((p) => ({ kind: "Project", title: p.name, when: p.dueDate, owner: p.owner, area: p.area })),
    ...db.tasks.filter((k) => k.status !== "done" && k.due > t && k.due <= in7).map((k) => ({ kind: "Task", title: k.title, when: k.due, owner: k.owner, area: k.area })),
    ...db.meetings.filter((m) => m.date > t && m.date <= in7).map((m) => ({ kind: "Meeting", title: m.title, when: m.date, owner: "", area: m.area }))
  ].sort((a, b) => a.when.localeCompare(b.when));
  const dueToday = [
    ...db.projects.filter((p) => p.status !== "done" && p.dueDate === t).map((p) => ({ kind: "Project", title: p.name, owner: p.owner, area: p.area })),
    ...db.tasks.filter((k) => k.status !== "done" && k.due === t).map((k) => ({ kind: "Task", title: k.title, owner: k.owner, area: k.area })),
    ...db.meetings.filter((m) => m.date === t).map((m) => ({ kind: "Meeting", title: m.title, owner: "", area: m.area }))
  ];
  const out = {
    me: { name: req.user.name, role: req.user.role, title: req.user.title },
    team: db.users.map((u) => u.name),
    objectives: db.objectives, projects: db.projects, tasks: db.tasks, decisions: db.decisions,
    meetings: db.meetings, risks: db.risks, onlyme: db.onlyme, hottopics: db.hottopics,
    stakeholders: db.stakeholders, metrics: db.metrics, commitments: db.commitments, updates: db.updates,
    flags, workload, upcoming, dueToday, today: t,
    counts: {
      red: flags.filter((x) => x.level === "red").length, amber: flags.filter((x) => x.level === "amber").length,
      projects: db.projects.filter((p) => p.status !== "done").length, tasks: db.tasks.filter((k) => k.status !== "done").length,
      decisions: db.decisions.filter((d) => d.status === "open").length, risks: db.risks.filter((r) => r.status === "open").length,
      onlyme: db.onlyme.filter((q) => q.status === "pending").length, hot: db.hottopics.filter((h) => h.status === "open" && (h.heat === "hot" || h.category === "fire")).length,
      livewire: db.projects.filter((p) => p.liveWire === "yes" && p.status !== "done").length, commitments: db.commitments.filter((c) => c.status === "open").length
    }
  };
  if (req.user.role === "owner") { out.activity = db.activity.slice(0, 60); out.users = db.users.map((u) => ({ name: u.name, username: u.username, role: u.role, title: u.title, lastActive: u.lastActive })); }
  res.json(out);
});

// ---------- generic CRUD ----------
app.post("/api/c/:col", auth, (req, res) => {
  const col = req.params.col; if (!COLLECTIONS[col]) return res.status(400).json({ error: "Unknown collection" });
  const db = load(); const item = Object.assign({ id: id(), createdBy: req.user.name, lastUpdate: today() }, COLLECTIONS[col](req.body || {}));
  if (col === "updates") { item.who = req.user.name; db.updates.unshift(item); } else db[col].push(item);
  save(db); logAct("added " + SINGULAR[col], nameOf(item), req.user); res.json(item);
});
app.put("/api/c/:col/:id", auth, (req, res) => {
  const col = req.params.col; if (!COLLECTIONS[col]) return res.status(400).json({ error: "Unknown collection" });
  const db = load(); const item = db[col].find((x) => x.id === req.params.id); if (!item) return res.status(404).json({ error: "Not found" });
  Object.assign(item, COLLECTIONS[col](Object.assign({}, item, req.body)), { lastUpdate: today() });
  save(db); logAct("updated " + SINGULAR[col], nameOf(item), req.user); res.json(item);
});
app.delete("/api/c/:col/:id", auth, (req, res) => {
  const col = req.params.col; if (!COLLECTIONS[col]) return res.status(400).json({ error: "Unknown collection" });
  const db = load(); const item = db[col].find((x) => x.id === req.params.id); db[col] = db[col].filter((x) => x.id !== req.params.id); save(db);
  if (item) logAct("deleted " + SINGULAR[col], nameOf(item), req.user); res.json({ ok: true });
});

// ---------- account + users ----------
app.post("/api/account/password", auth, (req, res) => {
  const { current, next } = req.body || {}; const db = load(); const u = db.users.find((x) => x.username === req.user.username);
  if (!verifyPw(current || "", u.pw)) return res.status(400).json({ error: "Current password is wrong" });
  if (!next || next.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });
  u.pw = hashPw(next); save(db); res.json({ ok: true });
});
app.post("/api/users", auth, ownerOnly, (req, res) => {
  const { username, name, role, title } = req.body || {}; const db = load(); const un = (username || "").toLowerCase().trim();
  if (!un || db.users.find((u) => u.username === un)) return res.status(400).json({ error: "Username missing or already exists" });
  db.users.push({ username: un, name: name || un, role: role === "owner" ? "owner" : "member", title: title || "", pw: hashPw("rmx-office-2026"), lastActive: null });
  save(db); logAct("added user", name || un, req.user); res.json({ ok: true, tempPassword: "rmx-office-2026" });
});
app.post("/api/users/:username/reset", auth, ownerOnly, (req, res) => {
  const db = load(); const u = db.users.find((x) => x.username === req.params.username); if (!u) return res.status(404).json({ error: "User not found" });
  u.pw = hashPw("rmx-office-2026"); save(db); logAct("reset password for", u.name, req.user); res.json({ ok: true, tempPassword: "rmx-office-2026" });
});

// ================= BRIEFING STUDIO =================
const REPORT_TYPES = [
  { id: "daily", title: "Daily CEO Brief", desc: "Today's focus, flags, due items, your queue." },
  { id: "weekly", title: "Weekly Operating Review", desc: "What moved, what's stuck, the week ahead." },
  { id: "decision", title: "Decision Memo", desc: "One open decision, framed for a call." },
  { id: "board", title: "Board / Investor Update", desc: "Metrics, deal status, risks, the ask." },
  { id: "deal", title: "Deal Brief (Project Hose)", desc: "Milestones, risks, live tension." },
  { id: "warroom", title: "War-Room Brief", desc: "Live-wire items and the unblock decision." },
  { id: "stakeholder", title: "Stakeholder Update", desc: "One stakeholder, last touch, talking points." },
  { id: "monthly", title: "Monthly Business Review", desc: "Cross-entity rollup, cash, bold bets." }
];
const fmtList = (arr) => (arr.length ? arr : ["None."]);

function intakeFor(id, db) {
  const t = today();
  const flags = computeFlags(db);
  const red = flags.filter((f) => f.level === "red");
  const liveWire = db.projects.filter((p) => p.liveWire === "yes" && p.status !== "done");
  const onlyme = db.onlyme.filter((q) => q.status === "pending");
  const openDec = db.decisions.filter((d) => d.status === "open");
  switch (id) {
    case "daily": return { title: "Daily CEO Brief", summary: [["Red flags", red.length], ["Due today", db.projects.filter(p=>p.dueDate===t).length], ["Your queue", onlyme.length]], questions: [{ key: "focus", label: "What is the one outcome today is about?", type: "textarea" }, { key: "notes", label: "Anything to add?", type: "textarea" }] };
    case "weekly": return { title: "Weekly Operating Review", summary: [["Objectives", db.objectives.length], ["Open flags", flags.length], ["Blocked", db.projects.filter(p=>p.status==="blocked").length]], questions: [{ key: "moved", label: "What moved this week worth naming?", type: "textarea" }, { key: "pressure", label: "Where do you want to apply pressure next week?", type: "textarea" }] };
    case "decision": return { title: "Decision Memo", summary: [["Open decisions", openDec.length]], questions: [{ key: "decisionId", label: "Which decision?", type: "select", options: openDec.map(d => ({ value: d.id, label: d.title })) }, { key: "lean", label: "Your current lean?", type: "textarea" }, { key: "change", label: "What would change your mind?", type: "textarea" }] };
    case "board": return { title: "Board / Investor Update", summary: [["Metrics tracked", db.metrics.length], ["High risks", db.risks.filter(r=>r.likelihood==="high"&&r.impact==="high").length]], questions: [{ key: "narrative", label: "The headline narrative?", type: "textarea" }, { key: "wins", label: "Top wins this period?", type: "textarea" }, { key: "ask", label: "The one ask of the board?", type: "textarea" }] };
    case "deal": return { title: "Deal Brief (Project Hose)", summary: [["Project Hose items", db.projects.filter(p=>p.area==="Project Hose").length], ["Open decisions", db.decisions.filter(d=>d.area==="Project Hose"&&d.status==="open").length]], questions: [{ key: "tension", label: "The live tension with FITT this week?", type: "textarea" }, { key: "milestone", label: "Next milestone and date?", type: "text" }] };
    case "warroom": return { title: "War-Room Brief", summary: [["Live-wire items", liveWire.length], ["Red flags", red.length]], questions: [{ key: "unblock", label: "What decision unblocks the top item in 24 hours?", type: "textarea" }] };
    case "stakeholder": return { title: "Stakeholder Update", summary: [["Stakeholders", db.stakeholders.length]], questions: [{ key: "stakeholderId", label: "Which stakeholder?", type: "select", options: db.stakeholders.map(s => ({ value: s.id, label: s.name })) }, { key: "message", label: "What do they need to hear from you now?", type: "textarea" }] };
    case "monthly": return { title: "Monthly Business Review", summary: [["Entities in play", new Set(db.projects.map(p=>p.area)).size], ["Bold bets", db.metrics.filter(m=>m.group==="bet").length]], questions: [{ key: "kds", label: "What are you killing, doubling, or starting?", type: "textarea" }, { key: "narrative", label: "The month in one line?", type: "text" }] };
    default: return null;
  }
}

function buildDoc(id, db, a) {
  const t = today(); const flags = computeFlags(db); const red = flags.filter((f) => f.level === "red");
  const liveWire = db.projects.filter((p) => p.liveWire === "yes" && p.status !== "done");
  const onlyme = db.onlyme.filter((q) => q.status === "pending");
  const dueToday = db.projects.filter((p) => p.dueDate === t && p.status !== "done").map((p) => p.area + ": " + p.name + " (" + (p.owner || "unassigned") + ")");
  const flagBlock = (list) => ({ type: "flags", items: (list || []).slice(0, 15) });
  const B = []; let title = "", subtitle = longDate();
  if (id === "daily") {
    title = "Daily CEO Brief";
    B.push({ type: "heading", text: "Today's Focus" }, { type: "text", text: a.focus || "Not specified." });
    B.push({ type: "heading", text: "Due Today" }, { type: "bullets", items: fmtList(dueToday) });
    B.push({ type: "heading", text: "Flags" }, flagBlock(flags));
    B.push({ type: "heading", text: "Only-Me Queue" }, { type: "bullets", items: fmtList(onlyme.map(q => q.title + " (from " + (q.from || "office") + ", " + q.urgency + ")")) });
    B.push({ type: "heading", text: "Live-Wire" }, { type: "bullets", items: fmtList(liveWire.map(p => p.name + ": " + (p.nextAction || p.notes || "no next action"))) });
    if (a.notes) B.push({ type: "heading", text: "Notes" }, { type: "text", text: a.notes });
  } else if (id === "weekly") {
    title = "Weekly Operating Review";
    B.push({ type: "heading", text: "What Moved" }, { type: "text", text: a.moved || "Not specified." });
    B.push({ type: "heading", text: "Objective Health" }, { type: "kv", items: db.objectives.map(o => [o.title, o.status + ", " + o.progress + "%"]) });
    B.push({ type: "heading", text: "Stuck / Blocked" }, { type: "bullets", items: fmtList(db.projects.filter(p => p.status === "blocked").map(p => p.name + " (" + (p.owner || "unassigned") + ")")) });
    B.push({ type: "heading", text: "The Week Ahead" }, { type: "bullets", items: fmtList(db.projects.filter(p => p.dueDate > t && p.dueDate <= dayOffset(7)).map(p => p.dueDate + " " + p.name)) });
    B.push({ type: "heading", text: "Where We Apply Pressure" }, { type: "text", text: a.pressure || "Not specified." });
    B.push({ type: "heading", text: "Open Flags" }, flagBlock(flags));
  } else if (id === "decision") {
    const d = db.decisions.find(x => x.id === a.decisionId) || db.decisions[0] || {};
    title = "Decision Memo"; subtitle = d.title || subtitle;
    B.push({ type: "kv", items: [["Area", d.area || ""], ["Owner", d.owner || ""], ["Review by", d.reviewDate || "open"]] });
    B.push({ type: "heading", text: "Options On The Table" }, { type: "text", text: d.options || "Not captured." });
    B.push({ type: "heading", text: "Current Lean" }, { type: "text", text: a.lean || "Not specified." });
    B.push({ type: "heading", text: "What Would Change The Call" }, { type: "text", text: a.change || "Not specified." });
    B.push({ type: "heading", text: "Recommendation" }, { type: "text", text: d.decision || a.lean || "To be decided on the call." });
  } else if (id === "board") {
    title = "Board / Investor Update";
    B.push({ type: "heading", text: "Headline" }, { type: "text", text: a.narrative || "Not specified." });
    B.push({ type: "heading", text: "Key Metrics" }, { type: "kv", items: db.metrics.map(m => [m.label, (m.value || "—") + (m.unit ? " " + m.unit : "") + (m.target ? " (target " + m.target + ")" : "")]) });
    B.push({ type: "heading", text: "Wins" }, { type: "text", text: a.wins || "Not specified." });
    B.push({ type: "heading", text: "Key Risks" }, { type: "bullets", items: fmtList(db.risks.filter(r => r.status === "open").map(r => r.title + " (" + r.likelihood + "/" + r.impact + ")")) });
    B.push({ type: "heading", text: "The Ask" }, { type: "text", text: a.ask || "Not specified." });
  } else if (id === "deal") {
    title = "Deal Brief: Project Hose";
    B.push({ type: "heading", text: "Live Tension" }, { type: "text", text: a.tension || "Not specified." });
    B.push({ type: "heading", text: "Next Milestone" }, { type: "text", text: a.milestone || "Not specified." });
    B.push({ type: "heading", text: "Workstreams" }, { type: "bullets", items: fmtList(db.projects.filter(p => p.area === "Project Hose").map(p => p.name + ": " + p.status + ", " + p.progress + "%")) });
    B.push({ type: "heading", text: "Open Decisions" }, { type: "bullets", items: fmtList(db.decisions.filter(d => d.area === "Project Hose" && d.status === "open").map(d => d.title)) });
    B.push({ type: "heading", text: "Risks" }, { type: "bullets", items: fmtList(db.risks.filter(r => r.area === "Project Hose").map(r => r.title + " (" + r.likelihood + "/" + r.impact + ")")) });
  } else if (id === "warroom") {
    title = "War-Room Brief";
    B.push({ type: "heading", text: "The 24-Hour Unblock" }, { type: "text", text: a.unblock || "Not specified." });
    B.push({ type: "heading", text: "Live-Wire Items" }, { type: "bullets", items: fmtList(liveWire.map(p => p.name + ": " + p.status + (p.notes ? ", " + p.notes : ""))) });
    B.push({ type: "heading", text: "Red Flags" }, flagBlock(red));
  } else if (id === "stakeholder") {
    const s = db.stakeholders.find(x => x.id === a.stakeholderId) || db.stakeholders[0] || {};
    title = "Stakeholder Update"; subtitle = s.name || subtitle;
    B.push({ type: "kv", items: [["Type", s.type || ""], ["Last touch", s.lastTouch || "never"], ["Next touch", s.nextTouch || "unscheduled"], ["Open promise", s.openPromise || "none"]] });
    B.push({ type: "heading", text: "What They Need To Hear" }, { type: "text", text: a.message || "Not specified." });
    B.push({ type: "heading", text: "Notes" }, { type: "text", text: s.notes || "None." });
  } else if (id === "monthly") {
    title = "Monthly Business Review";
    B.push({ type: "heading", text: "The Month" }, { type: "text", text: a.narrative || "Not specified." });
    const areas = {}; db.projects.forEach(p => { areas[p.area] = (areas[p.area] || 0) + (p.status !== "done" ? 1 : 0); });
    B.push({ type: "heading", text: "By Entity" }, { type: "kv", items: Object.entries(areas).map(([k, v]) => [k, v + " open"]) });
    B.push({ type: "heading", text: "Cash & North Star" }, { type: "kv", items: db.metrics.filter(m => m.group !== "bet").map(m => [m.label, (m.value || "—") + " " + m.unit]) });
    B.push({ type: "heading", text: "Bold Bets" }, { type: "bullets", items: fmtList(db.metrics.filter(m => m.group === "bet").map(m => m.label + ": " + (m.value || "—") + "/" + (m.target || "—"))) });
    B.push({ type: "heading", text: "Kill / Double / Start" }, { type: "text", text: a.kds || "Not specified." });
  }
  return { title, subtitle, blocks: B };
}

// PDF renderer
const NAVY = "#0B1F3A", ORANGE = "#F0841F", INKC = "#1d2a3d", MUTED = "#6b7a90", REDC = "#d14343", AMBERC = "#c98a16";
function renderPDF(model, res, who) {
  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => {
    const buf = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="' + model.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + '.pdf"');
    res.send(buf);
  });
  const W = doc.page.width, H = doc.page.height;
  // header band
  doc.rect(0, 0, W, 92).fill(NAVY);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text("RMX", 50, 26, { continued: true }).fillColor("#5BA8FF").text("  |  BluBird");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text(model.title, 50, 44, { width: W - 100 });
  doc.fillColor("#9DB0CC").font("Helvetica").fontSize(10).text(model.subtitle, 50, 72, { width: W - 100 });
  doc.fillColor(INKC).font("Helvetica").fontSize(10);
  doc.x = 50; doc.y = 116;
  for (const b of model.blocks) {
    if (doc.y > H - 90) doc.addPage();
    if (b.type === "heading") {
      doc.moveDown(0.5); const y = doc.y; doc.rect(50, y + 2, 4, 13).fill(ORANGE);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12.5).text(b.text, 62, y); doc.moveDown(0.35);
      doc.fillColor(INKC).font("Helvetica").fontSize(10);
    } else if (b.type === "text") {
      doc.fillColor(INKC).font("Helvetica").fontSize(10.5).text(b.text, { width: W - 100 }); doc.moveDown(0.3);
    } else if (b.type === "bullets") {
      doc.fillColor(INKC).font("Helvetica").fontSize(10.5);
      for (const it of b.items) { doc.text("•  " + it, { width: W - 100 }); }
      doc.moveDown(0.3);
    } else if (b.type === "kv") {
      doc.fontSize(10.5);
      if (!b.items.length) { doc.fillColor(MUTED).text("None."); }
      for (const [k, v] of b.items) { doc.font("Helvetica-Bold").fillColor(NAVY).text(k + ":  ", { continued: true }).font("Helvetica").fillColor(INKC).text(v || "—", { width: W - 100 }); }
      doc.moveDown(0.3);
    } else if (b.type === "flags") {
      if (!b.items.length) { doc.fillColor(MUTED).font("Helvetica").fontSize(10).text("Nothing flagged."); doc.moveDown(0.3); }
      for (const f of b.items) {
        if (doc.y > H - 90) doc.addPage();
        const y = doc.y; doc.circle(54, y + 5, 3).fill(f.level === "red" ? REDC : AMBERC);
        doc.fillColor(INKC).font("Helvetica-Bold").fontSize(9.8).text(f.rule + "  ·  " + (f.owner || "unassigned") + (f.area ? "  ·  " + f.area : ""), 64, y, { width: W - 114 });
        doc.font("Helvetica").fillColor(MUTED).fontSize(9.3).text(f.item + (f.detail ? "  ·  " + f.detail : ""), 64, doc.y, { width: W - 114 });
        doc.moveDown(0.25);
      }
      doc.moveDown(0.1);
    }
  }
  // footers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // prevent footer text from triggering a new page
    doc.fillColor("#cbd5e1").rect(50, H - 54, W - 100, 0.6).fill();
    doc.fillColor(MUTED).font("Helvetica").fontSize(7.5);
    doc.text("Today, everyone has access to all the knowledge in the world. The gap is between you and action.", 50, H - 46, { width: W - 140, lineBreak: false });
    doc.text("Page " + (i - range.start + 1) + " of " + range.count, W - 95, H - 46, { width: 65, align: "right", lineBreak: false });
  }
  doc.end();
}
app.get("/api/report/types", auth, (req, res) => res.json(REPORT_TYPES));
app.get("/api/report/:id/intake", auth, (req, res) => { const db = load(); const i = intakeFor(req.params.id, db); if (!i) return res.status(404).json({ error: "Unknown report" }); res.json(i); });
app.post("/api/report/:id/generate", auth, (req, res) => {
  const db = load(); if (!intakeFor(req.params.id, db)) return res.status(404).json({ error: "Unknown report" });
  const model = buildDoc(req.params.id, db, req.body.answers || {});
  logAct("generated PDF", model.title, req.user);
  renderPDF(model, res, req.user.name);
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use(express.static(__dirname));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("CEO Office OS running on " + PORT));
