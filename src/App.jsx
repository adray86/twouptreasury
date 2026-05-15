import { useState, useEffect, useRef, useCallback } from “react”;
import { supabase } from “./supabase.js”;

// ─── SEO ─────────────────────────────────────────────────────────────────────
function injectMeta() {
document.title = “Double Down | Beat Albo’s $4.3M Beach House — One Flip At A Time”;
const rob = document.createElement(“meta”); rob.name=“robots”; rob.content=“index,follow”; document.head.appendChild(rob);
[
[“description”,“Double Down: Australia’s most ambitious coin flip. $1,000 to start. Global leaderboard. Badges. See what your money bought in 1980 vs now.”],
[“og:title”,“Double Down | Ignore CGT. Flip a Coin. Don’t Pay A Cent.”],
[“og:description”,“Start with $1,000 in play credits. Flip coins. Earn badges. Climb the leaderboard. Jim Chalmers bought a $4.3M beach house. Beat him.”],
[“keywords”,“Australia budget satire, coin flip, doubledown.au, Jim Chalmers, Albanese beach house, CGT discount, 1980 prices Australia, leaderboard”],
[“twitter:card”,“summary_large_image”],
[“twitter:title”,“Double Down — Beat Albo’s $4.3M Beach House”],
[“twitter:description”,“Free coin flip. $1,000 to start. Albo’s $4.3M house is the goal. Deficit ticking at $897/sec. doubledown.au”],
[“og:url”,“https://doubledown.au”],
].forEach(([k,v]) => {
const m = document.createElement(“meta”);
m.setAttribute(k.includes(“og:”) ? “property” : “name”, k);
m.content = v; document.head.appendChild(m);
});
// JSON-LD structured data for Google
const ld = document.createElement(“script”);
ld.type = “application/ld+json”;
ld.text = JSON.stringify({
“@context”:“https://schema.org”,
“@type”:“WebApplication”,
“name”:“Double Down”,
“url”:“https://doubledown.au”,
“description”:“Free satirical coin flip. Start with $1,000. Beat Albo’s $4.3M beach house. Jim Chalmers’ deficit: $28.3 billion. Your goal: earn more.”,
“applicationCategory”:“Game”,
“operatingSystem”:“Any”,
“offers”:{”@type”:“Offer”,“price”:“0”,“priceCurrency”:“AUD”},
“keywords”:“Australian budget satire, coin flip, Jim Chalmers, Albanese beach house, CGT, doubledown.au”
});
document.head.appendChild(ld);
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

// ─── LEADER TICKER ────────────────────────────────────────────────────────────
function LeaderTicker() {
const [lb, setLb] = useState([]);
useEffect(() => {
async function load() { const d = await getLeaderboard(); setLb(d.slice(0,10)); }
load();
const t = setInterval(load, 20000);
return () => clearInterval(t);
}, []);
if (!lb.length) return null;
const medals = [“🥇”,“🥈”,“🥉”];
const items = lb.map((e,i) => `${medals[i]||("#"+(i+1))} ${e.topHouseEmoji||""}${e.name}  $${Number(e.balance).toLocaleString("en-AU")}`);
const txt = […items,…items].join(”   ·   “);
return (
<div className="ticker-wrap">
<span className="ticker-tag">🏆 LEADERBOARD</span>
<div className="ticker-scroll">
<span className="ticker-txt">{txt}</span>
</div>
</div>
);
}

// ─── REFERRAL SYSTEM ──────────────────────────────────────────────────────────
function getReferralCode() {
try { return new URLSearchParams(window.location.search).get(“ref”); } catch { return null; }
}
function storeReferrer(code) {
try { if(code) sessionStorage.setItem(“dd_ref”, code); } catch {}
}
function getStoredReferrer() {
try { return sessionStorage.getItem(“dd_ref”); } catch { return null; }
}
function clearReferrer() {
try { sessionStorage.removeItem(“dd_ref”); } catch {}
}
async function creditReferrer(referrerName) {
try {
const { data } = await supabase.from(“profiles”).select(”*”).eq(“name”, referrerName).single();
if (!data) return;
const newBal = (data.balance||0) + 1_000_000;
const newCount = (data.referral_count||0) + 1;
await supabase.from(“profiles”).update({
balance: newBal,
referral_count: newCount,
updated_at: new Date().toISOString()
}).eq(“name”, referrerName);
} catch {}
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

// ─── STORAGE (Supabase) ─────────────────────────────────────────────────────
async function getLeaderboard() {
try {
const { data } = await supabase.from(“leaderboard”).select(”*”).order(“balance”,{ascending:false}).limit(50);
return Array.isArray(data) ? data.map(r=>({
name:r.name, balance:r.balance, flips:r.flips||0,
badgeCount:r.badge_count||0, topHouseEmoji:r.top_house_emoji||null
})) : [];
} catch { return []; }
}
async function updateLeaderboard(entry) {
try {
await supabase.from(“leaderboard”).upsert({
name:entry.name, balance:entry.balance, flips:entry.flips||0,
badge_count:entry.badgeCount||0, top_house_emoji:entry.topHouseEmoji||null,
updated_at: new Date().toISOString()
},{onConflict:“name”});
} catch {}
}
async function loadProfile(name) {
try {
const { data } = await supabase.from(“profiles”).select(”*”).eq(“name”,name).single();
if (data) return {name:data.name, balance:data.balance, flips:data.flips||0, wins:data.wins||0, lowestEver:data.lowest_ever||data.balance, createdAt:new Date(data.created_at||Date.now()).getTime(), badges:data.badges||[]};
} catch {}
return null;
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
try {
const { data } = await supabase.from(“chat_messages”).select(”*”).order(“created_at”,{ascending:true}).limit(80);
if (Array.isArray(data)) setMsgs(data.map(r=>({id:r.id,handle:r.handle,text:r.text,ts:new Date(r.created_at).getTime()})));
} catch {}
}, []);
useEffect(() => { load(); const t=setInterval(load,5000); return ()=>clearInterval(t); }, [load]);
useEffect(() => { endRef.current?.scrollIntoView({behavior:“smooth”}); }, [msgs]);

async function post() {
if (!text.trim()||posting) return;
setPosting(true);
try {
await supabase.from(“chat_messages”).insert({handle, text:text.trim()});
await load();
} catch {}
setText(””); setPosting(false);
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
<a className="don-btn don-btn--kofi" href="https://ko.fi/doubledown" target="_blank" rel="noopener noreferrer">
☕ Support on Ko-fi
<span className="don-tag">0% platform fee · set up at ko.fi</span>
</a>
<a className="don-btn don-btn--bmc" href="https://buymeacoffee.com/queeflatinah" target="_blank" rel="noopener noreferrer">
🍺 Buy Me a Tinny
<span className="don-tag">5% platform fee · buymeacoffee.com</span>
</a>
</div>

```
  </div>
</div>
```

);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onSignIn, onGuest }) {
const [name, setName] = useState(””);
const [email, setEmail] = useState(””);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(””);

async function handleSignIn() {
if (!name.trim()) return;
setLoading(true); setError(””);
const safe = name.trim().slice(0,20).replace(/[^a-zA-Z0-9_-]/g,””);
if (!safe) { setError(“Letters, numbers, underscores and dashes only.”); setLoading(false); return; }
let profile = await loadProfile(safe);
const isNew = !profile;
if (!profile) {
profile = { name:safe, balance:STARTING, flips:0, wins:0, lowestEver:STARTING, createdAt:Date.now(), email:email.trim()||null };
}
if (email.trim() && !profile.email) profile.email = email.trim();
await saveProfile(profile);
if (isNew) {
const referrer = getStoredReferrer();
if (referrer && referrer.toLowerCase() !== safe.toLowerCase()) {
await creditReferrer(referrer);
clearReferrer();
}
}
setLoading(false);
onSignIn(profile);
}

return (
<div className="auth-page">
<div className="auth-logo">🎲</div>
<h1 className="auth-h1">DOUBLE DOWN</h1>
<p className="auth-sub">Jim Chalmers took your CGT discount.<br/>Albo bought a $4.3M beach house during a cost-of-living crisis.<br/><strong>Here’s $1,000. Make it back.</strong></p>

```
  <button className="auth-btn auth-btn--guest" onClick={onGuest}>
    🎲 Play Now — No Signup
  </button>
  <p className="auth-guest-note">Free forever · $1,000 to start · no signup needed</p>

  <div className="auth-divider">— or save your progress —</div>

  <div className="auth-card">
    <div className="auth-lbl">PICK A NAME. KEEP YOUR SCORE.</div>
    <input className="auth-inp" placeholder="Username (e.g. ChalmersBuster99)…" value={name}
      onChange={e=>{setName(e.target.value);setError("");}}
      onKeyDown={e=>e.key==="Enter"&&handleSignIn()} maxLength={20} autoFocus/>
    <input className="auth-inp" placeholder="Email (optional — to recover your account)" value={email||""}
      onChange={e=>setEmail(e.target.value)} type="email"/>
    {error && <div className="auth-err">{error}</div>}
    <button className="auth-btn" disabled={!name.trim()||loading} onClick={handleSignIn}>
      {loading?"Saving…":"Save My Progress & Join Leaderboard →"}
    </button>
    <div className="auth-hint">Leaderboard · badges · balance all saved · email optional but lets you recover your account</div>
  </div>
</div>
```

);
}

