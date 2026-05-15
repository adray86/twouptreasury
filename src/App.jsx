import { useState, useEffect, useRef, useCallback } from “react”;

// ─── SEO ─────────────────────────────────────────────────────────────────────
function injectMeta() {
document.title = “Double Down | Beat Albo’s $4.3M Beach House — One Flip At A Time”;
[
[“description”,“Double Down: Australia’s most ambitious coin flip. $1,000 to start. Global leaderboard. Badges. See what your money bought in 1980 vs now.”],
[“og:title”,“Double Down | Ignore CGT. Flip a Coin. Don’t Pay A Cent.”],
[“og:description”,“Start with $1,000 in play credits. Flip coins. Earn badges. Climb the leaderboard. Jim Chalmers bought a $4.3M beach house. Beat him.”],
[“keywords”,“Australia budget satire, coin flip game, 1980 prices Australia, Albanese house, leaderboard, play credits, Jim Chalmers, two-up, badges”],
].forEach(([k,v]) => {
const m = document.createElement(“meta”);
m.setAttribute(k.includes(“og:”) ? “property” : “name”, k);
m.content = v; document.head.appendChild(m);
});
const can = document.createElement(“link”);
can.rel = “canonical”; can.href = “https://doubledown.au”;
document.head.appendChild(can);
}

// ─── BADGE DEFINITIONS ────────────────────────────────────────────────────────
// Albo’s Copacabana clifftop house = $4,300,000
const ALBO = 4_300_000;
const BADGES = [
{ id:“first_flip”,  emoji:“🪙”, label:“First Flip”,          desc:“You flipped your first coin. Welcome.”,                                          check: p => p.flips >= 1 },
{ id:“in_green”,    emoji:“📈”, label:“In The Green”,         desc:“Balance above $1,000. Unlike the federal budget.”,                               check: p => p.balance > 1000 },
{ id:“avo”,         emoji:“🥑”, label:“Avo Toast Money”,      desc:”$2,000+ — enough for 83 café avocado toasts at $24 a pop.”,                     check: p => p.balance >= 2000 },
{ id:“tinny”,       emoji:“🍺”, label:“Shout A Round”,        desc:”$5,000+ — a tinny costs $9 now. Buy a round while you can.”,                    check: p => p.balance >= 5000 },
{ id:“surplus”,     emoji:“📊”, label:“Budget Surplus”,       desc:”$10,000+ — you’ve already beat Chalmers. His deficit is $28.3 billion.”,        check: p => p.balance >= 10_000 },
{ id:“deposit”,     emoji:“🗝️”, label:“First Home Deposit”,   desc:”$50,000+ — a deposit. Somewhere regional. 2004 prices.”,                       check: p => p.balance >= 50_000 },
{ id:“negear”,      emoji:“💼”, label:“Negative Gearer”,      desc:”$100,000+ — losses deductible against other income. For now.”,                  check: p => p.balance >= 100_000 },
{ id:“landlord”,    emoji:“🏘️”, label:“Portfolio Landlord”,   desc:”$500,000+ — time to raise the rent and blame council rates.”,                   check: p => p.balance >= 500_000 },
{ id:“albo1”,       emoji:“🏖️”, label:“1× Albo’s House”,     desc:”$4.3M — Copacabana clifftop. Ocean views. Purchased during a cost-of-living crisis.”,  check: p => p.balance >= ALBO },
{ id:“albo2”,       emoji:“🏖️🏖️”, label:“2× Albo’s Houses”,  desc:”$8.6M — you could gift one to a struggling renter and still be fine.”,         check: p => p.balance >= ALBO*2 },
{ id:“albo3”,       emoji:“🏖️🏖️🏖️”, label:“3× Albo’s Houses”, desc:”$12.9M — at this point you’re basically a Liberal Party donor.”,              check: p => p.balance >= ALBO*3 },
{ id:“albo5”,       emoji:“🌊”, label:“5× Albo’s Houses”,     desc:”$21.5M — property portfolio bigger than most super funds.”,                     check: p => p.balance >= ALBO*5 },
{ id:“albo10”,      emoji:“🌊🌊”, label:“10× Albo’s Houses”,   desc:”$43M — the ocean views are yours. All of them.”,                               check: p => p.balance >= ALBO*10 },
{ id:“century”,     emoji:“💯”, label:“Century Flipper”,       desc:“100 flips. Dedicated.”,                                                         check: p => p.flips >= 100 },
{ id:“survivor”,    emoji:“🦘”, label:“True Blue Survivor”,    desc:“Got below $100 and climbed back. Very Australian.”,                             check: p => p.lowestEver !== undefined && p.lowestEver < 100 && p.balance > p.lowestEver },
];

function getEarnedBadges(profile) {
return BADGES.filter(b => b.check(profile));
}
function getHighestHouseBadge(profile) {
const houses = BADGES.filter(b => b.id.startsWith(“albo”) && b.check(profile));
return houses.length ? houses[houses.length - 1] : null;
}

// ─── LIVE DEFICIT COUNTER ─────────────────────────────────────────────────────
// $28.3B deficit / 365 days / 24h / 3600s = ~$897/second
function DeficitCounter() {
const BASE = 28_300_000_000;
const PER_SEC = 897;
const [count, setCount] = useState(BASE);
useEffect(() => {
const t = setInterval(() => setCount(n => n + PER_SEC), 1000);
return () => clearInterval(t);
}, []);
return (
<div className="deficit-bar">
<span className="deficit-label">🇦🇺 NATIONAL DEFICIT — LIVE</span>
<span className="deficit-num">${count.toLocaleString(“en-AU”)}</span>
<span className="deficit-sub">+$897 every second · Jim Chalmers calls this “an improvement”</span>
</div>
);
}

