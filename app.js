// ---------- state ----------
let DATA = null;
const AREAS = ["RMX","BluBird","BBI","Zephyr","Project Hose","RMX Metals","Plan Beyond","MEET x AR","Personal","All"];
const VIEWS = [
  {id:"dashboard",label:"Dashboard",group:"Command"},
  {id:"onlyme",label:"Only-Me Queue",add:"onlyme",addLabel:"Add to queue",group:"Command"},
  {id:"warroom",label:"War Room",add:"projects",addLabel:"Add live-wire",group:"Command"},
  {id:"planning",label:"Planning",add:"objectives",group:"Plan & Run"},
  {id:"projects",label:"Projects",add:"projects",group:"Plan & Run"},
  {id:"tasks",label:"Tasks",add:"tasks",group:"Plan & Run"},
  {id:"decisions",label:"Decisions",add:"decisions",group:"Plan & Run"},
  {id:"meetings",label:"Meetings",add:"meetings",group:"Plan & Run"},
  {id:"risks",label:"Risks",add:"risks",group:"Watch"},
  {id:"hottopics",label:"Hot Topics",add:"hottopics",addLabel:"Add topic",group:"Watch"},
  {id:"stakeholders",label:"Stakeholders",add:"stakeholders",addLabel:"Add stakeholder",group:"Watch"},
  {id:"capital",label:"Capital & Bets",add:"metrics",addLabel:"Add metric",group:"Watch"},
  {id:"commitments",label:"Commitments",add:"commitments",addLabel:"Add commitment",group:"Watch"},
  {id:"cadence",label:"Cadence",add:"updates",addLabel:"Log update",group:"Output"},
  {id:"studio",label:"Briefing Studio",group:"Output"},
  {id:"team",label:"Team",owner:true,group:"Admin"}
];
const TITLES = {dashboard:"Dashboard",onlyme:"Only-Me Queue",warroom:"War Room · Live-Wire",planning:"Planning & Objectives",projects:"Projects",tasks:"Tasks",decisions:"Decisions",meetings:"Meetings",risks:"Risk Register",hottopics:"Hot Topics & Watchlist",stakeholders:"Stakeholders & Comms",capital:"Capital, North Star & Bold Bets",commitments:"Commitments Ledger",cadence:"Cadence",studio:"Briefing Studio",team:"Team & Activity"};
const SINGULAR = {objectives:"objective",projects:"project",tasks:"task",decisions:"decision",meetings:"meeting",risks:"risk",onlyme:"item",hottopics:"topic",stakeholders:"stakeholder",metrics:"metric",commitments:"commitment",updates:"update"};
const STUDIO = [
  {id:"daily",title:"Daily CEO Brief",desc:"Today's focus, flags, due items, your queue."},
  {id:"weekly",title:"Weekly Operating Review",desc:"What moved, what's stuck, the week ahead."},
  {id:"decision",title:"Decision Memo",desc:"One open decision, framed for a call."},
  {id:"board",title:"Board / Investor Update",desc:"Metrics, deal status, risks, the ask."},
  {id:"deal",title:"Deal Brief (Project Hose)",desc:"Milestones, risks, live tension."},
  {id:"warroom",title:"War-Room Brief",desc:"Live-wire items and the unblock decision."},
  {id:"stakeholder",title:"Stakeholder Update",desc:"One stakeholder, last touch, talking points."},
  {id:"monthly",title:"Monthly Business Review",desc:"Cross-entity rollup, cash, bold bets."}
];