// ─── SHARE RESET ──────────────────────────────────────────────────────────────
const SHARE_COOLDOWN = 15 * 60 * 1000; // 15 minutes in ms

function ShareReset({ profile, setProfile, setHist, isGuest, persist }) {
const [now, setNow] = useState(Date.now());
useEffect(() => {
const t = setInterval(() => setNow(Date.now()), 1000);
return () => clearInterval(t);
}, []);

const lastReset = profile.lastShareReset || 0;
const elapsed = now - lastReset;
const remaining = SHARE_COOLDOWN - elapsed;
const onCooldown = remaining > 0;

const mins = String(Math.floor(remaining / 60000)).padStart(2,“0”);
const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2,“0”);

function doReset(openFn) {
openFn();
setTimeout(() => {
const r = { …profile, balance:100000, flips:0, wins:0, lowestEver:100000, lastShareReset:Date.now() };
setProfile(r); setHist([]); if(!isGuest) persist(r);
}, 800);
}

const platforms = [
{ label:“𝕏 Twitter”, color:”#1da1f2”, fn:()=>{
const txt=“I just blew my entire balance on doubledown.au 💸%0AStarting over with $100,000 — someone has to beat Albo’s $4.3M beach house 🏖️🇦🇺%0A%0Adoubledown.au @JEChalmers @AlboMP”;
window.open(“https://twitter.com/intent/tweet?text=”+txt,”_blank”);
}},
{ label:“Facebook”, color:”#1877f2”, fn:()=>{
window.open(“https://www.facebook.com/sharer/sharer.php?u=https://doubledown.au&quote=I+just+blew+my+entire+balance+on+doubledown.au+Starting+over+with+$100,000”,”_blank”);
}},
{ label:“Reddit”, color:”#ff5600”, fn:()=>{
const title=“I just went broke on a satirical Australian budget coin flip. Restarting with $100,000.”;
window.open(“https://www.reddit.com/submit?url=https://doubledown.au&title=”+encodeURIComponent(title),”_blank”);
}},
];

