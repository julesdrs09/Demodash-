import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── Status Bar iOS ────────────────────────────────────────────────────────────
function StatusBar({ dark = true }) {
  const [time, setTime]     = useState(new Date());
  const [battery, setBattery] = useState(62);
  const [signal, setSignal]   = useState(3);

  // Couleur basée sur l'heure — change chaque heure, stable dans l'heure
  const battColor = new Date().getHours() % 2 === 0 ? "#f5c400" : (dark ? "#fff" : "#1a1a1a");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setInterval(() => setBattery(p => Math.max(15, Math.min(99, p + (Math.random()>0.7?-1:0)))), 60000);
    const s = setInterval(() => setSignal(Math.random()>0.8 ? 2+Math.floor(Math.random()*2) : 3), 30000);
    return () => { clearInterval(t); clearInterval(b); clearInterval(s); };
  }, []);

  const h = String(time.getHours()).padStart(2,"0");
  const m = String(time.getMinutes()).padStart(2,"0");
  const c = dark ? "#fff" : "#000";

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 22px 4px",pointerEvents:"none"}}>
      <span style={{color:c,fontSize:17,fontWeight:600}}>{h}:{m}</span>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {/* Barres signal */}
        <div style={{display:"flex",alignItems:"flex-end",gap:"2.5px"}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{width:"3px",height:`${(i+1)*3+2}px`,borderRadius:"1.5px",background:i<signal?c:`${c}40`}}/>
          ))}
        </div>
        <span style={{color:c,fontSize:13,fontWeight:600}}>5G</span>
        {/* Batterie jaune iOS */}
        <div style={{display:"flex",alignItems:"center",gap:"1.5px"}}>
          <div style={{width:26,height:13,border:`1.5px solid ${c}88`,borderRadius:4,padding:"1.5px",display:"flex",alignItems:"stretch"}}>
            <div style={{width:`${battery}%`,background:battColor,borderRadius:2}}/>
          </div>
          <div style={{width:2,height:6,background:`${c}55`,borderRadius:"0 1px 1px 0"}}/>
        </div>
      </div>
    </div>
  );
}


// ── Notifications Web Push ────────────────────────────────────────────────────
const canNotif = () => typeof window !== "undefined" && "Notification" in window;

async function requestNotifPermission() {
  if (!canNotif()) return false;
  if (window.Notification.permission === "granted") return true;
  if (window.Notification.permission === "denied") return false;
  const perm = await window.Notification.requestPermission();
  return perm === "granted";
}

function sendSaleNotif({ prenom, produit, prix, extra="" }) {
  if (!canNotif() || window.Notification.permission !== "granted") return;
  try {
    new window.Notification("🎉 You made a sale!", {
      body: `${prenom} bought ${produit}${extra ? ` ${extra}` : ""} for €${Number(prix).toFixed(2)}`,
      tag: "sale-" + Date.now(),
    });
  } catch(e) { console.log("Notif error:", e); }
}

function getNotifPermission() {
  if (!canNotif()) return "unavailable";
  return window.Notification.permission;
}


const Icon = ({ name, size = 24, color = "#555", active = false }) => {
  const c = color;
  const icons = {

    // Maison Stripe : contour + fenêtre intérieure carrée
    home: active ? (
      <>
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5z" fill={c}/>
        <rect x="9" y="13" width="6" height="8" rx="0.5" fill="#0d0d14"/>
      </>
    ) : (
      <>
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5z" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
        <rect x="9" y="13" width="6" height="8" rx="0.5" stroke={c} strokeWidth="1.4" fill="none"/>
      </>
    ),

    // Paiements Stripe : terminal/écran avec "0" + feuilles empilées derrière
    payments: (
      <>
        {/* Feuilles derrière */}
        <rect x="5" y="4" width="13" height="10" rx="1.5" stroke={c} strokeWidth="1.4" fill="none"/>
        <rect x="3" y="6" width="13" height="10" rx="1.5" stroke={c} strokeWidth="1.4" fill="none"/>
        {/* Billet principal */}
        <rect x="2" y="8" width="16" height="10" rx="1.5" stroke={c} strokeWidth="1.5" fill={active?"none":"none"}/>
        {/* "0" au centre */}
        <ellipse cx="10" cy="13" rx="2" ry="2.5" stroke={c} strokeWidth="1.3" fill="none"/>
      </>
    ),

    // Soldes Stripe : portefeuille ouvert avec rabat et point
    balances: (
      <>
        {/* Corps portefeuille */}
        <rect x="2" y="7" width="18" height="13" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
        {/* Rabat supérieur */}
        <path d="M6 7V5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V7" stroke={c} strokeWidth="1.4" fill="none"/>
        {/* Poche intérieure avec point */}
        <rect x="14" y="11" width="6" height="5" rx="1" stroke={c} strokeWidth="1.3" fill="none"/>
        <circle cx="17" cy="13.5" r="1" fill={c}/>
      </>
    ),

    // Clients Stripe : deux silhouettes superposées
    clients: (
      <>
        {/* Personne derrière */}
        <circle cx="15" cy="7" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M18 20c0-3-1.8-5-4.5-5.5" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Personne devant */}
        <circle cx="9" cy="8" r="3.5" stroke={c} strokeWidth="1.5" fill="none"/>
        <path d="M2 21c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>
    ),

    // Rechercher Stripe : loupe simple
    search: (
      <>
        <circle cx="10" cy="10" r="6.5" stroke={c} strokeWidth="1.7" fill="none"/>
        <line x1="15.2" y1="15.2" x2="21" y2="21" stroke={c} strokeWidth="1.9" strokeLinecap="round"/>
      </>
    ),

    // Magasin header
    store: (
      <>
        <path d="M4 9l8-6 8 6v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20V9z" stroke={c} strokeWidth="1.7" fill="none" strokeLinejoin="round"/>
        <rect x="9" y="12" width="6" height="8" rx="1" stroke={c} strokeWidth="1.5" fill="none"/>
      </>
    ),

    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <polyline points="16 17 21 12 16 7" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="21" y1="12" x2="9" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={c} strokeWidth="1.8" fill="none"/>
      </>
    ),
    save: (
      <>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke={c} strokeWidth="1.8" fill="none"/>
        <polyline points="17 21 17 13 7 13 7 21" stroke={c} strokeWidth="1.8" fill="none"/>
        <polyline points="7 3 7 8 15 8" stroke={c} strokeWidth="1.8" fill="none"/>
      </>
    ),
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display:"block"}}>{icons[name]}</svg>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }
function yest()  { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); }
function fmtDateFR(iso) {
  if (!iso) return "—";
  const [,m,d] = iso.split("-");
  const months = ["jan","fév","mars","avr","mai","juin","juil","août","sept","oct","nov","déc"];
  return `${parseInt(d)} ${months[parseInt(m)-1]}`;
}
function fmtEuro(v) {
  if (!v && v!==0) return "0,00 €";
  return Number(v).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
}
function fmtNum(v) { return String(Math.round(v||0)); }

function buildChartData(sales) {
  if (!sales.length) {
    const days=[];
    for(let i=16;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push({day:fmtDateFR(d.toISOString().slice(0,10)),v:0});}
    return days;
  }
  const dates=sales.map(s=>s.date).filter(Boolean).sort();
  const byDay={};
  sales.forEach(s=>{byDay[s.date]=(byDay[s.date]||0)+Number(s.montant||0);});
  const range=[]; const cur=new Date(dates[0]); const max=new Date();
  while(cur<=max){const iso=cur.toISOString().slice(0,10);range.push({day:fmtDateFR(iso),v:Math.round((byDay[iso]||0)*100)/100});cur.setDate(cur.getDate()+1);}
  return range;
}