const SCHEMAS = {
  objectives:[{k:"title",l:"Objective",t:"text"},{k:"area",l:"Area",t:"area"},{k:"ring",l:"Priority ring (1 critical / 2 important / 3 background)",t:"select",o:["1","2","3"]},{k:"owner",l:"Owner",t:"owner"},{k:"horizon",l:"Horizon",t:"text"},{k:"status",l:"Status",t:"select",o:["on-track","at-risk","off-track","done"]},{k:"progress",l:"Progress %",t:"number"},{k:"notes",l:"Notes",t:"textarea"}],
  projects:[{k:"name",l:"Project",t:"text"},{k:"area",l:"Area",t:"area"},{k:"objectiveId",l:"Linked objective",t:"objective"},{k:"owner",l:"Owner",t:"owner"},{k:"status",l:"Status",t:"select",o:["active","blocked","at-risk","done"]},{k:"priority",l:"Priority",t:"select",o:["high","medium","low"]},{k:"liveWire",l:"Live-wire (War Room)",t:"select",o:["no","yes"]},{k:"startDate",l:"Start",t:"date"},{k:"dueDate",l:"Due",t:"date"},{k:"progress",l:"Progress %",t:"number"},{k:"nextAction",l:"Next action",t:"text"},{k:"notes",l:"Notes",t:"textarea"}],
  tasks:[{k:"title",l:"Task",t:"text"},{k:"area",l:"Area",t:"area"},{k:"owner",l:"Owner",t:"owner"},{k:"due",l:"Due",t:"date"},{k:"status",l:"Status",t:"select",o:["open","doing","done"]},{k:"priority",l:"Priority",t:"select",o:["high","medium","low"]}],
  decisions:[{k:"title",l:"Decision",t:"text"},{k:"area",l:"Area",t:"area"},{k:"owner",l:"Owner",t:"owner"},{k:"status",l:"Status",t:"select",o:["open","decided","deferred"]},{k:"options",l:"Options on the table",t:"textarea"},{k:"decision",l:"Decision",t:"textarea"},{k:"rationale",l:"Rationale",t:"textarea"},{k:"decidedDate",l:"Decided on",t:"date"},{k:"reviewDate",l:"Review by",t:"date"}],
  meetings:[{k:"title",l:"Meeting",t:"text"},{k:"date",l:"Date",t:"date"},{k:"area",l:"Area",t:"area"},{k:"attendees",l:"Attendees",t:"text"},{k:"agenda",l:"Agenda",t:"textarea"},{k:"notes",l:"Notes",t:"textarea"},{k:"actions",l:"Action items",t:"actions"}],
  risks:[{k:"title",l:"Risk",t:"text"},{k:"area",l:"Area",t:"area"},{k:"owner",l:"Owner",t:"owner"},{k:"likelihood",l:"Likelihood",t:"select",o:["low","medium","high"]},{k:"impact",l:"Impact",t:"select",o:["low","medium","high"]},{k:"mitigation",l:"Mitigation",t:"textarea"},{k:"status",l:"Status",t:"select",o:["open","mitigated","closed"]}],
  onlyme:[{k:"title",l:"What needs you",t:"text"},{k:"area",l:"Area",t:"area"},{k:"from",l:"Raised by",t:"text"},{k:"type",l:"Type",t:"select",o:["decision","approval","review","signoff"]},{k:"urgency",l:"Urgency",t:"select",o:["high","medium","low"]},{k:"due",l:"Needed by",t:"date"},{k:"status",l:"Status",t:"select",o:["pending","done"]},{k:"notes",l:"Notes",t:"textarea"}],
  hottopics:[{k:"title",l:"Topic",t:"text"},{k:"area",l:"Area",t:"area"},{k:"category",l:"Category",t:"select",o:["fire","competitor","regulatory","customer","narrative"]},{k:"heat",l:"Heat",t:"select",o:["hot","warm","cooling"]},{k:"owner",l:"Owner",t:"owner"},{k:"status",l:"Status",t:"select",o:["open","closed"]},{k:"notes",l:"Notes",t:"textarea"}],
  stakeholders:[{k:"name",l:"Name",t:"text"},{k:"type",l:"Type",t:"select",o:["board","investor","customer","family","partner","internal"]},{k:"lastTouch",l:"Last touch",t:"date"},{k:"nextTouch",l:"Next touch",t:"date"},{k:"openPromise",l:"Open promise",t:"text"},{k:"owner",l:"Owner",t:"owner"},{k:"notes",l:"Notes",t:"textarea"}],
  metrics:[{k:"label",l:"Metric",t:"text"},{k:"group",l:"Group",t:"select",o:["cash","northstar","bet"]},{k:"area",l:"Area",t:"area"},{k:"value",l:"Current value",t:"text"},{k:"target",l:"Target",t:"text"},{k:"unit",l:"Unit",t:"text"},{k:"period",l:"Period",t:"text"},{k:"notes",l:"Notes",t:"textarea"}],
  commitments:[{k:"promise",l:"Promise",t:"text"},{k:"to",l:"To whom",t:"text"},{k:"by",l:"By when",t:"date"},{k:"area",l:"Area",t:"area"},{k:"owner",l:"Owner",t:"owner"},{k:"status",l:"Status",t:"select",o:["open","kept","broken"]},{k:"notes",l:"Notes",t:"textarea"}],
  updates:[{k:"type",l:"Type",t:"select",o:["daily","weekly"]},{k:"area",l:"Area",t:"area"},{k:"text",l:"Update",t:"textarea"}]
};