// ─── ITEMS: 1980 vs 2026 ─────────────────────────────────────────────────────
const ITEMS = [
{ emoji:“🏠”, name:“Sydney House (median)”,  p80:68000,  p26:1650000, unit:”” },
{ emoji:“🍺”, name:“Pub Schooner”,            p80:0.65,   p26:13,      unit:”” },
{ emoji:“🥛”, name:“Milk (2L)”,               p80:0.55,   p26:3.50,    unit:”” },
{ emoji:“🍞”, name:“Loaf of Bread”,           p80:0.55,   p26:4.50,    unit:”” },
{ emoji:“⛽”, name:“Petrol (per litre)”,       p80:0.28,   p26:2.20,    unit:”/L” },
{ emoji:“🥑”, name:“Avocado (each)”,          p80:0.15,   p26:4.00,    unit:”” },
{ emoji:“☕”, name:“Café Coffee”,             p80:0.20,   p26:5.50,    unit:”” },
{ emoji:“🎓”, name:“Uni Degree”,              p80:0,      p26:65000,   unit:””, free80:true },
{ emoji:“🏡”, name:“Weekly Rent (Sydney)”,    p80:55,     p26:700,     unit:”/wk” },
{ emoji:“🚗”, name:“Toyota Corolla (new)”,    p80:6500,   p26:31000,   unit:”” },
{ emoji:“🎬”, name:“Cinema Ticket”,           p80:2.00,   p26:25,      unit:”” },
{ emoji:“💡”, name:“Quarterly Power Bill”,    p80:60,     p26:700,     unit:”” },
{ emoji:“🥩”, name:“Rump Steak (per kg)”,     p80:3.50,   p26:38,      unit:”/kg” },
{ emoji:“🏖️”, name:“Albo’s Beach House”,     p80: null,  p26:4300000, unit:””, albo:true },
{ emoji:“🏥”, name:“Medicare”,                p80:0,      p26:0,       unit:””, bothFree:true },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmtN = n => n.toLocaleString(“en-AU”, {minimumFractionDigits:0, maximumFractionDigits:0});
const fmtD = (n, opts={}) => {
if (opts.free) return “FREE”;
if (opts.na)   return “N/A”;
if (n === 0)   return “FREE”;
if (n < 1)     return `$${n.toFixed(2)}`;
return `$${fmtN(n)}`;
};
const timeAgo = ts => {
const s = Math.floor((Date.now()-ts)/1000);
if (s < 60) return `${s}s`;
if (s < 3600) return `${Math.floor(s/60)}m`;
return `${Math.floor(s/3600)}h`;
};
const STARTING = 1000;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
async function sGet(key, shared=false) {
try { const r = await window.storage.get(key, shared); return r?.value ? JSON.parse(r.value) : null; }
catch { return null; }
}
async function sSet(key, val, shared=false) {
try { await window.storage.set(key, JSON.stringify(val), shared); } catch {}
}
async function getLeaderboard() {
const d = await sGet(“lb-v5”, true);
return Array.isArray(d) ? d : [];
}
async function updateLeaderboard(entry) {
const lb = await getLeaderboard();
const idx = lb.findIndex(e => e.name === entry.name);
if (idx >= 0) lb[idx] = { …lb[idx], …entry };
else lb.push(entry);
lb.sort((a,b) => b.balance - a.balance);
await sSet(“lb-v5”, lb.slice(0,50), true);
}
async function loadProfile(name) { return sGet(`prof-${name}`, false); }
async function saveProfile(p) {
await sSet(`prof-${p.name}`, p, false);
const earned = getEarnedBadges(p);
const topHouse = getHighestHouseBadge(p);
await updateLeaderboard({
name: p.name, balance: p.balance, flips: p.flips, wins: p.wins,
badgeCount: earned.length, topHouseEmoji: topHouse?.emoji || null, ts: Date.now()
});
}

// ─── BADGE STRIP ─────────────────────────────────────────────────────────────
function BadgeStrip({ profile, newBadge }) {
const earned = getEarnedBadges(profile);
if (!earned.length) return null;
return (
<div className="badge-strip">
{earned.map(b => (
<div key={b.id} className={`badge-pill${b.id === newBadge ? " badge-pill--new" : ""}`} title={`${b.label} — ${b.desc}`}>
<span className="bp-em">{b.emoji}</span>
<span className="bp-lbl">{b.label}</span>
</div>
))}
</div>
);
}

// ─── BADGE CELEBRATION ───────────────────────────────────────────────────────
function BadgeCelebration({ badge, onDone }) {
useEffect(() => { const t = setTimeout(onDone, 3800); return () => clearTimeout(t); }, [onDone]);
return (
<div className="badge-cel" onClick={onDone}>
<div className="bcel-inner">
<div className="bcel-em">{badge.emoji}</div>
<div className="bcel-unlocked">BADGE UNLOCKED</div>
<div className="bcel-title">{badge.label}</div>
<div className="bcel-desc">{badge.desc}</div>
<div className="bcel-tap">tap to dismiss</div>
</div>
</div>
);
}

// ─── COIN ─────────────────────────────────────────────────────────────────────
function Coin({ phase, result }) {
return (
<div className="coin-wrap">
<div className={`coin${phase==="spin"?" coin--spin":""}${phase==="done"?(result==="H"?" coin--h":" coin--t"):""}`}>
<div className="cf cf-front"><span className="cem">🦅</span><span className="clbl">HEADS</span></div>
<div className="cf cf-back"><span className="cem">🦘</span><span className="clbl">TAILS</span></div>
</div>
</div>
);
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function Leaderboard({ currentUser, compact }) {
const [lb, setLb] = useState([]);
const [loading, setLoading] = useState(true);
const load = useCallback(async () => {
const d = await getLeaderboard(); setLb(d); setLoading(false);
}, []);
useEffect(() => { load(); const t = setInterval(load,8000); return ()=>clearInterval(t); }, [load]);

const rows = compact ? lb.slice(0,10) : lb.slice(0,30);
return (
<div className="lb">
<div className="lb-hdr">
<span className="lb-title">🏆 LEADERBOARD</span>
<span className="lb-sub">{lb.length} players</span>
</div>
{loading && <div className="lb-empty">Loading…</div>}
{!loading && !lb.length && <div className="lb-empty">No players yet. Be first.</div>}
{rows.map((e,i) => (
<div key={e.name} className={`lb-row${e.name===currentUser?" lb-row--me":""}${i<3?" lb-row--top":""}`}>
<span className="lb-rank">{i===0?“🥇”:i===1?“🥈”:i===2?“🥉”:`#${i+1}`}</span>
<span className="lb-name">
{e.topHouseEmoji && <span className="lb-house-badge" title="House badge">{e.topHouseEmoji}</span>}
{e.name}{e.name===currentUser?” (you)”:””}
</span>
<div className="lb-right">
<span className="lb-bal">${fmtN(e.balance)}</span>
{!compact && <span className="lb-meta">{e.flips}f · {e.badgeCount||0}🏅</span>}
</div>
</div>
))}
</div>
);
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function Chat({ handle }) {
const [msgs, setMsgs] = useState([]);
const [text, setText] = useState(””);
const [posting, setPosting] = useState(false);
const endRef = useRef(null);
const load = useCallback(async () => {
const d = await sGet(“chat-v5”, true);
if (Array.isArray(d)) setMsgs(d);
}, []);
useEffect(() => { load(); const t=setInterval(load,5000); return ()=>clearInterval(t); }, [load]);
useEffect(() => { endRef.current?.scrollIntoView({behavior:“smooth”}); }, [msgs]);

async function post() {
if (!text.trim()||posting) return;
setPosting(true);
const m = {id:Date.now(), handle, text:text.trim(), ts:Date.now()};
const cur = await sGet(“chat-v5”,true) || [];
const updated = […(Array.isArray(cur)?cur:[]).slice(-79), m];
await sSet(“chat-v5”, updated, true);
setMsgs(updated); setText(””); setPosting(false);
}

return (
<div className="chat">
<div className="chat-hdr">
<span className="chat-ttl">💬 Public Wall</span>
<span className="chat-ct">{msgs.length} msgs · live</span>
</div>
<div className="chat-msgs">
{!msgs.length && <div className="chat-empty">Be first. Bag out Chalmers.</div>}
{msgs.map(m=>(
<div key={m.id} className={`msg${m.handle===handle?" msg--me":""}`}>
<div className="msg-meta"><span className="msg-who">{m.handle}</span><span className="msg-t">{timeAgo(m.ts)}</span></div>
<div className="msg-txt">{m.text}</div>
</div>
))}
<div ref={endRef}/>
</div>
<div className="chat-in">
<input className=“chat-inp” placeholder=“Say something…” value={text}
onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key===“Enter”&&post()} maxLength={180}/>
<button className="chat-send" onClick={post} disabled={posting||!text.trim()}>→</button>
</div>
</div>
);
}

// ─── 1980 CALCULATOR ──────────────────────────────────────────────────────────
function Calc1980({ balance }) {
const [mode, setMode] = useState(“table”);
const [amount, setAmount] = useState(balance || 1000);
useEffect(()=>{ if(balance) setAmount(balance); },[balance]);

return (
<div className="calc80">
<div className="c80-tabs">
<button className={`c80tab${mode==="table"?" c80tab--on":""}`} onClick={()=>setMode(“table”)}>📋 Prices Then vs Now</button>
<button className={`c80tab${mode==="yourbal"?" c80tab--on":""}`} onClick={()=>setMode(“yourbal”)}>💰 What Your Balance Buys</button>
</div>

```
  {mode==="table" && (
    <div className="tbl-wrap">
      <div className="tbl-head"><span>Item</span><span>1980</span><span>2026</span><span>×</span></div>
      {ITEMS.map(it => {
        const mult = it.bothFree ? "Still free 🙏" : it.free80 ? "∞ (was free)" : it.albo ? "New unit of measurement" : it.p80 ? `${(it.p26/it.p80).toFixed(0)}×` : "—";
        const pain = !it.bothFree && !it.free80 && !it.albo && it.p80 && (it.p26/it.p80) >= 10;
        return (
          <div key={it.name} className={`tbl-row${pain?" tbl-row--pain":""}${it.albo?" tbl-row--albo":""}`}>
            <span className="tbl-item"><span className="tbl-em">{it.emoji}</span><span>{it.name}</span></span>
            <span className="tbl-old">{it.free80||it.bothFree?"FREE":it.albo?"Didn't exist":fmtD(it.p80)}{it.unit}</span>
            <span className="tbl-new">{it.bothFree?"FREE":fmtD(it.p26)}{it.unit}</span>
            <span className={`tbl-mult${pain?" tbl-mult--pain":it.albo?" tbl-mult--albo":""}`}>{mult}</span>
          </div>
        );
      })}
      <div className="tbl-note">Sources: RBA, ABS CPI, Domain, NRMA, NSW Fair Trading, realestate.com.au · For illustration</div>
    </div>
  )}

  {mode==="yourbal" && (
    <div className="ybwrap">
      <div className="yb-ctrl">
        <label className="yb-lbl">Your amount (play $)</label>
        <div className="yb-sl"><input type="range" min="100" max="100000" step="100" value={amount} onChange={e=>setAmount(+e.target.value)} className="slider"/><span className="yb-val">${fmtN(amount)}</span></div>
      </div>
      <div className="yb-grid">
        {ITEMS.filter(it=>!it.bothFree&&!it.free80&&!it.albo&&it.p80>0).map(it=>{
          const q80=Math.floor(amount/it.p80), q26=Math.floor(amount/it.p26);
          return (
            <div key={it.name} className="yb-card">
              <div className="yb-em">{it.emoji}</div>
              <div className="yb-name">{it.name}</div>
              <div className="yb-cmp">
                <div className="yb-era"><div className="yb-eralbl">1980</div><div className="yb-n yb-n--then">{fmtN(q80)}</div><div className="yb-u">{fmtD(it.p80)}{it.unit} ea</div></div>
                <div className="yb-arr">→</div>
                <div className="yb-era"><div className="yb-eralbl">2026</div><div className="yb-n yb-n--now">{fmtN(q26)}</div><div className="yb-u">{fmtD(it.p26)}{it.unit} ea</div></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="albo-calc">
        <div className="albo-em">🏖️</div>
        <div className="albo-txt">
          <div className="albo-title">Albo's House Test</div>
          <div className="albo-sub">${fmtN(amount)} buys you <strong>{((amount/ALBO)*100).toFixed(4)}%</strong> of Albo's Copacabana clifftop.<br/>
          You need <strong>${fmtN(ALBO - Math.min(amount, ALBO))}</strong> more for your own beach house during a cost-of-living crisis.</div>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}

// ─── DONATIONS ────────────────────────────────────────────────────────────────
function Donations() {
return (
<div className="donations">
<div className="don-inner">
<div className="don-flag">🇦🇺</div>
<h2 className="don-h2">Help A Struggling Aussie Family</h2>
<p className="don-pitch">
Rent’s gone up. Avo toast is in the twenties. A tinny won’t get change from a tenner.
A flat white costs more than a federal government subsidy. Negative gearing on the family
home just got grandfathered and Jim Chalmers called it “ambitious reform.”
We’re not asking for much. Just enough to buy some milk this week.
</p>
<p className="don-legal">(Satirical site. Donations go toward hosting costs and general bewilderment at Australian property prices.)</p>
<div className="don-currency">
<span className="don-currency-flag">🇦🇺🇳🇿</span>
<span className="don-currency-txt">
We accept donations in <strong>AUD or NZD</strong> — because at least one of those is a stable currency right now, and we’re not naming names, Jim.
</span>
</div>
<div className="don-btns">
<a className="don-btn don-btn--kofi" href="https://ko.fi" target="_blank" rel="noopener noreferrer">
☕ Support on Ko-fi
<span className="don-tag">0% platform fee · set up at ko.fi</span>
</a>
<a className="don-btn don-btn--bmc" href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer">
🍺 Buy Me a Tinny
<span className="don-tag">5% platform fee · buymeacoffee.com</span>
</a>
</div>
<div className="don-setup">
💡 <strong>To set up donations:</strong> Register at <a href="https://ko.fi" target="_blank" rel="noopener noreferrer" className="don-link">ko.fi</a> (free, 0% platform fee) and replace these links with your actual page URL. Ko-fi connects directly to your Stripe or PayPal — you keep ~97¢ of every dollar donated.
</div>
</div>
</div>
);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onSignIn, onGuest }) {
const [name, setName] = useState(””);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(””);

async function handleSignIn() {
if (!name.trim()) return;
setLoading(true); setError(””);
const safe = name.trim().slice(0,20).replace(/[^a-zA-Z0-9_-]/g,””);
if (!safe) { setError(“Letters, numbers, underscores and dashes only.”); setLoading(false); return; }
let profile = await loadProfile(safe);
if (!profile) {
profile = { name:safe, balance:STARTING, flips:0, wins:0, lowestEver:STARTING, createdAt:Date.now() };
}
await saveProfile(profile);
setLoading(false);
onSignIn(profile);
}

return (
<div className="auth-page">
<div className="auth-logo">🪙</div>
<h1 className="auth-h1">DOUBLE DOWN</h1>
<p className="auth-sub">Australia’s most straightforward financial instrument.<br/>Heads or tails. $1,000 to start. Leaderboard. Badges.</p>
<div className="auth-card">
<div className="auth-s">
<div className="auth-lbl">CREATE ACCOUNT OR SIGN IN</div>
<div className="auth-micro">Saves your balance and badges across sessions. Appear on the leaderboard.</div>
<input className=“auth-inp” placeholder=“Choose a username…” value={name}
onChange={e=>{setName(e.target.value);setError(””);}}
onKeyDown={e=>e.key===“Enter”&&handleSignIn()} maxLength={20} autoFocus/>
{error && <div className="auth-err">{error}</div>}
<button className="auth-btn" disabled={!name.trim()||loading} onClick={handleSignIn}>
{loading?“Loading…”:“Play & Save Progress →”}
</button>
<div className="auth-hint">New username = new account · starts at $1,000</div>
</div>
<div className="auth-or">— or —</div>
<div className="auth-s">
<button className="auth-btn auth-btn--ghost" onClick={onGuest}>Play as Guest (session only)</button>
<div className="auth-hint">$1,000 credits · resets when you leave · no leaderboard · no badges saved</div>
</div>
</div>
</div>
);
}

// ─── GAME ─────────────────────────────────────────────────────────────────────
function Game({ user, isGuest, onBack, onUpdate }) {
const [profile, setProfile] = useState(user);
const [pick, setPick] = useState(null);
const [stake, setStake] = useState(20);
const [custom, setCustom] = useState(””);
const [phase, setPhase] = useState(“idle”);
const [result, setResult] = useState(null);
const [outcome, setOutcome] = useState(null);
const [flipMsg, setFlipMsg] = useState(null);
const [hist, setHist] = useState([]);
const [tab, setTab] = useState(“flip”);
const [celebBadge, setCelebBadge] = useState(null);
const [shared, setShared] = useState(false);
const prevBadgeIds = useRef(getEarnedBadges(user).map(b=>b.id));

const eff = custom!==””?Math.max(1,Math.floor(+custom)):stake;
const wr = profile.flips>0?Math.round(profile.wins/profile.flips*100):50;

async function persist(updated) {
if (!isGuest) {
await saveProfile(updated);
onUpdate(updated);
}
// Check for new badges
const nowIds = getEarnedBadges(updated).map(b=>b.id);
const newId = nowIds.find(id=>!prevBadgeIds.current.includes(id));
if (newId) {
prevBadgeIds.current = nowIds;
const newBadge = BADGES.find(b=>b.id===newId);
if (newBadge) setCelebBadge(newBadge);
}
}

function flip() {
if (!pick||phase!==“idle”||eff>profile.balance||eff<=0) return;
setPhase(“spin”); setResult(null); setOutcome(null); setFlipMsg(null);
setTimeout(async ()=>{
const r = Math.random()<0.5?“H”:“T”;
const won = r===pick;
const nb = profile.balance + (won?eff:-eff);
const updated = {
…profile,
balance: nb,
flips: profile.flips+1,
wins: profile.wins+(won?1:0),
lowestEver: Math.min(profile.lowestEver??STARTING, nb),
};
setResult(r); setOutcome(won?“win”:“lose”);
setProfile(updated);
setHist(h=>[{r,won,eff},…h.slice(0,11)]);
setFlipMsg(won
? `+$${fmtN(eff)} — ${nb>=ALBO?`🏖️ ${(nb/ALBO).toFixed(1)}× Albo’s house!`:"heads wins"}`
: `-$${fmtN(eff)} — ${nb<100?"oof. very Australian.":"tails wins"}`
);
setPhase(“done”);
await persist(updated);
setTimeout(()=>setPhase(“idle”),600);
}, 2400);
}

async function doShare() {
const earned = getEarnedBadges(profile);
const topHouse = getHighestHouseBadge(profile);
const txt = `I've got $${fmtN(profile.balance)} on Double Down${topHouse?` and earned ${topHouse.label}`:""}. Albo paid $4.3M for a beach house during a cost-of-living crisis. ${earned.length} badges. Come flip. 🪙🇦🇺 https://doubledown.au`;
try { await navigator.share({title:“Double Down”,text:txt}); }
catch { navigator.clipboard.writeText(txt).catch(()=>{}); }
setShared(true); setTimeout(()=>setShared(false),2000);
}

const topHouse = getHighestHouseBadge(profile);

return (
<div className="game-page">
{celebBadge && <BadgeCelebration badge={celebBadge} onDone={()=>setCelebBadge(null)}/>}

```
  <nav className="nav">
    <button className="nav-back" onClick={onBack}>← Back</button>
    <div className="nav-logo">🪙 TWO-UP</div>
    <div className="nav-r">
      {topHouse && <span className="nav-house" title={topHouse.label}>{topHouse.emoji}</span>}
      {!isGuest && <span className="nav-user">{profile.name}</span>}
      {isGuest && <span className="nav-guest">Guest</span>}
      <a className="nav-donate" href="https://ko.fi/doubledown" target="_blank" rel="noopener noreferrer">☕ Donate</a>
      <button className="nav-share" onClick={doShare}>{shared?"✅":"Share"}</button>
    </div>
  </nav>

  <DeficitCounter/>
  <div className="mob-tabs">
    {["flip","board","chat"].map(t=>(
      <button key={t} className={`mob-tab${tab===t?" mob-tab--on":""}`} onClick={()=>setTab(t)}>
        {t==="flip"?"🪙 Flip":t==="board"?"🏆 Board":"💬 Chat"}
      </button>
    ))}
  </div>

  <div className="game-grid">
    {/* FLIP */}
    <div className={`flip-col${tab!=="flip"?" flip-col--hidden":""}`}>
      <div className="bal-bar">
        <div>
          <div className="bal-lbl">PLAY BALANCE</div>
          <div className="bal-val" style={{color:profile.balance>STARTING?"#4ade80":profile.balance<STARTING?"#ef4444":"var(--gold)"}}>
            ${fmtN(profile.balance)}
          </div>
          {topHouse && <div className="bal-house">{topHouse.emoji} {topHouse.label}</div>}
        </div>
        <div className="bal-r">
          <div className="bal-stat">{profile.flips} flips</div>
          <div className="bal-stat">{wr}% wins</div>
          {isGuest&&<button className="link-btn sml" onClick={onBack}>sign up to save →</button>}
        </div>
      </div>

      {/* BADGES */}
      {!isGuest && <BadgeStrip profile={profile} newBadge={celebBadge?.id}/>}

      {/* NEXT BADGE */}
      {!isGuest && (() => {
        const earned = getEarnedBadges(profile).map(b=>b.id);
        const next = BADGES.find(b=>!earned.includes(b.id));
        if (!next) return null;
        return (
          <div className="next-badge">
            <span className="nb-lbl">NEXT BADGE</span>
            <span className="nb-em">{next.emoji}</span>
            <span className="nb-title">{next.label}</span>
            <span className="nb-desc">{next.desc}</span>
          </div>
        );
      })()}

      {/* OUTCOME */}
      {flipMsg && (
        <div className={`outcome${outcome==="win"?" out-w":" out-l"}`}>{flipMsg}</div>
      )}

      <Coin phase={phase} result={result}/>

      <div className="sec-lbl">YOUR CALL</div>
      <div className="pick-row">
        <button className={`pick${pick==="H"?" pick--on":""}`} onClick={()=>setPick("H")}>🦅 HEADS</button>
        <button className={`pick${pick==="T"?" pick--on":""}`} onClick={()=>setPick("T")}>🦘 TAILS</button>
      </div>

      <div className="sec-lbl">STAKE (PLAY CREDITS)</div>
      <div className="stakes-row">
        {[10,20,50,100,200,500].map(a=>(
          <button key={a} className={`stake-btn${stake===a&&!custom?" stake-btn--on":""}`} onClick={()=>{setStake(a);setCustom("");}}>
            ${a}
          </button>
        ))}
      </div>
      <input className="cust-inp" type="number" min="1" max={profile.balance} placeholder="Custom amount…" value={custom} onChange={e=>setCustom(e.target.value)}/>

      {profile.balance<=0
        ? <button className="refill-btn" onClick={()=>{ const r={...profile,balance:STARTING,flips:0,wins:0}; setProfile(r); setHist([]); if(!isGuest)persist(r); }}>🔄 Refill to $1,000</button>
        : <button className="flip-btn" disabled={!pick||phase!=="idle"||eff>profile.balance||eff<=0} onClick={flip}>
            {phase==="spin"?"FLIPPING…":`FLIP — $${fmtN(eff)}`}
          </button>
      }

      {hist.length>0&&(
        <div>
          <div className="sec-lbl">RECENT FLIPS</div>
          <div className="chips-row">
            {hist.map((h,i)=>(
              <div key={i} className={`chip${h.won?" chip-w":" chip-l"}`} title={`${h.r==="H"?"HEADS":"TAILS"} ${h.won?"+":"-"}$${h.eff}`}>{h.r}</div>
            ))}
          </div>
        </div>
      )}

      {/* GAME DONATE */}
      <div className="gdon">
        <div className="gdon-lbl">ENJOY THE SATIRE? 🇦🇺</div>
        <div className="gdon-pitch">Milk: $3.50. Avo toast: $24. A tinny: $9. Albo's house: $4.3M.</div>
        <div className="gdon-btns">
          <a className="gdon-btn" href="https://ko.fi" target="_blank" rel="noopener noreferrer">☕ Ko-fi (0% fee)</a>
          <a className="gdon-btn gdon-btn--b" href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer">🍺 BMC (5% fee)</a>
        </div>
        <div className="gdon-note">Add your actual Ko-fi/BMC page URL here once set up.</div>
      </div>
    </div>

    {/* LEADERBOARD */}
    <div className={`board-col${tab!=="board"?" board-col--hidden":""}`}>
      <Leaderboard currentUser={isGuest?null:profile.name}/>
      {isGuest&&<div className="guest-note">Guest mode — <button className="link-btn" onClick={onBack}>sign up</button> to appear on the board and keep your badges.</div>}
    </div>

    {/* CHAT */}
    <div className={`chat-col${tab!=="chat"?" chat-col--hidden":""}`}>
      <div className="qbar">
        <span className="qbar-albo">🏖️ $4.3M</span> — Albo's beach house. Bought during a cost-of-living crisis. Your goal.
      </div>
      <Chat handle={isGuest?"Guest":profile.name}/>
    </div>
  </div>

  <div className="game-foot">
    Satire · Play credits only · No real gambling · Gambling Help: <strong>1800 858 858</strong>
  </div>
</div>
```

);
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onPlay }) {
const [shared, setShared] = useState(false);
async function doShare() {
const t=“Double Down — Start with $1,000. Earn badges. Beat Albo’s $4.3M beach house. 🪙🇦🇺 https://doubledown.au”;
try { await navigator.share({title:“Double Down”,text:t,url:“https://doubledown.au”}); }
catch { navigator.clipboard.writeText(t).catch(()=>{}); }
setShared(true); setTimeout(()=>setShared(false),2000);
}

return (
<div className="land">
<nav className="nav">
<div className="nav-logo">🎲 DOUBLE DOWN</div>
<div className="nav-r">
<a className="nav-donate" href="https://ko.fi/doubledown" target="_blank" rel="noopener noreferrer">☕ Donate</a>
<button className="nav-share" onClick={doShare}>{shared?“✅”:“Share”}</button>
</div>
</nav>

```
  {/* HERO */}
  <section className="hero">
    <div className="hero-eye">🇦🇺 PLAY FREE · doubledown.au · 🇦🇺</div>
    <h1 className="hero-h1">Ignore CGT.<br/><em>Double Down.</em><br/>Don't Pay A Cent.</h1>
    <p className="hero-p">
      Jim Chalmers killed the CGT discount and left a $28.3 billion deficit. Anthony Albanese
      bought a <strong>$4.3 million beach house</strong> during a cost-of-living crisis and said
      "I know what it's like to struggle." We built a coin flip. $1,000 to start. Earn badges.
      Climb the leaderboard.
    </p>
    <div className="hero-ctas">
      <button className="cta" onClick={onPlay}>Play — Start with $1,000 →</button>
      <button className="cta cta--ghost" onClick={doShare}>📤 Share</button>
    </div>
    <div className="hero-badges">
      <span className="hbadge">🪙 Play Credits Only</span>
      <span className="hbadge">🏆 Global Leaderboard</span>
      <span className="hbadge">🏅 {BADGES.length} Badges to Earn</span>
      <span className="hbadge">🏖️ Beat Albo's $4.3M House</span>
    </div>
  </section>
  <DeficitCounter/>

  {/* ALBO GOAL */}
  <section className="albo-section">
    <div className="albo-sec-inner">
      <div className="albo-sec-em">🏖️</div>
      <div>
        <div className="albo-sec-title">YOUR GOAL: $4,300,000</div>
        <div className="albo-sec-sub">Albanese paid $4.3 million for a Copacabana clifftop house — four bedrooms, three bathrooms, "uninterrupted ocean and Sydney skyline views" — while Australians struggled with rent, mortgages and grocery bills. Every multiple of $4.3M you accrue earns you a 🏖️ beach house badge on your profile.</div>
      </div>
    </div>
  </section>

  {/* BADGES PREVIEW */}
  <section className="section">
    <div className="section-inner">
      <div className="section-lbl">BADGES — {BADGES.length} TO EARN</div>
      <div className="section-desc">Awarded automatically as your play balance grows. House badges appear on your leaderboard profile.</div>
      <div className="all-badges">
        {BADGES.map(b=>(
          <div key={b.id} className="badge-preview">
            <div className="bp-big-em">{b.emoji}</div>
            <div className="bp-title">{b.label}</div>
            <div className="bp-d">{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* 1980 CALCULATOR */}
  <section className="section section--dark">
    <div className="section-inner">
      <div className="section-lbl">WHAT YOUR MONEY ACTUALLY BUYS — 1980 vs 2026</div>
      <div className="section-desc">A beer cost 65 cents. Rent was $55 a week. Uni was free. Albo's beach house didn't exist as a concept. Now it does. It costs $4.3 million.</div>
      <Calc1980/>
    </div>
  </section>

  {/* DONATIONS */}
  <Donations/>

  {/* TOP 5 */}
  <section className="section">
    <div className="section-inner">
      <div className="section-lbl">THE FIVE TRUTHS THEY WON'T TELL YOU</div>
      {[
        "Jim Chalmers bet your CGT discount on red. It landed on black. We let you pick the colour.",
        "Albanese said 'I know what it's like to struggle.' Then bought a $4.3M clifftop. We said nothing. We just built a leaderboard.",
        "Four years to see your tax cuts. Four seconds to flip for yours.",
        "The Treasurer says the deficit 'improved by $8.5 billion.' It's still $28.3B. We'll take that bet.",
        "Two-up: Australia's oldest financial instrument. Older than negative gearing. More reliable than Labor.",
      ].map((q,i)=>(
        <div className="joke" key={i}>
          <span className="joke-n">0{i+1}</span>
          <q className="joke-q">"{q}"</q>
        </div>
      ))}
    </div>
  </section>

  {/* LEADERBOARD */}
  <section className="section section--dark">
    <div className="section-inner">
      <div className="section-lbl">LIVE LEADERBOARD — EVERYONE STARTS AT $1,000</div>
      <div className="lb-preview"><Leaderboard compact={true}/></div>
      <button className="cta" style={{marginTop:20}} onClick={onPlay}>Join the Leaderboard →</button>
    </div>
  </section>

  <footer className="footer">
    <div className="ft-logo">🎲 DOUBLE DOWN</div>
    <div className="ft-links">
      <button onClick={onPlay}>Play →</button>
      <button onClick={doShare}>Share</button>
    </div>
    <div className="ft-legal">
      Satire. Play credits only. No real gambling or payments of any kind. Not financial, tax, or legal advice.
      Not endorsed by Jim Chalmers, Anthony Albanese, the ATO, the RBA, or any kangaroo.
      Gambling Help Online: <strong>1800 858 858</strong>.
      Double Down Pty Ltd (ACN: 420-069-666) · 🇦🇺 Australia · 2026
    </div>
  </footer>
</div>
```

);
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
const [page, setPage] = useState(“land”);
const [user, setUser] = useState(null);
const [isGuest, setIsGuest] = useState(false);
useEffect(()=>{ injectMeta(); },[]);
function handleSignIn(p){ setUser(p); setIsGuest(false); setPage(“game”); }
function handleGuest(){ setUser({name:“Guest”,balance:STARTING,flips:0,wins:0,lowestEver:STARTING,createdAt:Date.now()}); setIsGuest(true); setPage(“game”); }
function handleBack(){ setPage(“land”); setUser(null); setIsGuest(false); }

return (
<>
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow+Condensed:wght@400;600;700;800;900&display=swap’);
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
:root{
–bg:#080C0A;–bg2:#101610;–bg3:#182018;
–gold:#E8C84A;–gold2:#B89A28;
–green:#1B7A44;–green2:#23A65A;
–red:#DC3528;–text:#EAE8E0;
–muted:rgba(234,232,224,.45);–border:rgba(234,232,224,.09);
–mono:‘Space Mono’,monospace;–cond:‘Barlow Condensed’,sans-serif;
}
body{background:var(–bg);color:var(–text);font-family:var(–mono);min-height:100vh;}
input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:var(–border);outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(–gold);cursor:pointer;}
a{color:inherit;}
.slider{width:100%;}
.link-btn{background:none;border:none;color:var(–green2);font-family:var(–mono);font-size:inherit;cursor:pointer;text-decoration:underline;}
.link-btn.sml{font-size:10px;}

```
    /* NAV */
    .nav{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--border);background:var(--bg);position:sticky;top:0;z-index:50;}
    .nav-logo{font-family:var(--cond);font-size:17px;font-weight:900;letter-spacing:.08em;color:var(--gold);}
    .nav-r{display:flex;align-items:center;gap:8px;}
    .nav-tag{font-size:9px;letter-spacing:.15em;color:var(--muted);display:none;}
    @media(min-width:600px){.nav-tag{display:inline;}}
    .deficit-bar{background:rgba(220,53,40,.08);border-bottom:1px solid rgba(220,53,40,.2);padding:8px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
    .deficit-label{font-size:9px;letter-spacing:.2em;color:var(--red);font-family:var(--mono);}
    .deficit-num{font-family:var(--cond);font-size:22px;font-weight:900;color:var(--red);letter-spacing:.02em;}
    .deficit-sub{font-size:9px;color:var(--muted);font-style:italic;}
            .nav-donate{background:var(--gold);color:#080C0A;font-family:var(--cond);font-weight:800;font-size:12px;padding:6px 12px;border-radius:4px;text-decoration:none;}
    .nav-share,.nav-back{background:transparent;border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:11px;padding:6px 12px;border-radius:4px;cursor:pointer;transition:all .15s;}
    .nav-share:hover,.nav-back:hover{border-color:var(--gold);color:var(--gold);}
    .nav-user{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--green2);}
    .nav-guest{font-size:10px;color:var(--muted);}
    .nav-house{font-size:18px;line-height:1;}

    /* BADGE STRIP */
    .badge-strip{display:flex;gap:5px;flex-wrap:wrap;}
    .badge-pill{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:rgba(232,200,74,.08);border:1px solid rgba(232,200,74,.2);font-size:10px;color:var(--gold);cursor:default;transition:all .2s;}
    .badge-pill--new{background:rgba(74,222,128,.15);border-color:#4ade80;color:#4ade80;animation:badgePop .4s cubic-bezier(.34,1.56,.64,1);}
    @keyframes badgePop{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}
    .bp-em{font-size:14px;line-height:1;}
    .bp-lbl{letter-spacing:.05em;font-family:var(--cond);font-weight:700;}

    /* BADGE CELEBRATION */
    .badge-cel{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);cursor:pointer;animation:fadeIn .25s ease;}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    .bcel-inner{background:var(--bg2);border:2px solid var(--gold);border-radius:16px;padding:36px 28px;max-width:380px;width:100%;text-align:center;animation:celPop .4s cubic-bezier(.34,1.56,.64,1);}
    @keyframes celPop{from{transform:scale(.7);}to{transform:scale(1);}}
    .bcel-em{font-size:72px;margin-bottom:10px;}
    .bcel-unlocked{font-size:9px;letter-spacing:.3em;color:var(--muted);margin-bottom:8px;}
    .bcel-title{font-family:var(--cond);font-size:32px;font-weight:900;color:var(--gold);margin-bottom:8px;}
    .bcel-desc{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:16px;}
    .bcel-tap{font-size:9px;color:rgba(234,232,224,.2);letter-spacing:.15em;}

    /* NEXT BADGE */
    .next-badge{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:6px;}
    .nb-lbl{font-size:8px;letter-spacing:.2em;color:var(--muted);flex-shrink:0;}
    .nb-em{font-size:18px;flex-shrink:0;}
    .nb-title{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--text);flex-shrink:0;}
    .nb-desc{font-size:9px;color:var(--muted);flex:1;display:none;}
    @media(min-width:600px){.nb-desc{display:inline;}}

    /* ALL BADGES PREVIEW */
    .all-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;}
    .badge-preview{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;transition:border .15s;}
    .badge-preview:hover{border-color:rgba(232,200,74,.3);}
    .bp-big-em{font-size:28px;margin-bottom:6px;}
    .bp-title{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--gold);margin-bottom:4px;}
    .bp-d{font-size:9px;color:var(--muted);line-height:1.5;}

    /* ALBO SECTION */
    .albo-section{background:rgba(232,200,74,.06);border-top:1px solid rgba(232,200,74,.15);border-bottom:1px solid rgba(232,200,74,.15);padding:36px 20px;}
    .albo-sec-inner{max-width:820px;margin:0 auto;display:flex;gap:20px;align-items:flex-start;}
    .albo-sec-em{font-size:52px;flex-shrink:0;}
    .albo-sec-title{font-family:var(--cond);font-size:clamp(20px,4vw,36px);font-weight:900;color:var(--gold);margin-bottom:8px;}
    .albo-sec-sub{font-size:12px;color:var(--muted);line-height:1.8;}

    /* AUTH */
    .auth-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;}
    .auth-logo{font-size:56px;margin-bottom:10px;}
    .auth-h1{font-family:var(--cond);font-size:clamp(28px,8vw,58px);font-weight:900;color:var(--gold);letter-spacing:.05em;margin-bottom:8px;}
    .auth-sub{font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:28px;}
    .auth-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:26px;max-width:360px;width:100%;}
    .auth-s{}
    .auth-lbl{font-size:9px;letter-spacing:.22em;color:var(--muted);margin-bottom:4px;}
    .auth-micro,.auth-hint{font-size:10px;color:var(--muted);line-height:1.5;margin-bottom:10px;}
    .auth-hint{text-align:center;margin-top:5px;margin-bottom:0;}
    .auth-inp{width:100%;background:var(--bg3);border:1.5px solid var(--border);border-radius:6px;padding:11px 13px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none;margin-bottom:10px;transition:border .12s;}
    .auth-inp:focus{border-color:var(--gold);}
    .auth-inp::placeholder{color:rgba(234,232,224,.2);}
    .auth-err{font-size:11px;color:var(--red);margin-bottom:8px;}
    .auth-btn{width:100%;padding:13px;background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:800;font-size:15px;letter-spacing:.05em;border-radius:7px;cursor:pointer;transition:all .15s;margin-bottom:4px;}
    .auth-btn:hover:not(:disabled){background:var(--green2);}
    .auth-btn:disabled{opacity:.4;cursor:not-allowed;}
    .auth-btn--ghost{background:transparent;border:1.5px solid var(--border);color:var(--muted);font-size:13px;}
    .auth-btn--ghost:hover{border-color:var(--gold);color:var(--gold);background:transparent;}
    .auth-or{font-size:11px;color:var(--muted);margin:14px 0;}

    /* LANDING */
    .land{min-height:100vh;}
    .hero{max-width:800px;margin:0 auto;padding:60px 20px 44px;text-align:center;}
    .hero-eye{font-size:9px;letter-spacing:.22em;color:var(--muted);margin-bottom:16px;}
    .hero-h1{font-family:var(--cond);font-weight:900;font-size:clamp(42px,9vw,100px);line-height:.88;color:var(--text);margin-bottom:22px;}
    .hero-h1 em{font-style:normal;color:var(--gold);}
    .hero-p{font-size:13px;line-height:1.8;color:var(--muted);max-width:520px;margin:0 auto 26px;}
    .hero-p strong{color:var(--text);}
    .hero-ctas{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;}
    .cta{background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:800;font-size:15px;letter-spacing:.05em;padding:13px 30px;border-radius:6px;cursor:pointer;transition:all .15s;box-shadow:0 4px 16px rgba(27,122,68,.4);}
    .cta:hover{background:var(--green2);transform:translateY(-1px);}
    .cta--ghost{background:transparent;border:1.5px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:12px;}
    .cta--ghost:hover{border-color:var(--gold);color:var(--gold);transform:none;box-shadow:none;background:transparent;}
    .hero-badges{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;}
    .hbadge{font-size:10px;padding:4px 9px;border:1px solid var(--border);border-radius:20px;color:var(--muted);}

    /* SECTIONS */
    .section{padding:44px 20px;border-top:1px solid var(--border);}
    .section--dark{background:var(--bg2);}
    .section-inner{max-width:820px;margin:0 auto;}
    .section-lbl{font-size:9px;letter-spacing:.26em;color:var(--muted);text-transform:uppercase;margin-bottom:10px;}
    .section-desc{font-size:12px;color:var(--muted);line-height:1.7;margin-bottom:22px;}

    /* 1980 CALC */
    .calc80{}
    .c80-tabs{display:flex;gap:7px;margin-bottom:14px;flex-wrap:wrap;}
    .c80tab{padding:7px 13px;border-radius:5px;border:1.5px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s;}
    .c80tab:hover,.c80tab--on{border-color:var(--gold);color:var(--gold);}
    .c80tab--on{background:rgba(232,200,74,.07);}
    .tbl-wrap{overflow-x:auto;}
    .tbl-head{display:grid;grid-template-columns:1fr 90px 90px 60px;gap:6px;padding:5px 8px;font-size:9px;letter-spacing:.18em;color:var(--muted);border-bottom:1px solid var(--border);}
    .tbl-row{display:grid;grid-template-columns:1fr 90px 90px 60px;gap:6px;padding:8px;border-bottom:1px solid rgba(255,255,255,.04);align-items:center;}
    .tbl-row:hover{background:rgba(255,255,255,.02);}
    .tbl-row--pain{background:rgba(220,53,40,.04);}
    .tbl-row--albo{background:rgba(232,200,74,.05);border-color:rgba(232,200,74,.1);}
    .tbl-item{display:flex;align-items:center;gap:6px;font-size:11px;}
    .tbl-em{font-size:15px;}
    .tbl-old{font-size:11px;color:#4ade80;font-family:var(--mono);}
    .tbl-new{font-size:11px;color:var(--red);font-family:var(--mono);}
    .tbl-row--albo .tbl-new{color:var(--gold);}
    .tbl-mult{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--muted);}
    .tbl-mult--pain{color:var(--red);}
    .tbl-mult--albo{color:var(--gold);font-size:10px;}
    .tbl-note{font-size:9px;color:rgba(234,232,224,.2);margin-top:8px;text-align:center;}
    .ybwrap{}
    .yb-ctrl{margin-bottom:18px;}
    .yb-lbl{font-size:9px;letter-spacing:.18em;color:var(--muted);display:block;margin-bottom:8px;}
    .yb-sl{display:flex;align-items:center;gap:12px;}
    .yb-val{font-family:var(--cond);font-size:20px;font-weight:700;color:var(--gold);min-width:80px;text-align:right;}
    .yb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:14px;}
    .yb-card{background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:12px;}
    .yb-em{font-size:20px;margin-bottom:3px;}
    .yb-name{font-size:10px;color:var(--muted);margin-bottom:7px;}
    .yb-cmp{display:flex;align-items:center;gap:6px;}
    .yb-era{flex:1;text-align:center;}
    .yb-eralbl{font-size:8px;letter-spacing:.12em;color:var(--muted);margin-bottom:1px;}
    .yb-n{font-family:var(--cond);font-size:20px;font-weight:900;}
    .yb-n--then{color:#4ade80;}
    .yb-n--now{color:var(--red);}
    .yb-u{font-size:8px;color:var(--muted);}
    .yb-arr{font-size:14px;color:var(--muted);flex-shrink:0;}
    .albo-calc{display:flex;gap:12px;align-items:flex-start;background:rgba(232,200,74,.06);border:1px solid rgba(232,200,74,.18);border-radius:8px;padding:14px;}
    .albo-em{font-size:28px;flex-shrink:0;}
    .albo-title{font-family:var(--cond);font-size:15px;font-weight:700;color:var(--gold);margin-bottom:4px;}
    .albo-sub{font-size:11px;color:var(--muted);line-height:1.6;}
    .albo-sub strong{color:var(--text);}

    /* DONATIONS */
    .donations{background:rgba(232,200,74,.04);border-top:1px solid rgba(232,200,74,.12);border-bottom:1px solid rgba(232,200,74,.12);padding:44px 20px;}
    .don-inner{max-width:600px;margin:0 auto;text-align:center;}
    .don-flag{font-size:44px;margin-bottom:10px;}
    .don-h2{font-family:var(--cond);font-size:clamp(22px,5vw,38px);font-weight:900;color:var(--gold);margin-bottom:14px;line-height:1.1;}
    .don-pitch{font-size:13px;line-height:1.8;color:var(--text);margin-bottom:10px;}
    .don-currency{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px dashed rgba(234,232,224,.12);border-radius:7px;padding:11px 14px;margin-bottom:22px;text-align:left;}
    .don-currency-flag{font-size:22px;flex-shrink:0;}
    .don-currency-txt{font-size:11px;color:var(--muted);line-height:1.6;font-style:italic;}
    .don-currency-txt strong{color:var(--text);font-style:normal;}
    .don-legal{font-size:11px;color:var(--muted);font-style:italic;margin-bottom:22px;}
    .don-btns{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
    .don-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:13px 20px;border-radius:7px;border:1.5px solid;font-family:var(--cond);font-size:15px;font-weight:700;cursor:pointer;transition:all .15s;min-width:170px;text-decoration:none;}
    .don-btn--kofi{border-color:var(--gold);background:rgba(232,200,74,.08);color:var(--gold);}
    .don-btn--kofi:hover{background:rgba(232,200,74,.14);}
    .don-btn--bmc{border-color:var(--border);background:transparent;color:var(--text);}
    .don-btn--bmc:hover{border-color:var(--gold);}
    .don-tag{font-size:9px;letter-spacing:.1em;color:var(--muted);font-family:var(--mono);font-weight:400;}
    .don-setup{font-size:11px;color:var(--muted);line-height:1.7;background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:14px;text-align:left;}
    .don-setup strong{color:var(--text);}
    .don-link{color:var(--green2);text-decoration:underline;}

    /* JOKES */
    .joke{display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-bottom:1px solid var(--border);}
    .joke:last-child{border-bottom:none;}
    .joke-n{font-family:var(--cond);font-size:36px;font-weight:900;color:var(--gold);opacity:.22;line-height:1;flex-shrink:0;width:44px;}
    .joke-q{font-family:var(--cond);font-weight:600;font-size:clamp(14px,2.2vw,20px);line-height:1.35;color:var(--text);font-style:italic;border:none;}

    /* LB */
    .lb{background:var(--bg2);border:1px solid var(--border);border-radius:9px;overflow:hidden;}
    .lb-preview{max-width:460px;}
    .lb-hdr{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;border-bottom:1px solid var(--border);}
    .lb-title{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--gold);}
    .lb-sub{font-size:9px;color:var(--muted);}
    .lb-empty{padding:18px;text-align:center;font-size:12px;color:var(--muted);}
    .lb-row{display:flex;align-items:center;gap:9px;padding:8px 13px;border-bottom:1px solid rgba(255,255,255,.03);transition:background .12s;}
    .lb-row:hover{background:rgba(255,255,255,.02);}
    .lb-row--me{background:rgba(35,166,90,.06);border-left:2px solid var(--green2);}
    .lb-row--top{background:rgba(232,200,74,.03);}
    .lb-rank{font-size:11px;width:26px;flex-shrink:0;text-align:center;}
    .lb-name{flex:1;font-size:11px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:5px;}
    .lb-house-badge{font-size:14px;flex-shrink:0;}
    .lb-right{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
    .lb-bal{font-family:var(--cond);font-size:14px;font-weight:700;color:var(--gold);}
    .lb-meta{font-size:9px;color:var(--muted);}

    /* FOOTER */
    .footer{background:var(--bg2);border-top:1px solid var(--border);padding:26px 20px;text-align:center;}
    .ft-logo{font-family:var(--cond);font-size:18px;font-weight:900;color:var(--gold);margin-bottom:10px;}
    .ft-links{display:flex;gap:14px;justify-content:center;margin-bottom:10px;}
    .ft-links button{background:none;border:none;color:var(--muted);font-family:var(--mono);font-size:12px;cursor:pointer;text-decoration:underline;}
    .ft-links button:hover{color:var(--gold);}
    .ft-legal{font-size:9px;color:rgba(234,232,224,.2);line-height:1.8;max-width:520px;margin:0 auto;}

    /* GAME */
    .game-page{min-height:100vh;display:flex;flex-direction:column;}
    .mob-tabs{display:flex;border-bottom:1px solid var(--border);}
    .mob-tab{flex:1;padding:11px;background:none;border:none;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;border-bottom:2px solid transparent;transition:all .12s;}
    .mob-tab--on{color:var(--gold);border-bottom-color:var(--gold);}
    .game-grid{display:grid;grid-template-columns:1fr;flex:1;}
    @media(min-width:860px){
      .mob-tabs{display:none;}
      .game-grid{grid-template-columns:370px 210px 1fr;}
      .flip-col--hidden,.board-col--hidden,.chat-col--hidden{display:flex!important;}
    }
    .flip-col{display:flex;flex-direction:column;gap:11px;padding:14px;border-right:1px solid var(--border);overflow-y:auto;max-height:calc(100vh - 105px);}
    .flip-col--hidden{display:none;}
    .board-col{overflow-y:auto;max-height:calc(100vh - 105px);border-right:1px solid var(--border);}
    .board-col--hidden{display:none;}
    .chat-col{display:flex;flex-direction:column;max-height:calc(100vh - 105px);}
    .chat-col--hidden{display:none;}
    .game-foot{padding:10px 18px;border-top:1px solid var(--border);font-size:9px;color:rgba(234,232,224,.18);text-align:center;}
    .game-foot strong{color:rgba(234,232,224,.32);}
    .guest-note{padding:11px 13px;font-size:10px;color:var(--muted);border-top:1px solid var(--border);}

    /* BAL BAR */
    .bal-bar{display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:11px 13px;}
    .bal-lbl{font-size:9px;letter-spacing:.18em;color:var(--muted);margin-bottom:2px;}
    .bal-val{font-family:var(--cond);font-size:26px;font-weight:900;line-height:1;}
    .bal-house{font-size:11px;color:var(--gold);margin-top:2px;}
    .bal-r{text-align:right;}
    .bal-stat{font-size:10px;color:var(--muted);}

    /* OUTCOME */
    .outcome{padding:9px 12px;border-radius:6px;font-family:var(--cond);font-size:13px;font-weight:700;animation:pop .35s cubic-bezier(.34,1.56,.64,1);}
    .out-w{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2);}
    .out-l{background:rgba(220,53,40,.08);color:#ef4444;border:1px solid rgba(220,53,40,.16);}
    @keyframes pop{from{transform:scale(.8);opacity:0;}to{transform:scale(1);opacity:1;}}

    /* COIN */
    .coin-wrap{display:flex;align-items:center;justify-content:center;height:115px;perspective:600px;}
    .coin{width:90px;height:90px;position:relative;transform-style:preserve-3d;transition:transform .4s;}
    .coin--spin{animation:cflip 2.4s cubic-bezier(.25,.8,.5,1) forwards;}
    .coin--h{transform:rotateY(0);}
    .coin--t{transform:rotateY(180deg);}
    @keyframes cflip{0%{transform:rotateY(0) translateY(0);}25%{transform:rotateY(720deg) translateY(-26px);}75%{transform:rotateY(1440deg) translateY(-13px);}100%{transform:rotateY(1800deg) translateY(0);}}
    .cf{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid var(--gold2);box-shadow:inset 0 0 12px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.5);}
    .cf-front{background:radial-gradient(circle at 38% 35%,#f0d060,#b89228);}
    .cf-back{background:radial-gradient(circle at 38% 35%,#d8b840,#9a7618);transform:rotateY(180deg);}
    .cem{font-size:26px;line-height:1;}
    .clbl{font-family:var(--cond);font-size:8px;font-weight:800;color:#0A0F0D;letter-spacing:.15em;}

    /* PICKS */
    .sec-lbl{font-size:9px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;}
    .pick-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
    .pick{padding:10px;border-radius:6px;border:1.5px solid var(--border);background:transparent;color:var(--text);font-family:var(--cond);font-size:14px;font-weight:700;letter-spacing:.05em;cursor:pointer;transition:all .12s;}
    .pick:hover,.pick--on{border-color:var(--gold);color:var(--gold);}
    .pick--on{background:rgba(232,200,74,.09);}
    .stakes-row{display:flex;gap:5px;flex-wrap:wrap;}
    .stake-btn{padding:6px 10px;border-radius:4px;border:1.5px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s;}
    .stake-btn:hover,.stake-btn--on{border-color:var(--gold);color:var(--gold);}
    .stake-btn--on{background:rgba(232,200,74,.07);}
    .cust-inp{width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;transition:border .12s;}
    .cust-inp:focus{border-color:var(--gold);}
    .cust-inp::placeholder{color:rgba(234,232,224,.2);}
    .flip-btn{width:100%;padding:14px;background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:900;font-size:17px;letter-spacing:.05em;border-radius:7px;cursor:pointer;transition:all .15s;box-shadow:0 4px 14px rgba(27,122,68,.35);}
    .flip-btn:hover:not(:disabled){background:var(--green2);transform:translateY(-1px);}
    .flip-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}
    .refill-btn{width:100%;padding:10px;background:transparent;border:1px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:11px;border-radius:6px;cursor:pointer;}
    .refill-btn:hover{border-color:var(--green2);color:var(--green2);}
    .chips-row{display:flex;gap:4px;flex-wrap:wrap;}
    .chip{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;border:1.5px solid;font-family:var(--mono);}
    .chip-w{border-color:#4ade80;color:#4ade80;}
    .chip-l{border-color:var(--red);color:var(--red);}

    /* GAME DONATE */
    .gdon{background:rgba(232,200,74,.04);border:1px solid rgba(232,200,74,.1);border-radius:6px;padding:11px;}
    .gdon-lbl{font-size:8px;letter-spacing:.2em;color:var(--muted);margin-bottom:5px;}
    .gdon-pitch{font-size:10px;color:var(--muted);line-height:1.5;margin-bottom:8px;}
    .gdon-btns{display:flex;gap:6px;}
    .gdon-btn{flex:1;padding:8px;border-radius:5px;border:1.5px solid rgba(232,200,74,.25);background:transparent;color:var(--gold);font-family:var(--cond);font-size:12px;font-weight:700;cursor:pointer;text-align:center;transition:all .12s;display:block;text-decoration:none;}
    .gdon-btn:hover{background:rgba(232,200,74,.09);}
    .gdon-btn--b{border-color:var(--border);color:var(--muted);}
    .gdon-btn--b:hover{border-color:var(--gold);color:var(--gold);background:transparent;}
    .gdon-note{font-size:8px;color:rgba(234,232,224,.2);margin-top:5px;text-align:center;}

    /* CHAT */
    .qbar{padding:11px 14px;background:rgba(232,200,74,.04);border-bottom:1px solid var(--border);font-size:11px;color:var(--muted);line-height:1.5;}
    .qbar-albo{font-family:var(--cond);font-size:13px;font-weight:800;color:var(--gold);}
    .chat{display:flex;flex-direction:column;flex:1;overflow:hidden;}
    .chat-hdr{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border);flex-shrink:0;}
    .chat-ttl{font-family:var(--cond);font-size:12px;font-weight:700;}
    .chat-ct{font-size:9px;color:var(--muted);flex:1;}
    .chat-msgs{flex:1;overflow-y:auto;padding:9px 11px;display:flex;flex-direction:column;gap:7px;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
    .chat-empty{font-size:12px;color:var(--muted);text-align:center;margin-top:22px;font-style:italic;}
    .msg{max-width:86%;}
    .msg--me{align-self:flex-end;}
    .msg-meta{display:flex;gap:5px;align-items:baseline;margin-bottom:2px;}
    .msg-who{font-size:9px;color:var(--green2);font-weight:700;}
    .msg--me .msg-who{color:var(--gold);}
    .msg-t{font-size:9px;color:rgba(234,232,224,.2);}
    .msg-txt{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:12px;line-height:1.5;}
    .msg--me .msg-txt{background:rgba(232,200,74,.07);border-color:rgba(232,200,74,.13);}
    .chat-in{display:flex;gap:5px;padding:9px 11px;border-top:1px solid var(--border);flex-shrink:0;}
    .chat-inp{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;transition:border .12s;}
    .chat-inp:focus{border-color:var(--gold);}
    .chat-inp::placeholder{color:rgba(234,232,224,.2);}
    .chat-send{background:var(--green);border:none;color:#fff;font-family:var(--mono);font-size:13px;padding:7px 13px;border-radius:5px;cursor:pointer;}
    .chat-send:hover:not(:disabled){background:var(--green2);}
    .chat-send:disabled{opacity:.4;cursor:not-allowed;}
  `}</style>

  {page==="land" && <Landing onPlay={()=>setPage("auth")}/>}
  {page==="auth" && <Auth onSignIn={handleSignIn} onGuest={handleGuest}/>}
  {page==="game" && user && <Game user={user} isGuest={isGuest} onBack={handleBack} onUpdate={p=>setUser(p)}/>}
</>
```

);
}