// ── Encode / Decode sauvegarde ───────────────────────────────────────────────
function encodeSave(data) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }
  catch { return ""; }
}
function decodeSave(code) {
  try { return JSON.parse(decodeURIComponent(escape(atob(code.trim())))); }
  catch { return null; }
}

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen({ onDone, color="#4f46e5", appName="stripe", dark=false }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:"fixed",inset:0,background:color,
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",
      zIndex:999
    }}>
      <div style={{color:dark?"#111":"#fff",fontSize:52,fontWeight:800,letterSpacing:-2}}>
        {appName}
      </div>
      <div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)"}}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .stripe-spinner {
            width:28px;height:28px;
            border:2.5px solid ${dark?"rgba(0,0,0,0.15)":"rgba(255,255,255,0.3)"};
            border-top-color:${dark?"#111":"#fff"};
            border-radius:50%;
            animation:spin 0.8s linear infinite;
          }
        `}</style>
        <div className="stripe-spinner"/>
      </div>
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode]   = useState("choose"); // choose | new | load
  const [code, setCode]   = useState("");
  const [error, setError] = useState("");

  const handleNew = () => {
    const fresh = { sales: [], createdAt: today() };
    onLogin(fresh);
  };

  const handleLoad = () => {
    setError("");
    const data = decodeSave(code);
    if (!data || !Array.isArray(data.sales)) {
      setError("Code invalide. Vérifie que tu as bien tout copié.");
      return;
    }
    onLogin(data);
  };

  return (
    <div style={{background:"#09090f",minHeight:"100vh",maxWidth:480,margin:"0 auto",fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",display:"flex",flexDirection:"column",padding:"0 24px 40px"}}>
      <StatusBar dark={true}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      
      <div style={{marginBottom:40,textAlign:"center"}}>
        <div style={{width:64,height:64,background:"#635bff",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 30px rgba(99,91,255,0.45)"}}>
          <Icon name="store" size={32} color="#fff"/>
        </div>
        <div style={{color:"#fff",fontSize:24,fontWeight:800,letterSpacing:-0.5}}>Stripe Demo</div>
        <div style={{color:"#555",fontSize:13,marginTop:4}}>Outil pédagogique</div>
      </div>

      {mode === "choose" && (
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:12}}>
          <button onClick={handleNew} style={{width:"100%",padding:"18px",borderRadius:14,border:"none",background:"#635bff",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 20px rgba(99,91,255,0.4)"}}>
            Nouvelle session
          </button>
          <button onClick={()=>setMode("load")} style={{width:"100%",padding:"18px",borderRadius:14,border:"1.5px solid #2a2a40",background:"transparent",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"}}>
            Charger mes données
          </button>
          <div style={{color:"#444",fontSize:12,textAlign:"center",marginTop:8,lineHeight:1.5}}>
            Nouvelle session = repartir de zéro{"\n"}Charger = coller ton code de sauvegarde
          </div>
        </div>
      )}

      {mode === "load" && (
        <div style={{width:"100%"}}>
          <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:6,textAlign:"center"}}>Charger mes données</div>
          <div style={{color:"#666",fontSize:13,marginBottom:20,textAlign:"center",lineHeight:1.5}}>
            Colle ici le code de sauvegarde que tu avais copié lors de ta dernière session.
          </div>
          <textarea
            value={code} onChange={e=>{setCode(e.target.value);setError("");}}
            placeholder="Colle ton code ici..."
            style={{width:"100%",background:"#1c1c3a",border:`1.5px solid ${error?"#f55":"#2a2a40"}`,borderRadius:12,padding:"14px",fontSize:13,color:"#fff",outline:"none",boxSizing:"border-box",minHeight:100,resize:"none",fontFamily:"monospace"}}
          />
          {error && <div style={{color:"#f55",fontSize:12,marginTop:6,marginBottom:4}}>{error}</div>}
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <button onClick={()=>{setMode("choose");setCode("");setError("");}} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #2a2a40",background:"transparent",color:"#888",fontSize:14,cursor:"pointer"}}>Retour</button>
            <button onClick={handleLoad} disabled={!code.trim()} style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:code.trim()?"#635bff":"#2a2a40",color:code.trim()?"#fff":"#555",fontSize:14,fontWeight:800,cursor:code.trim()?"pointer":"not-allowed"}}>
              Charger
            </button>
          </div>
        </div>
      )}

      <div style={{marginTop:40,background:"rgba(220,50,50,0.12)",borderRadius:10,padding:"8px 16px",color:"#f88",fontSize:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",textAlign:"center"}}>
        Démo pédagogique — chiffres fictifs
      </div>
      </div>
    </div>
  );
}

// ── Save modal ───────────────────────────────────────────────────────────────
function SaveModal({ data, onClose }) {
  const code = useMemo(()=>encodeSave(data),[data]);
  const [copied, setCopied] = useState(false);

  const doCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});
    } else {
      // fallback for mobile
      const ta = document.createElement("textarea");
      ta.value = code; ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true); setTimeout(()=>setCopied(false),2500);
    }
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#13132a",borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,boxShadow:"0 -12px 50px rgba(99,91,255,0.3)"}}>
        <div style={{width:36,height:4,background:"#2a2a45",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:6}}>Sauvegarder mes données</div>
        <div style={{color:"#666",fontSize:13,marginBottom:16,lineHeight:1.5}}>
          Copie ce code et garde-le précieusement. La prochaine fois, clique sur "Charger mes données" et colle-le pour retrouver toutes tes ventes.
        </div>

        <div style={{background:"#0d0d1a",borderRadius:10,padding:"12px 14px",marginBottom:16,fontFamily:"monospace",fontSize:11,color:"#635bff",wordBreak:"break-all",lineHeight:1.6,maxHeight:120,overflowY:"auto"}}>
          {code}
        </div>

        <button onClick={doCopy} style={{
          width:"100%",padding:"16px",borderRadius:12,border:"none",
          background:copied?"#1a3a1a":"#635bff",
          color:copied?"#4cdf82":"#fff",fontSize:15,fontWeight:800,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          boxShadow:copied?"none":"0 4px 20px rgba(99,91,255,0.4)",
          transition:"all 0.2s"
        }}>
          <Icon name="copy" size={18} color={copied?"#4cdf82":"#fff"}/>
          {copied ? "Copié !" : "Copier le code"}
        </button>

        <div style={{color:"#444",fontSize:11,textAlign:"center",marginTop:14,lineHeight:1.5}}>
          {data.sales?.length || 0} vente(s) sauvegardée(s) · Généré le {fmtDateFR(today())}
        </div>
      </div>
    </div>
  );
}

// ── Sale form modal ──────────────────────────────────────────────────────────
function SaleFormModal({ onSave, onClose, editSale }) {
  const [form, setForm] = useState(editSale||{date:today(),time:"12:00",montant:"",client:"",produit:""});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const valid=form.date&&form.montant;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#13132a",borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#2a2a45",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:18}}>{editSale?"Modifier la vente":"Ajouter une vente"}</div>
        {[
          {label:"Montant (€) *",key:"montant",type:"number",placeholder:"Ex: 299.99"},
          {label:"Client",key:"client",type:"text",placeholder:"Ex: Sophie Martin"},
          {label:"Produit",key:"produit",type:"text",placeholder:"Ex: Formation Excel"},
          {label:"Date *",key:"date",type:"date"},
          {label:"Heure",key:"time",type:"time"},
        ].map(f=>(
          <div key={f.key} style={{marginBottom:13}}>
            <div style={{color:"#888",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:5}}>{f.label}</div>
            <input type={f.type} value={form[f.key]} placeholder={f.placeholder||""}
              onChange={e=>set(f.key,e.target.value)}
              style={{width:"100%",background:"#1c1c3a",border:"1.5px solid #2a2a40",borderRadius:11,padding:"12px 14px",fontSize:15,color:"#fff",outline:"none",boxSizing:"border-box",colorScheme:"dark"}}
            />
          </div>
        ))}
        <div style={{color:"#555",fontSize:12,marginBottom:16,lineHeight:1.5}}>Date passée = vente historique · Date future = programmée</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #2a2a45",background:"transparent",color:"#888",fontSize:14,cursor:"pointer",fontWeight:600}}>Annuler</button>
          <button onClick={()=>{if(valid){onSave({...form,montant:Number(form.montant)});onClose();}}} style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:valid?"#635bff":"#2a2a45",color:valid?"#fff":"#555",fontSize:14,fontWeight:800,cursor:valid?"pointer":"not-allowed"}}>
            {editSale?"Modifier":"Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, fmt }) {
  if (!active||!payload?.length) return null;
  const f = fmt || fmtEuro;
  return <div style={{background:"#635bff",borderRadius:6,padding:"3px 9px",color:"#fff",fontSize:12,fontWeight:700,boxShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{f(payload[0]?.value)}</div>;
}

// ── Stripe-exact chart with grid + bubble + end dot ──────────────────────────
function AreaBlock({ chartData, gradId, fmtTip, isZero }) {
  const fmt = fmtTip || fmtEuro;
  const lastVal = chartData[chartData.length-1]?.v ?? 0;

  // Stripe shows a flat line with grid when value is 0
  if (isZero || chartData.every(d=>d.v===0)) {
    return (
      <div style={{position:"relative",height:90,marginTop:4,marginBottom:20}}>
        {/* Grid lines */}
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{position:"absolute",top:`${i*18}%`,left:0,right:0,height:1,background:"rgba(255,255,255,0.05)"}}/>
        ))}
        {/* Flat line */}
        <div style={{position:"absolute",top:"55%",left:0,right:0,height:2,background:"#635bff",opacity:0.7,borderRadius:1}}/>
        {/* End dot */}
        <div style={{position:"absolute",top:"55%",right:2,width:8,height:8,borderRadius:"50%",background:"#635bff",transform:"translateY(-50%)"}}/>
        {/* Value bubble */}
        <div style={{position:"absolute",top:"55%",left:0,transform:"translateY(-110%)",background:"#635bff",borderRadius:5,padding:"2px 7px",color:"#fff",fontSize:11,fontWeight:700}}>
          {fmt(0)}
        </div>
        {/* X axis labels */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"space-between",padding:"0 4px"}}>
          {[0,1,2,3,4,5,6].map(i=>{
            const idx = Math.floor(i*(chartData.length-1)/6);
            return <span key={i} style={{color:"#444",fontSize:9}}>{chartData[idx]?.day||""}</span>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{height:110,marginTop:4,position:"relative"}}>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={chartData} margin={{top:8,right:6,left:6,bottom:20}}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635bff" stopOpacity={0.45}/>
              <stop offset="100%" stopColor="#635bff" stopOpacity={0.03}/>
            </linearGradient>
          </defs>
          {/* Vertical grid lines */}
          {[0,1,2,3,4,5].map(i=>(
            <line key={i}/>
          ))}
          <XAxis
            dataKey="day"
            tick={{fill:"#555",fontSize:9}}
            tickLine={false}
            axisLine={false}
            interval={Math.max(Math.floor(chartData.length/6),1)-1}
          />
          <Tooltip content={<ChartTip fmt={fmt}/>}/>
          <Area
            type="monotone" dataKey="v"
            stroke="#635bff" strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{r:4,fill:"#fff",stroke:"#635bff",strokeWidth:2}}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Metric card Euro ──────────────────────────────────────────────────────────
function MetricCard({ label, chartData, total, subtitle, dateLabel, gradId, extraStats }) {
  const isZero = total === 0;
  return (
    <div style={{background:"transparent",padding:"18px 0 4px",marginBottom:4,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      {/* Title + badge */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,padding:"0 2px"}}>
        <span style={{color:"#fff",fontSize:16,fontWeight:700}}>{label}</span>
        <span style={{background:"#1e1e2e",borderRadius:6,padding:"2px 9px",color:"#666",fontSize:12,fontWeight:500}}>{isZero?"0,0 %":"+100 %"}</span>
      </div>
      {/* Values row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:0,padding:"0 2px"}}>
        <div>
          <div style={{color:isZero?"#888":"#635bff",fontSize:22,fontWeight:700,letterSpacing:-0.3}}>{fmtEuro(total)}</div>
          <div style={{color:"#555",fontSize:12,marginTop:3}}>{dateLabel?.prev}</div>
          {subtitle&&<div style={{color:"#555",fontSize:11,marginTop:2}}>{subtitle}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:isZero?"#888":"#635bff",fontSize:20,fontWeight:700}}>0,00 €</div>
          <div style={{color:"#555",fontSize:12,marginTop:3}}>{dateLabel?.curr}</div>
        </div>
      </div>
      <AreaBlock chartData={chartData} gradId={gradId} fmtTip={fmtEuro} isZero={isZero}/>
      {extraStats&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",borderTop:"1px solid rgba(255,255,255,0.06)",padding:"12px 2px 10px",gap:4}}>
          {extraStats.map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{color:"#666",fontSize:10,marginBottom:4,lineHeight:1.2}}>{s.l}</div>
              <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{s.v}</div>
              <div style={{color:"#4cdf82",fontSize:11,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Metric card Int ───────────────────────────────────────────────────────────
function MetricCardInt({ label, value, chartData, dateLabel, gradId }) {
  const isZero = value === 0;
  return (
    <div style={{background:"transparent",padding:"18px 0 4px",marginBottom:4,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,padding:"0 2px"}}>
        <span style={{color:"#fff",fontSize:16,fontWeight:700}}>{label}</span>
        <span style={{background:"#1e1e2e",borderRadius:6,padding:"2px 9px",color:"#666",fontSize:12,fontWeight:500}}>{isZero?"0,0 %":"+100 %"}</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"0 2px"}}>
        <div>
          <div style={{color:isZero?"#888":"#fff",fontSize:22,fontWeight:700}}>{fmtNum(value)}</div>
          <div style={{color:"#555",fontSize:12,marginTop:3}}>{dateLabel?.prev}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:isZero?"#888":"#635bff",fontSize:20,fontWeight:700}}>0</div>
          <div style={{color:"#555",fontSize:12,marginTop:3}}>{dateLabel?.curr}</div>
        </div>
      </div>
      <AreaBlock chartData={chartData} gradId={gradId} fmtTip={v=>String(Math.round(v||0))} isZero={isZero}/>
    </div>
  );
}

// ── Metric card Pct ───────────────────────────────────────────────────────────
function MetricCardPct({ label, value, chartData, dateLabel, gradId }) {
  const disp = `${Number(value).toFixed(2).replace(".",",")} %`;
  const isZero = value === 0;
  return (
    <div style={{background:"transparent",padding:"18px 0 4px",marginBottom:4,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,padding:"0 2px"}}>
        <span style={{color:"#fff",fontSize:16,fontWeight:700}}>{label}</span>
        <span style={{background:"#1e1e2e",borderRadius:6,padding:"2px 9px",color:"#666",fontSize:12,fontWeight:500}}>0,0 %</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"0 2px"}}>
        <div>
          <div style={{color:"#888",fontSize:22,fontWeight:700}}>{disp}</div>
          <div style={{color:"#555",fontSize:12,marginTop:3}}>{dateLabel?.prev}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#635bff",fontSize:20,fontWeight:700}}>{disp}</div>
          <div style={{color:"#555",fontSize:12,marginTop:3}}>{dateLabel?.curr}</div>
        </div>
      </div>
      <AreaBlock chartData={chartData} gradId={gradId} fmtTip={v=>`${Number(v).toFixed(2).replace(".",",")} %`} isZero={isZero}/>
    </div>
  );
}

function MetricCardPct({ label, value, chartData, dateLabel, gradId }) {
  const disp=`${Number(value).toFixed(2).replace(".",",")} %`;
  return (
    <div style={{background:"#11112a",borderRadius:18,padding:"18px 16px 14px",marginBottom:16,border:"1px solid #1e1e38"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{color:"#fff",fontSize:15,fontWeight:700}}>{label}</span>
        <span style={{background:"#1e1e38",borderRadius:6,padding:"2px 8px",color:"#555",fontSize:12}}>0,0 %</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
        <div>
          <div style={{color:"#888",fontSize:24,fontWeight:800}}>{disp}</div>
          <div style={{color:"#555",fontSize:12,marginTop:1}}>{dateLabel?.prev}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#635bff",fontSize:18,fontWeight:700}}>{disp}</div>
          <div style={{color:"#555",fontSize:12,marginTop:1}}>{dateLabel?.curr}</div>
        </div>
      </div>
      <AreaBlock chartData={chartData} gradId={gradId} fmtTip={v=>`${Number(v).toFixed(2).replace(".",",")} %`}/>
    </div>
  );
}

// ── Ventes tab ───────────────────────────────────────────────────────────────
function VentesTab({ sales, onAdd, onDelete, onEdit }) {
  const [showForm, setShowForm] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const todayStr=today();
  const sorted=[...sales].sort((a,b)=>b.date.localeCompare(a.date));
  const past=sorted.filter(s=>s.date<=todayStr);
  const future=sorted.filter(s=>s.date>todayStr);

  const SaleRow=({s})=>(
    <div style={{background:s.date<=todayStr?"#0f1a0f":"#11112a",borderRadius:14,padding:"13px 15px",marginBottom:10,border:`1px solid ${s.date<=todayStr?"#1a3a1a":"#1e1e38"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{marginBottom:5}}>
            <span style={{background:s.date<=todayStr?"#1a3a1a":"#1a1a3a",color:s.date<=todayStr?"#4cdf82":"#635bff",fontSize:9,fontWeight:800,borderRadius:6,padding:"2px 7px",letterSpacing:0.5}}>
              {s.date<=todayStr?"Validée":"Programmée"}
            </span>
          </div>
          <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:2}}>{fmtEuro(s.montant)}</div>
          {s.client&&<div style={{color:"#aaa",fontSize:13}}>{s.client}</div>}
          {s.produit&&<div style={{color:"#666",fontSize:12,marginTop:1}}>{s.produit}</div>}
        </div>
        <div style={{textAlign:"right",minWidth:90}}>
          <div style={{color:"#635bff",fontSize:13,fontWeight:700}}>{fmtDateFR(s.date)}</div>
          {s.time&&<div style={{color:"#555",fontSize:11,marginTop:1}}>{s.time}</div>}
          <div style={{display:"flex",gap:5,marginTop:10,justifyContent:"flex-end"}}>
            <button onClick={()=>{setEditSale(s);setShowForm(true);}} style={{background:"#1c1c3a",border:"none",borderRadius:7,padding:"5px 10px",color:"#635bff",fontSize:11,cursor:"pointer",fontWeight:700}}>Modifier</button>
            <button onClick={()=>onDelete(s.id)} style={{background:"#2a1a1a",border:"none",borderRadius:7,padding:"5px 10px",color:"#f55",fontSize:11,cursor:"pointer",fontWeight:700}}>Suppr.</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{padding:"0 16px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800}}>Ventes</div>
          <div style={{color:"#555",fontSize:12,marginTop:1}}>Sauvegarde via le bouton en haut</div>
        </div>
        <button onClick={()=>{setEditSale(null);setShowForm(true);}} style={{background:"#635bff",border:"none",borderRadius:12,padding:"9px 16px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:"0 3px 12px rgba(99,91,255,0.4)"}}>+ Ajouter</button>
      </div>

      <div style={{background:"#11112a",borderRadius:12,padding:"12px 16px",display:"flex",gap:16,marginBottom:18,marginTop:12,border:"1px solid #1e1e38"}}>
        <div>
          <div style={{color:"#555",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Total validé</div>
          <div style={{color:"#4cdf82",fontSize:15,fontWeight:800,marginTop:2}}>{fmtEuro(past.reduce((a,s)=>a+Number(s.montant||0),0))}</div>
        </div>
        <div style={{width:1,background:"#1e1e38"}}/>
        <div>
          <div style={{color:"#555",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Programmé</div>
          <div style={{color:"#635bff",fontSize:15,fontWeight:800,marginTop:2}}>{fmtEuro(future.reduce((a,s)=>a+Number(s.montant||0),0))}</div>
        </div>
        <div style={{width:1,background:"#1e1e38"}}/>
        <div>
          <div style={{color:"#555",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Ventes</div>
          <div style={{color:"#fff",fontSize:15,fontWeight:800,marginTop:2}}>{sales.length}</div>
        </div>
      </div>

      {future.length>0&&(<><div style={{color:"#635bff",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Programmées</div>{future.map(s=><SaleRow key={s.id} s={s}/>)}<div style={{height:1,background:"#1e1e38",margin:"14px 0"}}/></>)}
      {past.length>0&&(<><div style={{color:"#4cdf82",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Validées</div>{past.map(s=><SaleRow key={s.id} s={s}/>)}</>)}
      {sales.length===0&&<div style={{textAlign:"center",color:"#444",fontSize:14,padding:"50px 0"}}>Aucune vente — ajoute-en une !</div>}

      {showForm&&<SaleFormModal editSale={editSale} onClose={()=>{setShowForm(false);setEditSale(null);}} onSave={s=>{if(editSale)onEdit({...s,id:editSale.id});else onAdd({...s,id:Date.now()});}}/>}
    </div>
  );
}

// ── Virement Row — exact Stripe screenshot ────────────────────────────────────
function VirementRow({ v, onDelete, todayStr }) {
  const isPast = v.date <= todayStr;
  const dateLabel = (() => {
    const d = new Date(v.date);
    const days = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
    const months = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  })();

  return (
    <div style={{
      display:"flex",alignItems:"center",gap:14,
      paddingTop:18,paddingBottom:18,
      borderBottom:"1px solid rgba(255,255,255,0.06)"
    }}>
      {/* Icône gauche — petit cercle vert foncé discret */}
      <div style={{
        width:36,height:36,borderRadius:"50%",flexShrink:0,
        background: isPast ? "#1a3d1a" : "#1e1e2e",
        display:"flex",alignItems:"center",justifyContent:"center"
      }}>
        {isPast ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="20 6 9 17 4 12" stroke="#4cdf82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#555" strokeWidth="1.8" fill="none"/>
            <polyline points="12 7 12 12 15 15" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      {/* Infos centre */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:"#fff",fontSize:18,fontWeight:700,marginBottom:3,letterSpacing:-0.3}}>
          {fmtEuro(v.montant)}
        </div>
        <div style={{color:"#888",fontSize:13}}>
          {isPast ? `Versé le ${dateLabel}` : `Estimé le ${dateLabel}`}
        </div>
      </div>

      {/* Banque + flèche droite */}
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        {/* Icône banque */}
        <div style={{
          width:32,height:32,background:"#1e1e2e",borderRadius:8,
          display:"flex",alignItems:"center",justifyContent:"center"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-6 9 6v2H3V9z" stroke="#888" strokeWidth="1.4" fill="none"/>
            <rect x="5" y="11" width="3" height="6" stroke="#888" strokeWidth="1.3" fill="none"/>
            <rect x="10.5" y="11" width="3" height="6" stroke="#888" strokeWidth="1.3" fill="none"/>
            <rect x="16" y="11" width="3" height="6" stroke="#888" strokeWidth="1.3" fill="none"/>
            <line x1="3" y1="17" x2="21" y2="17" stroke="#888" strokeWidth="1.4"/>
          </svg>
        </div>
        <span style={{color:"#888",fontSize:13,letterSpacing:0.5}}>••{v.iban||"0049"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <polyline points="9 18 15 12 9 6" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Supprimer discret */}
        <button onClick={()=>onDelete(v.id)} style={{
          background:"none",border:"none",color:"#2a2a2a",
          fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1,
          marginLeft:2
        }}>×</button>
      </div>
    </div>
  );
}

// ── Virement Form Modal — simple et efficace ──────────────────────────────────
function VirementFormModal({ onClose, onSave, soldeDisponible, forcedDate }) {
  const [step, setStep]     = useState("form");
  const [montant, setMontant] = useState("");
  const [banque, setBanque]   = useState("CREDIT AGRICOLE");
  const [iban, setIban]       = useState("6350");
  const date = forcedDate || today();
  const valid = montant && Number(montant) > 0;

  const handleConfirm = () => {
    onSave({ montant: Number(montant), banque, iban, date });
    setStep("confirm");
  };

  if (step === "confirm") return (
    <div style={{position:"fixed",inset:0,background:"#0d0d14",zIndex:400,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 30px"}}>
      <div style={{marginBottom:36}}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="42" stroke="#22c55e" strokeWidth="4" fill="none"/>
          <polyline points="26,45 39,58 64,32" stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{color:"#fff",fontSize:18,fontWeight:600,textAlign:"center",lineHeight:1.7,maxWidth:300}}>
        <span style={{fontWeight:800}}>{fmtEuro(Number(montant))}</span>{" "}
        sont en cours de transfert vers{" "}
        <span style={{fontWeight:800}}>{banque} {"•".repeat(18)}{iban}.</span>
      </div>
      <button onClick={onClose} style={{marginTop:50,background:"#635bff",border:"none",borderRadius:14,padding:"16px 48px",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(99,91,255,0.4)"}}>
        Fermer
      </button>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"#0d0d14",zIndex:400,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px 0"}}>
        <div style={{width:32}}/>
        <span style={{color:"#fff",fontSize:17,fontWeight:600}}>Virer des fonds</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,margin:"20px 20px 0"}}>
        <div style={{border:"1.5px solid #635bff",borderRadius:12,padding:"14px 16px",background:"rgba(99,91,255,0.08)"}}>
          <div style={{color:"#fff",fontSize:15,fontWeight:600,marginBottom:4}}>Standard</div>
          <div style={{color:"#555",fontSize:12}}>Arrive dans 1 jour</div>
        </div>
        <div style={{border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"14px 16px"}}>
          <div style={{color:"#555",fontSize:15,fontWeight:600,marginBottom:4}}>Instantané</div>
          <div style={{color:"#555",fontSize:12}}>Cette option n'est pas disponible.</div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 20px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:4,marginBottom:12}}>
          <span style={{color:"#888",fontSize:28,fontWeight:300,marginTop:8}}>€</span>
          <input autoFocus type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="0"
            style={{background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:72,fontWeight:700,letterSpacing:-2,width:220,textAlign:"center",caretColor:"#635bff"}}
          />
        </div>
        <div style={{color:"#666",fontSize:14}}>{fmtEuro(soldeDisponible)} disponible(s)</div>
      </div>
      <div style={{padding:"0 20px 32px"}}>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:16,paddingBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
            <span style={{color:"#666",fontSize:16}}>À</span>
            <input value={banque} onChange={e=>setBanque(e.target.value.toUpperCase())} placeholder="Nom de la banque"
              style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#aaa",fontSize:14,fontWeight:500}}
            />
            <input value={iban} onChange={e=>setIban(e.target.value)} placeholder="4 chiffres"
              style={{background:"transparent",border:"none",outline:"none",color:"#aaa",fontSize:14,width:60,textAlign:"right"}}
            />
          </div>
          {iban&&<div style={{color:"#555",fontSize:12,paddingLeft:28}}>{"•".repeat(20)}{iban}</div>}
        </div>
        <button onClick={()=>{if(valid){onSave({montant:Number(montant),banque,iban,date});setStep("confirm");}}} style={{
          width:"100%",padding:"18px",borderRadius:14,border:"none",marginTop:16,
          background:valid?"#635bff":"#1e1e2e",color:valid?"#fff":"#444",
          fontSize:16,fontWeight:700,cursor:valid?"pointer":"not-allowed",
          boxShadow:valid?"0 4px 20px rgba(99,91,255,0.4)":"none"
        }}>Virer des fonds</button>
      </div>
    </div>
  );
}

// ── Programmer un virement (date libre) ──────────────────────────────────────
function ProgrammerVirementModal({ onClose, onSave }) {
  const [montant, setMontant] = useState("");
  const [banque,  setBanque]  = useState("");
  const [iban,    setIban]    = useState("");
  const [date,    setDate]    = useState(today());
  const valid = montant && Number(montant)>0 && date && banque && iban;
  const isPast = date < today();

  const BANQUES = ["CREDIT AGRICOLE","BNP PARIBAS","SOCIETE GENERALE","LA BANQUE POSTALE","CIC","BOURSORAMA","REVOLUT","LYDIA","PAYPAL","AUTRE"];

  const fmtDL = (iso) => {
    if (!iso) return "";
    const d=new Date(iso);
    const days=["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];
    const months=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#13132a",borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,boxShadow:"0 -12px 50px rgba(99,91,255,0.25)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#2a2a45",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:20}}>Programmer un virement</div>

        {/* Montant */}
        <div style={{marginBottom:14}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:5}}>Montant (€) *</div>
          <input type="number" value={montant} placeholder="Ex: 500.00"
            onChange={e=>setMontant(e.target.value)}
            style={{width:"100%",background:"#1c1c3a",border:"1.5px solid #2a2a40",borderRadius:11,padding:"12px 14px",fontSize:15,color:"#fff",outline:"none",boxSizing:"border-box"}}
          />
        </div>

        {/* Banque — liste + champ libre */}
        <div style={{marginBottom:14}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:5}}>Banque *</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
            {BANQUES.map(b=>(
              <button key={b} onClick={()=>setBanque(b)} style={{
                background:banque===b?"#635bff":"#1c1c3a",
                border:`1.5px solid ${banque===b?"#635bff":"#2a2a40"}`,
                borderRadius:20,padding:"6px 12px",
                color:banque===b?"#fff":"#888",
                fontSize:12,fontWeight:banque===b?700:400,
                cursor:"pointer",whiteSpace:"nowrap"
              }}>{b}</button>
            ))}
          </div>
          <input type="text" value={banque} placeholder="Ou saisir manuellement..."
            onChange={e=>setBanque(e.target.value.toUpperCase())}
            style={{width:"100%",background:"#1c1c3a",border:`1.5px solid ${banque?"#635bff":"#2a2a40"}`,borderRadius:11,padding:"12px 14px",fontSize:15,color:"#fff",outline:"none",boxSizing:"border-box"}}
          />
        </div>

        {/* Numéro de compte libre */}
        <div style={{marginBottom:14}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:5}}>Numéro de compte *</div>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:14,letterSpacing:1}}>••••</span>
            <input type="text" value={iban} placeholder="Ex: 6350 (derniers chiffres)"
              onChange={e=>setIban(e.target.value)}
              style={{width:"100%",background:"#1c1c3a",border:`1.5px solid ${iban?"#635bff":"#2a2a40"}`,borderRadius:11,padding:"12px 14px 12px 52px",fontSize:15,color:"#fff",outline:"none",boxSizing:"border-box"}}
            />
          </div>
          {iban&&<div style={{color:"#555",fontSize:11,marginTop:5,paddingLeft:4}}>Apparaîtra comme : ••{iban}</div>}
        </div>

        {/* Date */}
        <div style={{marginBottom:14}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:5}}>Date *</div>
          <input type="date" value={date}
            onChange={e=>setDate(e.target.value)}
            style={{width:"100%",background:"#1c1c3a",border:"1.5px solid #2a2a40",borderRadius:11,padding:"12px 14px",fontSize:15,color:"#fff",outline:"none",boxSizing:"border-box",colorScheme:"dark"}}
          />
          {date && date!==today() && (
            <div style={{color:isPast?"#4cdf82":"#888",fontSize:12,marginTop:6,paddingLeft:4}}>
              {isPast?`Virement enregistré au ${fmtDL(date)}`:`Programmé pour le ${fmtDL(date)}`}
            </div>
          )}
        </div>

        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #2a2a45",background:"transparent",color:"#888",fontSize:14,cursor:"pointer",fontWeight:600}}>Annuler</button>
          <button onClick={()=>{if(valid)onSave({montant:Number(montant),banque,iban,date});}} style={{
            flex:2,padding:"14px",borderRadius:12,border:"none",
            background:valid?"#635bff":"#2a2a45",color:valid?"#fff":"#555",
            fontSize:14,fontWeight:800,cursor:valid?"pointer":"not-allowed"
          }}>Programmer</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
const PERIODS = ["1 SEM.","4 SEM.","1 AN","CUMUL MOIS","CUMUL TRIM.","CUMUL ANNÉE"];
const NAV=[
  {label:"Accueil",    icon:"home",    key:"home"},
  {label:"Paiements",  icon:"payments",key:"payments"},
  {label:"Soldes",     icon:"balances",key:"balances"},
  {label:"Clients",    icon:"clients", key:"clients"},
  {label:"Rechercher", icon:"search",  key:"search"},
];

function Dashboard({ initialData, onLogout }) {
  const [period,setPeriod]     = useState(0);
  const [activeNav,setActiveNav] = useState("home");
  const [sales,setSales]       = useState(initialData.sales||[]);
  const [showSave,setShowSave] = useState(false);

  const addSale    = s=>setSales(p=>[...p,s]);
  const deleteSale = id=>setSales(p=>p.filter(s=>s.id!==id));
  const editSale   = s=>setSales(p=>p.map(x=>x.id===s.id?s:x));

  const todayStr = today();
  const hierStr  = yest();
  const validSales    = useMemo(()=>sales.filter(s=>s.date<=todayStr),[sales,todayStr]);
  const hierSales     = useMemo(()=>sales.filter(s=>s.date===hierStr),[sales,hierStr]);
  const volumeBrut    = useMemo(()=>Math.round(validSales.reduce((a,s)=>a+Number(s.montant||0),0)*100)/100,[validSales]);
  const volumeBrutHier= useMemo(()=>Math.round(hierSales.reduce((a,s)=>a+Number(s.montant||0),0)*100)/100,[hierSales]);
  const volumeNet     = useMemo(()=>Math.round(volumeBrut*0.934*100)/100,[volumeBrut]);
  const chartBrut     = useMemo(()=>buildChartData(validSales),[validSales]);
  const chartNet      = useMemo(()=>chartBrut.map(d=>({...d,v:Math.round(d.v*0.934*100)/100})),[chartBrut]);
  const nActive       = validSales.length;
  const panier        = nActive>0?Math.round(volumeBrut/nActive*100)/100:0;
  // ── Dates dynamiques par période ──────────────────────────────────────────
  const dateRange = useMemo(()=>{
    const now = new Date();
    const fmt = (d) => {
      const months=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };
    const fmtMY = (d) => {
      const months=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const sub = (d, days) => { const r=new Date(d); r.setDate(r.getDate()-days); return r; };

    if (period === 0) { // 1 SEM.
      const start = sub(now, 7); const prevEnd = sub(start, 1); const prevStart = sub(prevEnd, 6);
      return { prev:`${fmt(start)} – ${fmt(sub(now,1))}`, curr:`${fmt(now.toISOString().slice(0,10)=== today() ? now : now)} – Aujourd'hui`,
        prevLabel:`${fmt(start)} – ${fmt(sub(now,1))}`, currLabel:`${fmt(sub(now,6))} – Aujourd'hui` };
    }
    if (period === 1) { // 4 SEM.
      const start = sub(now, 28); const prevStart = sub(start, 28); const prevEnd = sub(start,1);
      return { prevLabel:`${fmt(prevStart)} – ${fmt(prevEnd)}`, currLabel:`${fmt(start)} – Aujourd'hui` };
    }
    if (period === 2) { // 1 AN
      const prevS = new Date(now); prevS.setFullYear(prevS.getFullYear()-2); prevS.setDate(1);
      const prevE = new Date(now); prevE.setFullYear(prevE.getFullYear()-1); prevE.setDate(0);
      const currS = new Date(now); currS.setFullYear(currS.getFullYear()-1); currS.setDate(1);
      return { prevLabel:`${fmtMY(prevS)} – ${fmtMY(prevE)}`, currLabel:`${fmtMY(currS)} – ${fmtMY(now)}` };
    }
    if (period === 3) { // CUMUL MOIS
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { prevLabel:`1 ${["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."][now.getMonth()]} ${now.getFullYear()}`, currLabel:`Aujourd'hui` };
    }
    if (period === 4) { // CUMUL TRIM.
      const q = Math.floor(now.getMonth()/3);
      const qStart = new Date(now.getFullYear(), q*3, 1);
      const prevQStart = new Date(now.getFullYear(), (q-1)*3, 1);
      const prevQEnd = new Date(now.getFullYear(), q*3, 0);
      const months=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
      return { prevLabel:`1 ${months[prevQStart.getMonth()]} – 1 ${months[prevQEnd.getMonth()]} ${prevQEnd.getFullYear()}`, currLabel:`1 avr. – Aujourd'hui` };
    }
    if (period === 5) { // CUMUL ANNÉE
      const prevS = new Date(now.getFullYear()-1, 0, 1);
      const prevE = new Date(now.getFullYear()-1, 11, 31);
      const months=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
      return { prevLabel:`${fmtMY(prevS)} – ${fmtMY(prevE)}`, currLabel:`${fmtMY(new Date(now.getFullYear(),0,1))} – ${fmtMY(now)}` };
    }
    return { prevLabel:"—", currLabel:"Aujourd'hui" };
  },[period]);

  const saveData = useMemo(()=>({sales}),[sales]);
  const [virements, setVirements] = useState([]);
  const [showVirementForm, setShowVirementForm] = useState(false);   // programmer (passé/futur)
  const [showVirementDirect, setShowVirementDirect] = useState(false); // virement direct

  return (
    <div style={{background:"#0d0d14",minHeight:"100vh",maxWidth:480,margin:"0 auto",fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",color:"#fff",position:"relative",paddingBottom:90}}>
      <StatusBar dark={true}/>

      {/* ── Header dynamique selon onglet ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 10px"}}>
        <div style={{width:36,height:36,background:"#1c1c2e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="store" size={22} color="#888"/>
        </div>
        <span style={{fontWeight:600,fontSize:17,color:"#fff",letterSpacing:-0.2}}>
          {activeNav==="home"?"beacons.ai":activeNav==="balances"?"Soldes":activeNav==="notifs"?"Ventes":activeNav==="payments"?"Paiements":activeNav==="clients"?"Clients":"Rechercher"}
        </span>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setShowSave(true)} style={{background:"none",border:"none",cursor:"pointer",padding:2,opacity:0.7}}>
            <Icon name="save" size={20} color="#aaa"/>
          </button>
          <div onClick={()=>activeNav==="balances"?setShowVirementForm(true):setActiveNav("notifs")} style={{width:36,height:36,borderRadius:"50%",background:"#635bff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 12px rgba(99,91,255,0.5)"}}>
            <Icon name="plus" size={20}/>
          </div>
        </div>
      </div>

      {/* ── Carrousel Hier / Aujourd'hui — uniquement sur Accueil ── */}
      {activeNav==="home"&&(
      <div style={{overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",display:"flex"}}>
        {[
          {label:"Hier",        brut:volumeBrutHier, n:hierSales.length},
          {label:"Aujourd'hui", brut:volumeBrut,     n:nActive},
        ].map((day,idx)=>(
          <div key={day.label} style={{minWidth:"100%",scrollSnapAlign:"start",padding:"4px 16px 0",boxSizing:"border-box"}}>
            <div style={{color:"#fff",fontSize:22,fontWeight:800,marginBottom:12,letterSpacing:-0.5}}>{day.label}</div>
            <div style={{background:"#181828",borderRadius:14,padding:"14px 18px",display:"flex",justifyContent:"space-between"}}>
              {[
                {l:"Volume brut",v:fmtEuro(day.brut)},
                {l:"Paiements",  v:fmtNum(day.n)},
                {l:"Clients",    v:fmtNum(day.n)},
              ].map(item=>(
                <div key={item.l} style={{textAlign:"center"}}>
                  <div style={{color:"#777",fontSize:11,marginBottom:6,fontWeight:400}}>{item.l}</div>
                  <div style={{color:"#fff",fontSize:16,fontWeight:700}}>{item.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:10,marginBottom:2}}>
              <div style={{width:idx===0?20:6,height:5,borderRadius:3,background:idx===0?"#635bff":"#2a2a45",transition:"width 0.25s"}}/>
              <div style={{width:idx===1?20:6,height:5,borderRadius:3,background:idx===1?"#635bff":"#2a2a45",transition:"width 0.25s"}}/>
            </div>
          </div>
        ))}
      </div>
      )}

      {activeNav==="home"&&(
        <div style={{padding:"14px 20px 0"}}>
          {/* Aperçu rapports */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:19,fontWeight:800,letterSpacing:-0.4}}>Aperçu des rapports</span>
            <span style={{color:"#635bff",fontSize:14,fontWeight:600,cursor:"pointer"}}>Modifier</span>
          </div>

          {/* Périodes — pill Stripe exact */}
          <div style={{display:"flex",gap:2,overflowX:"auto",scrollbarWidth:"none",marginBottom:14,paddingBottom:2}}>
            {PERIODS.map((p,i)=>(
              <button key={p} onClick={()=>setPeriod(i)} style={{
                background:period===i?"#635bff":"transparent",
                border:"none",borderRadius:20,
                padding:"7px 14px",
                color:period===i?"#fff":"#888",
                fontSize:12,fontWeight:period===i?700:400,
                cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
                transition:"all 0.15s"
              }}>{p}</button>
            ))}
          </div>

          <MetricCard label="Volume brut" chartData={chartBrut} total={volumeBrut}
            dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g1"
            extraStats={[
              {l:"Paiements",v:fmtNum(nActive),sub:nActive>0?"+100 %":"0 %"},
              {l:"Clients",v:fmtNum(nActive),sub:nActive>0?"+100 %":"0 %"},
              {l:"Nouveaux clients",v:fmtNum(nActive),sub:nActive>0?"+100 %":"0 %"},
              {l:"Panier moyen",v:fmtEuro(panier),sub:"0 %"},
            ]}
          />
          <MetricCard label="Volume net des ventes" chartData={chartNet} total={volumeNet}
            subtitle={volumeBrut>0?`Après frais et remboursements : -${fmtEuro(volumeBrut-volumeNet)}`:""}
            dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g2"
          />
          <MetricCardInt label="Paiements réussis"        value={nActive} chartData={chartBrut.map(d=>({...d,v:d.v>0?1:0}))} dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g3"/>
          <MetricCardInt label="Nouveaux clients"         value={nActive} chartData={chartBrut.map(d=>({...d,v:d.v>0?1:0}))} dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g4"/>
          <MetricCard    label="Dépenses par client"      chartData={chartBrut.map(d=>({...d,v:nActive>0?Math.round(d.v/Math.max(nActive,1)*100)/100:0}))} total={panier} dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g5"/>
          <MetricCardInt label="Paiements à risque élevé" value={0} chartData={chartBrut.map(d=>({...d,v:0}))} dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g6"/>
          <MetricCardPct label="Activité relative aux litiges" value={0} chartData={chartBrut.map(d=>({...d,v:0}))} dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g7"/>
          <MetricCardInt label="Nombre de litiges"        value={0} chartData={chartBrut.map(d=>({...d,v:0}))} dateLabel={{prev:dateRange.prevLabel,curr:dateRange.currLabel}} gradId="g8"/>
        </div>
      )}

      {activeNav==="notifs"&&<NotificationsTab/>}
        <div style={{padding:"14px 0 0"}}>
          <VentesTab sales={sales} onAdd={addSale} onDelete={deleteSale} onEdit={editSale}/>
        </div>
      )}

      {activeNav==="balances"&&(
        <div style={{padding:"0 0 40px"}}>
          {/* Lignes de solde */}
          <div style={{padding:"8px 20px 0"}}>
            {[
              {label:"Disponible pour virement", info:true,  val: fmtEuro(volumeNet*0.8)},
              {label:"Virements en cours",        info:false, val: fmtEuro(virements.filter(v=>v.date===today()).reduce((a,v)=>a+Number(v.montant||0),0))},
              {label:"Bientôt disponible",        info:true,  val: fmtEuro(volumeNet*0.2)},
            ].map((row)=>(
              <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:"#fff",fontSize:16}}>{row.label}</span>
                  {row.info&&(
                    <div style={{width:16,height:16,borderRadius:"50%",border:"1.5px solid #555",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{color:"#555",fontSize:10,fontWeight:700}}>i</span>
                    </div>
                  )}
                </div>
                <span style={{color:"#fff",fontSize:16}}>{row.val}</span>
              </div>
            ))}

            {/* Total */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,paddingBottom:6}}>
              <span style={{color:"#fff",fontSize:16,fontWeight:800}}>Total</span>
              <span style={{color:"#fff",fontSize:16,fontWeight:800}}>{fmtEuro(volumeNet)}</span>
            </div>
            <div style={{textAlign:"right",color:"#666",fontSize:13,paddingBottom:16}}>
              {fmtEuro(volumeNet*0.8)} admissible(s) pour les virements instantanés
            </div>

            {/* Bouton Virer des fonds — virement EN DIRECT */}
            <button onClick={()=>setShowVirementDirect(true)} style={{
              width:"100%",padding:"16px",borderRadius:12,border:"none",
              background:"#635bff",color:"#fff",fontSize:16,fontWeight:700,
              cursor:"pointer",marginBottom:24,
              boxShadow:"0 4px 16px rgba(99,91,255,0.35)"
            }}>Virer des fonds</button>

            <div style={{height:1,background:"rgba(255,255,255,0.07)",marginBottom:24}}/>

            {/* Section Virements */}
            <div style={{marginTop:24}}>
              <div style={{color:"#fff",fontSize:20,fontWeight:800,marginBottom:16}}>Virements</div>

              {virements.length===0 ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:20}}>
                  <div style={{width:72,height:72,background:"#1a1a2a",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="6" width="16" height="12" rx="2" stroke="#666" strokeWidth="1.6"/>
                      <path d="M6 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" stroke="#666" strokeWidth="1.6"/>
                      <path d="M16 14l2-2-2-2" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{color:"#fff",fontSize:17,fontWeight:700,marginBottom:10}}>Aucun virement</div>
                  <div style={{color:"#666",fontSize:14,textAlign:"center",lineHeight:1.6,maxWidth:280}}>
                    Les virements apparaîtront ici, ainsi que la date à laquelle ils devraient être crédités sur votre compte bancaire.
                  </div>
                </div>
              ) : (
                <div>
                  {/* Virements futurs */}
                  {virements.filter(v=>v.date>today()).length>0&&(
                    <>
                      <div style={{color:"#635bff",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Programmés</div>
                      {virements.filter(v=>v.date>today()).sort((a,b)=>a.date.localeCompare(b.date)).map(v=>(
                        <VirementRow key={v.id} v={v} onDelete={id=>setVirements(p=>p.filter(x=>x.id!==id))} todayStr={today()}/>
                      ))}
                      <div style={{height:1,background:"rgba(255,255,255,0.07)",margin:"12px 0"}}/>
                    </>
                  )}
                  {/* Virements passés/aujourd'hui */}
                  {virements.filter(v=>v.date<=today()).length>0&&(
                    <>
                      <div style={{color:"#4cdf82",fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Effectués</div>
                      {virements.filter(v=>v.date<=today()).sort((a,b)=>b.date.localeCompare(a.date)).map(v=>(
                        <VirementRow key={v.id} v={v} onDelete={id=>setVirements(p=>p.filter(x=>x.id!==id))} todayStr={today()}/>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal virement EN DIRECT (aujourd'hui, écran Stripe) */}
      {showVirementDirect&&(
        <VirementFormModal
          onClose={()=>setShowVirementDirect(false)}
          onSave={v=>{ setVirements(p=>[...p,{...v,id:Date.now(),date:today()}]); setShowVirementDirect(false); }}
          soldeDisponible={volumeNet*0.8}
          forcedDate={today()}
        />
      )}

      {/* Modal PROGRAMMER un virement (date libre passé/futur) */}
      {showVirementForm&&(
        <ProgrammerVirementModal
          onClose={()=>setShowVirementForm(false)}
          onSave={v=>{ setVirements(p=>[...p,{...v,id:Date.now()}]); setShowVirementForm(false); }}
        />
      )}

      {["payments","clients","search"].includes(activeNav)&&(
        <div style={{padding:"60px 20px",textAlign:"center",color:"#444",fontSize:14}}>Onglet bientôt disponible</div>
      )}

      {/* ── Barre de navigation Stripe ── */}
      <div style={{
        position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,
        background:"#0d0d14",
        borderTop:"1px solid rgba(255,255,255,0.08)",
        display:"flex",justifyContent:"space-around",
        padding:"10px 0 26px",zIndex:100
      }}>
        {NAV.map(item=>{
          const isActive = activeNav===item.key;
          return (
            <div key={item.key} onClick={()=>setActiveNav(item.key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",minWidth:56,paddingTop:2}}>
              <Icon name={item.icon} size={24} color={isActive?"#635bff":"#666"} active={isActive}/>
              <span style={{fontSize:10,fontWeight:isActive?600:400,color:isActive?"#635bff":"#666"}}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {showSave&&<SaveModal data={saveData} onClose={()=>setShowSave(false)}/>}
    </div>
  );
}

// ── Sale Form Modal (Beacons) ─────────────────────────────────────────────────
function BeaconsSaleModal({ product, onClose, onSave }) {
  const [client,  setClient]  = useState("");
  const [montant, setMontant] = useState(String(product?.prix || ""));
  const [date,    setDate]    = useState(new Date().toISOString().slice(0,10));
  const [extra,   setExtra]   = useState(""); // ex: "+ accompagnement 1:1"
  const [sendNotif, setSendNotif] = useState(true);
  const [notifStatus, setNotifStatus] = useState(() => getNotifPermission());
  const valid = client.trim() && montant && Number(montant) > 0 && date;

  const handlePermission = async () => {
    const ok = await requestNotifPermission();
    setNotifStatus(ok ? "granted" : "denied");
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,boxShadow:"0 -8px 30px rgba(0,0,0,0.15)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontWeight:800,fontSize:18,color:"#111",marginBottom:4}}>Ajouter une vente</div>
        <div style={{color:"#2563eb",fontSize:13,fontWeight:600,marginBottom:20}}>{product?.nom}</div>

        {[
          {label:"Prénom client *",  val:client,  set:setClient,  type:"text",   placeholder:"Ex: Lorenzo"},
          {label:"Montant (€) *",    val:montant, set:setMontant, type:"number", placeholder:`${product?.prix}`},
          {label:"Détail produit",   val:extra,   set:setExtra,   type:"text",   placeholder:"Ex: + accompagnement 1:1"},
          {label:"Date *",           val:date,    set:setDate,    type:"date",   placeholder:""},
        ].map(f=>(
          <div key={f.label} style={{marginBottom:14}}>
            <div style={{color:"#888",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>{f.label}</div>
            <input type={f.type} value={f.val} placeholder={f.placeholder}
              onChange={e=>f.set(e.target.value)}
              style={{width:"100%",border:`1.5px solid ${f.val?"#2563eb":"#e5e7eb"}`,borderRadius:11,padding:"12px 14px",fontSize:15,color:"#111",outline:"none",boxSizing:"border-box",colorScheme:"light"}}
            />
          </div>
        ))}

        {/* Aperçu notif */}
        {client && montant && (
          <div style={{background:"#1c1c1e",borderRadius:14,padding:"12px 14px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎉</div>
            <div>
              <div style={{color:"#fff",fontSize:13,fontWeight:700}}>You made a sale!</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:1.4}}>
                {client} bought {product?.nom}{extra?` ${extra}`:""} for €{Number(montant).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Toggle notif */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"10px 14px",background:"#f9fafb",borderRadius:12,border:"1px solid #e5e7eb"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"#111"}}>Envoyer une notification</div>
            <div style={{fontSize:12,color:"#888"}}>
              {notifStatus==="granted" ? "✓ Permissions accordées" :
               notifStatus==="denied"  ? "✗ Bloqué — autorise dans Réglages" :
               "Appuie pour autoriser"}
            </div>
          </div>
          {notifStatus==="granted" ? (
            <div onClick={()=>setSendNotif(v=>!v)} style={{
              width:46,height:26,borderRadius:13,cursor:"pointer",transition:"background 0.2s",
              background:sendNotif?"#2563eb":"#e5e7eb",position:"relative"
            }}>
              <div style={{position:"absolute",top:3,left:sendNotif?22:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
            </div>
          ) : notifStatus==="default" ? (
            <button onClick={handlePermission} style={{background:"#2563eb",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              Autoriser
            </button>
          ) : null}
        </div>

        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",color:"#888",fontSize:14,cursor:"pointer",fontWeight:600}}>Annuler</button>
          <button onClick={()=>{
            if(!valid) return;
            if(sendNotif && notifStatus==="granted") {
              sendSaleNotif({prenom:client.trim(),produit:product?.nom,prix:montant,extra});
            }
            onSave({id:Date.now(),client:client.trim(),montant:Number(montant),date,extra});
          }} style={{
            flex:2,padding:"14px",borderRadius:12,border:"none",
            background:valid?"#2563eb":"#e5e7eb",color:valid?"#fff":"#aaa",
            fontSize:14,fontWeight:800,cursor:valid?"pointer":"not-allowed"
          }}>Confirmer la vente</button>
        </div>
      </div>
    </div>
  );
}
function ProductFormModal({ product, onClose, onSave }) {
  const [nom,  setNom]  = useState(product?.nom  || "");
  const [prix, setPrix] = useState(product?.prix || "");
  const [desc, setDesc] = useState(product?.desc || "");
  const valid = nom.trim() && prix && Number(prix) > 0;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480,boxShadow:"0 -8px 30px rgba(0,0,0,0.15)",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontWeight:800,fontSize:18,color:"#111",marginBottom:20}}>
          {product ? "Modifier le produit" : "Nouveau produit"}
        </div>

        {[
          {label:"Nom du produit *", val:nom,  set:setNom,  type:"text",   placeholder:"Ex: Formation Digital Success"},
          {label:"Prix ($US) *",     val:prix, set:setPrix, type:"number", placeholder:"Ex: 97"},
          {label:"Description",      val:desc, set:setDesc, type:"text",   placeholder:"Ex: Formation complète en ligne"},
        ].map(f=>(
          <div key={f.label} style={{marginBottom:14}}>
            <div style={{color:"#888",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>{f.label}</div>
            <input type={f.type} value={f.val} placeholder={f.placeholder}
              onChange={e=>f.set(e.target.value)}
              style={{width:"100%",border:`1.5px solid ${f.val?"#2563eb":"#e5e7eb"}`,borderRadius:11,padding:"12px 14px",fontSize:15,color:"#111",outline:"none",boxSizing:"border-box"}}
            />
          </div>
        ))}

        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",color:"#888",fontSize:14,cursor:"pointer",fontWeight:600}}>Annuler</button>
          <button onClick={()=>{if(valid)onSave({nom:nom.trim(),prix:Number(prix),desc});}} style={{
            flex:2,padding:"14px",borderRadius:12,border:"none",
            background:valid?"#2563eb":"#e5e7eb",color:valid?"#fff":"#aaa",
            fontSize:14,fontWeight:800,cursor:valid?"pointer":"not-allowed"
          }}>{product?"Modifier":"Créer le produit"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Profile Edit Modal ────────────────────────────────────────────────────────
function ProfileEditModal({ username, avatar, bannerColor, onClose, onSave }) {
  const [newUsername, setNewUsername] = useState(username);
  const [newAvatar,   setNewAvatar]   = useState(avatar);
  const [newColor,    setNewColor]    = useState("#1e3a5f");

  const COLORS = [
    {label:"Bleu foncé",    val:"linear-gradient(180deg,#1e3a5f 0%,#0f172a 100%)"},
    {label:"Violet",        val:"linear-gradient(180deg,#4c1d95 0%,#1e1b4b 100%)"},
    {label:"Vert",          val:"linear-gradient(180deg,#064e3b 0%,#022c22 100%)"},
    {label:"Rose",          val:"linear-gradient(180deg,#9d174d 0%,#500724 100%)"},
    {label:"Gris",          val:"linear-gradient(180deg,#374151 0%,#111827 100%)"},
    {label:"Orange",        val:"linear-gradient(180deg,#92400e 0%,#451a03 100%)"},
    {label:"Noir pur",      val:"linear-gradient(180deg,#1f2937 0%,#000000 100%)"},
    {label:"Bleu vif",      val:"linear-gradient(180deg,#1d4ed8 0%,#1e3a8a 100%)"},
  ];

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const selectedBanner = COLORS.find(c=>c.val===newColor)?.val || COLORS[0].val;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontWeight:800,fontSize:18,color:"#111",marginBottom:20}}>Modifier le profil</div>

        {/* Aperçu mini */}
        <div style={{background:selectedBanner,borderRadius:14,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #fff",overflow:"hidden",background:"#374151",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
            {newAvatar?<img src={newAvatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:"👤"}
          </div>
          <span style={{color:"#fff",fontWeight:700,fontSize:14}}>@{newUsername||"username"}</span>
        </div>

        {/* Photo de profil */}
        <div style={{marginBottom:18}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Photo de profil</div>
          <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",background:"#f9fafb",border:"1.5px dashed #e5e7eb",borderRadius:12,padding:"14px"}}>
            <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",background:"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
              {newAvatar?<img src={newAvatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:"👤"}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:"#2563eb"}}>Choisir une photo</div>
              <div style={{fontSize:12,color:"#aaa"}}>JPG, PNG — depuis ta galerie</div>
            </div>
            <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
          </label>
          {newAvatar&&<button onClick={()=>setNewAvatar(null)} style={{marginTop:8,background:"none",border:"none",color:"#ef4444",fontSize:12,cursor:"pointer"}}>Supprimer la photo</button>}
        </div>

        {/* Pseudo */}
        <div style={{marginBottom:18}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Nom d'utilisateur</div>
          <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${newUsername?"#2563eb":"#e5e7eb"}`,borderRadius:11,overflow:"hidden"}}>
            <span style={{padding:"12px 10px 12px 14px",color:"#aaa",fontSize:15}}>@</span>
            <input value={newUsername} onChange={e=>setNewUsername(e.target.value.replace(/\s/g,"_"))}
              placeholder="mon_compte"
              style={{flex:1,border:"none",outline:"none",fontSize:15,color:"#111",padding:"12px 14px 12px 0"}}
            />
          </div>
        </div>

        {/* Couleur de fond */}
        <div style={{marginBottom:24}}>
          <div style={{color:"#888",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Couleur du fond</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {COLORS.map(c=>(
              <div key={c.val} onClick={()=>setNewColor(c.val)} style={{cursor:"pointer",textAlign:"center"}}>
                <div style={{
                  height:44,borderRadius:10,background:c.val,
                  border:`2.5px solid ${newColor===c.val?"#2563eb":"transparent"}`,
                  boxShadow:newColor===c.val?"0 0 0 1px #2563eb":"none"
                }}/>
                <div style={{fontSize:10,color:"#888",marginTop:4}}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",color:"#888",fontSize:14,cursor:"pointer",fontWeight:600}}>Annuler</button>
          <button onClick={()=>onSave(newUsername||username, newAvatar, COLORS.find(c=>c.val===newColor)?.val||bannerColor)} style={{
            flex:2,padding:"14px",borderRadius:12,border:"none",
            background:"#2563eb",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"
          }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const [permission, setPermission] = useState("default");
  const [titre,    setTitre]    = useState("🎉 You made a sale!");
  const [prenom,   setPrenom]   = useState("");
  const [produit,  setProduit]  = useState("");
  const [extra,    setExtra]    = useState("");
  const [prix,     setPrix]     = useState("");
  const [history,  setHistory]  = useState([]);
  const [banner,   setBanner]   = useState(null); // bannière in-app
  const [status,   setStatus]   = useState("idle"); // idle | sent | error

  // Vérifie permission au mount
  useEffect(()=>{
    try {
      if(typeof window!=="undefined" && "Notification" in window){
        setPermission(window.Notification.permission);
      } else {
        setPermission("unavailable");
      }
    } catch(e){ setPermission("unavailable"); }
  },[]);

  const handlePermission = async () => {
    try {
      if(!("Notification" in window)){ setPermission("unavailable"); return; }
      const p = await window.Notification.requestPermission();
      setPermission(p);
    } catch(e){ setPermission("unavailable"); }
  };

  const bodyText = `${prenom||"Client"} bought ${produit||"Produit"}${extra?` ${extra}`:""} for €${Number(prix||0).toFixed(2)}`;
  const titreText = titre || "🎉 You made a sale!";

  const handleSend = async () => {
    if (!prenom || !produit || !prix) return;

    // 1. Bannière in-app toujours
    setBanner({ titre: titreText, body: bodyText });
    setTimeout(()=>setBanner(null), 5000);

    // 2. Vraie notif système si permission
    let notifSent = false;
    try {
      if(typeof window!=="undefined" && "Notification" in window && window.Notification.permission==="granted"){
        new window.Notification(titreText, {
          body: bodyText,
          tag: "sale-"+Date.now(),
        });
        notifSent = true;
      }
    } catch(e){}

    setHistory(h=>[{
      titre:titreText, body:bodyText,
      time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
      real:notifSent
    },...h].slice(0,10));
    setStatus("sent");
    setTimeout(()=>setStatus("idle"),2500);
  };

  const valid = prenom && produit && prix;

  return (
    <div style={{background:"#f9fafb",minHeight:"100vh",paddingBottom:80,position:"relative"}}>

      {/* Bannière in-app iOS style */}
      {banner&&(
        <div style={{
          position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",
          width:"calc(100% - 32px)",maxWidth:440,zIndex:9999,
          background:"rgba(30,30,30,0.95)",backdropFilter:"blur(20px)",
          borderRadius:16,padding:"12px 14px",
          display:"flex",gap:10,alignItems:"center",
          boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
          animation:"slideDown 0.3s ease"
        }}>
          <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {/* Icône Beacons — 4 points colorés */}
          <div style={{width:40,height:40,borderRadius:10,background:"#111",border:"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="5.5" cy="5.5" r="4" fill="#ef4444"/>
              <circle cx="16.5" cy="5.5" r="4" fill="#3b82f6"/>
              <circle cx="5.5" cy="16.5" r="4" fill="#22c55e"/>
              <circle cx="16.5" cy="16.5" r="4" fill="#f59e0b"/>
            </svg>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#fff",fontSize:13,fontWeight:700,marginBottom:1}}>{banner.titre}</div>
            <div style={{color:"rgba(255,255,255,0.75)",fontSize:12,lineHeight:1.4}}>{banner.body}</div>
          </div>
          <button onClick={()=>setBanner(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
        </div>
      )}

      <div style={{background:"#fff",padding:"16px 20px 12px",borderBottom:"1px solid #e5e7eb"}}>
        <span style={{fontWeight:800,fontSize:20,color:"#111"}}>Notifications</span>
        <div style={{color:"#888",fontSize:12,marginTop:2}}>Personnalise et envoie tes notifs</div>
      </div>

      <div style={{padding:"16px"}}>

        {/* Statut permission */}
        {permission==="unavailable"&&(
          <div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#92400e",lineHeight:1.5}}>
            ⚠️ Les notifications système nécessitent Safari. La bannière in-app fonctionne partout !
          </div>
        )}
        {permission==="default"&&(
          <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
            <div style={{fontSize:13,color:"#1e40af",fontWeight:600,marginBottom:8}}>Activer les notifications système</div>
            <div style={{fontSize:12,color:"#3b82f6",marginBottom:10,lineHeight:1.4}}>Pour recevoir aussi les notifs sur l'écran de verrouillage (en plus de la bannière in-app)</div>
            <button onClick={handlePermission} style={{background:"#2563eb",border:"none",borderRadius:8,padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
              Autoriser les notifications
            </button>
          </div>
        )}
        {permission==="granted"&&(
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span>✅</span><span style={{color:"#16a34a",fontSize:13,fontWeight:600}}>Notifications système + bannière activées</span>
          </div>
        )}
        {permission==="denied"&&(
          <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#dc2626"}}>
            🚫 Bloquées — Réglages → Safari → Notifications. La bannière in-app fonctionne quand même.
          </div>
        )}

        {/* Formulaire */}
        <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"16px",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:15,color:"#111",marginBottom:14}}>Composer</div>

          {[
            {label:"Titre",         val:titre,   set:setTitre,   placeholder:"🎉 You made a sale!",  type:"text"},
            {label:"Prénom *",      val:prenom,  set:setPrenom,  placeholder:"Ex: Léandre",           type:"text"},
            {label:"Produit *",     val:produit, set:setProduit, placeholder:"Ex: ASA en 2 fois",     type:"text"},
            {label:"Détail",        val:extra,   set:setExtra,   placeholder:"Ex: + accompagnement 1:1",type:"text"},
            {label:"Prix (€) *",    val:prix,    set:setPrix,    placeholder:"Ex: 249",               type:"number"},
          ].map(f=>(
            <div key={f.label} style={{marginBottom:11}}>
              <div style={{color:"#888",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{f.label}</div>
              <input type={f.type} value={f.val} placeholder={f.placeholder}
                onChange={e=>f.set(e.target.value)}
                style={{width:"100%",border:`1.5px solid ${f.val?"#2563eb":"#e5e7eb"}`,borderRadius:10,padding:"10px 12px",fontSize:14,color:"#111",outline:"none",boxSizing:"border-box"}}
              />
            </div>
          ))}

          {/* Aperçu notif iOS style */}
          <div style={{background:"rgba(30,30,30,0.92)",borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center",marginTop:4}}>
            <div style={{width:38,height:38,borderRadius:9,background:"#111",border:"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 22 22">
                <circle cx="5.5" cy="5.5" r="4" fill="#ef4444"/>
                <circle cx="16.5" cy="5.5" r="4" fill="#3b82f6"/>
                <circle cx="5.5" cy="16.5" r="4" fill="#22c55e"/>
                <circle cx="16.5" cy="16.5" r="4" fill="#f59e0b"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontSize:13,fontWeight:700,marginBottom:1}}>{titreText}</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:1.4}}>{bodyText}</div>
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!valid}
            style={{
              width:"100%",padding:"15px",borderRadius:12,border:"none",
              background: !valid?"#e5e7eb" : status==="sent"?"#16a34a":"#2563eb",
              color:!valid?"#aaa":"#fff",
              fontSize:15,fontWeight:700,
              cursor:valid?"pointer":"not-allowed",
              transition:"background 0.2s"
            }}>
            {status==="sent" ? "✓ Envoyée !" : "🔔 Envoyer la notification"}
          </button>
        </div>

        {/* Historique */}
        {history.length>0&&(
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"16px"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#111",marginBottom:12}}>Historique</div>
            {history.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:10,paddingBottom:10,borderBottom:i<history.length-1?"1px solid #f3f4f6":"none",marginBottom:i<history.length-1?10:0,alignItems:"center"}}>
                <div style={{width:32,height:32,borderRadius:8,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 22 22">
                    <circle cx="5.5" cy="5.5" r="4" fill="#ef4444"/>
                    <circle cx="16.5" cy="5.5" r="4" fill="#3b82f6"/>
                    <circle cx="5.5" cy="16.5" r="4" fill="#22c55e"/>
                    <circle cx="16.5" cy="16.5" r="4" fill="#f59e0b"/>
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{n.titre}</div>
                  <div style={{fontSize:11,color:"#888",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.body}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{color:"#bbb",fontSize:11}}>{n.time}</div>
                  {n.real&&<div style={{color:"#16a34a",fontSize:10}}>système</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ── Beacons Dashboard ─────────────────────────────────────────────────────────
function BeaconsDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState("home");
  const [beaconsPage, setBeaconsPage] = useState("more");
  const [username, setUsername]     = useState("mon_compte");
  const [avatar, setAvatar]         = useState(null); // base64 image
  const [bannerColor, setBannerColor] = useState("linear-gradient(180deg,#1e3a5f 0%,#0f172a 100%)");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductId, setEditProductId]     = useState(null);
  const [saleModal, setSaleModal]             = useState(null); // product object

  // Produits avec leurs ventes
  const [products, setProducts] = useState([
    { id:1, nom:"Formation Digital Origin Community", prix:97, ventes:[
      {id:101, date:"2026-03-05", client:"Sophie M.", montant:97},
      {id:102, date:"2026-03-12", client:"Lucas R.",  montant:97},
      {id:103, date:"2026-04-01", client:"Emma B.",   montant:97},
    ]},
    { id:2, nom:"Digital Success Academy", prix:197, ventes:[
      {id:201, date:"2026-03-20", client:"Paul D.",   montant:197},
      {id:202, date:"2026-04-15", client:"Léa P.",    montant:197},
    ]},
  ]);

  const [stats, setStats] = useState({
    followers: 2100, views: 132, linkClicks: 847, newFollowers: 12,
  });
  const [editTarget, setEditTarget] = useState(null);
  const [editVal, setEditVal]       = useState("");

  // Earnings calculés depuis les ventes de produits
  const totalEarnings = useMemo(()=>
    products.reduce((sum,p)=>sum+p.ventes.reduce((s,v)=>s+Number(v.montant||0),0),0),
  [products]);

  const fmtK   = v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(Math.round(v));
  const fmtUSD = v => `${Number(v).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} $US`;

  // Mini courbe bleue simple
  const MiniChart = ({ data, height=50 }) => (
    <svg width="100%" height={height} viewBox={`0 0 120 ${height}`} preserveAspectRatio="none">
      <polyline
        points={data.map((v,i)=>`${i*(120/(data.length-1))},${height-(v/Math.max(...data,1))*height*0.85}`).join(" ")}
        fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );

  const generateData = (base, n=7) => {
    const seed = base % 97 + 1;
    return Array.from({length:n},(_,i)=> {
      const x = Math.sin(i * seed * 0.7 + seed) * 0.5 + 0.5;
      return base > 0 ? Math.round(base * (0.4 + x * 0.6)) : 0;
    });
  };

  const BNAVS = [
    {key:"home",      label:"Home",         icon:<path d="M3 10.5L12 3l9 7.5V21H15v-7H9v7H3z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>},
    {key:"linkinbio", label:"Link in Bio",  icon:<><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="17" y1="13" x2="17" y2="21" stroke="currentColor" strokeWidth="1.5"/><line x1="13" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="1.5"/></>},
    {key:"notifs",    label:"Notifications", icon:<><path d="M12 3a7 7 0 0 1 7 7v3.5l1.5 2.5h-17L5 13.5V10A7 7 0 0 1 12 3z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" fill="none"/></>},
    {key:"products",  label:"Products",     icon:<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></>},
    {key:"more",      label:"More",         icon:<><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.8"/></>},
  ];

  const StatCard = ({title, value, sub, data, fmt}) => (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"16px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{fontWeight:700,fontSize:15,color:"#111"}}>{title}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="9 18 15 12 9 6" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <button onClick={()=>{setEditTarget({key:title,fmt});setEditVal(String(value));}} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:"left",display:"block",width:"100%"}}>
        <div style={{fontSize:28,fontWeight:800,color:value>0?"#111":"#bbb",letterSpacing:-0.5,marginBottom:4}}>
          {fmt ? fmt(value) : fmtK(value)}
        </div>
        {sub && <div style={{fontSize:12,color:"#16a34a",fontWeight:600}}>{sub}</div>}
      </button>
      <div style={{marginTop:8,height:50}}>
        <MiniChart data={data}/>
      </div>
    </div>
  );

  return (
    <div style={{background:"#f9fafb",minHeight:"100vh",maxWidth:480,margin:"0 auto",fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",paddingBottom:80}}>
      <StatusBar dark={false}/>

      {/* Banner — cliquable pour modifier */}
      <div style={{background:bannerColor,padding:"20px 16px 24px",position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <line x1="3" y1="6" x2="21" y2="6" stroke="#fff" strokeWidth="1.8"/><line x1="3" y1="12" x2="21" y2="12" stroke="#fff" strokeWidth="1.8"/><line x1="3" y1="18" x2="21" y2="18" stroke="#fff" strokeWidth="1.8"/>
            </svg>
          </button>
          <div style={{display:"flex",gap:8}}>
            <div style={{background:"#fff",borderRadius:20,padding:"6px 14px",display:"flex",alignItems:"center",gap:4}}>
              <span style={{color:"#2563eb",fontSize:14}}>✦</span>
              <span style={{fontWeight:700,fontSize:13,color:"#111"}}>60</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎁</div>
            <div style={{background:"rgba(255,255,255,0.15)",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth="1.8" fill="none"/></svg>
            </div>
          </div>
        </div>

        {/* Avatar + username — tout cliquable */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          {/* Photo de profil cliquable */}
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>setShowProfileEdit(true)}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"#374151",border:"3px solid #fff",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
              {avatar ? <img src={avatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="avatar"/> : "👤"}
            </div>
            {/* Badge modifier */}
            <div style={{position:"absolute",bottom:0,right:0,background:"#2563eb",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
          </div>

          {/* Pseudo cliquable */}
          <span onClick={()=>setShowProfileEdit(true)} style={{color:"#fff",fontWeight:700,fontSize:16,cursor:"pointer",borderBottom:"1px dashed rgba(255,255,255,0.4)",paddingBottom:1}}>@{username}</span>

          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:12}}>🔗 beacons.ai/{username}</span>
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"3px 10px"}}>
              <span style={{color:"#fff",fontSize:12,fontWeight:600}}>Share</span>
            </div>
          </div>
          <div style={{background:"#2563eb",borderRadius:20,padding:"10px 24px",display:"flex",alignItems:"center",gap:8,marginTop:4}}>
            <span style={{color:"#fff",fontSize:14}}>✦</span>
            <span style={{color:"#fff",fontWeight:700,fontSize:15}}>Chat with Beam</span>
          </div>
        </div>

        {/* Bouton modifier profil discret */}
        <button onClick={()=>setShowProfileEdit(true)} style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",background:"rgba(255,255,255,0.15)",border:"none",borderRadius:20,padding:"4px 12px",color:"rgba(255,255,255,0.7)",fontSize:11,cursor:"pointer"}}>
          Modifier le profil
        </button>
      </div>

      {/* ── Modal édition profil ── */}
      {showProfileEdit&&(
        <ProfileEditModal
          username={username} avatar={avatar} bannerColor={bannerColor}
          onClose={()=>setShowProfileEdit(false)}
          onSave={(u,a,b)=>{setUsername(u);setAvatar(a);setBannerColor(b);setShowProfileEdit(false);}}
        />
      )}

      {/* Home content */}
      {activeNav==="home"&&(
        <div style={{padding:"16px"}}>
          {/* Beam widget */}
          <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
            <span style={{flex:1,color:"#374151",fontSize:14}}>How can I help you today?</span>
            <div style={{background:"#2563eb",borderRadius:10,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
          </div>

          {/* Content section */}
          <div style={{fontWeight:800,fontSize:20,color:"#111",marginBottom:12}}>Content</div>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
            {["All","Search ✦","Trends ✦","Instagram","TikTok"].map((t,i)=>(
              <div key={t} style={{
                paddingBottom:8,paddingRight:16,paddingLeft:i===0?0:0,
                borderBottom:i===0?"2.5px solid #111":"2.5px solid transparent",
                color:i===0?"#111":"#888",fontSize:14,fontWeight:i===0?700:400,
                cursor:"pointer",whiteSpace:"nowrap",flexShrink:0
              }}>{t}</div>
            ))}
          </div>

          {/* Date range */}
          <div style={{border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:12,background:"#fff"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#555" strokeWidth="1.5" fill="none"/><line x1="3" y1="9" x2="21" y2="9" stroke="#555" strokeWidth="1.5"/><line x1="8" y1="2" x2="8" y2="6" stroke="#555" strokeWidth="1.5"/><line x1="16" y1="2" x2="16" y2="6" stroke="#555" strokeWidth="1.5"/></svg>
            <span style={{color:"#374151",fontSize:14}}>
              {new Date(Date.now()-7*864e5).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} – {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
            </span>
          </div>

          {/* Stat cards */}
          <StatCard title="Total Followers" value={stats.followers}
            sub={`+${stats.newFollowers} (0.00%) L7D`}
            data={generateData(stats.followers)}
          />
          <StatCard title="Total Views" value={stats.views}
            sub="L7D"
            data={generateData(stats.views)}
          />
          <StatCard title="Total Earnings" value={totalEarnings}
            fmt={fmtUSD}
            data={generateData(totalEarnings)}
          />
          <StatCard title="Link Clicks" value={stats.linkClicks}
            sub="L7D"
            data={generateData(stats.linkClicks)}
          />
        </div>
      )}

      {["linkinbio"].includes(activeNav)&&(
        <div style={{padding:"60px 20px",textAlign:"center",color:"#888",fontSize:14}}>
          <div style={{fontSize:40,marginBottom:12}}>🚧</div>
          Onglet bientôt disponible
        </div>
      )}

      {/* ── Products tab ── */}
      {activeNav==="products"&&(
        <div style={{background:"#f9fafb",minHeight:"100vh",paddingBottom:80}}>
          {/* Header */}
          <div style={{background:"#fff",padding:"16px 20px 12px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,fontSize:20,color:"#111"}}>Products</span>
            <button onClick={()=>{setEditProductId(null);setShowProductForm(true);}} style={{
              background:"#2563eb",border:"none",borderRadius:10,padding:"8px 16px",
              color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Nouveau
            </button>
          </div>

          {/* Résumé total */}
          <div style={{margin:"14px 16px",background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",padding:"16px"}}>
            <div style={{color:"#888",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Total des ventes</div>
            <div style={{fontSize:28,fontWeight:800,color:"#111",letterSpacing:-0.5}}>{fmtUSD(totalEarnings)}</div>
            <div style={{color:"#16a34a",fontSize:13,marginTop:4}}>
              {products.reduce((s,p)=>s+p.ventes.length,0)} vente(s) · {products.length} produit(s)
            </div>
          </div>

          {/* Liste produits */}
          <div style={{padding:"0 16px"}}>
            {products.length===0&&(
              <div style={{textAlign:"center",color:"#aaa",fontSize:14,padding:"50px 0"}}>
                <div style={{fontSize:40,marginBottom:12}}>📦</div>
                Aucun produit — ajoutes-en un !
              </div>
            )}
            {products.map(p=>{
              const totalP = p.ventes.reduce((s,v)=>s+Number(v.montant||0),0);
              return (
                <div key={p.id} style={{background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",padding:"16px",marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:"#111",marginBottom:2}}>{p.nom}</div>
                      <div style={{color:"#2563eb",fontSize:14,fontWeight:600}}>{fmtUSD(p.prix)} / vente</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{setEditProductId(p.id);setShowProductForm(true);}} style={{background:"#f3f4f6",border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",color:"#555",fontWeight:600}}>Modifier</button>
                      <button onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"#fee2e2",border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",color:"#ef4444",fontWeight:600}}>Suppr.</button>
                    </div>
                  </div>

                  {/* Stats produit */}
                  <div style={{display:"flex",gap:10,marginBottom:12}}>
                    <div style={{flex:1,background:"#f0fdf4",borderRadius:10,padding:"10px",textAlign:"center"}}>
                      <div style={{color:"#16a34a",fontSize:18,fontWeight:800}}>{fmtUSD(totalP)}</div>
                      <div style={{color:"#888",fontSize:11}}>Gains</div>
                    </div>
                    <div style={{flex:1,background:"#eff6ff",borderRadius:10,padding:"10px",textAlign:"center"}}>
                      <div style={{color:"#2563eb",fontSize:18,fontWeight:800}}>{p.ventes.length}</div>
                      <div style={{color:"#888",fontSize:11}}>Ventes</div>
                    </div>
                  </div>

                  {/* Bouton ajouter vente */}
                  <button onClick={()=>setSaleModal(p)} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px dashed #2563eb",background:"transparent",color:"#2563eb",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                    + Ajouter une vente
                  </button>

                  {/* Historique ventes */}
                  {p.ventes.length>0&&(
                    <div style={{marginTop:12,borderTop:"1px solid #f3f4f6",paddingTop:10}}>
                      <div style={{color:"#888",fontSize:11,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Historique</div>
                      {[...p.ventes].sort((a,b)=>b.date.localeCompare(a.date)).map(v=>(
                        <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:7,paddingBottom:7,borderBottom:"1px solid #f9fafb"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:"#111"}}>{v.client}</div>
                            <div style={{fontSize:11,color:"#aaa"}}>{v.date}</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{color:"#16a34a",fontSize:14,fontWeight:700}}>{fmtUSD(v.montant)}</span>
                            <button onClick={()=>setProducts(prev=>prev.map(x=>x.id===p.id?{...x,ventes:x.ventes.filter(s=>s.id!==v.id)}:x))} style={{background:"none",border:"none",color:"#ddd",fontSize:16,cursor:"pointer",lineHeight:1}}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modal vente produit ── */}
      {saleModal&&(
        <BeaconsSaleModal
          product={saleModal}
          onClose={()=>setSaleModal(null)}
          onSave={(vente)=>{
            setProducts(prev=>prev.map(p=>p.id===saleModal.id?{...p,ventes:[...p.ventes,vente]}:p));
            setSaleModal(null);
          }}
        />
      )}

      {/* ── Modal ajout/édition produit ── */}
      {showProductForm&&(
        <ProductFormModal
          product={editProductId ? products.find(p=>p.id===editProductId) : null}
          onClose={()=>{setShowProductForm(false);setEditProductId(null);}}
          onSave={(data)=>{
            if(editProductId){
              setProducts(prev=>prev.map(p=>p.id===editProductId?{...p,...data}:p));
            } else {
              setProducts(prev=>[...prev,{...data,id:Date.now(),ventes:[]}]);
            }
            setShowProductForm(false);setEditProductId(null);
          }}
        />
      )}

      {/* ── More menu ── */}
      {activeNav==="more" && beaconsPage==="more" && (
        <div style={{background:"#fff",minHeight:"100vh",paddingBottom:120}}>
          <div style={{fontWeight:700,fontSize:17,color:"#111",textAlign:"center",padding:"18px 0 12px",borderBottom:"1px solid #f3f4f6"}}>More</div>

          {[
            {label:"Affiliate Products", icon:"cart"},
            {label:"Marketing",          icon:"megaphone"},
            {label:"Analytics",          icon:"bars"},
            {label:"Sales & Payouts",    icon:"cart2", action:true},
            {label:"Audience",           icon:"users"},
            {label:"Website",            icon:"monitor"},
          ].map(item=>(
            <div key={item.label} onClick={item.action?()=>setBeaconsPage("payouts"):undefined} style={{
              display:"flex",alignItems:"center",gap:16,padding:"18px 20px",
              borderBottom:"1px solid #f5f5f5",cursor:item.action?"pointer":"default"
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                {item.icon==="cart"&&<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="#555" strokeWidth="1.5" fill="none"/><line x1="3" y1="6" x2="21" y2="6" stroke="#555" strokeWidth="1.5"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#555" strokeWidth="1.5" fill="none"/></>}
                {item.icon==="megaphone"&&<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>}
                {item.icon==="bars"&&<><line x1="18" y1="20" x2="18" y2="10" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/></>}
                {item.icon==="cart2"&&<><circle cx="9" cy="21" r="1" fill="#555"/><circle cx="20" cy="21" r="1" fill="#555"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round"/></>}
                {item.icon==="users"&&<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#555" strokeWidth="1.5" fill="none"/><circle cx="9" cy="7" r="4" stroke="#555" strokeWidth="1.5" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#555" strokeWidth="1.5" fill="none"/></>}
                {item.icon==="monitor"&&<><rect x="2" y="3" width="20" height="14" rx="2" stroke="#555" strokeWidth="1.5" fill="none"/><line x1="8" y1="21" x2="16" y2="21" stroke="#555" strokeWidth="1.5"/><line x1="12" y1="17" x2="12" y2="21" stroke="#555" strokeWidth="1.5"/></>}
              </svg>
              <span style={{fontSize:16,color:"#111",flex:1}}>{item.label}</span>
              {item.action&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="#ccc" strokeWidth="2.2" strokeLinecap="round"/></svg>}
            </div>
          ))}

          <div style={{height:8,background:"#f9fafb"}}/>

          {[
            {label:"Settings",  icon:"settings"},
            {label:"Referrals", icon:"gift"},
          ].map(item=>(
            <div key={item.label} style={{display:"flex",alignItems:"center",gap:16,padding:"18px 20px",borderBottom:"1px solid #f5f5f5"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                {item.icon==="settings"&&<><circle cx="12" cy="12" r="3" stroke="#555" strokeWidth="1.5" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#555" strokeWidth="1.5" fill="none"/></>}
                {item.icon==="gift"&&<><path d="M20 12v10H4V12" stroke="#555" strokeWidth="1.5" fill="none"/><path d="M22 7H2v5h20V7z" stroke="#555" strokeWidth="1.5" fill="none"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="#555" strokeWidth="1.5" fill="none"/></>}
              </svg>
              <span style={{fontSize:16,color:"#111"}}>{item.label}</span>
            </div>
          ))}

          <div style={{position:"fixed",bottom:65,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:50}}>
            <button style={{width:"100%",padding:"18px",border:"none",background:"linear-gradient(90deg,#f97316,#ec4899)",color:"#fff",fontSize:14,fontWeight:800,letterSpacing:1.5,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              👑 BEACONS PRO
            </button>
          </div>
        </div>
      )}

      {/* ── Sales & Payouts ── */}
      {activeNav==="more" && beaconsPage==="payouts" && (
        <div style={{background:"#fff",minHeight:"100vh",paddingBottom:80}}>
          <div style={{display:"flex",alignItems:"center",padding:"16px 20px 8px"}}>
            <button onClick={()=>setBeaconsPage("more")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#111",fontSize:15}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
              Back
            </button>
            <span style={{fontWeight:700,fontSize:17,color:"#111",flex:1,textAlign:"center",marginRight:40}}>Payouts</span>
          </div>

          <div style={{padding:"0 16px"}}>
            {/* Total Payouts card */}
            <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"18px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,color:"#111"}}>Total Payouts</span>
                <button style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"5px 12px",background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                  VIEW ANALYTICS
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </button>
              </div>
              <button onClick={()=>setEditTarget({key:"earnings"})} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:28,fontWeight:800,color:"#111",letterSpacing:-0.5,marginBottom:10}}>
                  {totalEarnings.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} $US
                </div>
              </button>

              {/* Barre colorée */}
              <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:14}}>
                <div style={{flex:totalEarnings*0.993,background:"#6366f1"}}/>
                <div style={{flex:totalEarnings*0.006,background:"#f472b6"}}/>
                <div style={{flex:0.001,background:"#86efac"}}/>
              </div>

              {[
                {color:"#6366f1", label:"Direct Sale",       badge:true,  val: totalEarnings*0.993},
                {color:"#f472b6", label:"Affiliate Cash Out", badge:false, val: totalEarnings*0.006},
                {color:"#86efac", label:"Referral Cash Out",  badge:false, val: 0},
              ].map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:r.color,flexShrink:0}}/>
                  <span style={{fontSize:14,color:"#374151",flex:1}}>{r.label}</span>
                  {r.badge&&<span style={{background:"#22c55e",color:"#fff",fontSize:11,fontWeight:700,borderRadius:20,padding:"2px 10px",display:"flex",alignItems:"center",gap:4}}>⚡ INSTANT</span>}
                  <span style={{fontSize:14,color:"#111",fontWeight:600}}>{r.val.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} $US</span>
                </div>
              ))}
            </div>

            {/* Affiliate Commission */}
            <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"18px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,color:"#111"}}>Affiliate Commission</span>
                <div style={{width:18,height:18,borderRadius:"50%",border:"1.5px solid #bbb",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:10,color:"#888",fontWeight:700}}>i</span>
                </div>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:"#111",marginBottom:14}}>0 $US</div>
              <button style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:"#f3f4f6",color:"#aaa",fontSize:15,fontWeight:600,cursor:"not-allowed",marginBottom:10}}>Cash out</button>
              <button onClick={()=>setBeaconsPage("sales")} style={{width:"100%",padding:"13px",borderRadius:10,border:"1px solid #e5e7eb",background:"#fff",color:"#111",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                View all sales
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Referral Commission */}
            <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,color:"#111"}}>Referral Commission</span>
                <div style={{width:18,height:18,borderRadius:"50%",border:"1.5px solid #bbb",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:10,color:"#888",fontWeight:700}}>i</span>
                </div>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:"#111",marginBottom:14}}>0 $US</div>
              <button style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:"#f3f4f6",color:"#aaa",fontSize:15,fontWeight:600,cursor:"not-allowed",marginBottom:10}}>Cash out</button>
              <button style={{width:"100%",padding:"13px",borderRadius:10,border:"1px solid #e5e7eb",background:"#fff",color:"#111",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                View all referrals
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Digital Product Sales ── */}
      {activeNav==="more" && beaconsPage==="sales" && (
        <div style={{background:"#fff",minHeight:"100vh",paddingBottom:80}}>
          <div style={{display:"flex",alignItems:"center",padding:"16px 20px 8px"}}>
            <button onClick={()=>setBeaconsPage("payouts")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#111",fontSize:15}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
              Back
            </button>
            <span style={{fontWeight:700,fontSize:17,color:"#111",flex:1,textAlign:"center",marginRight:40}}>Digital Product Sales</span>
          </div>

          <div style={{padding:"0 16px"}}>
            {/* Lifetime Sales */}
            <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"18px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:15,color:"#111"}}>Lifetime Sales</span>
                <button style={{border:"1px solid #e5e7eb",borderRadius:8,padding:"5px 12px",background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                  VIEW ANALYTICS <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div style={{fontSize:26,fontWeight:800,color:"#111",letterSpacing:-0.5,marginBottom:10}}>
                {fmtUSD(totalEarnings)}
              </div>

              {/* Barre multi-couleurs */}
              <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:14}}>
                {["#6366f1","#f472b6","#fbbf24","#2dd4bf"].map((c,i)=>(
                  <div key={c} style={{flex:products[i]?.ventes.reduce((s,v)=>s+v.montant,0)||1,background:c}}/>
                ))}
              </div>

              {products.map((p,i)=>{
                const colors=["#6366f1","#f472b6","#fbbf24","#2dd4bf"];
                const tot=p.ventes.reduce((s,v)=>s+v.montant,0);
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:colors[i%4],flexShrink:0}}/>
                    <span style={{fontSize:13,color:"#374151",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nom}</span>
                    <span style={{fontSize:13,color:"#111",fontWeight:600,flexShrink:0}}>{fmtUSD(tot)}</span>
                  </div>
                );
              })}

              {/* Courbe cumulative */}
              <div style={{height:1,background:"#e5e7eb",margin:"14px 0 10px"}}/>
              <div style={{height:160,position:"relative"}}>
                <svg width="100%" height="160" viewBox="0 0 300 160" preserveAspectRatio="none">
                  <polyline
                    points="0,155 20,155 40,150 55,130 70,100 85,70 100,45 115,30 130,20 145,15 160,13 180,12 200,12 220,12 240,12 260,12 280,12 300,12"
                    fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                {/* X axis labels */}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:4}}>
                  {["Mar 03","Mar 26","Apr 18","May 11","Jun"].map(l=>(
                    <span key={l} style={{fontSize:10,color:"#888"}}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales history */}
            <div style={{fontWeight:800,fontSize:18,color:"#111",marginBottom:12}}>Sales history</div>
            <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:"14px"}}>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <button style={{border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px",background:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Add Filter</button>
                <div style={{flex:1,display:"flex",alignItems:"center",gap:6,border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px",background:"#fff"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6" stroke="#bbb" strokeWidth="1.8"/><line x1="15" y1="15" x2="21" y2="21" stroke="#bbb" strokeWidth="1.8"/></svg>
                  <span style={{color:"#bbb",fontSize:13}}>Search by Product</span>
                </div>
                <button style={{border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px",background:"#fff",cursor:"pointer"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#555" strokeWidth="1.8"/><polyline points="7 10 12 15 17 10" stroke="#555" strokeWidth="1.8"/><line x1="12" y1="15" x2="12" y2="3" stroke="#555" strokeWidth="1.8"/></svg>
                </button>
              </div>
              <div style={{textAlign:"center",color:"#bbb",fontSize:13,padding:"20px 0"}}>
                {products.reduce((s,p)=>s+p.ventes.length,0)===0
                  ? "Aucune vente à afficher"
                  : products.flatMap(p=>p.ventes.map(v=>({...v,produit:p.nom}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map(v=>(
                    <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f3f4f6",textAlign:"left"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"#111"}}>{v.client}</div>
                        <div style={{fontSize:11,color:"#aaa",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:180}}>{v.produit}</div>
                        <div style={{fontSize:11,color:"#aaa"}}>{v.date}</div>
                      </div>
                      <span style={{color:"#16a34a",fontSize:14,fontWeight:700}}>{fmtUSD(v.montant)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget&&(
        <div onClick={()=>setEditTarget(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:480}}>
            <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:16,fontWeight:700,color:"#111",marginBottom:16}}>Modifier — {editTarget.key}</div>
            <input autoFocus type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
              style={{width:"100%",border:"2px solid #2563eb",borderRadius:12,padding:"14px",fontSize:22,color:"#111",outline:"none",boxSizing:"border-box",fontWeight:700}}
            />
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={()=>setEditTarget(null)} style={{flex:1,padding:"14px",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",color:"#888",fontSize:14,cursor:"pointer"}}>Annuler</button>
              <button onClick={()=>{
                const v=Number(editVal);
                if(editTarget.key==="Total Followers") setStats(p=>({...p,followers:v}));
                if(editTarget.key==="Total Views")     setStats(p=>({...p,views:v}));
                if(editTarget.key==="Total Earnings")  setStats(p=>({...p,earnings:v}));
                if(editTarget.key==="Link Clicks")     setStats(p=>({...p,linkClicks:v}));
                setEditTarget(null);
              }} style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:"#2563eb",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #e5e7eb",display:"flex",justifyContent:"space-around",padding:"10px 0 22px",zIndex:100}}>
        {BNAVS.map(item=>{
          const isActive = activeNav===item.key;
          return (
            <div key={item.key} onClick={()=>setActiveNav(item.key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",minWidth:56}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{color:isActive?"#2563eb":"#888"}}>
                {item.icon}
              </svg>
              <span style={{fontSize:10,color:isActive?"#2563eb":"#888",fontWeight:isActive?700:400}}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── App Selector ──────────────────────────────────────────────────────────────
function AppSelector({ onSelect }) {
  return (
    <div style={{
      background:"#0d0d14",minHeight:"100vh",maxWidth:480,margin:"0 auto",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",
      display:"flex",flexDirection:"column",
      padding:"0 24px 40px",
    }}>
      <StatusBar dark={true}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,paddingTop:20}}>
      <div style={{color:"#fff",fontSize:22,fontWeight:800,marginBottom:8,letterSpacing:-0.5}}>Choisir une démo</div>
      <div style={{color:"#666",fontSize:14,marginBottom:24,textAlign:"center"}}>Sélectionne l'application que tu veux simuler</div>

      {/* Demo Dash */}
      <button onClick={()=>onSelect("stripe")} style={{
        width:"100%",background:"#11112a",border:"1.5px solid #2a2a45",
        borderRadius:18,padding:"24px 20px",cursor:"pointer",textAlign:"left",
        display:"flex",alignItems:"center",gap:16,
        boxShadow:"0 4px 20px rgba(99,91,255,0.15)"
      }}>
        <div style={{width:56,height:56,background:"#635bff",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#fff",fontSize:22,fontWeight:800,letterSpacing:-1}}>S</span>
        </div>
        <div>
          <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:4}}>Demo Dash</div>
          <div style={{color:"#888",fontSize:13,lineHeight:1.4}}>Dashboard paiements, virements, soldes & rapports</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:"auto",flexShrink:0}}>
          <polyline points="9 18 15 12 9 6" stroke="#635bff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Demo Vente */}
      <button onClick={()=>onSelect("beacons")} style={{
        width:"100%",background:"#11112a",border:"1.5px solid #2a2a45",
        borderRadius:18,padding:"24px 20px",cursor:"pointer",textAlign:"left",
        display:"flex",alignItems:"center",gap:16,
        boxShadow:"0 4px 20px rgba(37,99,235,0.15)"
      }}>
        <div style={{width:56,height:56,background:"#2563eb",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#fff",fontSize:22,fontWeight:800,letterSpacing:-1}}>B</span>
        </div>
        <div>
          <div style={{color:"#fff",fontSize:18,fontWeight:800,marginBottom:4}}>Demo Vente</div>
          <div style={{color:"#888",fontSize:13,lineHeight:1.4}}>Followers, vues, gains & link-in-bio analytics</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:"auto",flexShrink:0}}>
          <polyline points="9 18 15 12 9 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Notice développement */}
      <div style={{color:"#635bff",fontSize:12,textAlign:"center",marginTop:4,fontStyle:"italic",opacity:0.8}}>
        En phase de développement — pas encore terminé
      </div>

      <div style={{color:"#333",fontSize:11,marginTop:12,textAlign:"center",letterSpacing:0.5,textTransform:"uppercase"}}>Démo pédagogique — chiffres fictifs</div>
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("login");
  const [appData, setAppData] = useState(null);
  const [splashFor, setSplashFor] = useState(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleLogin = (data) => { setAppData(data); setStep("select"); };
  const handleSelect = (choice) => {
    setSplashFor(choice);
    setStep("splash");
    setTimeout(() => setStep(choice), 2200);
  };

  const goBack = () => {
    if (step === "stripe" || step === "beacons") setStep("select");
    else if (step === "select") setStep("login");
  };

  const canGoBack = step === "stripe" || step === "beacons" || step === "select";

  const onTouchStart = (e) => {
    if (!canGoBack) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
    setSwipeX(0);
  };

  const onTouchMove = (e) => {
    if (!swiping || !canGoBack) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Only horizontal swipe starting from left edge
    if (dx > 0 && dy < 60 && touchStartX.current < 40) {
      setSwipeX(Math.min(dx, 300));
    }
  };

  const onTouchEnd = () => {
    if (swipeX > 100) goBack();
    setSwipeX(0);
    setSwiping(false);
  };

  return (
    <div
      style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",position:"relative",fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",overflow:"hidden"}}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Indicateur visuel de swipe */}
      {swipeX > 10 && (
        <div style={{
          position:"fixed",left:0,top:0,bottom:0,width:swipeX,
          background:`linear-gradient(90deg, rgba(99,91,255,${Math.min(swipeX/300*0.3,0.3)}), transparent)`,
          zIndex:9998,pointerEvents:"none",transition:"none"
        }}>
          {swipeX > 50 && (
            <div style={{
              position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",
              width:36,height:36,borderRadius:"50%",
              background:swipeX>100?"#635bff":"rgba(99,91,255,0.4)",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"background 0.15s"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polyline points="15 18 9 12 15 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {step==="login"   && <LoginScreen onLogin={handleLogin}/>}
      {step==="select"  && <AppSelector onSelect={handleSelect}/>}
      {step==="splash"  && <SplashScreen onDone={()=>{}} color={splashFor==="beacons"?"#ffffff":"#4f46e5"} appName={splashFor==="beacons"?"beacons":"stripe"} dark={splashFor==="beacons"}/>}
      {step==="beacons" && <BeaconsDashboard onLogout={()=>setStep("select")}/>}
      {step==="stripe"  && <Dashboard initialData={appData} onLogout={()=>setStep("select")}/>}
    </div>
  );
}