// ---------- helpers ----------
const $ = (id)=>document.getElementById(id);
function esc(s){return (s==null?"":s.toString()).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function chip(s){return `<span class="chip s-${(s||"").replace(/\s/g,'-')}">${esc(s)}</span>`;}
function ringChip(r){return `<span class="ring ring${r}">RING ${r}</span>`;}
function prog(n){n=Number(n)||0;return `<div class="prog"><i style="width:${n}%"></i></div>`;}

// ---------- load + route ----------
async function load(){
  const r = await fetch("/api/data");
  DATA = await r.json();
  renderNav(); route();
}
function renderNav(){
  let html="", lastGroup="";
  VIEWS.filter(v=>!v.owner||DATA.me.role==="owner").forEach(v=>{
    if(v.group!==lastGroup){ html+=`<div class="navgroup">${v.group}</div>`; lastGroup=v.group; }
    let badge="";
    if(v.id==="dashboard"&&DATA.counts.red) badge=`<span class="badge">${DATA.counts.red}</span>`;
    if(v.id==="onlyme"&&DATA.counts.onlyme) badge=`<span class="badge amber">${DATA.counts.onlyme}</span>`;
    if(v.id==="warroom"&&DATA.counts.livewire) badge=`<span class="badge amber">${DATA.counts.livewire}</span>`;
    if(v.id==="hottopics"&&DATA.counts.hot) badge=`<span class="badge">${DATA.counts.hot}</span>`;
    html+=`<a id="nav-${v.id}" onclick="goto('${v.id}')">${v.label}${badge}</a>`;
  });
  $("nav").innerHTML=html;
}
function goto(id){location.hash=id;$("side").classList.remove("open");}
function route(){
  let id = location.hash.slice(1) || "dashboard";
  const v = VIEWS.find(x=>x.id===id);
  if(!v || (v.owner && DATA.me.role!=="owner")) id="dashboard";
  document.querySelectorAll(".nav a").forEach(a=>a.classList.remove("active"));
  const link=$("nav-"+id); if(link) link.classList.add("active");
  $("vTitle").textContent = TITLES[id];
  $("vSub").textContent = new Date().toDateString().toUpperCase();
  const view = VIEWS.find(x=>x.id===id);
  let actions="";
  if(view.add) actions=`<button onclick="add('${view.add}')">+ ${view.addLabel||("Add "+SINGULAR[view.add])}</button>`;
  if(id==="team") actions=`<button onclick="openUser()">+ Add user</button>`;
  $("vActions").innerHTML=actions;
  $("view").innerHTML=RENDER[id]();
}

// ---------- shared renderers ----------
function rowList(items, emptyMsg){ return items.length?items.join(""):`<div class="empty">${emptyMsg}</div>`; }
function flagsHTML(list){ return list.length?list.map(f=>`<div class="flag ${f.level}"><div class="bar"></div><div><div class="rule">${esc(f.rule)} · ${esc(f.area)} · ${esc(f.owner||"unassigned")}</div><div class="t">${esc(f.item)}</div><div class="m">${esc(f.detail)}</div></div></div>`).join(""):`<div class="empty">Nothing is slipping.</div>`; }

const RENDER = {
  dashboard(){
    const c=DATA.counts;
    const tiles=`<div class="tiles">
      <div class="tile red"><div class="v">${c.red}</div><div class="l">Red flags</div></div>
      <div class="tile amber"><div class="v">${c.amber}</div><div class="l">Amber flags</div></div>
      <div class="tile"><div class="v">${c.onlyme}</div><div class="l">Only-Me queue</div></div>
      <div class="tile"><div class="v">${c.livewire}</div><div class="l">Live-wire</div></div>
      <div class="tile"><div class="v">${c.projects}</div><div class="l">Open projects</div></div>
      <div class="tile"><div class="v">${c.decisions}</div><div class="l">Open decisions</div></div></div>`;
    const today = rowList(DATA.dueToday.map(x=>`<div class="row" style="cursor:default"><span class="area">${esc(x.area)} · ${esc(x.kind)}</span><div class="t">${esc(x.title)}</div><div class="m">${esc(x.owner||"unassigned")}</div></div>`),"Clear runway today.");
    const week = rowList(DATA.upcoming.map(x=>`<div class="row" style="cursor:default"><span class="area">${esc(x.area)} · ${esc(x.kind)}</span><div class="t">${esc(x.title)}</div><div class="m">${esc(x.when)} · ${esc(x.owner||"unassigned")}</div></div>`),"Nothing due in 7 days.");
    const obj = rowList((DATA.objectives||[]).map(o=>`<div class="row" onclick="edit('objectives','${o.id}')"><div style="display:flex;justify-content:space-between;gap:10px"><div><span class="area">${esc(o.area)}</span> ${ringChip(o.ring)} ${chip(o.status)}<div class="t">${esc(o.title)}</div></div><div class="m">${o.progress}%</div></div>${prog(o.progress)}</div>`),"No objectives.");
    const wl = rowList(Object.entries(DATA.workload).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="row" style="cursor:default"><div style="display:flex;justify-content:space-between"><div class="t">${esc(n)}</div><div class="m">${v} open</div></div></div>`),"No open work.");
    return tiles + `<div class="grid2">
      <div class="card"><h2>Flags <span class="sub">${DATA.flags.length} open</span></h2><div class="body">${flagsHTML(DATA.flags)}</div></div>
      <div><div class="card"><h2>Due Today</h2><div class="body">${today}</div></div><div class="card"><h2>This Week</h2><div class="body">${week}</div></div></div></div>
      <div class="grid2"><div class="card"><h2>Objective Health</h2><div class="body">${obj}</div></div><div class="card"><h2>Workload</h2><div class="body">${wl}</div></div></div>`;
  },
  onlyme(){
    const q=[...(DATA.onlyme||[])].sort((a,b)=>(a.status==="pending"?0:1)-(b.status==="pending"?0:1));
    const rows=q.map(x=>`<tr class="clickable" onclick="edit('onlyme','${x.id}')"><td><span class="area">${esc(x.area)}</span><div class="t">${esc(x.title)}</div><div class="m">from ${esc(x.from||"office")}</div></td><td>${chip(x.type)}</td><td>${chip(x.urgency)}</td><td class="m">${x.due||"—"}</td><td>${chip(x.status)}</td></tr>`).join("");
    return `<div class="card"><h2>What only you can resolve</h2><div class="body"><table><thead><tr><th>Item</th><th>Type</th><th>Urgency</th><th>Needed by</th><th>Status</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">Queue is clear.</td></tr>`}</tbody></table></div></div>`;
  },
  warroom(){
    const lw=(DATA.projects||[]).filter(p=>p.liveWire==="yes"&&p.status!=="done");
    const cards=lw.map(p=>`<div class="card"><h2>${esc(p.name)} <span class="sub">${esc(p.area)}</span></h2><div class="body">
      <div style="margin-bottom:6px">${chip(p.status)} ${chip(p.priority)} <span class="m">${esc(p.owner||"unassigned")} · due ${p.dueDate||"—"}</span></div>
      <span class="area">Next action</span><div class="t">${esc(p.nextAction||"not set")}</div>
      ${p.notes?`<div class="m" style="margin-top:6px">${esc(p.notes)}</div>`:""}
      ${prog(p.progress)}<button class="linkbtn" style="margin-top:8px" onclick="edit('projects','${p.id}')">Open project</button></div></div>`).join("");
    const red=DATA.flags.filter(f=>f.level==="red");
    return (cards||`<div class="card"><div class="body"><div class="empty">No live-wire projects. Flag the critical few with "Live-wire: yes".</div></div></div>`)
      + `<div class="card"><h2>Red Flags Across The Center</h2><div class="body">${flagsHTML(red)}</div></div>`;
  },
  planning(){
    const rings={1:[],2:[],3:[]}; (DATA.objectives||[]).forEach(o=>(rings[o.ring]||rings[2]).push(o));
    const names={1:"Ring 1 · Critical",2:"Ring 2 · Important",3:"Ring 3 · Background"};
    return [1,2,3].map(r=>`<div class="card"><h2>${names[r]} <span class="sub">${rings[r].length}</span></h2><div class="body">${rowList(rings[r].map(o=>`<div class="row" onclick="edit('objectives','${o.id}')"><div style="display:flex;justify-content:space-between;gap:10px"><div><span class="area">${esc(o.area)} · ${esc(o.horizon)}</span> ${chip(o.status)}<div class="t">${esc(o.title)}</div><div class="m">${esc(o.owner||"unassigned")}</div></div><div class="m">${o.progress}%</div></div>${prog(o.progress)}</div>`),"Empty.")}</div></div>`).join("");
  },
  projects(){
    const rows=(DATA.projects||[]).map(p=>`<tr class="clickable" onclick="edit('projects','${p.id}')"><td><span class="area">${esc(p.area)}${p.liveWire==="yes"?" · LIVE-WIRE":""}</span><div class="t">${esc(p.name)}</div><div class="m">${esc(p.nextAction||"no next action")}</div></td><td>${esc(p.owner||"—")}</td><td>${chip(p.status)}</td><td class="m">${p.dueDate||"—"}</td><td style="min-width:90px">${prog(p.progress)}<div class="m">${p.progress}%</div></td></tr>`).join("");
    return `<div class="card"><div class="body"><table><thead><tr><th>Project</th><th>Owner</th><th>Status</th><th>Due</th><th>Progress</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">No projects.</td></tr>`}</tbody></table></div></div>`;
  },
  tasks(){
    const rows=(DATA.tasks||[]).map(k=>`<tr class="clickable" onclick="edit('tasks','${k.id}')"><td><span class="area">${esc(k.area)}</span><div class="t">${esc(k.title)}</div></td><td>${esc(k.owner||"—")}</td><td>${chip(k.status)}</td><td>${chip(k.priority)}</td><td class="m">${k.due||"—"}</td></tr>`).join("");
    return `<div class="card"><div class="body"><table><thead><tr><th>Task</th><th>Owner</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">No tasks.</td></tr>`}</tbody></table></div></div>`;
  },
  decisions(){
    const rows=(DATA.decisions||[]).map(d=>`<tr class="clickable" onclick="edit('decisions','${d.id}')"><td><span class="area">${esc(d.area)}</span><div class="t">${esc(d.title)}</div><div class="m">${esc(d.decision||d.options||"")}</div></td><td>${esc(d.owner||"—")}</td><td>${chip(d.status)}</td><td class="m">${d.reviewDate||"—"}</td></tr>`).join("");
    return `<div class="card"><div class="body"><table><thead><tr><th>Decision</th><th>Owner</th><th>Status</th><th>Review by</th></tr></thead><tbody>${rows||`<tr><td colspan="4" class="empty">No decisions.</td></tr>`}</tbody></table></div></div>`;
  },
  meetings(){
    return (DATA.meetings||[]).map(m=>{
      const acts=(m.actions||[]).map(a=>`<div class="row" style="cursor:default"><div class="t">${a.done?"✓ ":""}${esc(a.text)}</div><div class="m">${esc(a.owner||"unassigned")} · due ${a.due||"—"}</div></div>`).join("")||`<div class="empty">No action items.</div>`;
      return `<div class="card"><h2>${esc(m.title)} <span class="sub">${esc(m.date)}</span></h2><div class="body"><div class="m" style="margin-bottom:6px">${esc(m.area)} · ${esc(m.attendees||"")}</div>${m.agenda?`<div style="margin-bottom:8px"><span class="area">Agenda</span><div>${esc(m.agenda)}</div></div>`:""}<span class="area">Action items</span>${acts}<button class="linkbtn" style="margin-top:8px" onclick="edit('meetings','${m.id}')">Edit meeting</button></div></div>`;
    }).join("")||`<div class="card"><div class="body"><div class="empty">No meetings.</div></div></div>`;
  },
  risks(){
    const rows=(DATA.risks||[]).map(r=>`<tr class="clickable" onclick="edit('risks','${r.id}')"><td><span class="area">${esc(r.area)}</span><div class="t">${esc(r.title)}</div><div class="m">${esc(r.mitigation||"no mitigation")}</div></td><td>${esc(r.owner||"—")}</td><td>${chip(r.likelihood)}</td><td>${chip(r.impact)}</td><td>${chip(r.status)}</td></tr>`).join("");
    return `<div class="card"><div class="body"><table><thead><tr><th>Risk</th><th>Owner</th><th>Likelihood</th><th>Impact</th><th>Status</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">No risks.</td></tr>`}</tbody></table></div></div>`;
  },
  hottopics(){
    const rows=(DATA.hottopics||[]).map(h=>{
      const cat = h.category==="fire"?`<span class="cat cat-fire">fire</span>`:(h.heat==="hot"?`<span class="cat cat-hot">${esc(h.category)}</span>`:`<span class="chip s-open">${esc(h.category)}</span>`);
      return `<tr class="clickable" onclick="edit('hottopics','${h.id}')"><td><span class="area">${esc(h.area)}</span><div class="t">${esc(h.title)}</div><div class="m">${esc(h.notes||"")}</div></td><td>${cat}</td><td>${chip(h.heat)}</td><td>${esc(h.owner||"—")}</td><td>${chip(h.status)}</td></tr>`;
    }).join("");
    return `<div class="card"><div class="body"><table><thead><tr><th>Topic</th><th>Category</th><th>Heat</th><th>Owner</th><th>Status</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">Nothing on the watchlist.</td></tr>`}</tbody></table></div></div>`;
  },
  stakeholders(){
    const rows=(DATA.stakeholders||[]).map(s=>`<tr class="clickable" onclick="edit('stakeholders','${s.id}')"><td><div class="t">${esc(s.name)}</div><div class="m">${esc(s.openPromise||"no open promise")}</div></td><td>${chip(s.type)}</td><td class="m">${s.lastTouch||"never"}</td><td class="m">${s.nextTouch||"—"}</td><td>${esc(s.owner||"—")}</td></tr>`).join("");
    return `<div class="card"><div class="body"><table><thead><tr><th>Stakeholder</th><th>Type</th><th>Last touch</th><th>Next touch</th><th>Owner</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">No stakeholders.</td></tr>`}</tbody></table></div></div>`;
  },
  capital(){
    const g=(name)=>(DATA.metrics||[]).filter(m=>m.group===name);
    const block=(title,arr)=>`<div class="card"><h2>${title}</h2><div class="body">${rowList(arr.map(m=>`<div class="row" onclick="edit('metrics','${m.id}')"><div style="display:flex;justify-content:space-between"><div><span class="area">${esc(m.area)} · ${esc(m.period||"")}</span><div class="t">${esc(m.label)}</div></div><div class="m">${esc(m.value||"—")}${m.unit?" "+esc(m.unit):""}${m.target?" / target "+esc(m.target):""}</div></div></div>`),"None.")}</div></div>`;
    return block("Cash",g("cash"))+block("North Star Metrics",g("northstar"))+block("Bold Bets",g("bet"));
  },
  commitments(){
    const rows=(DATA.commitments||[]).map(c=>`<tr class="clickable" onclick="edit('commitments','${c.id}')"><td><span class="area">${esc(c.area)}</span><div class="t">${esc(c.promise)}</div></td><td>${esc(c.to||"—")}</td><td class="m">${c.by||"—"}</td><td>${esc(c.owner||"—")}</td><td>${chip(c.status)}</td></tr>`).join("");
    return `<div class="card"><h2>Every promise, tracked to its owner</h2><div class="body"><table><thead><tr><th>Promise</th><th>To</th><th>By</th><th>Owner</th><th>Status</th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">No open commitments.</td></tr>`}</tbody></table></div></div>`;
  },
  cadence(){
    const red=DATA.flags.filter(f=>f.level==="red");
    const daily=(DATA.updates||[]).filter(u=>u.type==="daily").slice(0,6);
    const weekly=(DATA.updates||[]).filter(u=>u.type==="weekly").slice(0,6);
    const dueT=rowList(DATA.dueToday.map(x=>`<div class="row" style="cursor:default"><span class="area">${esc(x.area)} · ${esc(x.kind)}</span><div class="t">${esc(x.title)}</div></div>`),"Nothing due today.");
    const redH=red.length?red.map(f=>`<div class="flag red"><div class="bar"></div><div><div class="rule">${esc(f.rule)} · ${esc(f.owner||"unassigned")}</div><div class="t">${esc(f.item)}</div></div></div>`).join(""):`<div class="empty">No red flags.</div>`;
    const wk=rowList(DATA.upcoming.map(x=>`<div class="row" style="cursor:default"><span class="area">${esc(x.area)} · ${esc(x.kind)}</span><div class="t">${esc(x.title)}</div><div class="m">${esc(x.when)}</div></div>`),"Nothing this week.");
    const log=(arr)=>rowList(arr.map(u=>`<div class="row" style="cursor:default"><div class="m">${u.date} · ${esc(u.who||"")} · ${esc(u.area||"")}</div><div class="t">${esc(u.text)}</div></div>`),"No entries.");
    return `<div class="grid2"><div class="card"><h2>Daily Standup</h2><div class="body"><span class="area">Due today</span>${dueT}<div style="margin-top:10px"></div><span class="area">Red flags</span>${redH}</div></div>
      <div class="card"><h2>Weekly Review</h2><div class="body"><span class="area">Upcoming 7 days</span>${wk}</div></div></div>
      <div class="grid2"><div class="card"><h2>Daily Updates</h2><div class="body">${log(daily)}</div></div><div class="card"><h2>Weekly Updates</h2><div class="body">${log(weekly)}</div></div></div>`;
  },
  studio(){
    return `<div class="studio-grid">${STUDIO.map(s=>`<div class="studio-card" onclick="openStudio('${s.id}')"><div class="t">${esc(s.title)}</div><div class="d">${esc(s.desc)}</div><span class="go">Generate PDF →</span></div>`).join("")}</div>`;
  },
  team(){
    const users=(DATA.users||[]).map(u=>{const active=u.lastActive&&(Date.now()-new Date(u.lastActive))<6e5;const la=u.lastActive?new Date(u.lastActive).toLocaleString():"never";return `<tr><td>${active?'<span class="live"></span>':'<span class="stale-dot"></span>'}${esc(u.name)}</td><td class="m">${esc(u.title||"")}</td><td class="m">${u.role}</td><td class="m">${la}</td><td><button class="ghost sm" onclick="resetUser('${u.username}')">Reset password</button></td></tr>`;}).join("");
    const acts=(DATA.activity||[]).map(a=>`<div class="row" style="cursor:default"><div class="t">${esc(a.who)} ${esc(a.action)} ${esc(a.target||"")}</div><div class="m">${new Date(a.when).toLocaleString()}</div></div>`).join("")||`<div class="empty">No activity.</div>`;
    return `<div class="card"><h2>Team</h2><div class="body"><table><thead><tr><th>Person</th><th>Title</th><th>Role</th><th>Last active</th><th></th></tr></thead><tbody>${users}</tbody></table></div></div><div class="card"><h2>Activity Feed</h2><div class="body">${acts}</div></div>`;
  }
};