return (
<div className="refill-share-box">
<div className="refill-share-lbl">📤 Share & restart with $100,000</div>
{onCooldown ? (
<>
<div className="refill-share-sub">Next share reset available in</div>
<div className="cooldown-timer">{mins}:{secs}</div>
<div className="cooldown-note">Reset to $1,000 above while you wait, or come back in {mins} mins for the big bag.</div>
</>
) : (
<>
<div className="refill-share-sub">Post on social. Get a bigger bag. Available every 15 mins.</div>
<div className="refill-social-row">
{platforms.map(({label,color,fn})=>(
<button key={label} className=“social-refill-btn” style={{borderColor:color,color}}
onClick={()=>doReset(fn)}>{label}</button>
))}
</div>
</>
)}
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

const eff = Math.min(Math.max(1, Math.floor(+(custom||stake)||1)), profile.balance);
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
// Credit referrer on first ever flip (guest)
if (isGuest && profile.flips === 0) {
const referrer = getStoredReferrer();
if (referrer) { creditReferrer(referrer); clearReferrer(); }
}
const rLabel = r===“H” ? “🦅 HEADS” : “🦘 TAILS”;
setFlipMsg(won
? `+$${fmtN(eff)} — ${nb>=ALBO?`🏖️ ${(nb/ALBO).toFixed(1)}× Albo’s house!`:`${rLabel} — you win!`}`
: `-$${fmtN(eff)} — ${rLabel} — you lose.`
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
    <div className="nav-logo">🎲 DOUBLE DOWN</div>
    <div className="nav-r">
      {topHouse && <span className="nav-house" title={topHouse.label}>{topHouse.emoji}</span>}
      {!isGuest && <span className="nav-user">{profile.name}</span>}
      {isGuest && <span className="nav-guest">Guest</span>}
      <a className="nav-donate" href="https://ko.fi/doubledown" target="_blank" rel="noopener noreferrer">☕ Donate</a>
      <button className="nav-share" onClick={doShare}>{shared?"✅":"Share"}</button>
    </div>
  </nav>

  <DeficitCounter/>
  <LeaderTicker/>
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
        <div className={`outcome${outcome==="win"?" out-w":" out-l"}`}>
          {flipMsg}
          {outcome==="win" && <button className="flip-share-btn" onClick={()=>{
            const pct=((profile.balance/4300000)*100).toFixed(2);
            const txt=`I just flipped ${pick==="H"?"🦅 HEADS":"🦘 TAILS"} on doubledown.au and won! Balance: $${profile.balance.toLocaleString("en-AU")} — that's ${pct}% of Albo's $4.3M beach house 🏖️🇦🇺`;
            navigator.share?navigator.share({text:txt,url:"https://doubledown.au"}):navigator.clipboard.writeText(txt);
          }}>📤 Share this flip</button>}
          {outcome==="win" && isGuest && (
            <button className="flip-signup-btn" onClick={onBack}>
              🏆 Sign up to save your progress &amp; appear on the leaderboard
              <span className="signup-sub">You're at ${fmtN(profile.balance)} — don't lose it when you leave</span>
            </button>
          )}
        </div>
      )}

      <Coin phase={phase} result={result}/>

      <div className="sec-lbl" style={{fontSize:"11px",color:"#B0ADA6",letterSpacing:".18em"}}>STEP 1 — HEADS OR TAILS?</div>
      <div className="pick-row">
        <button className={`pick${pick==="H"?" pick--on":""}`} onClick={()=>setPick("H")}>
          <span className="pick-em">🦅</span>
          <span className="pick-lbl">HEADS</span>
        </button>
        <button className={`pick${pick==="T"?" pick--on":""}`} onClick={()=>setPick("T")}>
          <span className="pick-em">🦘</span>
          <span className="pick-lbl">TAILS</span>
        </button>
      </div>
      {pick && <div className="pick-confirm">Your call: <strong>{pick==="H"?"🦅 HEADS":"🦘 TAILS"}</strong></div>}

      <div className="sec-lbl" style={{fontSize:"11px",color:"#B0ADA6",letterSpacing:".18em",marginTop:"8px"}}>STEP 2 — HOW MUCH?</div>
      <div className="bet-display">
        <span className="bet-currency">$</span>
        <input
          className="bet-input"
          type="number"
          min="1"
          max={profile.balance}
          value={custom||stake}
          onChange={e=>setCustom(e.target.value)}
          onFocus={e=>e.target.select()}
        />
      </div>
      <div className="bet-presets">
        {[
          {label:"10%", fn:()=>Math.max(1,Math.floor(profile.balance*.1))},
          {label:"25%", fn:()=>Math.max(1,Math.floor(profile.balance*.25))},
          {label:"50%", fn:()=>Math.max(1,Math.floor(profile.balance*.5))},
          {label:"MAX", fn:()=>profile.balance},
        ].map(({label,fn})=>{
          const val=fn();
          return <button key={label} className={`bp-btn${+(custom||stake)===val?" bp-btn--on":""}`} onClick={()=>setCustom(String(val))}>{label}</button>;
        })}
      </div>


      {profile.balance<=0
        ? <div className="bust-box">
              <div className="bust-em">💸</div>
              <div className="bust-title">COOKED.</div>
              <div className="bust-sub">You've blown the whole grand. Very Australian.<br/>Jim Chalmers feels your pain. He doesn't, but still.</div>
              <button className="refill-btn" onClick={()=>{ const r={...profile,balance:STARTING,flips:0,wins:0,lowestEver:STARTING}; setProfile(r); setHist([]); if(!isGuest)persist(r); }}>
                🔄 Reset to $1,000 — Free
              </button>
              <div className="bust-or">— or —</div>
              <ShareReset profile={profile} setProfile={setProfile} setHist={setHist} isGuest={isGuest} persist={persist}/>
            </div>
        : !pick
          ? <div className="flip-hint">👆 Pick heads or tails first</div>
          : <button className="flip-btn" disabled={phase!=="idle"||eff>profile.balance||eff<=0} onClick={flip}>
              {phase==="spin"?"FLIPPING…":`${pick==="H"?"🦅 HEADS":"🦘 TAILS"} — FLIP $${fmtN(eff)}`}
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

      {/* REFERRAL */}
      {!isGuest && (
        <div className="referral-box">
          <div className="ref-lbl">💰 REFER A MATE. GET $1,000,000.</div>
          <div className="ref-sub">When someone plays through your link, you get $1M in credits automatically.</div>
          <div className="ref-link-row">
            <div className="ref-link">doubledown.au?ref={profile.name}</div>
            <button className="ref-copy" onClick={()=>{
              const url=`https://doubledown.au?ref=${profile.name}`;
              navigator.clipboard.writeText(url).catch(()=>{});
              const btn=document.activeElement; btn.textContent="✅"; setTimeout(()=>btn.textContent="Copy",1500);
            }}>Copy</button>
          </div>
          <div className="ref-social-row">
            <button className="ref-social-btn ref-tw" onClick={()=>{
              const txt=`I'm playing a satirical coin flip to earn Albo's $4.3M beach house 🏖️%0AUse my link for a free $1,000 start — doubledown.au?ref=${profile.name} 🇦🇺`;
              window.open("https://twitter.com/intent/tweet?text="+txt,"_blank");
            }}>𝕏 Tweet</button>
            <button className="ref-social-btn ref-fb" onClick={()=>{
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://doubledown.au?ref="+profile.name)}`,"_blank");
            }}>Facebook</button>
            <button className="ref-social-btn ref-rd" onClick={()=>{
              window.open(`https://www.reddit.com/submit?url=${encodeURIComponent("https://doubledown.au?ref="+profile.name)}&title=${encodeURIComponent("Play this satirical Australian budget coin flip — earn Albo's $4.3M beach house")}`,"_blank");
            }}>Reddit</button>
          </div>
          {profile.referral_count>0 && <div className="ref-count">🎉 {profile.referral_count} referral{profile.referral_count!==1?"s":""} · +${(profile.referral_count*1000000).toLocaleString("en-AU")} earned</div>}
        </div>
      )}

    {/* GAME DONATE */}
      <div className="gdon">
        <div className="gdon-lbl">ENJOY THE SATIRE? 🇦🇺</div>
        <div className="gdon-pitch">Milk: $3.50. Avo toast: $24. A tinny: $9. Albo's house: $4.3M.</div>
        <div className="gdon-btns">
          <a className="gdon-btn" href="https://ko.fi/doubledown" target="_blank" rel="noopener noreferrer">☕ Ko-fi (0% fee)</a>
          <a className="gdon-btn gdon-btn--b" href="https://buymeacoffee.com/queeflatinah" target="_blank" rel="noopener noreferrer">🍺 BMC (5% fee)</a>
        </div>

      </div>
    </div>

    {/* LEADERBOARD */}
    <div className={`board-col${tab!=="board"?" board-col--hidden":""}`}>
      <Leaderboard currentUser={isGuest?null:profile.name}/>
      {isGuest&&<div className="guest-note guest-note--cta">
        <div className="gn-title">👻 You're invisible.</div>
        <div className="gn-body">Guest players don't appear on the leaderboard and lose everything when they leave.</div>
        <button className="gn-btn" onClick={onBack}>Sign up to save your progress →</button>
      </div>}
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

// ─── CARICATURES (CC-style satirical illustrations) ──────────────────────────
function AlboCaricature() {
return (
<svg viewBox="0 0 180 240" className="caric" aria-label="Satirical caricature of Anthony Albanese" role="img">
{/* Sky */}
<rect width="180" height="240" fill="#87CEEB"/>
{/* Ocean */}
<rect y="175" width="180" height="65" fill="#1565C0"/>
<rect y="175" width="180" height="12" fill="#1E88E5" opacity=".5"/>
{/* Copacabana cliff */}
<ellipse cx="90" cy="200" rx="100" ry="30" fill="#5D4037"/>
{/* House on cliff */}
<rect x="50" y="158" width="80" height="45" fill="#FFFDE7" rx="2"/>
<polygon points="40,158 90,128 140,158" fill="#E53935"/>
<rect x="76" y="177" width="14" height="26" fill="#90CAF9"/>
<text x="90" y="172" textAnchor="middle" fontSize="7" fill="#B71C1C" fontWeight="bold">$4.3M</text>
{/* Body - Labor red suit */}
<rect x="55" y="138" width="70" height="40" fill="#C62828" rx="6"/>
{/* Collar / white shirt */}
<polygon points="90,138 82,152 90,148 98,152" fill="white"/>
{/* ALP badge */}
<circle cx="70" cy="148" r="5" fill="#C62828" stroke="white" strokeWidth="1"/>
<text x="70" y="151" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">ALP</text>
{/* Neck */}
<rect x="82" y="125" width="16" height="16" fill="#D2956A" rx="4"/>
{/* Head - round, prominent ears */}
<ellipse cx="90" cy="100" rx="42" ry="48" fill="#D2956A"/>
{/* Big ears */}
<ellipse cx="48" cy="102" rx="13" ry="17" fill="#D2956A"/>
<ellipse cx="48" cy="102" rx="8" ry="11" fill="#C4845A"/>
<ellipse cx="132" cy="102" rx="13" ry="17" fill="#D2956A"/>
<ellipse cx="132" cy="102" rx="8" ry="11" fill="#C4845A"/>
{/* Silver hair */}
<path d="M50,72 Q90,42 130,72 Q125,58 90,52 Q55,58 50,72" fill="#9E9E9E"/>
<path d="M50,72 Q45,85 48,95" fill="none" stroke="#9E9E9E" strokeWidth="8" strokeLinecap="round"/>
<path d="M130,72 Q135,85 132,95" fill="none" stroke="#9E9E9E" strokeWidth="8" strokeLinecap="round"/>
{/* Eyes - friendly but guilty */}
<ellipse cx="78" cy="95" rx="9" ry="10" fill="white"/>
<ellipse cx="102" cy="95" rx="9" ry="10" fill="white"/>
<circle cx="80" cy="97" r="5" fill="#3E2723"/>
<circle cx="104" cy="97" r="5" fill="#3E2723"/>
<circle cx="82" cy="95" r="2" fill="white"/>
<circle cx="106" cy="95" r="2" fill="white"/>
{/* Raised eyebrows - surprised expression */}
<path d="M70,83 Q78,78 87,82" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
<path d="M93,82 Q102,78 110,83" fill="none" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
{/* Wide grin */}
<path d="M72,118 Q90,136 108,118" fill="#7B3F00" stroke="#5D4037" strokeWidth="1"/>
<path d="M72,118 Q90,130 108,118" fill="white"/>
{/* Caption */}
<rect x="0" y="218" width="180" height="22" fill="rgba(0,0,0,.6)"/>
<text x="90" y="233" textAnchor="middle" fontSize="9" fill="white" fontFamily="monospace" fontWeight="bold">“I KNOW WHAT IT’S LIKE”</text>
</svg>
);
}

function ChalmersCaricature() {
return (
<svg viewBox="0 0 180 240" className="caric" aria-label="Satirical caricature of Jim Chalmers" role="img">
{/* Dark parliament backdrop */}
<rect width="180" height="240" fill="#1A237E"/>
{/* Parliament pillars */}
<rect x="10" y="60" width="20" height="180" fill="#283593"/>
<rect x="150" y="60" width="20" height="180" fill="#283593"/>
<rect x="0" y="55" width="180" height="15" fill="#283593"/>
{/* Budget papers scattered */}
<rect x="20" y="180" width="140" height="60" fill="#E8EAF6" rx="3"/>
<text x="90" y="200" textAnchor="middle" fontSize="8" fill="#C62828" fontWeight="bold">DEFICIT: $28.3B</text>
<text x="90" y="212" textAnchor="middle" fontSize="7" fill="#37474F">“AN IMPROVEMENT”</text>
<text x="90" y="224" textAnchor="middle" fontSize="6" fill="#78909C">-Jim Chalmers, probably</text>
{/* Body - navy suit, Budget night */}
<rect x="52" y="138" width="76" height="45" fill="#1A237E" rx="6"/>
{/* Red Labor tie */}
<polygon points="90,140 85,158 90,155 95,158" fill="#E53935"/>
{/* Collar */}
<rect x="83" y="138" width="14" height="10" fill="white"/>
{/* Neck */}
<rect x="81" y="124" width="18" height="17" fill="#D4A574" rx="4"/>
{/* Head - square jaw, distinguished */}
<ellipse cx="90" cy="96" rx="40" ry="44" fill="#D4A574"/>
{/* Square jawline */}
<rect x="62" y="110" width="56" height="20" fill="#D4A574" rx="4"/>
{/* Ears */}
<ellipse cx="50" cy="98" rx="11" ry="14" fill="#D4A574"/>
<ellipse cx="130" cy="98" rx="11" ry="14" fill="#D4A574"/>
{/* Brown hair - receding slightly */}
<path d="M52,68 Q90,48 128,68 Q120,55 90,50 Q60,55 52,68" fill="#4E342E"/>
<path d="M52,68 Q50,78 52,90" fill="none" stroke="#4E342E" strokeWidth="7" strokeLinecap="round"/>
<path d="M128,68 Q130,78 128,90" fill="none" stroke="#4E342E" strokeWidth="7" strokeLinecap="round"/>
{/* Confident eyes */}
<ellipse cx="76" cy="92" rx="9" ry="9" fill="white"/>
<ellipse cx="104" cy="92" rx="9" ry="9" fill="white"/>
<circle cx="78" cy="93" r="5" fill="#1A237E"/>
<circle cx="106" cy="93" r="5" fill="#1A237E"/>
<circle cx="80" cy="91" r="2" fill="white"/>
<circle cx="108" cy="91" r="2" fill="white"/>
{/* Smug eyebrows */}
<path d="M68,80 Q76,76 84,80" fill="none" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round"/>
<path d="M96,80 Q104,76 112,80" fill="none" stroke="#4E342E" strokeWidth="2.5" strokeLinecap="round"/>
{/* Self-satisfied smile */}
<path d="M74,116 Q90,128 106,116" fill="#A0522D" stroke="#8B4513" strokeWidth="1"/>
<path d="M74,116 Q90,122 106,116" fill="white"/>
{/* CGT crossed out badge */}
<circle cx="68" cy="150" r="8" fill="#E53935"/>
<text x="68" y="153" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">CGT</text>
<line x1="61" y1="143" x2="75" y2="157" stroke="white" strokeWidth="2"/>
{/* Caption */}
<rect x="0" y="218" width="180" height="22" fill="rgba(0,0,0,.6)"/>
<text x="90" y="233" textAnchor="middle" fontSize="9" fill="white" fontFamily="monospace" fontWeight="bold">“MOST AMBITIOUS BUDGET”</text>
</svg>
);
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onPlay }) {
const [tab, setTab] = useState(“play”);
const [shared, setShared] = useState(false);

async function doShare() {
const t = “Jim Chalmers killed the CGT discount & left a $28.3B deficit. Albo bought a $4.3M beach house. We built a coin flip. 🪙🇦🇺 https://doubledown.au”;
try { await navigator.share({ title:“Double Down”, text:t, url:“https://doubledown.au” }); }
catch { navigator.clipboard.writeText(t).catch(()=>{}); }
setShared(true); setTimeout(()=>setShared(false), 2500);
}

function tweet(text) {
window.open(“https://twitter.com/intent/tweet?text=” + encodeURIComponent(text), “_blank”);
}

const TABS = [
{ id:“play”,    icon:“🎲”, label:“Play” },
{ id:“budget”,  icon:“📉”, label:“Budget” },
{ id:“albo”,    icon:“🏖️”, label:“Albo’s House” },
{ id:“prices”,  icon:“🕰️”, label:“1980 vs Now” },
{ id:“board”,   icon:“🏆”, label:“Leaderboard” },
{ id:“donate”,  icon:“☕”, label:“Donate” },
];

return (
<div className="land">
{/* STICKY NAV */}
<nav className="nav">
<div className="nav-logo">🎲 DOUBLE DOWN</div>
<div className="nav-r">
<a className="nav-donate" href="https://ko.fi/doubledown" target="_blank" rel="noopener noreferrer">☕ Donate</a>
<button className="nav-share" onClick={doShare}>{shared ? “✅” : “Share”}</button>
</div>
</nav>

```
  {/* LIVE DEFICIT TICKER */}
  <DeficitCounter/>

  {/* TAB BAR */}
  <div className="ltabs">
    {TABS.map(t => (
      <button key={t.id} className={`ltab${tab===t.id?" ltab--on":""}`} onClick={()=>setTab(t.id)}>
        <span className="ltab-icon">{t.icon}</span>
        <span className="ltab-lbl">{t.label}</span>
      </button>
    ))}
  </div>

  {/* ── PLAY TAB ── */}
  {tab==="play" && (
    <div className="tc">
      <div className="hero">
        <div className="hero-eye">🇦🇺 FREE · SATIRICAL · PLAY CREDITS ONLY</div>
        <h1 className="hero-h1">Ignore CGT.<br/><em>Double Down.</em><br/>Don't Pay A Cent.</h1>
    <div className="hero-stats">
      <div className="hstat"><span className="hstat-n">$28.3B</span><span className="hstat-l">deficit they left you</span></div>
      <div className="hstat"><span className="hstat-n">$4.3M</span><span className="hstat-l">Albo's beach house</span></div>
      <div className="hstat"><span className="hstat-n">$1,000</span><span className="hstat-l">we're giving you</span></div>
    </div>
        <p className="hero-p">
          Chalmers axed your CGT discount. Albo bought a <strong>$4.3M beach house</strong> during a cost-of-living crisis.<br/>
          We built Australia's most financially irresponsible coin flip. <strong>$1,000 to start. Free forever.</strong>
        </p>
        <button className="cta cta--big" onClick={onPlay}>F*#k the Budget. Here's $1,000. Flip Now. →</button>
        <div className="social-share-row">
          <button className="ss-btn ss-tw" onClick={()=>tweet("Jim Chalmers killed the CGT discount and left a $28.3B deficit.\n\nAlbo bought a $4.3M beach house during a cost-of-living crisis.\n\nWe built a coin flip.\n\ndoubledown.au 🪙🇦🇺\n@JEChalmers @AlboMP")}>𝕏 Tweet</button>
          <button className="ss-btn ss-rd" onClick={()=>window.open("https://www.reddit.com/submit?url=https://doubledown.au&title="+encodeURIComponent("We built a coin flip to explain the 2026 budget — your goal is to buy Albo's $4.3M beach house"),"_blank")}>📮 Reddit</button>

        </div>
      </div>

      {/* CARICATURES */}
      <div className="caric-row">
        <div className="caric-card">
          <AlboCaricature/>
          <div className="caric-name">Anthony Albanese</div>
          <div className="caric-fact">Purchased $4.3M clifftop beach house at Copacabana, NSW — during Australia's worst cost-of-living crisis in 40 years.</div>
          <button className="caric-btn" onClick={()=>tweet('Albo bought a $4.3M beach house during a cost-of-living crisis.\n\nYour move: doubledown.au 🏖️🇦🇺')}>Share this</button>
        </div>
        <div className="vs-block">
          <div className="vs-text">VS</div>
          <div className="vs-sub">you</div>
          <div className="vs-balance">$1,000<br/><span>to start</span></div>
        </div>
        <div className="caric-card">
          <ChalmersCaricature/>
          <div className="caric-name">Jim Chalmers</div>
          <div className="caric-fact">Removed CGT discount. Left a $28.3 billion deficit. Called it "the most ambitious budget in decades." Stands by this.</div>
          <button className="caric-btn" onClick={()=>tweet('Jim Chalmers left a $28.3B deficit and called it ambitious.\n\nWe built a coin flip. doubledown.au @JEChalmers')}>Share this</button>
        </div>
      </div>

      {/* BADGES PREVIEW */}
      <div className="tc-section">
        <div className="tc-lbl">🏅 {BADGES.length} BADGES TO EARN</div>
        <div className="tc-sub">Starting from "First Flip" to "10× Albo's Houses." Each one a small act of financial resistance.</div>
        <div className="all-badges">
          {BADGES.map(b=>(
            <div key={b.id} className="badge-preview">
              <div className="bp-big-em">{b.emoji}</div>
              <div className="bp-title">{b.label}</div>
              <div className="bp-d">{b.desc}</div>
            </div>
          ))}
        </div>
        <button className="cta" style={{marginTop:20}} onClick={onPlay}>Start Earning Badges →</button>
      </div>
    </div>
  )}

  {/* ── BUDGET TAB ── */}
  {tab==="budget" && (
    <div className="tc">
      <div className="tc-section tc-section--hero">
        <div className="tc-lbl">📉 THE 2026 FEDERAL BUDGET — IN PLAIN ENGLISH</div>
        <div className="budget-cards">
          {[
            { n:"$28,300,000,000", label:"Budget Deficit", sub:"Jim Chalmers called this 'an improvement.' It is still $28.3 billion.", color:"red" },
            { n:"$897/sec", label:"Rate of Borrowing", sub:"Australia borrows $897 every second. You earn $0 of that.", color:"red" },
            { n:"$4,300,000", label:"Albo's Beach House", sub:"Purchased during the cost-of-living crisis he was meant to fix.", color:"gold" },
            { n:"0¢", label:"Your CGT Discount", sub:"Removed. Gone. Chalmers did that. We made a game about it.", color:"red" },
            { n:"65¢ → $13", label:"Price of a Beer (1980→Now)", sub:"A 1,900% increase. Wages grew 600%. Do the maths.", color:"muted" },
            { n:"FREE → $65,000", label:"A Uni Degree (1980→Now)", sub:"HECS: Australia's most expensive gift to future generations.", color:"muted" },
          ].map((s,i)=>(
            <div key={i} className={`bcard bcard--${s.color}`}>
              <div className="bcard-n">{s.n}</div>
              <div className="bcard-label">{s.label}</div>
              <div className="bcard-sub">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="tc-section">
          <div className="tc-lbl">THE FIVE TRUTHS THEY WON'T TELL YOU</div>
          {[
            { q:"Jim Chalmers bet your CGT discount on red. It landed on black. We let you pick the colour.", share:"Jim Chalmers bet your CGT discount on red. It landed on black. We let you pick: doubledown.au" },
            { q:"Albanese said 'I know what it's like to struggle.' Then bought a $4.3M clifftop. We built a leaderboard.", share:"'I know what it's like to struggle' — Anthony Albanese, who owns a $4.3M beach house. doubledown.au" },
            { q:"Four years to see your tax cuts. Four seconds to flip for yours.", share:"Four years to see your tax cuts. Four seconds to flip for yours. doubledown.au 🪙" },
            { q:"The Treasurer says the deficit improved by $8.5 billion. It's still $28.3B. We'll take that bet.", share:"The Treasurer says the deficit 'improved.' It's still $28.3B. We'll take that bet: doubledown.au @JEChalmers" },
            { q:"Two-up was banned for 364 days a year. Negative gearing wasn't. Make of that what you will.", share:"Two-up: older than negative gearing. More reliable than Labor. doubledown.au 🇦🇺" },
          ].map((j,i)=>(
            <div className="joke" key={i}>
              <span className="joke-n">0{i+1}</span>
              <div className="joke-body">
                <q className="joke-q">"{j.q}"</q>
                <button className="joke-share" onClick={()=>tweet(j.share)}>𝕏</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* ── ALBO'S HOUSE TAB ── */}
  {tab==="albo" && (
    <div className="tc">
      <div className="tc-section tc-section--gold">
        <div className="tc-lbl">🏖️ THE GOAL: $4,300,000</div>
        <div className="albo-feature">
          <div className="albo-feat-caric"><AlboCaricature/></div>
          <div className="albo-feat-facts">
            <h2 className="albo-feat-h2">Albo's Copacabana Clifftop</h2>
            <ul className="albo-facts-list">
              {[
                ["📍","Copacabana, NSW Central Coast"],
                ["🛏️","4 bedrooms, 3 bathrooms"],
                ["🌊","Uninterrupted ocean & Sydney skyline views"],
                ["💰","Purchase price: $4,300,000"],
                ["📅","Purchased: 2024 — mid cost-of-living crisis"],
                ["🏘️","Median Sydney house at time: ~$1.65M"],
                ["😤","Times said 'I know what it's like to struggle': Several"],
              ].map(([icon,fact],i)=>(
                <li key={i} className="albo-fact"><span>{icon}</span><span>{fact}</span></li>
              ))}
            </ul>
            <button className="cta" style={{marginTop:16}} onClick={onPlay}>Earn Your Own Beach House →</button>
          </div>
        </div>
        <div className="albo-badges-section">
          <div className="tc-lbl" style={{marginBottom:12}}>ALBO HOUSE BADGES — EARN ONE FOR EVERY $4.3M</div>
          <div className="all-badges">
            {BADGES.filter(b=>b.id.startsWith("albo")||b.id==="survivor"||b.id==="century").map(b=>(
              <div key={b.id} className="badge-preview badge-preview--gold">
                <div className="bp-big-em">{b.emoji}</div>
                <div className="bp-title">{b.label}</div>
                <div className="bp-d">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="tweet-cta">
          <button className="ss-btn ss-tw" onClick={()=>tweet("The goal: earn enough play credits to buy Albo's $4.3M Copacabana clifftop beach house — purchased during a cost-of-living crisis.\n\ndoubledown.au 🏖️🇦🇺 @AlboMP")}>𝕏 Tweet Albo's House</button>
        </div>
      </div>
    </div>
  )}

  {/* ── 1980 TAB ── */}
  {tab==="prices" && (
    <div className="tc">
      <div className="tc-section">
        <div className="tc-lbl">🕰️ WHAT YOUR MONEY ACTUALLY BUYS — 1980 vs 2026</div>
        <div className="prices-feature">
          <div className="prices-caric"><ChalmersCaricature/><div className="caric-name">Jim Chalmers</div><div className="caric-fact">"Inflation is moderating." — Jim Chalmers, 2026</div></div>
          <div className="prices-calc"><Calc1980/></div>
        </div>
        <div className="tweet-cta">
          <button className="ss-btn ss-tw" onClick={()=>tweet("A beer cost 65¢ in 1980.\nNow it's $13.\n\nRent was $55/week in Sydney.\nNow it's $700.\n\nUni was free.\nNow it's $65,000.\n\nAlbo's beach house didn't exist as a concept.\nNow it costs $4.3M.\n\ndoubledown.au 🇦🇺")}>𝕏 Tweet These Numbers</button>
        </div>
      </div>
    </div>
  )}

  {/* ── LEADERBOARD TAB ── */}
  {tab==="board" && (
    <div className="tc">
      <div className="tc-section">
        <div className="tc-lbl">🏆 LIVE LEADERBOARD — EVERYONE STARTS AT $1,000</div>
        <div className="tc-sub">The national deficit is $28.3 billion. How far can you get on $1,000?</div>
        <Leaderboard compact={false}/>
        <button className="cta" style={{marginTop:20}} onClick={onPlay}>Join the Leaderboard →</button>
      </div>
    </div>
  )}

  {/* ── DONATE TAB ── */}
  {tab==="donate" && (
    <div className="tc">
      <Donations/>
    </div>
  )}

  <footer className="footer">
    <div className="ft-logo">🎲 DOUBLE DOWN</div>
    <div className="ft-links">
      <button onClick={onPlay}>Play →</button>
      <button onClick={doShare}>Share</button>
    </div>
    <div className="ft-legal">
      Satire. Play credits only. No real gambling or payments. Not financial, tax, or legal advice.
      Not endorsed by Jim Chalmers, Anthony Albanese, the ATO, the RBA, or any kangaroo.
      Gambling Help: <strong>1800 858 858</strong>. doubledown.au · 🇦🇺 2026
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
useEffect(()=>{
injectMeta();
const ref = getReferralCode();
if (ref) storeReferrer(ref);
},[]);
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
–bg:#080C0A;–bg2:#141A12;–bg3:#1C2419;
–gold:#E8C84A;–gold2:#B89A28;
–green:#1B7A44;–green2:#23A65A;
–red:#DC3528;–text:#EAE8E0;
–muted:#B0ADA6;–border:rgba(234,232,224,.14);
–mono:‘Space Mono’,monospace;–cond:‘Barlow Condensed’,sans-serif;
}
html,body{background:#080C0A!important;color:#EAE8E0;font-family:var(–mono);min-height:100vh;}
#root{background:#080C0A;min-height:100vh;}
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
    /* LEADER TICKER */
    .ticker-wrap{display:flex;align-items:center;background:#0D1410;border-bottom:1px solid rgba(232,200,74,.15);overflow:hidden;height:32px;}
    .ticker-tag{font-family:var(--cond);font-size:10px;font-weight:900;color:var(--gold);letter-spacing:.12em;padding:0 10px;white-space:nowrap;border-right:1px solid rgba(232,200,74,.2);flex-shrink:0;height:100%;display:flex;align-items:center;}
    .ticker-scroll{flex:1;overflow:hidden;height:100%;display:flex;align-items:center;}
    .ticker-txt{display:inline-block;white-space:nowrap;font-family:var(--mono);font-size:11px;color:#C4C1BA;animation:ticker 30s linear infinite;padding-left:100%;}
    @keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
    .deficit-bar{background:rgba(220,53,40,.1);border-bottom:2px solid rgba(220,53,40,.3);padding:10px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
    .deficit-label{font-size:9px;letter-spacing:.2em;color:var(--red);font-family:var(--mono);}
    .deficit-num{font-family:var(--cond);font-size:clamp(18px,5vw,28px);font-weight:900;color:var(--red);letter-spacing:.02em;}
    .deficit-sub{font-size:10px;color:rgba(234,232,224,.6);font-style:italic;}
            .nav-donate{background:var(--gold);color:#080C0A;font-family:var(--cond);font-weight:800;font-size:12px;padding:6px 12px;border-radius:4px;text-decoration:none;}
    .social-share-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;}
    .ss-btn{padding:8px 16px;border-radius:5px;border:1.5px solid;font-family:var(--cond);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:.03em;}
    .ss-tw{background:rgba(29,161,242,.1);border-color:rgba(29,161,242,.4);color:#1da1f2;}
    .ss-tw:hover{background:rgba(29,161,242,.2);}
    .ss-rd{background:rgba(255,86,0,.1);border-color:rgba(255,86,0,.4);color:#ff5600;}
    .ss-rd:hover{background:rgba(255,86,0,.2);}
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
    .bcel-tap{font-size:9px;color:rgba(234,232,224,.45);letter-spacing:.15em;}

    /* NEXT BADGE */
    .next-badge{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:6px;}
    .nb-lbl{font-size:8px;letter-spacing:.2em;color:var(--muted);flex-shrink:0;}
    .nb-em{font-size:18px;flex-shrink:0;}
    .nb-title{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--text);flex-shrink:0;}
    .nb-desc{font-size:9px;color:var(--muted);flex:1;display:none;}
    @media(min-width:600px){.nb-desc{display:inline;}}

    /* ALL BADGES PREVIEW */
    .all-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;}
    .badge-preview{background:#141A12;border:1px solid rgba(234,232,224,.14);border-radius:8px;padding:14px;text-align:center;transition:border .15s;}
    .badge-preview:hover{border-color:rgba(232,200,74,.3);}
    .bp-big-em{font-size:28px;margin-bottom:6px;}
    .bp-title{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--gold);margin-bottom:4px;}
    .bp-d{font-size:10px;color:#A8A5A0;line-height:1.6;}

    /* ALBO SECTION */
    .albo-section{background:rgba(232,200,74,.06);border-top:1px solid rgba(232,200,74,.15);border-bottom:1px solid rgba(232,200,74,.15);padding:36px 20px;}
    .albo-sec-inner{max-width:820px;margin:0 auto;display:flex;gap:20px;align-items:flex-start;}
    .albo-sec-em{font-size:52px;flex-shrink:0;}
    .albo-sec-title{font-family:var(--cond);font-size:clamp(20px,4vw,36px);font-weight:900;color:var(--gold);margin-bottom:8px;}
    .albo-sec-sub{font-size:12px;color:#B0ADA6;line-height:1.8;}

    /* AUTH */
    .auth-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;background:#080C0A;}
    .auth-logo{font-size:56px;margin-bottom:10px;}
    .auth-h1{font-family:var(--cond);font-size:clamp(28px,8vw,58px);font-weight:900;color:var(--gold);letter-spacing:.05em;margin-bottom:8px;}
    .auth-sub{font-size:13px;color:#B0ADA6;line-height:1.7;margin-bottom:22px;max-width:320px;}
    .auth-sub strong{color:#EAE8E0;}
    .auth-btn--guest{width:100%;max-width:340px;padding:18px;font-size:19px;margin-bottom:8px;background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:900;letter-spacing:.04em;border-radius:8px;cursor:pointer;box-shadow:0 6px 32px rgba(27,122,68,.5);animation:pulse 2s ease-in-out infinite;}
    .auth-btn--guest:hover{background:var(--green2);}
    .auth-guest-note{font-size:10px;color:#7E7C77;margin-bottom:16px;letter-spacing:.08em;}
    .auth-divider{font-size:11px;color:#7E7C77;margin:8px 0 16px;letter-spacing:.1em;}
    .auth-card{background:#1A2218;border:1px solid rgba(234,232,224,.2);border-radius:12px;padding:26px;max-width:360px;width:100%;}
    .auth-s{}
    .auth-lbl{font-size:9px;letter-spacing:.22em;color:var(--muted);margin-bottom:4px;}
    .auth-micro,.auth-hint{font-size:10px;color:var(--muted);line-height:1.5;margin-bottom:10px;}
    .auth-hint{text-align:center;margin-top:5px;margin-bottom:0;}
    .auth-inp{width:100%;background:var(--bg3);border:1.5px solid var(--border);border-radius:6px;padding:11px 13px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none;margin-bottom:10px;transition:border .12s;}
    .auth-inp:focus{border-color:var(--gold);}
    .auth-inp::placeholder{color:rgba(234,232,224,.45);}
    .auth-err{font-size:11px;color:var(--red);margin-bottom:8px;}
    .auth-btn{width:100%;padding:13px;background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:800;font-size:15px;letter-spacing:.05em;border-radius:7px;cursor:pointer;transition:all .15s;margin-bottom:4px;}
    .auth-btn:hover:not(:disabled){background:var(--green2);}
    .auth-btn:disabled{opacity:.4;cursor:not-allowed;}
    .auth-btn--ghost{background:transparent;border:1.5px solid var(--border);color:var(--muted);font-size:13px;}
    .auth-btn--ghost:hover{border-color:var(--gold);color:var(--gold);background:transparent;}
    .auth-or{font-size:11px;color:var(--muted);margin:14px 0;}

    /* LANDING */
    .land{min-height:100vh;background:#080C0A;}
    .hero{max-width:800px;margin:0 auto;padding:60px 20px 44px;text-align:center;background:#080C0A;}
    .hero-eye{font-size:10px;letter-spacing:.18em;color:#B0ADA6;margin-bottom:16px;}
    .hero-h1{font-family:var(--cond);font-weight:900;font-size:clamp(42px,9vw,100px);line-height:.88;color:var(--text);margin-bottom:22px;}
    .hero-h1 em{font-style:normal;color:var(--gold);}
    .hero-p{font-size:13px;line-height:1.8;color:#C4C1BA;max-width:520px;margin:0 auto 20px;}
    .hero-stats{display:flex;gap:0;justify-content:center;margin:20px auto;max-width:480px;border:1px solid rgba(234,232,224,.1);border-radius:10px;overflow:hidden;}
    .hstat{flex:1;padding:14px 10px;text-align:center;border-right:1px solid rgba(234,232,224,.1);}
    .hstat:last-child{border-right:none;}
    .hstat-n{display:block;font-family:var(--cond);font-size:clamp(16px,4vw,24px);font-weight:900;color:var(--gold);}
    .hstat-l{display:block;font-size:9px;color:#7E7C77;letter-spacing:.1em;margin-top:2px;}
    .hero-p strong{color:var(--text);}
    .hero-ctas{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;}
    .cta{background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:800;font-size:17px;letter-spacing:.05em;padding:15px 36px;border-radius:6px;cursor:pointer;transition:all .15s;box-shadow:0 4px 24px rgba(27,122,68,.5);}
    .cta:hover{background:var(--green2);transform:translateY(-1px);}
    .cta--ghost{background:transparent;border:1.5px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:12px;}
    .cta--launch{font-size:20px;padding:18px 40px;width:100%;max-width:400px;box-shadow:0 6px 32px rgba(27,122,68,.6);animation:pulse 2s ease-in-out infinite;}
    @keyframes pulse{0%,100%{box-shadow:0 6px 32px rgba(27,122,68,.6);}50%{box-shadow:0 6px 48px rgba(27,122,68,.9);}}
    .cta--ghost:hover{border-color:var(--gold);color:var(--gold);transform:none;box-shadow:none;background:transparent;}
    .hero-badges{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;}
    .hbadge{font-size:10px;padding:4px 9px;border:1px solid rgba(234,232,224,.15);border-radius:20px;color:rgba(234,232,224,.65);}

    /* SECTIONS */
    .section{padding:44px 20px;border-top:1px solid rgba(234,232,224,.14);background:#080C0A;}
    .section--dark{background:var(--bg2);border-top:1px solid rgba(234,232,224,.07);}
    .section-inner{max-width:820px;margin:0 auto;}
    .section-lbl{font-size:9px;letter-spacing:.2em;color:#C4C1BA;text-transform:uppercase;margin-bottom:10px;}
    .section-desc{font-size:12px;color:#B0ADA6;line-height:1.7;margin-bottom:22px;}

    /* 1980 CALC */
    .calc80{}
    .c80-tabs{display:flex;gap:7px;margin-bottom:14px;flex-wrap:wrap;}
    .c80tab{padding:7px 13px;border-radius:5px;border:1.5px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s;}
    .c80tab:hover,.c80tab--on{border-color:var(--gold);color:var(--gold);}
    .c80tab--on{background:rgba(232,200,74,.07);}
    .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:6px;border:1px solid var(--border);}
    .tbl-head{display:grid;grid-template-columns:1fr 72px 72px 52px;gap:4px;padding:5px 8px;font-size:9px;letter-spacing:.18em;color:var(--muted);border-bottom:1px solid var(--border);}
    .tbl-row{display:grid;grid-template-columns:1fr 72px 72px 52px;gap:4px;padding:8px;border-bottom:1px solid rgba(255,255,255,.04);align-items:center;}
    @media(max-width:420px){.tbl-head,.tbl-row{grid-template-columns:1fr 62px 62px;} .tbl-head span:last-child,.tbl-mult{display:none;}}
    .tbl-row:hover{background:rgba(255,255,255,.02);}
    .tbl-row--pain{background:rgba(220,53,40,.04);}
    .tbl-row--albo{background:rgba(232,200,74,.05);border-color:rgba(232,200,74,.1);}
    .tbl-item{display:flex;align-items:center;gap:5px;font-size:11px;}
    @media(max-width:420px){.tbl-item{font-size:10px;} .tbl-old,.tbl-new{font-size:10px;}}
    .tbl-em{font-size:15px;}
    .tbl-old{font-size:11px;color:#4ade80;font-family:var(--mono);}
    .tbl-new{font-size:11px;color:var(--red);font-family:var(--mono);}
    .tbl-row--albo .tbl-new{color:var(--gold);}
    .tbl-mult{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--muted);}
    .tbl-mult--pain{color:var(--red);}
    .tbl-mult--albo{color:var(--gold);font-size:10px;}
    .tbl-note{font-size:9px;color:rgba(234,232,224,.4);margin-top:8px;text-align:center;}
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
    .albo-sub{font-size:11px;color:#A8A5A0;line-height:1.6;}
    .albo-sub strong{color:var(--text);}

    /* DONATIONS */
    .donations{background:rgba(232,200,74,.04);border-top:1px solid rgba(232,200,74,.15);border-bottom:1px solid rgba(232,200,74,.15);padding:44px 20px;}
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
    .don-tag{font-size:10px;letter-spacing:0;color:var(--muted);font-family:var(--cond);font-weight:400;}
    .don-setup{font-size:11px;color:var(--muted);line-height:1.7;background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:14px;text-align:left;}
    .don-setup strong{color:var(--text);}
    .don-link{color:var(--green2);text-decoration:underline;}


    /* CARICATURES */
    .caric{width:100%;height:auto;border-radius:12px;display:block;}
    .caric-row{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;max-width:700px;margin:28px auto 0;padding:0 16px;background:#080C0A;}
    .caric-card{text-align:center;background:#080C0A;}
    .caric-name{font-family:var(--cond);font-size:15px;font-weight:900;color:var(--gold);margin:8px 0 4px;letter-spacing:.05em;}
    .caric-fact{font-size:10px;color:#A8A5A0;line-height:1.6;margin-bottom:8px;}
    .caric-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:10px;padding:5px 10px;border-radius:4px;cursor:pointer;transition:all .15s;}
    .caric-btn:hover{border-color:var(--gold);color:var(--gold);}
    .vs-block{text-align:center;padding:12px;}
    .vs-text{font-family:var(--cond);font-size:36px;font-weight:900;color:var(--text);line-height:1;}
    .vs-sub{font-size:9px;color:var(--muted);letter-spacing:.2em;margin-bottom:8px;}
    .vs-balance{font-family:var(--cond);font-size:18px;font-weight:900;color:var(--green2);line-height:1.2;}
    .vs-balance span{font-size:9px;color:var(--muted);font-family:var(--mono);}

    /* TABS */
    .ltabs{display:flex;overflow-x:auto;border-bottom:1px solid rgba(234,232,224,.14);background:#141A12;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
    .ltabs::-webkit-scrollbar{display:none;}
    .ltab{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 14px;border:none;background:transparent;color:var(--muted);font-family:var(--mono);font-size:9px;letter-spacing:.1em;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;flex-shrink:0;}
    .ltab:hover{color:var(--text);}
    .ltab--on{color:var(--gold);border-bottom-color:var(--gold);}
    .ltab-icon{font-size:16px;}
    .ltab-lbl{letter-spacing:.12em;text-transform:uppercase;}

    /* TAB CONTENT */
    .tc{min-height:60vh;background:#080C0A;}
    .tc-section{max-width:820px;margin:0 auto;padding:36px 16px;background:#080C0A;}
    .tc-section--hero{background:#080C0A;}
    .tc-section--gold{background:rgba(232,200,74,.03);}
    .tc-lbl{font-size:9px;letter-spacing:.22em;color:#C4C1BA;text-transform:uppercase;margin-bottom:8px;}
    .tc-sub{font-size:12px;color:#B0ADA6;line-height:1.7;margin-bottom:20px;}

    /* BUDGET CARDS */
    .budget-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:16px 0 28px;}
    .bcard{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;}
    .bcard--red{border-color:rgba(220,53,40,.3);background:rgba(220,53,40,.05);}
    .bcard--gold{border-color:rgba(232,200,74,.3);background:rgba(232,200,74,.05);}
    .bcard--muted{border-color:var(--border);}
    .bcard-n{font-family:var(--cond);font-size:clamp(18px,4vw,28px);font-weight:900;color:var(--text);margin-bottom:4px;}
    .bcard--red .bcard-n{color:var(--red);}
    .bcard--gold .bcard-n{color:var(--gold);}
    .bcard-label{font-family:var(--cond);font-size:13px;font-weight:700;color:var(--text);margin-bottom:6px;}
    .bcard-sub{font-size:10px;color:#A8A5A0;line-height:1.5;}

    /* JOKE SHARE */
    .joke-body{display:flex;align-items:flex-start;gap:10px;flex:1;}
    .joke-share{background:transparent;border:1px solid var(--border);color:var(--muted);font-size:11px;padding:4px 8px;border-radius:4px;cursor:pointer;flex-shrink:0;transition:all .15s;}
    .joke-share:hover{border-color:rgba(29,161,242,.5);color:#1da1f2;}

    /* ALBO FEATURE */
    .albo-feature{display:grid;grid-template-columns:160px 1fr;gap:20px;align-items:start;margin:16px 0 24px;}
    @media(max-width:480px){.albo-feature{grid-template-columns:1fr;};}
    .albo-feat-caric{width:160px;}
    .albo-feat-h2{font-family:var(--cond);font-size:clamp(20px,4vw,30px);font-weight:900;color:var(--gold);margin-bottom:12px;}
    .albo-facts-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
    .albo-fact{display:flex;gap:10px;font-size:11px;color:#D8D5CE;align-items:flex-start;}
    .albo-fact span:first-child{font-size:15px;flex-shrink:0;}
    .albo-badges-section{margin-top:28px;}
    .badge-preview--gold{border-color:rgba(232,200,74,.2)!important;}

    /* PRICES FEATURE */
    .prices-feature{display:grid;grid-template-columns:160px 1fr;gap:20px;align-items:start;margin:16px 0 24px;}
    @media(max-width:480px){.prices-feature{grid-template-columns:1fr;};}
    .prices-caric{width:160px;text-align:center;}
    .prices-calc{flex:1;}

    /* TWEET CTA */
    .tweet-cta{text-align:center;margin-top:24px;}

    /* BIG CTA */
    .cta--big{font-size:18px;padding:16px 40px;width:100%;max-width:420px;display:block;margin:0 auto 16px;}

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
    .footer{background:#141A12;border-top:1px solid rgba(234,232,224,.14);padding:26px 20px;text-align:center;}
    .ft-logo{font-family:var(--cond);font-size:18px;font-weight:900;color:var(--gold);margin-bottom:10px;}
    .ft-links{display:flex;gap:14px;justify-content:center;margin-bottom:10px;}
    .ft-links button{background:none;border:none;color:var(--muted);font-family:var(--mono);font-size:12px;cursor:pointer;text-decoration:underline;}
    .ft-links button:hover{color:var(--gold);}
    .ft-legal{font-size:9px;color:rgba(234,232,224,.45);line-height:1.8;max-width:520px;margin:0 auto;}

    /* GAME */
    .game-page{min-height:100vh;display:flex;flex-direction:column;background:#080C0A;}
    .mob-tabs{display:flex;border-bottom:1px solid var(--border);}
    .mob-tab{flex:1;padding:11px;background:none;border:none;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;border-bottom:2px solid transparent;transition:all .12s;}
    .mob-tab--on{color:var(--gold);border-bottom-color:var(--gold);}
    .game-grid{display:grid;grid-template-columns:1fr;flex:1;}
    @media(min-width:860px){
      .mob-tabs{display:none;}
      .game-grid{grid-template-columns:370px 210px 1fr;}
      .flip-col--hidden,.board-col--hidden,.chat-col--hidden{display:flex!important;}
    }
    .flip-col{display:flex;flex-direction:column;gap:11px;padding:14px;border-right:1px solid rgba(234,232,224,.14);overflow-y:auto;max-height:calc(100vh - 105px);background:#080C0A;}
    .flip-col--hidden{display:none;}
    .board-col{overflow-y:auto;max-height:calc(100vh - 105px);border-right:1px solid var(--border);}
    .board-col--hidden{display:none;}
    .chat-col{display:flex;flex-direction:column;max-height:calc(100vh - 105px);}
    .chat-col--hidden{display:none;}
    .game-foot{padding:10px 18px;border-top:1px solid var(--border);font-size:9px;color:rgba(234,232,224,.4);text-align:center;}
    .game-foot strong{color:rgba(234,232,224,.32);}
    .guest-note{padding:11px 13px;font-size:10px;color:var(--muted);border-top:1px solid var(--border);}
    .guest-note--cta{background:rgba(232,200,74,.05);border:1px solid rgba(232,200,74,.15);border-radius:8px;margin:12px;padding:14px;text-align:center;}
    .gn-title{font-family:var(--cond);font-size:16px;font-weight:900;color:var(--gold);margin-bottom:5px;}
    .gn-body{font-size:11px;color:#A8A5A0;line-height:1.6;margin-bottom:10px;}
    .gn-btn{width:100%;padding:11px;background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:800;font-size:14px;border-radius:6px;cursor:pointer;letter-spacing:.03em;}
    .gn-btn:hover{background:var(--green2);}
    .signup-sub{display:block;font-size:10px;font-weight:400;font-family:var(--mono);margin-top:4px;opacity:.8;}

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
    .flip-share-btn{display:block;width:100%;margin-top:8px;padding:7px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);border-radius:5px;color:#4ade80;font-family:var(--cond);font-size:12px;font-weight:700;cursor:pointer;transition:all .12s;}
    .flip-share-btn:hover{background:rgba(74,222,128,.2);}
    .flip-signup-btn{display:block;width:100%;margin-top:8px;padding:12px 10px;background:rgba(232,200,74,.1);border:2px solid rgba(232,200,74,.5);border-radius:7px;color:var(--gold);font-family:var(--cond);font-size:14px;font-weight:800;cursor:pointer;transition:all .12s;text-align:center;}
    .flip-signup-btn:hover{background:rgba(232,200,74,.15);border-color:var(--gold);}
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
    .pick{padding:18px 10px;border-radius:10px;border:2px solid rgba(234,232,224,.18);background:rgba(255,255,255,.03);color:#B0ADA6;font-family:var(--cond);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px;}
    .pick-em{font-size:36px;line-height:1;}
    .pick-lbl{font-size:13px;font-weight:800;letter-spacing:.12em;}
    .pick-confirm{text-align:center;font-family:var(--cond);font-size:14px;color:#B0ADA6;padding:6px 0 2px;}
    .pick-confirm strong{color:var(--gold);}
    .pick:hover{border-color:rgba(232,200,74,.4);color:var(--gold);}
    .pick--on{border-color:var(--gold)!important;color:var(--gold)!important;background:rgba(232,200,74,.12)!important;box-shadow:0 0 20px rgba(232,200,74,.2);}

    .stakes-row{display:flex;gap:5px;flex-wrap:wrap;}
    /* BET UI */
    .bet-display{display:flex;align-items:center;background:#141A12;border:3px solid var(--gold);border-radius:10px;padding:10px 16px;margin-bottom:10px;gap:6px;box-shadow:0 0 24px rgba(232,200,74,.25),inset 0 0 20px rgba(232,200,74,.05);}
    .bet-currency{font-family:var(--cond);font-size:32px;font-weight:900;color:var(--gold);}
    .bet-input{flex:1;background:transparent;border:none;outline:none;font-family:var(--cond);font-size:40px;font-weight:900;color:#EAE8E0;width:100%;min-width:0;}
    .bet-input::-webkit-inner-spin-button,.bet-input::-webkit-outer-spin-button{-webkit-appearance:none;}
    .bet-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px;}
    .bp-btn{padding:10px 4px;border-radius:6px;border:1.5px solid rgba(234,232,224,.2);background:rgba(255,255,255,.03);color:#B0ADA6;font-family:var(--cond);font-size:15px;font-weight:700;cursor:pointer;transition:all .12s;}
    .bp-btn:hover{border-color:rgba(232,200,74,.5);color:var(--gold);background:rgba(232,200,74,.06);}
    .bp-btn--on{border-color:var(--gold);color:#080C0A;background:var(--gold);font-weight:900;}
    .bet-adj{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px;}
    .adj-btn{padding:7px 11px;border-radius:5px;border:1px solid rgba(234,232,224,.14);background:transparent;color:#B0ADA6;font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s;flex:1;}
    .adj-btn:hover{border-color:rgba(232,200,74,.4);color:var(--gold);}
    .stake-btn{padding:6px 10px;border-radius:4px;border:1.5px solid var(--border);background:transparent;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .12s;}
    .stake-btn:hover,.stake-btn--on{border-color:var(--gold);color:var(--gold);}
    .stake-btn--on{background:rgba(232,200,74,.07);}
    .cust-inp{width:100%;background:#141A12;border:1.5px solid rgba(234,232,224,.2);border-radius:5px;padding:7px 10px;color:#EAE8E0;font-family:var(--mono);font-size:12px;outline:none;transition:border .12s;}
    .cust-inp:focus{border-color:var(--gold);}
    .cust-inp::placeholder{color:rgba(234,232,224,.45);}
    .flip-btn{width:100%;padding:16px;background:var(--green);border:3px solid var(--green2);color:#fff;font-family:var(--cond);font-weight:900;font-size:18px;letter-spacing:.06em;border-radius:8px;cursor:pointer;transition:all .15s;box-shadow:0 6px 24px rgba(27,122,68,.5);}
    .flip-btn:hover:not(:disabled){background:var(--green2);transform:translateY(-1px);}
    .flip-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}
    .flip-hint{width:100%;padding:14px;text-align:center;color:#B0ADA6;font-family:var(--cond);font-size:15px;font-weight:700;border:2px dashed rgba(234,232,224,.15);border-radius:7px;letter-spacing:.05em;}
    .bust-box{text-align:center;padding:20px 10px;background:rgba(220,53,40,.06);border:1px solid rgba(220,53,40,.2);border-radius:10px;}
    .bust-em{font-size:48px;margin-bottom:8px;}
    .bust-title{font-family:var(--cond);font-size:28px;font-weight:900;color:var(--red);letter-spacing:.08em;margin-bottom:6px;}
    .bust-sub{font-size:11px;color:#A8A5A0;line-height:1.6;margin-bottom:14px;}
    .refill-btn{width:100%;padding:13px;background:var(--green);border:none;color:#fff;font-family:var(--cond);font-weight:800;font-size:15px;border-radius:7px;cursor:pointer;letter-spacing:.04em;display:flex;flex-direction:column;align-items:center;gap:3px;}
    .refill-btn:hover{background:var(--green2);}
    .refill-btn--share{background:rgba(232,200,74,.12);border:2px solid var(--gold);color:var(--gold);margin-top:0;}
    .refill-btn--share:hover{background:rgba(232,200,74,.22);}
    .refill-tag{font-size:10px;font-weight:400;opacity:.75;font-family:var(--mono);letter-spacing:0;}
    .bust-or{font-size:11px;color:#7E7C77;margin:10px 0;letter-spacing:.1em;}
    .cooldown-timer{font-family:var(--cond);font-size:48px;font-weight:900;color:var(--gold);letter-spacing:.05em;margin:8px 0;}
    .cooldown-note{font-size:10px;color:#7E7C77;line-height:1.6;margin-top:6px;}
    .refill-share-box{background:rgba(232,200,74,.06);border:1.5px solid rgba(232,200,74,.25);border-radius:8px;padding:14px;text-align:center;}
    .refill-share-lbl{font-family:var(--cond);font-size:16px;font-weight:900;color:var(--gold);margin-bottom:3px;}
    .refill-share-sub{font-size:10px;color:#7E7C77;margin-bottom:12px;letter-spacing:.05em;}
    .refill-social-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
    .social-refill-btn{padding:10px 6px;border-radius:6px;border:1.5px solid;background:transparent;font-family:var(--cond);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:.02em;}
    .social-refill-btn:hover{opacity:.8;background:rgba(255,255,255,.05);}
    .refill-btn:hover{border-color:var(--green2);color:var(--green2);}
    .chips-row{display:flex;gap:4px;flex-wrap:wrap;}
    .chip{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;border:1.5px solid;font-family:var(--mono);}
    .chip-w{border-color:#4ade80;color:#4ade80;}
    .chip-l{border-color:var(--red);color:var(--red);}

    /* REFERRAL */
    .referral-box{background:rgba(232,200,74,.06);border:1.5px solid rgba(232,200,74,.3);border-radius:8px;padding:14px;}
    .ref-lbl{font-family:var(--cond);font-size:14px;font-weight:900;color:var(--gold);letter-spacing:.04em;margin-bottom:4px;}
    .ref-sub{font-size:10px;color:#A8A5A0;line-height:1.5;margin-bottom:10px;}
    .ref-link-row{display:flex;gap:6px;align-items:center;margin-bottom:8px;}
    .ref-link{flex:1;background:#080C0A;border:1px solid rgba(232,200,74,.2);border-radius:5px;padding:7px 9px;font-family:var(--mono);font-size:10px;color:var(--gold);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .ref-copy{padding:7px 12px;background:var(--gold);border:none;color:#080C0A;font-family:var(--cond);font-size:12px;font-weight:900;border-radius:5px;cursor:pointer;flex-shrink:0;}
    .ref-social-row{display:flex;gap:6px;margin-bottom:8px;}
    .ref-social-btn{flex:1;padding:8px 4px;border-radius:5px;border:1.5px solid;background:transparent;font-family:var(--cond);font-size:12px;font-weight:700;cursor:pointer;transition:all .12s;}
    .ref-tw{border-color:rgba(29,161,242,.4);color:#1da1f2;}
    .ref-fb{border-color:rgba(24,119,242,.4);color:#1877f2;}
    .ref-rd{border-color:rgba(255,86,0,.4);color:#ff5600;}
    .ref-count{font-size:11px;color:var(--green2);font-family:var(--cond);font-weight:700;text-align:center;}
    /* GAME DONATE */
    .gdon{background:rgba(232,200,74,.04);border:1px solid rgba(232,200,74,.1);border-radius:6px;padding:11px;}
    .gdon-lbl{font-size:8px;letter-spacing:.2em;color:var(--muted);margin-bottom:5px;}
    .gdon-pitch{font-size:10px;color:#A8A5A0;line-height:1.5;margin-bottom:8px;}
    .gdon-btns{display:flex;gap:6px;}
    .gdon-btn{flex:1;padding:8px;border-radius:5px;border:1.5px solid rgba(232,200,74,.25);background:transparent;color:var(--gold);font-family:var(--cond);font-size:12px;font-weight:700;cursor:pointer;text-align:center;transition:all .12s;display:block;text-decoration:none;}
    .gdon-btn:hover{background:rgba(232,200,74,.09);}
    .gdon-btn--b{border-color:var(--border);color:var(--muted);}
    .gdon-btn--b:hover{border-color:var(--gold);color:var(--gold);background:transparent;}
    .gdon-note{font-size:8px;color:rgba(234,232,224,.45);margin-top:5px;text-align:center;}

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
    .msg-t{font-size:9px;color:rgba(234,232,224,.45);}
    .msg-txt{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px 10px;font-size:12px;line-height:1.5;}
    .msg--me .msg-txt{background:rgba(232,200,74,.07);border-color:rgba(232,200,74,.13);}
    .chat-in{display:flex;gap:5px;padding:9px 11px;border-top:1px solid var(--border);flex-shrink:0;}
    .chat-inp{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:7px 10px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;transition:border .12s;}
    .chat-inp:focus{border-color:var(--gold);}
    .chat-inp::placeholder{color:rgba(234,232,224,.45);}
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
