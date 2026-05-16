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

// ─── GLOBAL STATS ─────────────────────────────────────────────────────────────
function GlobalStats() {
const [stats, setStats] = useState({players:0, flipped:0, flips:0});
useEffect(()=>{
async function load() {
try {
const {data} = await supabase.from(“profiles”).select(“balance,flips,total_flipped”);
if(!data) return;
setStats({
players: data.length,
flipped: data.reduce((a,r)=>a+(r.total_flipped||0),0),
flips: data.reduce((a,r)=>a+(r.flips||0),0)
});
} catch {}
}
load(); const t=setInterval(load,15000); return()=>clearInterval(t);
},[]);
if(!stats.players) return null;
return (
<div className="global-stats">
<div className="gs-item"><span className="gs-n">{stats.players.toLocaleString(“en-AU”)}</span><span className="gs-l">Australians playing</span></div>
<div className="gs-item"><span className="gs-n">{stats.flips.toLocaleString(“en-AU”)}</span><span className="gs-l">total flips</span></div>
<div className="gs-item"><span className="gs-n">${(stats.flipped/1000000).toFixed(1)}M</span><span className="gs-l">total flipped</span></div>
</div>
);
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed() {
const [items, setItems] = useState([]);
useEffect(()=>{
async function load() {
try {
const {data} = await supabase.from(“activity_feed”).select(”*”).order(“created_at”,{ascending:false}).limit(20);
if(data) setItems(data);
} catch {}
}
load(); const t=setInterval(load,8000); return()=>clearInterval(t);
},[]);
if(!items.length) return null;
const txt = […items,…items].map(i=>i.action).join(”   ·   “);
return (
<div className="ticker-wrap activity-ticker">
<span className="ticker-tag">⚡ LIVE</span>
<div className="ticker-scroll"><span className="ticker-txt">{txt}</span></div>
</div>
);
}

async function logActivity(action) {
try { await supabase.from(“activity_feed”).insert({action}); } catch {}
}

// ─── HOT STREAK MODAL ─────────────────────────────────────────────────────────
function HotStreakModal({ streak, balance, onDouble, onPass }) {
return (
<div className="badge-cel" onClick={onPass}>
<div className=“bcel-inner” onClick={e=>e.stopPropagation()}>
<div className="bcel-em">🔥</div>
<div className="bcel-unlocked">{streak} WINS IN A ROW</div>
<div className="bcel-title">HOT STREAK</div>
<div className="bcel-desc">You’re on fire. The budget isn’t. Double your next bet?</div>
<button className="auth-btn" style={{marginBottom:8}} onClick={onDouble}>🔥 Double Down — bet ${(balance*0.5).toLocaleString(“en-AU”)}</button>
<button className="auth-btn auth-btn--ghost" onClick={onPass}>Stay safe (coward)</button>
</div>
</div>
);
}

// ─── DONATIONS WALL ───────────────────────────────────────────────────────────
function DonationsWall() {
const [donors, setDonors] = useState([]);
useEffect(()=>{
async function load() {
try {
const {data} = await supabase.from(“donations”).select(”*”).order(“created_at”,{ascending:false}).limit(20);
if(data) setDonors(data);
} catch {}
}
load();
},[]);
return (
<div className="don-wall">
<div className="don-wall-title">🇦🇺 WALL OF PATRIOTS</div>
<div className="don-wall-sub">Australians who funded this satire</div>
{!donors.length && <div className="don-wall-empty">Be the first. Your name lives here forever.</div>}
{donors.map((d,i)=>(
<div key={d.id||i} className="don-wall-item">
<span className="don-wall-icon">{d.amount_aud>=20?“☕☕”:“☕”}</span>
<div className="don-wall-info">
<span className="don-wall-name">{d.donor_name||“Anonymous”}</span>
{d.message && <span className="don-wall-msg">”{d.message}”</span>}
</div>
{d.amount_aud && <span className="don-wall-amt">${d.amount_aud}</span>}
</div>
))}
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
This one’s for the 26-year-old eating toast for dinner because rent took everything.
For the couple who did everything right and still can’t save a deposit.
For the family that skipped the school excursion this year.
For everyone Jim Chalmers mentioned in his budget speech and immediately forgot about.
<br/><br/>Keep the satire alive.
</p>
<p className="don-legal">(Satirical site. Donations go toward hosting costs and general bewilderment at Australian property prices.)</p>
<div className="don-currency">
<span className="don-currency-flag">🇦🇺🇳🇿</span>
<span className="don-currency-txt">
We accept donations in <strong>AUD or NZD</strong> — because at least one of those is a stable currency right now, and we’re not naming names, Jim.
</span>
</div>
<div className="don-btns">
<a className="don-btn don-btn--kofi" href="https://ko-fi.com/queeflatinah" target="_blank" rel="noopener noreferrer">
☕ Support on Ko-fi
<span className="don-tag">0% platform fee</span>
</a>
<a className="don-btn don-btn--bmc" href="https://buymeacoffee.com/queeflatinah" target="_blank" rel="noopener noreferrer">
🍺 Buy Me a Tinny
<span className="don-tag">5% platform fee</span>
</a>
</div>
<DonationsWall/>

```
  </div>
</div>
```

);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onSignIn, onGuest, guestBalance }) {
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
  <div className="auth-divider" style={{marginTop:0,marginBottom:16}}>— save your progress &amp; join the leaderboard —</div>

  <div className="auth-card">
    <div className="auth-lbl">PICK A NAME. KEEP YOUR SCORE.</div>
    {guestBalance && guestBalance > STARTING && (
      <div className="auth-balance-alert">
        💰 You have <strong>${guestBalance.toLocaleString("en-AU")}</strong> to save — don't lose it!
      </div>
    )}
    <input className="auth-inp" placeholder="Username (e.g. ChalmersBuster99)…" value={name}
      onChange={e=>{setName(e.target.value);setError("");}}
      onKeyDown={e=>e.key==="Enter"&&handleSignIn()} maxLength={20} autoFocus/>
    <input className="auth-inp" placeholder="Email (optional — to recover your account)" value={email||""}
      onChange={e=>setEmail(e.target.value)} type="email"/>
    {error && <div className="auth-err">{error}</div>}
    <button className="auth-btn" disabled={!name.trim()||loading} onClick={handleSignIn}>
      {loading?"Saving…":"Save My Progress & Keep My Balance →"}
    </button>
    <div className="auth-hint">Your current balance will be saved · appears on leaderboard · email optional</div>
    <button className="auth-back" onClick={()=>window.history.back()}>← Back to site</button>
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

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed() {
const [items, setItems] = useState([]);
useEffect(() => {
async function load() {
try {
const { data } = await supabase.from(“activity_feed”)
.select(”*”).order(“created_at”,{ascending:false}).limit(20);
if (data) setItems(data);
} catch {}
}
load();
const t = setInterval(load, 6000);
return () => clearInterval(t);
}, []);
if (!items.length) return null;
const txt = […items,…items].map(i=>i.action).join(”   ·   “);
return (
<div className="activity-wrap">
<span className="activity-tag">⚡ LIVE</span>
<div className="activity-scroll">
<span className="activity-txt">{txt}</span>
</div>
</div>
);
}

// ─── GLOBAL STATS ─────────────────────────────────────────────────────────────
function GlobalStats() {
const [stats, setStats] = useState({players:0,flipped:0});
useEffect(() => {
async function load() {
try {
const { data } = await supabase.from(“profiles”).select(“flips,total_flipped,balance”);
if (data) {
const players = data.length;
const flipped = data.reduce((s,r)=>s+(r.total_flipped||0),0);
setStats({players, flipped});
}
} catch {}
}
load();
const t = setInterval(load, 15000);
return () => clearInterval(t);
}, []);
if (!stats.players) return null;
return (
<div className="global-stats">
<div className="gstat"><span className="gstat-n">{stats.players.toLocaleString(“en-AU”)}</span><span className="gstat-l">Australians playing</span></div>
<div className="gstat-div"/>
<div className="gstat"><span className="gstat-n">${(stats.flipped/1000000).toFixed(1)}M</span><span className="gstat-l">total flipped</span></div>
</div>
);
}

// ─── HOT STREAK MODAL ─────────────────────────────────────────────────────────
function HotStreakModal({ streak, balance, onDouble, onPass }) {
return (
<div className="streak-modal">
<div className="streak-inner">
<div className="streak-fire">🔥</div>
<div className="streak-title">{streak} IN A ROW.</div>
<div className="streak-sub">You’re hot. Double your next bet?</div>
<div className="streak-bal">Current balance: <strong>${balance.toLocaleString(“en-AU”)}</strong></div>
<button className="streak-yes" onClick={onDouble}>🎲 DOUBLE DOWN</button>
<button className="streak-no" onClick={onPass}>Play it safe</button>
</div>
</div>
);
}

// ─── DONATIONS WALL ───────────────────────────────────────────────────────────
function DonationsWall() {
const [donors, setDonors] = useState([]);
useEffect(() => {
async function load() {
try {
const { data } = await supabase.from(“donations”)
.select(”*”).order(“created_at”,{ascending:false}).limit(20);
if (data) setDonors(data);
} catch {}
}
load();
}, []);
return (
<div className="don-wall">
<div className="don-wall-title">🇦🇺 PATRIOTS WHO FUNDED THIS SATIRE</div>
{!donors.length && <div className="don-wall-empty">Be the first. Your name goes here forever.</div>}
{donors.map((d,i)=>(
<div key={d.id||i} className="don-wall-item">
<span className="don-wall-em">☕</span>
<div>
<div className="don-wall-name">{d.donor_name||“Anonymous”}{d.amount_aud?` · $${d.amount_aud}`:””}</div>
{d.message && <div className="don-wall-msg">”{d.message}”</div>}
</div>
</div>
))}
</div>
);
}

// ─── PLAYER CARD ──────────────────────────────────────────────────────────────
function PlayerCard({ profile, onClose }) {
const pct = ((profile.balance/4300000)*100).toFixed(1);
const txt = `🎲 DOUBLE DOWN\n${profile.name}\nBalance: $${profile.balance.toLocaleString("en-AU")}\nThat's ${pct}% of Albo's $4.3M beach house\n${profile.flips} flips · doubledown.au`;
return (
<div className="pcard-wrap" onClick={onClose}>
<div className=“pcard” onClick={e=>e.stopPropagation()}>
<div className="pcard-logo">🎲 DOUBLE DOWN</div>
<div className="pcard-name">{profile.name}</div>
<div className="pcard-bal">${profile.balance.toLocaleString(“en-AU”)}</div>
<div className="pcard-pct">{pct}% of Albo’s beach house 🏖️</div>
<div className="pcard-flips">{profile.flips} flips · {profile.wins} wins</div>
<div className="pcard-url">doubledown.au</div>
<div className="pcard-btns">
<button className=“pcard-tw” onClick={()=>{
window.open(“https://twitter.com/intent/tweet?text=”+encodeURIComponent(txt),”_blank”);
}}>𝕏 Share</button>
<button className=“pcard-cp” onClick={()=>{ navigator.clipboard.writeText(txt).catch(()=>{}); }}>Copy</button>
<button className="pcard-close" onClick={onClose}>Close</button>
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
const [hotStreak, setHotStreak] = useState(0);
const [showHotStreak, setShowHotStreak] = useState(false);
const [hotDoubleBet, setHotDoubleBet] = useState(false);
const [showStreak, setShowStreak] = useState(false);
const [showCard, setShowCard] = useState(false);
const prevBadgeIds = useRef(getEarnedBadges(user).map(b=>b.id));

const baseEff = Math.min(Math.max(1, Math.floor(+(custom||stake)||1)), profile.balance);
const eff = hotDoubleBet ? Math.min(profile.balance, baseEff*2) : baseEff;
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
setPhase(“spin”); setResult(null); setOutcome(null); setFlipMsg(null); setHotDoubleBet(false);
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
// Daily streak
const today = new Date().toISOString().slice(0,10);
const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
const newStreak = won ? (profile.lastPlayDate===yesterday||(profile.streak||0)>0&&profile.lastPlayDate===today ? (profile.streak||0)+1 : 1) : 0;
updated.streak = newStreak;
updated.lastPlayDate = today;
updated.total_flipped = (profile.total_flipped||0) + eff;
// Log activity
const pName = isGuest ? “Guest” : profile.name;
if (won) {
if (nb >= 4300000) logActivity(`🏖️ ${pName} just earned Albo's beach house!`);
else if (nb >= 1000000) logActivity(`💰 ${pName} just hit $${(nb/1000000).toFixed(1)}M`);
else if (eff >= 50000) logActivity(`🎉 ${pName} won $${fmtN(eff)}`);
} else {
if (nb <= 0) logActivity(`💸 ${pName} just went COOKED`);
}
// Hot streak
if (won) {
const newHS = hotStreak + 1;
setHotStreak(newHS);
if (newHS >= 3 && newHS % 3 === 0) setShowHotStreak(true);
} else {
setHotStreak(0);
}
const rLabel = r===“H” ? “🦅 HEADS” : “🦘 TAILS”;
setFlipMsg(won
? `+$${fmtN(eff)} — ${nb>=ALBO?`🏖️ ${(nb/ALBO).toFixed(1)}× Albo’s house!`:`${rLabel} — you win!`}`
: `-$${fmtN(eff)} — ${rLabel} — you lose.`
);
// Daily streak + total flipped
const today = new Date().toISOString().slice(0,10);
updated.streak = won ? ((profile.streak||0)+1) : 0;
updated.last_play_date = today;
updated.total_flipped = (profile.total_flipped||0) + eff;
setProfile(updated);
if (won && updated.streak >= 3) setShowStreak(true);
if (won && updated.balance >= ALBO && profile.balance < ALBO) setShowCard(true);
try {
const name = isGuest ? “Guest” : profile.name;
const action = won
? `${name} won $${fmtN(eff)}${updated.balance>=ALBO?" 🏖️":""}  — balance $${fmtN(updated.balance)}`
: `${name} lost $${fmtN(eff)} — balance $${fmtN(updated.balance)}`;
supabase.from(“activity_feed”).insert({player_name:name,action,amount:won?eff:-eff}).then(()=>{});
} catch {}
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
{showStreak && <HotStreakModal streak={profile.streak||0} balance={profile.balance}
onDouble={()=>{ setCustom(String(Math.min(profile.balance,(+(custom||stake)||0)*2||1000))); setShowStreak(false); }}
onPass={()=>setShowStreak(false)}/>}
{showCard && <PlayerCard profile={profile} onClose={()=>setShowCard(false)}/>}
{celebBadge && <BadgeCelebration badge={celebBadge} onDone={()=>setCelebBadge(null)}/>}
{showHotStreak && <HotStreakModal streak={hotStreak} balance={profile.balance} onDouble={()=>{setShowHotStreak(false);setHotDoubleBet(true);}} onPass={()=>setShowHotStreak(false)}/>}

```
  <nav className="nav">
    <button className="nav-back" onClick={onBack}>← Back</button>
    <div className="nav-logo">🎲 DOUBLE DOWN</div>
    <div className="nav-r">
      {topHouse && <span className="nav-house" title={topHouse.label}>{topHouse.emoji}</span>}
      {!isGuest && <span className="nav-user">{profile.name}</span>}
      {isGuest && <span className="nav-guest">Guest</span>}
      <a className="nav-donate" href="https://ko-fi.com/queeflatinah" target="_blank" rel="noopener noreferrer">☕ Donate</a>
      <button className="nav-share" onClick={doShare}>{shared?"✅":"Share"}</button>
    </div>
  </nav>

  <DeficitCounter/>
  <LeaderTicker/>
  <ActivityFeed/>
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
      {profile.streak>=3 && <div className="streak-bar">🔥 {profile.streak}-flip hot streak</div>}
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
          {outcome==="win" && <button className="flip-card-btn" onClick={()=>setShowCard(true)}>🃏 Share your player card</button>}
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
          <a className="gdon-btn" href="https://ko-fi.com/queeflatinah" target="_blank" rel="noopener noreferrer">☕ Ko-fi (0% fee)</a>
          <a className="gdon-btn gdon-btn--b" href="https://buymeacoffee.com/queeflatinah" target="_blank" rel="noopener noreferrer">🍺 BMC (5% fee)</a>
        </div>

      </div>
    </div>

    {/* LEADERBOARD */}
    <div className={`board-col${tab!=="board"?" board-col--hidden":""}`}>
      <RecentFlips/>
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
const [showStreak, setShowStreak] = useState(false);
const [showCard, setShowCard] = useState(false);

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
<a className="nav-donate" href="https://ko-fi.com/queeflatinah" target="_blank" rel="noopener noreferrer">☕ Donate</a>
<button className="nav-share" onClick={doShare}>{shared ? “✅” : “Share”}</button>
</div>
</nav>

```
  {/* LIVE DEFICIT TICKER */}
  <DeficitCounter/>
  <LeaderTicker/>
  <ActivityFeed/>
  <GlobalStats/>

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
```

// ─── RECENT FLIPS FEED ────────────────────────────────────────────────────────
function RecentFlips() {
const [flips, setFlips] = useState([]);
useEffect(()=>{
async function load() {
try {
const {data} = await supabase.from(“activity_feed”)
.select(”*”).order(“created_at”,{ascending:false}).limit(10);
if(data) setFlips(data);
} catch {}
}
load(); const t=setInterval(load,5000); return()=>clearInterval(t);
},[]);
if(!flips.length) return null;
return (
<div className="recent-flips-feed">
<div className="rf-title">⚡ LIVE FLIPS</div>
{flips.map((f,i)=>(
<div key={f.id||i} className="rf-item">
<span className="rf-action">{f.action}</span>
<span className="rf-time">{timeAgo(f.created_at)}</span>
</div>
))}
</div>
);
}

function timeAgo(ts) {
const s = Math.floor((Date.now() - new Date(ts).getTime())/1000);
if(s<60) return `${s}s ago`;
if(s<3600) return `${Math.floor(s/60)}m ago`;
return `${Math.floor(s/3600)}h ago`;
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

function handleSignIn(p) {
// Preserve guest balance when signing up from game
if (isGuest && user && user.balance > STARTING) {
p = {…p, balance: user.balance, flips: user.flips||0, wins: user.wins||0, lowestEver: user.lowestEver||user.balance};
persist(p);
}
setUser(p); setIsGuest(false); setPage(“game”);
}

function handleGuest() {
setUser({name:“Guest”,balance:STARTING,flips:0,wins:0,lowestEver:STARTING,createdAt:Date.now()});
setIsGuest(true);
setPage(“game”);
}

function handleBack() {
// Go straight to auth signup page, NOT landing
// Keep user state so guestBalance can be passed to Auth
setPage(“auth”);
setIsGuest(false);
}

return (
<>
{page===“land” && <Landing onPlay={()=>setPage(“auth”)}/>}
{page===“auth” && <Auth onSignIn={handleSignIn} onGuest={handleGuest} guestBalance={isGuest&&user?user.balance:null}/>}
{page===“game” && user && <Game user={user} isGuest={isGuest} onBack={handleBack} onUpdate={p=>setUser(p)}/>}
</>
);
}