// ---------- record editor ----------
let EDIT={col:null,id:null};
function add(col){ openEditor(col,null); }
function edit(col,id){ openEditor(col,(DATA[col]||[]).find(x=>x.id===id)); }
function field(f,val){
  if(f.t==="area") return `<select id="f_${f.k}">${AREAS.map(a=>`<option ${a===val?"selected":""}>${a}</option>`).join("")}</select>`;
  if(f.t==="owner") return `<select id="f_${f.k}"><option value="">Unassigned</option>${(DATA.team||[]).map(n=>`<option ${n===val?"selected":""}>${esc(n)}</option>`).join("")}</select>`;
  if(f.t==="objective") return `<select id="f_${f.k}"><option value="">— none —</option>${(DATA.objectives||[]).map(o=>`<option value="${o.id}" ${o.id===val?"selected":""}>${esc(o.title)}</option>`).join("")}</select>`;
  if(f.t==="select") return `<select id="f_${f.k}">${f.o.map(o=>`<option ${o===val?"selected":""}>${o}</option>`).join("")}</select>`;
  if(f.t==="textarea") return `<textarea id="f_${f.k}" rows="2">${esc(val||"")}</textarea>`;
  if(f.t==="number") return `<input id="f_${f.k}" type="number" min="0" max="100" value="${val!=null?val:0}" />`;
  if(f.t==="date") return `<input id="f_${f.k}" type="date" value="${val||""}" />`;
  if(f.t==="actions") return `<div id="actionsList"></div><button class="linkbtn" onclick="addActionRow()">+ Add action item</button>`;
  return `<input id="f_${f.k}" value="${esc(val||"")}" />`;
}
function openEditor(col,item){
  EDIT={col,id:item?item.id:null};
  let html=`<h3>${item?"Edit ":"Add "}${SINGULAR[col]}</h3><div class="hint">${item?"Changes are logged to the activity feed.":"Tracked under your name."}</div>`;
  html+=SCHEMAS[col].map(f=>`<div><label>${esc(f.l)}</label>${field(f,item?item[f.k]:undefined)}</div>`).join("");
  html+=`<div class="formfoot"><div>${item?`<button class="ghost sm" onclick="del()">Delete</button>`:""}</div><div class="right"><button class="ghost" onclick="close_('modal')">Cancel</button><button onclick="saveEditor()">${item?"Save":"Create"}</button></div></div>`;
  $("sheet").innerHTML=html;
  if(col==="meetings"){ (item&&item.actions||[]).forEach(a=>addActionRow(a.text,a.owner,a.due,a.done)); }
  $("modal").classList.add("open");
}
function addActionRow(text,owner,due,done){
  const list=$("actionsList"); if(!list)return;
  const w=document.createElement("div"); w.className="actrow";
  w.innerHTML=`<input placeholder="Action" value="${esc(text||"")}" /><input placeholder="Owner" value="${esc(owner||"")}" /><input type="date" value="${due||""}" /><span class="x">×</span>`;
  w.querySelector(".x").onclick=()=>w.remove(); if(done){w.dataset.done="1";w.style.opacity=".6";}
  list.appendChild(w);
}
function collectActions(){ return Array.from(document.querySelectorAll("#actionsList .actrow")).map(r=>{const i=r.querySelectorAll("input");return {text:i[0].value,owner:i[1].value,due:i[2].value,done:r.dataset.done==="1"};}).filter(a=>a.text.trim()); }
async function saveEditor(){
  const col=EDIT.col,body={};
  for(const f of SCHEMAS[col]){ if(f.t==="actions"){body.actions=collectActions();continue;} const el=$("f_"+f.k); if(!el)continue; body[f.k]=f.t==="number"?Number(el.value):el.value; }
  await fetch(EDIT.id?`/api/c/${col}/${EDIT.id}`:`/api/c/${col}`,{method:EDIT.id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  close_("modal"); await load();
}
async function del(){ if(!EDIT.id)return; if(!confirm("Delete this "+SINGULAR[EDIT.col]+"?"))return; await fetch(`/api/c/${EDIT.col}/${EDIT.id}`,{method:"DELETE"}); close_("modal"); await load(); }

// ---------- briefing studio ----------
let STUDIO_ID=null;
async function openStudio(rid){
  STUDIO_ID=rid;
  const r=await fetch(`/api/report/${rid}/intake`); const k=await r.json();
  let html=`<h3>${esc(k.title)}</h3><div class="hint">The studio pulls what it can. Answer the gaps and it prints the PDF.</div>`;
  if(k.summary&&k.summary.length){ html+=`<div style="margin:6px 0 14px">${k.summary.map(([l,v])=>`<div class="sumline"><span>${esc(l)}</span><span class="m">${esc(v)}</span></div>`).join("")}</div>`; }
  html+=k.questions.map((q,i)=>{
    let inp;
    if(q.type==="select") inp=`<select id="q_${i}">${(q.options||[]).map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("")}</select>`;
    else if(q.type==="textarea") inp=`<textarea id="q_${i}" rows="2" data-key="${q.key}"></textarea>`;
    else inp=`<input id="q_${i}" data-key="${q.key}" />`;
    return `<div><label>${esc(q.label)}</label>${q.type==="select"?inp.replace('id="q_'+i+'"','id="q_'+i+'" data-key="'+q.key+'"'):inp}</div>`;
  }).join("");
  html+=`<div class="note" id="studioNote"></div><div class="formfoot"><span></span><div class="right"><button class="ghost" onclick="close_('modal')">Cancel</button><button onclick="generateReport()">Generate PDF</button></div></div>`;
  $("sheet").innerHTML=html; $("modal").classList.add("open");
}
async function generateReport(){
  const answers={};
  document.querySelectorAll("#sheet [data-key]").forEach(el=>{ answers[el.getAttribute("data-key")]=el.value; });
  $("studioNote").textContent="Generating...";
  const r=await fetch(`/api/report/${STUDIO_ID}/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers})});
  if(!r.ok){ $("studioNote").textContent="Could not generate."; return; }
  const blob=await r.blob(); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=(STUDIO_ID)+"-brief.pdf"; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  $("studioNote").textContent="Downloaded. Generate another or close.";
  load();
}

// ---------- users + account ----------
function openUser(){
  $("sheet").innerHTML=`<h3>Add user</h3><div class="hint">Starts on temp password rmx-office-2026.</div><div class="field2"><div><label>Name</label><input id="u_name"/></div><div><label>Username</label><input id="u_user"/></div></div><label>Title</label><input id="u_title"/><label>Role</label><select id="u_role"><option value="member">member</option><option value="owner">owner</option></select><div class="note" id="u_note"></div><div class="formfoot"><span></span><div class="right"><button class="ghost" onclick="close_('modal')">Cancel</button><button onclick="saveUser()">Create</button></div></div>`;
  $("modal").classList.add("open");
}
async function saveUser(){
  const r=await fetch("/api/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:$("u_name").value,username:$("u_user").value,title:$("u_title").value,role:$("u_role").value})});
  const d=await r.json(); if(!r.ok){$("u_note").textContent=d.error;return;} $("u_note").textContent="Created. Temp password: "+d.tempPassword; await load();
}
async function resetUser(u){ const r=await fetch("/api/users/"+u+"/reset",{method:"POST"});const d=await r.json();alert(d.ok?("Password reset. Temp: "+d.tempPassword):d.error);load(); }
function openAccount(){ $("acctNote").textContent=""; $("mAccount").classList.add("open"); }
async function savePassword(){
  const r=await fetch("/api/account/password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({current:$("aCur").value,next:$("aNew").value})});
  const d=await r.json(); $("acctNote").textContent=r.ok?"Password updated.":d.error; if(r.ok){$("aCur").value="";$("aNew").value="";}
}
function close_(id){ $(id).classList.remove("open"); }
async function logout(){ await fetch("/api/logout",{method:"POST"}); }

window.addEventListener("hashchange",route);
load();
