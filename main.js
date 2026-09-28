import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js";

import { constitution as constitutionData } from "./constitution.js";

const constitution = Object.entries(constitutionData).map(([part, value]) => ({part, title:value.title, articles:value.articles.map(a=>[String(a.number),a.title,a.text])}));
const movingCars=[]; const walkers=[]; const farmers=[]; const undergroundDoors=[];


const germanyStats = [
  {label:"Bevölkerung", value:"83,4 Mio.", detail:"31. März 2026", source:"Destatis", url:"https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Bevoelkerungsstand/_inhalt.html", key:"population"},
  {label:"Inflationsrate", value:"2,9 %", detail:"August 2026 · gegenüber Vorjahr", source:"Destatis", url:"https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html", key:"inflation"},
  {label:"Arbeitslosenquote", value:"6,4 %", detail:"Juli 2026 · BA-Quote", source:"Bundesagentur für Arbeit", url:"https://www.arbeitsagentur.de/presse/2026-30-arbeitsmarkt-im-juli-2026", key:"unemployment"},
  {label:"BIP-Wachstum", value:"+0,3 %", detail:"2. Quartal 2026 · zum Vorquartal", source:"Destatis", url:"https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/08/PD26_303_811.html", key:"gdp"},
  {label:"Erneuerbare im Strom", value:"57 %", detail:"1. Halbjahr 2026 · Anteil am genutzten Strom", source:"Umweltbundesamt", url:"https://www.umweltbundesamt.de/presse/pressemitteilungen/erstes-halbjahr-2026-erneuerbare-energien-wachsen", key:"renewables"}
];
function renderGermanyStats(){
 const el=document.getElementById("germanyStats"); if(!el)return;
 el.innerHTML=germanyStats.map(s=>`<article class="gstat"><div class="gstat-top"><span>${s.label}</span><b>${s.value}</b></div><div class="gstat-line"><i></i></div><small>${s.detail}</small><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.source} ↗</a></article>`).join("");
}

const germanyBridge = [
 {key:"unemployment", title:"Arbeitsmarkt", value:"6,4 %", question:"Modellfrage: Wie robust bleibt Versorgung, wenn Beschäftigung und Einkommen unter Druck geraten?"},
 {key:"inflation", title:"Preise", value:"2,9 %", question:"Modellfrage: Wie reagieren Reserven und Investitionen, wenn laufende Kosten steigen?"},
 {key:"gdp", title:"Wirtschaft", value:"+0,3 %", question:"Modellfrage: Welche Kapazitäten bleiben für neue Projekte verfügbar?"},
 {key:"renewables", title:"Strommix", value:"57 %", question:"Modellfrage: Wie verändert eine resilientere Energieversorgung die Abhängigkeiten?"}
];
function renderGermanyBridge(){
 const el=document.getElementById("germanyBridge"); if(!el)return;
 el.innerHTML=`<div class="bridge-head"><div><span>REFERENZ → MODELL</span><b>Vier reale Anker, vier Modellfragen</b></div><small>Die Verknüpfung ist bewusst qualitativ: Die amtlichen Werte werden nicht in den 0–100-Modellindex umgerechnet.</small></div>`+germanyBridge.map(x=>`<article class="bridge-item"><div class="bridge-value"><span>${x.title}</span><b>${x.value}</b></div><p>${x.question}</p></article>`).join("");
}

const critique = [
["Grundidee","Gleichwertigkeit und Vielfalt sind als Leitprinzipien klar formulierbar.","Wie werden Zielkonflikte zwischen individueller Freiheit und gemeinschaftlichen Pflichten entschieden?"],
["Wirtschaft","Mitarbeiterbeteiligung und Wettbewerbsschutz adressieren Machtkonzentration.","Wie bleiben Investitionsanreize, Eigentumsrechte und internationale Kapitalflüsse funktionsfähig?"],
["Bürgerkapital","Freiwillige Beteiligung kann zusätzliche Finanzierungsquellen für Projekte schaffen.","Wer trägt Verluste und wie werden Informationsvorteile oder indirekter Investitionsdruck begrenzt?"],
["Grundversorgung","Reserven und zusätzliche Kapazitäten können Lieferausfälle abfedern.","Wie groß müssen Reserven sein, ohne dauerhaft Ressourcen zu binden oder Überproduktion zu erzeugen?"],
["Demokratie","Mehrere Informationsquellen und direkte Entscheidungen können Transparenz erhöhen.","Wie verhindert man Informationsüberlastung, kurzfristige Stimmungsentscheidungen und koordinierte Manipulation?"],
["Krisenordnung","Mehrere unabhängige Analysen reduzieren die Abhängigkeit von einer einzigen Prognose.","Wie werden widersprüchliche Empfehlungen unter Zeitdruck gewichtet, ohne Fachstellen zu Machtzentren zu machen?"],
["Daten","Zweckbindung und unabhängige Kontrolle können Missbrauch begrenzen.","Welche Daten dürfen für Planung aggregiert werden und wie wird Re-Identifikation verhindert?"],
["Adaptive Abgaben","Eine bedarfsorientierte Logik verbindet Einnahmen stärker mit tatsächlichem Finanzbedarf.","Wie werden Berechnung, demokratische Kontrolle und Planungssicherheit gleichzeitig gewährleistet?"],
["Offene Punkte","Das Modell lässt sich schrittweise präzisieren und mit Szenarien testen.","Geldschöpfung, internationale Verträge, Eigentumsübergänge, Rechtsdurchsetzung und Institutionen benötigen weitere Detailregeln."]
];

const connections = [
 {key:"food", title:"Ernährung", icon:"🌱", links:["energy","health","economy"], text:"Lebensmittelversorgung hängt im Modell mit Energie, Gesundheit und Wirtschaft zusammen."},
 {key:"energy", title:"Energie", icon:"⚡", links:["food","economy","infrastructure"], text:"Energie beeinflusst Produktion, Transport und damit mehrere Versorgungsketten."},
 {key:"health", title:"Gesundheit", icon:"✚", links:["food","education","trust"], text:"Gesundheit wird als Grundversorgung betrachtet und berührt Ernährung, Bildung und Vertrauen."},
 {key:"education", title:"Bildung", icon:"◈", links:["democracy","health","economy"], text:"Bildung verbindet individuelle Entwicklung mit demokratischer Beteiligung und Arbeitswelt."},
 {key:"economy", title:"Wirtschaft", icon:"▦", links:["capital","food","education","energy"], text:"Wirtschaft verbindet Investitionen, Arbeit, Versorgung und Infrastruktur."},
 {key:"capital", title:"Bürgerkapital", icon:"◌", links:["economy","infrastructure","trust"], text:"Investitionen können Projekte finanzieren; Vertrauen und Informationslage bleiben dabei relevante Modellfaktoren."},
 {key:"democracy", title:"Demokratie", icon:"◎", links:["education","crisis","trust"], text:"Entscheidungen werden mit Informationsquellen, Beteiligung und Krisenordnung verbunden."},
 {key:"crisis", title:"Krisenordnung", icon:"△", links:["food","energy","democracy","health"], text:"Krisenszenarien zeigen, wie mehrere Bereiche gleichzeitig belastet werden können."},
 {key:"infrastructure", title:"Infrastruktur", icon:"⌁", links:["energy","economy","food"], text:"Straßen, Energie, Logistik und Versorgung bilden eine gemeinsame technische Basis."},
 {key:"trust", title:"Vertrauen", icon:"♡", links:["democracy","health","capital","education"], text:"Vertrauen ist im Modell eine Querverbindung für Kooperation, Investitionen und Informationsverarbeitung."}
];
const connectionIndex = Object.fromEntries(connections.map(x=>[x.key,x]));
function renderConnections(){
 const el=document.getElementById("connectionCards"); if(!el)return;
 el.innerHTML=connections.map(c=>`<article class="connection-card" data-conn="${c.key}"><div class="conn-head"><span>${c.icon}</span><div><b>${c.title}</b><small>${c.links.length} Verbindungen</small></div></div><p>${c.text}</p><div class="conn-links">${c.links.map(k=>`<button data-conn-jump="${k}">${connectionIndex[k]?.title||k}</button>`).join("")}</div></article>`).join("");
 el.querySelectorAll("[data-conn-jump]").forEach(b=>b.onclick=()=>openConnection(b.dataset.connJump));
}
function openConnection(key){
 const c=connectionIndex[key]; if(!c)return;
 const panel=document.getElementById("panelContent");
 panel.innerHTML=`<span class="tag">VERKNÜPFUNG</span><h2>${c.icon} ${c.title}</h2><p>${c.text}</p><div class="proscons"><div><h4>Verbundene Bereiche</h4><ul>${c.links.map(k=>`<li><button class="panel-link" data-panel-conn="${k}">${connectionIndex[k]?.title||k}</button></li>`).join("")}</ul></div><div><h4>Modellhinweis</h4><ul><li>Die Verbindung beschreibt eine Modellannahme.</li><li>Sie ist keine Aussage über eine eindeutige Ursache-Wirkung-Beziehung in der Realität.</li></ul></div></div>`;
 panel.querySelectorAll("[data-panel-conn]").forEach(b=>b.onclick=()=>openConnection(b.dataset.panelConn));
 document.getElementById("infoPanel")?.classList.add("open");
}

const blocks = {
democracy:{title:"DEMOKRATIE",tag:"ENTSCHEIDUNG",text:"Bürger entscheiden über zentrale Fragen direkt. Kommunale Vertreter bündeln lokale Mandate und bleiben kontrollierbar.",pros:["direkte Beteiligung","mehrere Informationsquellen","begrenzte Mandate"],cons:["hoher Informationsbedarf","Gefahr von Überforderung","Verfahrenskomplexität"]},
health:{title:"GESUNDHEIT",tag:"VERSORGUNG",text:"Medizinische Versorgung gehört zur Grundversorgung. Kinder und Jugendliche erhalten besonderen Schutz; Forschung wird nach gesellschaftlichem Nutzen unterstützt.",pros:["Grundversorgung","Forschungsförderung","Kinderfokus"],cons:["Ressourcenbedarf","Priorisierung schwieriger Fälle","Gefahr bürokratischer Steuerung"]},
education:{title:"BILDUNG",tag:"ENTWICKLUNG",text:"Bildung soll Wissen, Denken und Selbstorientierung fördern. Projekte und Neuorientierung ergänzen klassische Grundlagen.",pros:["individuelle Wege","weniger Prüfungsdruck","breite Bildung"],cons:["schwierige Vergleichbarkeit","hoher Betreuungsbedarf","Qualitätssicherung nötig"]},
economy:{title:"WIRTSCHAFT",tag:"WETTBEWERB",text:"Unternehmen bleiben möglich. Mitarbeiterbeteiligung, Wettbewerbsschutz und neue Konkurrenten sollen Machtkonzentration begrenzen.",pros:["Mitarbeiterbeteiligung","Wettbewerb","Gründungsanreize"],cons:["komplexe Eigentumsregeln","Abgrenzung von Marktmacht","Investitionsrisiken"]},
food:{title:"ERNÄHRUNG",tag:"RESILIENZ",text:"Eine ökologische Grundversorgung wird mit regionaler Produktion, Reserven und zusätzlicher kontrollierter Anbaukapazität abgesichert.",pros:["Versorgungssicherheit","regionale Produktion","Reserven"],cons:["Flächenkonflikte","Ertragsrisiken","höherer Planungsbedarf"]},
capital:{title:"BÜRGERKAPITAL",tag:"INVESTITION",text:"Bürger können einen Teil ihres Kapitals freiwillig in Projekte investieren. Rendite ist nicht garantiert; Entscheidungen bleiben verteilt.",pros:["breite Beteiligung","Startup-Finanzierung","kein Zwangsinvestment"],cons:["Fehlinvestitionen","Ungleichheit der Investitionsfähigkeit","Informationsasymmetrien"]},
crisis:{title:"KRISENZENTRUM",tag:"ANALYSE",text:"Mehrere unabhängige Kriseninstanzen erstellen Lagebilder. Politische Entscheidungen bleiben beim demokratischen Entscheidungsorgan.",pros:["Redundanz","Szenarien","Dokumentation"],cons:["Abstimmungsprobleme","Informationskonflikte","Zeitdruck"]}
};

let state={food:100,energy:100,trust:88,conc:20,invest:60,reserve:82};
let scene,camera,renderer,controls,raycaster,mouse;
const objects=[];

function init3D(){
 document.querySelector("#infoPanel")?.classList.remove("open");
 scene=new THREE.Scene();
 scene.background=new THREE.Color(0xb8d3c0);
 scene.fog=new THREE.Fog(0xb8d3c0,55,135);
 camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,250);
 camera.position.set(72,42,92);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.setSize(innerWidth,innerHeight-72);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.05;
 document.querySelector("#canvasWrap").appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true; controls.dampingFactor=.045;
 controls.minDistance=24; controls.maxDistance=155;
 controls.maxPolarAngle=Math.PI/2.18; controls.target.set(0,1.5,0);
 scene.add(new THREE.HemisphereLight(0xeaf5e9,0x58715b,2.1));
 const sun=new THREE.DirectionalLight(0xfff3d6,2.6);
 sun.position.set(-30,55,22); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-70; sun.shadow.camera.right=70; sun.shadow.camera.top=70; sun.shadow.camera.bottom=-70; scene.add(sun);
 // Build the detailed landscape on the next frame, after the renderer is alive.
 raycaster=new THREE.Raycaster(); mouse=new THREE.Vector2();
 renderer.domElement.addEventListener("pointerdown",onPointer);
 addEventListener("resize",resize);
 // Start the renderer first. The heavy landscape build happens after the first paint.
 animate();
 requestAnimationFrame(()=>{
   const boot=document.querySelector("#boot");
   if(boot) boot.style.display="none";
   setTimeout(()=>{
     try { createLivingLandscape(); }
     catch(err){ console.error(err); const hint=document.querySelector("#statusHint"); if(hint) hint.textContent="Die Landschaft konnte nicht vollständig geladen werden."; }
   },0);
 });
}
const textureCache=new Map();
function canvasTexture(type, seed=1){
 const cacheKey=type+":"+seed;
 if(textureCache.has(cacheKey)) return textureCache.get(cacheKey);
 const c=document.createElement("canvas"); c.width=1536; c.height=1536; const x=c.getContext("2d");
 const rand=n=>{const v=Math.sin(n*12.9898+seed*78.233)*43758.5453;return v-Math.floor(v)};
 if(type==="ground"){
   x.fillStyle="#708e5b";x.fillRect(0,0,1024,1024);
   for(let i=0;i<9000;i++){const px=rand(i)*1024,py=rand(i+17)*1024,r=.35+rand(i+31)*1.8; x.fillStyle=rand(i+51)>.55?"rgba(46,76,43,.16)":"rgba(210,190,115,.10)";x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill()}
 } else if(type==="stone"){
   x.fillStyle="#b8b19b";x.fillRect(0,0,1024,1024);
   for(let i=0;i<1700;i++){const px=rand(i)*1024,py=rand(i+2)*1024,r=1+rand(i+4)*5;x.fillStyle=`rgba(65,61,51,${.035+rand(i+8)*.08})`;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill()}
 } else if(type==="plaster"){
   x.fillStyle="#e4dcc7";x.fillRect(0,0,1024,1024);
   for(let i=0;i<3200;i++){const px=rand(i)*1024,py=rand(i+3)*1024;x.fillStyle=`rgba(90,75,53,${.025+rand(i+9)*.06})`;x.fillRect(px,py,1+rand(i+11)*4,1+rand(i+13)*4)}
 } else if(type==="brick"){
   x.fillStyle="#9a684d";x.fillRect(0,0,1024,1024);
   for(let yy=0;yy<1024;yy+=38){for(let xx=0;xx<1024;xx+=72){const off=(yy/38)%2?36:0;x.fillStyle="#704b39";x.fillRect(xx+off,yy,68,30);x.fillStyle="rgba(245,220,190,.12)";x.fillRect(xx+off,yy,68,2)}}
 } else if(type==="wood"){
   x.fillStyle="#6f5037";x.fillRect(0,0,1024,1024);
   for(let i=0;i<70;i++){x.strokeStyle=`rgba(35,23,14,${.15+rand(i)*.18})`;x.lineWidth=2+rand(i+4)*4;x.beginPath();x.moveTo(0,i*16+rand(i)*10);x.lineTo(1024,i*16+rand(i)*10+rand(i+2)*20);x.stroke()}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),16);t.wrapS=t.wrapT=THREE.RepeatWrapping;textureCache.set(cacheKey,t);return t;
}
function buildingMaterial(type,color){const m=new THREE.MeshStandardMaterial({color,roughness:.78}); if(type)m.map=canvasTexture(type,Math.floor(color)); return m}
function detailedBuilding(key,label,x,z,w,d,h,wall,roof){
 const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMaterial("plaster",wall));body.position.y=h/2; body.castShadow=true; body.receiveShadow=true; g.add(body);
 const roofGeo=new THREE.ConeGeometry(Math.max(w,d)*.78,Math.max(2.2,h*.22),4);const r=new THREE.Mesh(roofGeo,new THREE.MeshStandardMaterial({color:roof,roughness:.9}));r.rotation.y=Math.PI/4;r.position.y=h+.75;r.castShadow=true;g.add(r);
 const door=new THREE.Mesh(new THREE.BoxGeometry(.9,1.8,.08),buildingMaterial("wood",0x6a4b34));door.position.set(0,.9,d/2+.045);g.add(door);
 const winMat=new THREE.MeshStandardMaterial({color:0xb8d4c1,roughness:.35,metalness:.05,emissive:0x6e9278,emissiveIntensity:.08});
 for(const side of [-1,1]){for(const yy of [h*.43,h*.68]){const win=new THREE.Mesh(new THREE.BoxGeometry(1.05,.82,.07),winMat);win.position.set(side*(w/2+.04),yy,0);win.rotation.y=Math.PI/2;g.add(win)}}
 for(const xx of [-w*.27,w*.27]){const win=new THREE.Mesh(new THREE.BoxGeometry(1.0,.8,.07),winMat);win.position.set(xx,h*.56,d/2+.04);g.add(win)}
 const chimney=new THREE.Mesh(new THREE.BoxGeometry(.45,.9,.45),buildingMaterial("brick",0x9b684d));chimney.position.set(w*.22,h+.95,0);chimney.castShadow=true;g.add(chimney);
 // Architectural trim: lintels, corner pilasters, flower boxes and a proper entrance frame.
 const trimMat=new THREE.MeshStandardMaterial({color:0xc4b79c,roughness:.72});
 for(const sx of [-1,1]){const pilaster=new THREE.Mesh(new THREE.BoxGeometry(.16,h*.88,.16),trimMat);pilaster.position.set(sx*(w/2-.16),h*.47,d/2+.02);pilaster.castShadow=true;g.add(pilaster);}
 for(const xx of [-w*.27,w*.27]){const lint=new THREE.Mesh(new THREE.BoxGeometry(1.18,.10,.13),trimMat);lint.position.set(xx,h*.56,d/2+.09);g.add(lint);const box=new THREE.Mesh(new THREE.BoxGeometry(1.15,.10,.34),new THREE.MeshStandardMaterial({color:0x6e8054,roughness:1}));box.position.set(xx,.66,d/2+.15);g.add(box);}
 const frameL=new THREE.Mesh(new THREE.BoxGeometry(.10,1.95,.16),trimMat);frameL.position.set(-.56,.98,d/2+.08);g.add(frameL);const frameR=frameL.clone();frameR.position.x=.56;g.add(frameR);
 const awningMat=new THREE.MeshStandardMaterial({color:0xa9654c,roughness:.8});
 if(label && /CAFÉ|BÄCKEREI|LADEN|WERKSTATT/.test(label)){const aw=new THREE.Mesh(new THREE.BoxGeometry(Math.min(3.4,w*.78),.10,.72),awningMat);aw.position.set(0,2.35,d/2+.28);aw.rotation.x=-.12;g.add(aw);}
 g.userData={key,label,base:h};scene.add(g);objects.push(g);return g;
}
function officeBuilding(key,label,x,z,w,d,h,wall,roofColor){
 const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMaterial("plaster",wall));body.position.y=h/2; body.castShadow=true; body.receiveShadow=true; g.add(body);
 const roofMesh=new THREE.Mesh(new THREE.BoxGeometry(w+.35,.35,d+.35),new THREE.MeshStandardMaterial({color:roofColor,roughness:.9}));roofMesh.position.y=h+.2;roofMesh.castShadow=true;g.add(roofMesh);
 const glass=new THREE.MeshStandardMaterial({color:0x789f91,roughness:.28,metalness:.12,emissive:0x314f46,emissiveIntensity:.12});
 for(let yy=1.8;yy<h;yy+=1.9) for(let xx=-w/2+1.2;xx<w/2-.4;xx+=1.55){const win=new THREE.Mesh(new THREE.BoxGeometry(.95,.72,.07),glass);win.position.set(xx,yy,d/2+.05);g.add(win)}
 const sign=new THREE.Mesh(new THREE.BoxGeometry(Math.min(4,w*.55),.62,.08),new THREE.MeshStandardMaterial({color:0xf0e5c5,roughness:.8}));sign.position.set(0,h*.64,d/2+.09);g.add(sign);
 for(let yy=1.15;yy<h;yy+=1.85){const band=new THREE.Mesh(new THREE.BoxGeometry(w+.18,.10,d+.18),new THREE.MeshStandardMaterial({color:0xb9b09d,roughness:.8}));band.position.y=yy;band.castShadow=true;g.add(band);}
 const roofGarden=new THREE.Mesh(new THREE.BoxGeometry(Math.max(2,w*.38),.18,Math.max(1.4,d*.32)),new THREE.MeshStandardMaterial({color:0x667c55,roughness:1}));roofGarden.position.set(-w*.18,h+.34,0);g.add(roofGarden);
 g.userData={key,label,base:h};scene.add(g);objects.push(g);return g;
}

function makeCar(color=0x4f6f5c, variant=0){
 const g=new THREE.Group();
 const paint=new THREE.MeshStandardMaterial({color,roughness:.42,metalness:.18});
 const dark=new THREE.MeshStandardMaterial({color:0x202522,roughness:.78});
 const glass=new THREE.MeshStandardMaterial({color:0x344f4a,roughness:.18,metalness:.08,transparent:true,opacity:.9});
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.48,.42,2.55),paint); body.position.y=.46; g.add(body);
 const hood=new THREE.Mesh(new THREE.BoxGeometry(1.32,.18,.72),paint); hood.position.set(0,.69,.83); g.add(hood);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.08,.48,1.25),glass); cabin.position.set(0,.84,-.05); g.add(cabin);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(.98,.06,1.08),paint); roof.position.set(0,1.08,-.05); g.add(roof);
 for(const x of [-.58,.58]) for(const z of [-.78,.78]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.13,16),dark);w.rotation.z=Math.PI/2;w.position.set(x,.29,z);g.add(w);}
 const head=new THREE.MeshStandardMaterial({color:0xfff0b0,emissive:0xffd36a,emissiveIntensity:.7}),tail=new THREE.MeshStandardMaterial({color:0x8b3d35,emissive:0x5b1510,emissiveIntensity:.45});
 for(const x of [-.4,.4]){const a=new THREE.Mesh(new THREE.BoxGeometry(.23,.13,.06),head);a.position.set(x,.52,1.3);g.add(a);const b=new THREE.Mesh(new THREE.BoxGeometry(.23,.12,.06),tail);b.position.set(x,.52,-1.3);g.add(b)}
 return g;
}
function addMovingCar(axis,lane,start,speed,color,variant=0){const g=makeCar(color,variant);scene.add(g);movingCars.push({g,axis,lane,start,speed,variant});}
function makePerson(shirt=0x6b7c63,skin=0xd1a27c,hair=0x40362d,variant=0){
 const g=new THREE.Group(), skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.8}), shirtMat=new THREE.MeshStandardMaterial({color:shirt,roughness:.72}), pantsMat=new THREE.MeshStandardMaterial({color:[0x3f463e,0x4b4d52,0x5c4e3f][variant%3],roughness:.88}), shoeMat=new THREE.MeshStandardMaterial({color:0x2c2d29,roughness:.92}), hairMat=new THREE.MeshStandardMaterial({color:hair,roughness:.9});
 const pelvis=new THREE.Mesh(new THREE.BoxGeometry(.34,.24,.24),pantsMat);pelvis.position.y=.78;g.add(pelvis);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.23,.52,4,8),shirtMat);torso.position.y=1.08;g.add(torso);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.12,8),skinMat);neck.position.y=1.42;g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.21,14,10),skinMat);head.position.y=1.62;g.add(head);
 const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.215,14,8,0,Math.PI*2,0,Math.PI*.52),hairMat);hairCap.position.y=1.68;g.add(hairCap);
 const armL=new THREE.Group(),armR=new THREE.Group(),upperL=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.38,3,6),shirtMat);upperL.position.y=-.19;armL.add(upperL);armL.position.set(-.28,1.28,0);g.add(armL);const upperR=upperL.clone();armR.add(upperR);armR.position.set(.28,1.28,0);g.add(armR);
 const legL=new THREE.Group(),legR=new THREE.Group(),lowerL=new THREE.Mesh(new THREE.CapsuleGeometry(.08,.42,3,6),pantsMat);lowerL.position.y=-.25;legL.add(lowerL);legL.position.set(-.11,.7,0);g.add(legL);const lowerR=lowerL.clone();legR.add(lowerR);legR.position.set(.11,.7,0);g.add(legR);
 for(const x of [-.11,.11]){const sh=new THREE.Mesh(new THREE.BoxGeometry(.17,.10,.30),shoeMat);sh.position.set(x,.20,.06);g.add(sh)}
 g.userData.parts={armL,armR,legL,legR};return g;
}
function addWalker(x,z,dx,dz,speed,color,phase=0,variant=0){const shirts=[color,0x9a765c,0x637f70,0x756b58,0x4f6b86],skins=[0xd1a27c,0xb97855,0xe0b18e,0x8e5a3f],hairs=[0x40362d,0x6a4a31,0x22231f,0x8a6749];const g=makePerson(shirts[variant%5],skins[variant%4],hairs[variant%4],variant);g.position.set(x,0,z);scene.add(g);walkers.push({g,x,z,dx,dz,speed,phase,variant});}
function makeFarmer(x,z,flip=1,variant=0){const g=makePerson(variant%2?0x5f7047:0x78834d,variant%3?0xc49372:0xd1a27c,0x493a2c,variant),hatMat=new THREE.MeshStandardMaterial({color:variant%2?0x9b7a4a:0x725b3c,roughness:1});const hat=new THREE.Mesh(new THREE.CylinderGeometry(.30,.34,.11,16),hatMat);hat.position.y=1.82;g.add(hat);const brim=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.035,16),hatMat);brim.position.y=1.76;g.add(brim);const tool=new THREE.Group();const handle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.35,8),new THREE.MeshStandardMaterial({color:0x6b4c31,roughness:1}));handle.rotation.z=-.48*flip;handle.position.set(.38*flip,1,.03);tool.add(handle);const blade=new THREE.Mesh(new THREE.BoxGeometry(.38,.08,.10),new THREE.MeshStandardMaterial({color:0x777a6c,metalness:.55,roughness:.42}));blade.position.set(.67*flip,.67,.03);blade.rotation.z=-.48*flip;tool.add(blade);g.add(tool);g.position.set(x,0,z);scene.add(g);farmers.push({g,x,z,phase:Math.random()*6.28,tool});}

function addUndergroundFarmEntrance(){
 const g=new THREE.Group();g.position.set(-7,-.5,29);
 const apron=new THREE.Mesh(new THREE.BoxGeometry(5,.22,3.2),new THREE.MeshStandardMaterial({map:canvasTexture("stone",77),roughness:.96}));apron.position.y=.12;g.add(apron);
 const wallMat=buildingMaterial("brick",0x805944);
 const left=new THREE.Mesh(new THREE.BoxGeometry(.45,2.4,3.0),wallMat);left.position.set(-2.05,1.2,0);g.add(left);
 const right=left.clone();right.position.x=2.05;g.add(right);
 const top=new THREE.Mesh(new THREE.BoxGeometry(4.55,.45,3.0),wallMat);top.position.y=2.18;g.add(top);
 const dark=new THREE.Mesh(new THREE.PlaneGeometry(3.65,1.85),new THREE.MeshStandardMaterial({color:0x111814,roughness:1,emissive:0x09120e,emissiveIntensity:.25}));
 dark.position.set(0,1.1,-1.51);dark.rotation.x=0;g.add(dark);
 // stairs descend behind the entrance
 for(let i=0;i<7;i++){const st=new THREE.Mesh(new THREE.BoxGeometry(3.25,.16,.52),new THREE.MeshStandardMaterial({color:0x6d6b5b,roughness:.95}));st.position.set(0,.92-i*.17,-1.72-i*.52);g.add(st)}
 const sign=new THREE.Mesh(new THREE.BoxGeometry(3.0,.5,.10),new THREE.MeshStandardMaterial({color:0xd6c58d,roughness:.7}));
 sign.position.set(0,2.72,0);g.add(sign);
 const light=new THREE.PointLight(0xd9b86b,2.2,8);light.position.set(0,1.5,-1.5);g.add(light);
 g.userData={key:"food",label:"UNTERGRUNDPLANTAGEN"};scene.add(g);objects.push(g);
 undergroundDoors.push({g,light});
}
function createLivingLandscape(){
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180,72,72),new THREE.MeshStandardMaterial({map:canvasTexture("ground",7),roughness:1}));
 ground.receiveShadow=true;
 ground.rotation.x=-Math.PI/2;ground.position.y=-.72;scene.add(ground);
 const roadMat=new THREE.MeshStandardMaterial({color:0x4f514b,roughness:.96});
 const sidewalkMat=new THREE.MeshStandardMaterial({map:canvasTexture("stone",11),roughness:.95});
 const lineMat=new THREE.MeshStandardMaterial({color:0xe8dfc5,roughness:.8});
 const road=(x,z,w,d,rot=0)=>{
   const group=new THREE.Group(); group.position.set(x,-.69,z); group.rotation.y=rot;
   const r=new THREE.Mesh(new THREE.BoxGeometry(w,.10,d),roadMat); r.position.y=0; r.receiveShadow=true; group.add(r);
   const curbMat=new THREE.MeshStandardMaterial({map:canvasTexture("stone",11),roughness:.92});
   for(const sy of [-1,1]){const curb=new THREE.Mesh(new THREE.BoxGeometry(w+.5,.16,.18),curbMat);curb.position.set(0,.08,sy*(d/2+.38));curb.castShadow=true;curb.receiveShadow=true;group.add(curb);}
   const swMat=new THREE.MeshStandardMaterial({map:canvasTexture("stone",13),roughness:.92});
   for(const sy of [-1,1]){const sw=new THREE.Mesh(new THREE.BoxGeometry(w+.5,.09,.62),swMat);sw.position.set(0,.045,sy*(d/2+.72));sw.receiveShadow=true;group.add(sw);}
   const count=Math.max(2,Math.floor(w/5));
   for(let i=-count;i<=count;i++){const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.025,1.8),lineMat);l.position.set(i*4,.065,0);l.receiveShadow=true;group.add(l);}
   scene.add(group);
 };
 // pedestrian paths with paving slabs and crossings
 const path=(x,z,w,d,rot=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.08,d),sidewalkMat);m.rotation.y=rot;m.position.set(x,-.60,z);m.receiveShadow=true;scene.add(m); for(let q=-d/2+1;q<d/2;q+=1.8){const seam=new THREE.Mesh(new THREE.BoxGeometry(w+.02,.012,.025),new THREE.MeshStandardMaterial({color:0x9a9b8d,roughness:1}));seam.rotation.y=rot;seam.position.set(x,-.55,z+q);scene.add(seam);}};
 path(-9,2,2.5,38,.02);path(9,2,2.5,38,.02);path(0,10,34,2.2,0);
 for(let i=-3;i<=3;i++){const cross=new THREE.Mesh(new THREE.BoxGeometry(.55,.025,5.2),new THREE.MeshStandardMaterial({color:0xf2ead6,roughness:.8}));cross.position.set(i*.9,-.61,4);scene.add(cross)}
 // Parking bays, bike lanes and road signs make the streets read as real infrastructure.
 const parkingMat=new THREE.MeshStandardMaterial({color:0xd9d2bd,roughness:.8});
 for(let i=-4;i<=4;i++){const bay=new THREE.Mesh(new THREE.BoxGeometry(2.1,.018,4.2),parkingMat);bay.position.set(i*2.6,-.61,13.2);scene.add(bay);}
 const bikeMat=new THREE.MeshStandardMaterial({color:0x6d8d65,roughness:.9});
 for(let z=-30;z<31;z+=3){const bike=new THREE.Mesh(new THREE.BoxGeometry(.9,.025,1.7),bikeMat);bike.position.set(5.15,-.58,z);scene.add(bike);}
 const signPoleMat=new THREE.MeshStandardMaterial({color:0x50574e,roughness:.7});
 for(const [x,z,rot] of [[-15,-7,0],[15,-7,Math.PI],[0,14,Math.PI/2]]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,2.1,10),signPoleMat);pole.position.set(x,.45,z);scene.add(pole);const sign=new THREE.Mesh(new THREE.BoxGeometry(.72,.5,.06),new THREE.MeshStandardMaterial({color:0xf0eadb,roughness:.65}));sign.position.set(x,1.55,z);sign.rotation.y=rot;scene.add(sign);}
 // River and a calm pond
 const riverPts=[];for(let i=0;i<=42;i++)riverPts.push(new THREE.Vector3(-42+Math.sin(i*.38)*4.5,-.66,-40+i*1.9));
 const riverCurve=new THREE.CatmullRomCurve3(riverPts);const river=new THREE.Mesh(new THREE.TubeGeometry(riverCurve,84,.95,12,false),new THREE.MeshStandardMaterial({color:0x679ca0,roughness:.22,metalness:.04}));scene.add(river);
 const pond=new THREE.Mesh(new THREE.CylinderGeometry(6.5,7.2,.22,48),new THREE.MeshStandardMaterial({color:0x6ca3a4,roughness:.18,metalness:.05}));pond.scale.z=.72;pond.position.set(-17,-.57,8);scene.add(pond);
 const pondRim=new THREE.Mesh(new THREE.TorusGeometry(6.2,.28,8,48),new THREE.MeshStandardMaterial({map:canvasTexture("stone",55),roughness:1}));pondRim.scale.z=.72;pondRim.rotation.x=Math.PI/2;pondRim.position.set(-17,-.43,8);scene.add(pondRim);
 // Freibad with pool, deck and tiny changing building
 const pool=new THREE.Mesh(new THREE.BoxGeometry(11,.22,6),new THREE.MeshStandardMaterial({color:0x66a8b1,roughness:.18,metalness:.04}));pool.position.set(18,-.56,-13);scene.add(pool);
 const deck=new THREE.Mesh(new THREE.BoxGeometry(14,.12,9),new THREE.MeshStandardMaterial({map:canvasTexture("wood",63),roughness:.86}));deck.position.set(18,-.61,-13);scene.add(deck); // pool surface sits just above deck visually
 pool.position.y=-.49;
 const poolhouse=officeBuilding("health","FREIBAD",25,-13,4.8,3.8,2.8,0xd8c9ac,0x66745c);
 // Civic / commercial core — distinct building types
 officeBuilding("democracy","RATHAUS",-11,-8,9,7,7.2,0xd8d0bb,0x555c49);
 officeBuilding("health","GESUNDHEIT",0,-12,8.5,7.5,8.8,0xd9d2bf,0x66705b);
 officeBuilding("education","SCHULE",11,-8,9,7,6.5,0xd7c9ae,0x68735d);
 detailedBuilding("economy","WERKSTATT",-14,10,7.5,6,5.2,0x9a684d,0x51483e);
 detailedBuilding("food","HOFVERKAUF",-2,10,7,5.5,4.4,0xe1d0a7,0x6f7650);
 detailedBuilding("capital","BÜRGERHAUS",12,9,7.5,6.2,7.0,0xd7ccb8,0x665c4d);
 // Old building / landmark with tower
 const old=detailedBuilding("crisis","ALTES HAUS",-1,1,8.5,7,6.2,0x9a684d,0x433b33);
 const tower=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.8,10,8),buildingMaterial("plaster",0xb59c7c));tower.position.set(-1,5,1);scene.add(tower);
 const towerRoof=new THREE.Mesh(new THREE.ConeGeometry(2.2,3.0,8),new THREE.MeshStandardMaterial({color:0x4c493e,roughness:.95}));towerRoof.position.set(-1,11.4,1);scene.add(towerRoof);
 // Multi-family blocks
 const apartment=(x,z,w,d,h,wall,roof)=>{const g=officeBuilding("","MEHRFAMILIENHAUS",x,z,w,d,h,wall,roof);for(let yy=1.5;yy<h-.4;yy+=1.65){for(let xx=-w/2+1.0;xx<w/2-.4;xx+=1.55){const balcony=new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.62),new THREE.MeshStandardMaterial({color:0x8f8a78,roughness:.85}));balcony.position.set(xx,yy-.38,d/2+.32);g.add(balcony);}}return g;};
 apartment(-25,-12,9,7,10.5,0xd2c5ae,0x5b5d52); apartment(26,7,10,8,12,0xe0d6c4,0x62675c); apartment(-25,4,8,7,8.5,0xc9b8a0,0x594d42);
 // Charm shops along the market street
 const shop=(x,z,color,label)=>{const g=detailedBuilding("economy",label,x,z,4.2,3.8,3.3,color,0x5b4d3e);const aw=new THREE.Mesh(new THREE.BoxGeometry(3.7,.12,1.15),new THREE.MeshStandardMaterial({color:0xa85f47,roughness:.75}));aw.position.set(0,2.5,2.0);aw.rotation.x=-.18;g.add(aw);return g};
 shop(-8,-20,0xd8c4a4,"CAFÉ");shop(-3,-20,0xb8c8b0,"BÄCKEREI");shop(2,-20,0xd4b79e,"LADEN");shop(7,-20,0xc6bfa9,"WERKSTATT");
 // Factory / industry zone at the edge, with chimneys and tanks
 const factory=new THREE.Group();factory.position.set(28,0,22);scene.add(factory);
 const facBody=new THREE.Mesh(new THREE.BoxGeometry(15,8,11),buildingMaterial("brick",0x8a5b45));facBody.position.y=4;factory.add(facBody);
 for(let i=-5;i<=5;i+=2.5){const win=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.1,.08),new THREE.MeshStandardMaterial({color:0x879d8c,roughness:.25,emissive:0x263b31,emissiveIntensity:.12}));win.position.set(i,5.1,5.56);factory.add(win)}
 for(let i=0;i<3;i++){const stack=new THREE.Mesh(new THREE.CylinderGeometry(.55,.7,10,16),buildingMaterial("brick",0x765042));stack.position.set(-4+i*4,9,1);factory.add(stack);}
 const tank=new THREE.Mesh(new THREE.CylinderGeometry(2,2,6,24),new THREE.MeshStandardMaterial({color:0x7c8b7a,metalness:.4,roughness:.45}));tank.position.set(7,3,1);factory.add(tank);
 factory.userData={key:"economy",label:"FABRIK"};objects.push(factory);
 // Rolling hills: low and distant so the settlement remains visible.
 const hillMat=[0x78945f,0x6f8a58,0x8ba26b,0x6f845d].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
 const hill=(x,z,sx,sy,sz,c)=>{const h=new THREE.Mesh(new THREE.SphereGeometry(8,32,18),hillMat[c%hillMat.length]);h.scale.set(sx,sy,sz);h.position.set(x,sy*3.0-3.0,z);scene.add(h)};
 hill(-52,10,2.6,.42,1.8,0); hill(52,12,2.8,.46,1.9,1);
 hill(-46,34,2.8,.56,1.8,2); hill(46,36,3.0,.54,2.0,3);
 hill(-18,48,3.3,.62,2.1,1); hill(18,50,3.5,.64,2.3,0);
 // Distant mountain wall behind the town — smoother, layered and intentionally far away.
 const mountainMat=new THREE.MeshStandardMaterial({color:0x657f76,roughness:.96,flatShading:false});const snowMat=new THREE.MeshStandardMaterial({color:0xe8e7dd,roughness:.98});
 for(let i=0;i<13;i++){const x=-72+i*12, h=18+(i%5)*5, r=7+(i%3)*2; const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,16),mountainMat); m.position.set(x,h/2-2,-72-(i%2)*4); m.rotation.y=i*.41; m.castShadow=true; scene.add(m); if(h>27){const s=new THREE.Mesh(new THREE.ConeGeometry(r*.42,4.2,12),snowMat);s.position.set(x,h-2.1,m.position.z+.1);s.rotation.y=i*.41;scene.add(s);}}
 // distant lake band adds atmospheric depth behind the settlement
 const distantLake=new THREE.Mesh(new THREE.PlaneGeometry(105,22),new THREE.MeshStandardMaterial({color:0x789fa0,roughness:.24,metalness:.02})); distantLake.rotation.x=-Math.PI/2; distantLake.position.set(0,-.55,-52); scene.add(distantLake);
 // Farms with real rows, greenhouses and farmers
 const cropMat=new THREE.MeshStandardMaterial({color:0x829a55,roughness:1});
 for(let f=0;f<8;f++){const x=-35+(f%4)*6,z=19+Math.floor(f/4)*8;for(let r=0;r<8;r++){const row=new THREE.Mesh(new THREE.BoxGeometry(4.8,.10,.16),cropMat);row.position.set(x,-.59,z+r*.62);scene.add(row)}}
 for(let i=0;i<2;i++){const gh=new THREE.Mesh(new THREE.BoxGeometry(7,2.8,4.5),new THREE.MeshStandardMaterial({color:0xc8ded0,transparent:true,opacity:.42,roughness:.2}));gh.position.set(-27+i*10,1,31);scene.add(gh)}
 for(let i=0;i<8;i++) makeFarmer(-34+(i%4)*5.8,20+Math.floor(i/4)*8,(i%2?1:-1),i);
 addUndergroundFarmEntrance();
 // Street furniture, crossings, trees and small gardens
 const lampMat=new THREE.MeshStandardMaterial({color:0x3f4b3e,roughness:.78}),lampGlow=new THREE.MeshStandardMaterial({color:0xffe9ae,emissive:0xffc85d,emissiveIntensity:.8});
 for(let i=0;i<22;i++){const horizontal=i%2===0,lane=horizontal?-2.3:2.3,q=-32+(i%11)*6;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,2.7,8),lampMat);pole.position.set(horizontal?q:lane,.75,horizontal?lane:q);scene.add(pole);const glow=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),lampGlow);glow.position.set(pole.position.x,2.0,pole.position.z);scene.add(glow)}
 const trunkMat=new THREE.MeshStandardMaterial({map:canvasTexture("wood",29),roughness:1});const leafMats=[0x4f7547,0x638b51,0x78975d,0x557c55].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
 for(let i=0;i<78;i++){const a=i/78*Math.PI*2,r=27+(i%8)*1.7,g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.24,1.6+(i%3)*.25,8),trunkMat);trunk.position.y=.15;g.add(trunk);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.0+(i%4)*.16,2),leafMats[i%4]);crown.position.y=1.4;crown.scale.set(1,1.12+(i%2)*.15,1);g.add(crown);g.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(g)}
 // Public-space details: benches, planters, bicycles and café tables.
 const benchWood=new THREE.MeshStandardMaterial({color:0x76573c,roughness:.9}), benchMetal=new THREE.MeshStandardMaterial({color:0x4d564c,roughness:.8});
 for(const [x,z,rot] of [[-7,-17,0],[4,-17,Math.PI],[15,-3,Math.PI/2],[-16,7,-Math.PI/2]]){const b=new THREE.Group();const seat=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,.42),benchWood);seat.position.y=.55;b.add(seat);for(const xx of [-.58,.58]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.08),benchMetal);leg.position.set(xx,.25,0);b.add(leg);}b.position.set(x,0,z);b.rotation.y=rot;scene.add(b);}
 for(const [x,z] of [[-6,-16],[-2,-16],[3,-16],[8,-16]]){const table=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.06,16),benchWood);table.position.set(x,1,z);scene.add(table);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,1,8),benchMetal);stem.position.set(x,.5,z);scene.add(stem);}
 // Cars, buses and many residents
 addMovingCar("z",-2.0,-28,5.2,0x587766,0);addMovingCar("z",2.0,20,-4.4,0x8a6f4f,1);addMovingCar("x",-2.0,-25,4.0,0x6f7b58,2);addMovingCar("x",2.0,18,-3.6,0x7a6657,3);
 addMovingCar("x",-23,-28,2.6,0x667d72,1);addMovingCar("x",23,12,-2.8,0x8a5e4e,2);
 for(let i=0;i<22;i++){const horizontal=i%2===0,side=(i%4)-1.5;addWalker(horizontal?-30+i*2.7:side*2.6,horizontal?side*2.6:-29+i*2.7,horizontal?(i%4<2?1:-1):0,horizontal?0:(i%4<2?1:-1),.5+(i%4)*.08,0x66775c,i*.55,i%5)}
 // Clouds stay high enough to pass visibly over the town and mountains
 const birds=[],birdMat=new THREE.MeshStandardMaterial({color:0x46544a,roughness:.9});for(let i=0;i<9;i++){const b=new THREE.Group(),l=new THREE.Mesh(new THREE.ConeGeometry(.10,.48,5),birdMat);l.rotation.z=Math.PI/2;l.position.x=-.22;b.add(l);const r=l.clone();r.position.x=.22;b.add(r);b.position.set(-35+i*8,14+(i%3)*1.2,-28+(i%4)*8);scene.add(b);birds.push({g:b,phase:i*.9,speed:.7+i*.08})}
 const cloudMat=new THREE.MeshStandardMaterial({color:0xf4f1e7,roughness:1,transparent:true,opacity:.86}),clouds=[];for(let i=0;i<7;i++){const c=new THREE.Group();for(let j=0;j<5;j++){const p=new THREE.Mesh(new THREE.SphereGeometry(1.8+(j%2)*.7,14,10),cloudMat);p.position.set(j*1.6,Math.sin(j)*.35,Math.cos(j)*.35);c.add(p)}c.position.set(-60+i*20,20+(i%2)*2,-28+i*8);c.scale.setScalar(.85+(i%3)*.2);scene.add(c);clouds.push({g:c,speed:.11+i*.018})}
 const windFlags=[];for(let i=0;i<7;i++){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,1.8,6),lampMat);pole.position.set(-28+i*5,-.05,29);scene.add(pole);const flag=new THREE.Mesh(new THREE.PlaneGeometry(.72,.36),new THREE.MeshStandardMaterial({color:[0x7d8d61,0xa17c5c,0x6c8175d][i%3],side:THREE.DoubleSide,roughness:.9}));flag.position.set(.36,.75,0);pole.add(flag);windFlags.push({flag,phase:i*.6})}
 const pts=[];for(let i=0;i<180;i++)pts.push((Math.random()-.5)*110,3+Math.random()*18,(Math.random()-.5)*110);const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xf1e4ac,size:.06,transparent:true,opacity:.25})));
 scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
}
function mat(c,em=0){return new THREE.MeshStandardMaterial({color:c,roughness:.62,metalness:.18,emissive:em?c:0,emissiveIntensity:em?0.22:0})}
function onPointer(e){
 const rect=renderer.domElement.getBoundingClientRect(); mouse.x=(e.clientX-rect.left)/rect.width*2-1; mouse.y=-(e.clientY-rect.top)/rect.height*2+1;
 raycaster.setFromCamera(mouse,camera); const hit=raycaster.intersectObjects(objects,true)[0]; if(!hit)return;
 let o=hit.object; while(o.parent && !o.userData.key)o=o.parent; showInfo(o.userData.key); focus(o);
}
function focus(o){const p=o.position.clone();controls.target.lerp(p,.35);camera.position.lerp(new THREE.Vector3(p.x+24,p.y+19,p.z+24),.35)}
function showInfo(key){const d=blocks[key]; if(!d)return; const c=connectionIndex[key]; const relation=c?`<div class="panel-relations"><h4>Verknüpft mit</h4><div>${c.links.map(k=>`<button class="relation-pill" data-panel-conn="${k}">${connectionIndex[k]?.title||k}</button>`).join("")}</div></div>`:""; document.querySelector("#panelContent").innerHTML=`<span class="tag">${d.tag}</span><h2>${d.title}</h2><p>${d.text}</p><div class="proscons"><div><h4>Mögliche Stärken</h4><ul>${d.pros.map(x=>`<li>${x}</li>`).join("")}</ul></div><div><h4>Offene Fragen</h4><ul>${d.cons.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>${relation}`; document.querySelector("#panelContent").querySelectorAll("[data-panel-conn]").forEach(b=>b.onclick=()=>openConnection(b.dataset.panelConn));document.querySelector("#infoPanel").classList.add("open")}
function animate(){
 requestAnimationFrame(animate); controls.update();
 const t=performance.now()/1000;
 movingCars.forEach(c=>{
   if(c.axis==="z"){c.g.position.z+=c.speed*.012;if(c.g.position.z>31)c.g.position.z=-31;if(c.g.position.z<-31)c.g.position.z=31;c.g.position.x=c.lane;c.g.rotation.y=c.speed>0?0:Math.PI;}
   else{c.g.position.x+=c.speed*.012;if(c.g.position.x>31)c.g.position.x=-31;if(c.g.position.x<-31)c.g.position.x=31;c.g.position.z=c.lane;c.g.rotation.y=c.speed>0?Math.PI/2:-Math.PI/2;}
 });
 walkers.forEach((p,i)=>{
   p.g.position.x+=p.dx*p.speed*.006; p.g.position.z+=p.dz*p.speed*.006;
   if(p.g.position.x>27||p.g.position.x<-27||p.g.position.z>27||p.g.position.z<-27){p.dx*=-1;p.dz*=-1;}
   p.g.rotation.y=Math.atan2(p.dx,p.dz);const walk=Math.sin(t*(7+p.speed*2)+p.phase),parts=p.g.userData.parts;
   if(parts){parts.legL.rotation.x=walk*.48;parts.legR.rotation.x=-walk*.48;parts.armL.rotation.x=-walk*.32;parts.armR.rotation.x=walk*.32;}p.g.position.y=Math.abs(walk)*.025;
 });
 farmers.forEach((f,i)=>{const work=Math.sin(t*1.8+f.phase);f.g.rotation.y=Math.sin(t*.45+f.phase)*.18;f.g.position.y=Math.abs(work)*.018;if(f.tool)f.tool.rotation.z=-.55+Math.sin(t*1.7+f.phase)*.35;});
 if(typeof birds!=='undefined')birds.forEach(b=>{b.g.position.x+=b.speed*.012;b.g.position.y+=Math.sin(t*2+b.phase)*.004;if(b.g.position.x>34)b.g.position.x=-34;const flap=Math.sin(t*8+b.phase)*.22;b.g.children.forEach((w,j)=>w.rotation.z=(j?-.3:.3)+flap*(j?-.7:.7))});
 if(typeof clouds!=='undefined')clouds.forEach(c=>{c.g.position.x+=c.speed*.01;if(c.g.position.x>38)c.g.position.x=-38});
 if(typeof windFlags!=='undefined')windFlags.forEach(f=>{f.flag.rotation.y=Math.sin(t*2.2+f.phase)*.35;f.flag.rotation.z=Math.sin(t*1.4+f.phase)*.05});
 undergroundDoors.forEach(u=>{u.light.intensity=1.8+Math.sin(t*1.7)*.35;});
 renderer.render(scene,camera);
}
function resize(){if(!renderer)return;camera.aspect=innerWidth/(innerHeight-72);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight-72)}
function resetCamera(){camera.position.set(72,42,92);controls.target.set(0,1.5,0)}

function updateMetrics(){
 const supply=Math.round((state.food*.52+state.energy*.48)*.96);
 const reserve=Math.round(Math.max(10, state.reserve-(100-state.food)*.35-(100-state.energy)*.3+(state.invest-60)*.12));
 const trust=Math.round(Math.max(0,Math.min(100,state.trust-(state.conc-20)*.08)));
 const energy=Math.round(state.energy);
 const vals=[["Versorgung",supply],["Energie",energy],["Reserve",reserve],["Vertrauen",trust]];
 document.querySelector("#metrics").innerHTML=vals.map(([n,v])=>`<div class="metric"><div class="mhead"><span>${n}</span><b>${v}</b></div><div class="bar"><i style="width:${Math.max(3,Math.min(100,v))}%"></i></div></div>`).join("");
}
function simMetrics(){
 const supply=Math.max(0,Math.round((state.food*.55+state.energy*.45)-Math.max(0,state.conc-50)*.2));
 const resilience=Math.max(0,Math.round(state.reserve*.45+state.invest*.28+state.trust*.18+state.energy*.09));
 const risk=Math.max(0,Math.min(100,Math.round((100-state.food)*.35+(100-state.energy)*.35+(100-state.trust)*.2+state.conc*.12)));
 return {supply,resilience,risk,system:100-risk};
}
function simRender(){
 for(const id of ["food","energy","trust","conc","invest"])document.getElementById(id+"Out").textContent=state[id];
 const {supply,resilience,risk,system}=simMetrics();
 const rows=[["Versorgung",supply,"Produktion und Energie im Verhältnis zur Belastung"],["Resilienz",resilience,"Puffer aus Reserve, Vertrauen und Investitionen"],["Systemstabilität",system,"Verbleibende Stabilität nach dem berechneten Krisendruck"],["Vertrauen",state.trust,"Kooperations- und Informationsbasis"]];
 document.getElementById("simBars").innerHTML=rows.map(([n,v,d])=>`<div class="sbar"><div class="sbarhead"><span>${n}</span><b>${v}</b></div><div class="sbartrack"><i style="width:${Math.max(2,Math.min(100,v))}%"></i></div><small>${d}</small></div>`).join("");
 const pulse=document.getElementById("simPulse");
 if(pulse){const tone=risk>60?"hoch":risk>30?"angespannt":"ruhig";pulse.innerHTML=`<span class="pulse-dot ${tone}"></span><div><b>Systemlage: ${tone}</b><small>Krisendruck ${risk} · Reserve ${Math.round(state.reserve)} · Konzentration ${Math.round(state.conc)}</small></div>`;}
 const network=document.getElementById("simNetwork");
 if(network){const links=[['Lebensmittel','Versorgung',state.food],['Energie','Versorgung',state.energy],['Vertrauen','Kooperation',state.trust],['Investitionen','Projekte',state.invest],['Konzentration','Abhängigkeit',state.conc]];network.innerHTML=links.map(([a,b,v])=>`<div class="network-row"><span>${a}</span><i><em style="width:${Math.max(4,Math.min(100,v))}%"></em></i><b>${b}</b></div>`).join("");}
 const analysis=document.getElementById("simAnalysis");
 if(analysis){const notes=[]; if(state.food<75)notes.push("Die Lebensmittelversorgung ist der aktuelle Engpass."); if(state.energy<75)notes.push("Energie wird zum limitierenden Faktor für Produktion und Mobilität."); if(state.trust<65)notes.push("Niedriges Vertrauen schwächt Kooperation und Investitionsbereitschaft."); if(state.conc>60)notes.push("Hohe Marktkonzentration erhöht Abhängigkeiten im Modell."); if(state.invest>75)notes.push("Höhere Bürgerkapital-Investitionen vergrößern den finanziellen Puffer."); if(!notes.length)notes.push("Kein einzelner Faktor dominiert die aktuelle Modelllage."); notes.push("Deutschland-Referenz: 6,4 % Arbeitslosenquote (Juli 2026) und 2,9 % Inflation (August 2026). Das sind externe Vergleichswerte; der Modellindex ist nicht in diese Einheiten übersetzt.");
 const bridge=[]; if(state.energy<75)bridge.push("Der Energie-Regler lässt sich inhaltlich neben den amtlichen Strommix stellen: Im 1. Halbjahr 2026 kamen rund 57 % des genutzten Stroms aus erneuerbaren Energien."); if(state.invest>75)bridge.push("Hohe Modell-Investitionen können als Testfrage für Wachstum und Projektfinanzierung gelesen werden; sie entsprechen nicht direkt dem realen BIP-Wachstum von +0,3 % im 2. Quartal 2026."); if(state.food<75)bridge.push("Eine schwächere Lebensmittelversorgung ist im Modell ein Resilienztest. Der Wert ist keine Prognose für die reale Versorgungslage Deutschlands."); notes.push(...bridge); analysis.innerHTML=notes.map((n,i)=>`<div class="analysis-item"><span>${String(i+1).padStart(2,'0')}</span><p>${n}</p></div>`).join("");}
 updateConnectionHighlight();
 updateMetrics();
}
function updateConnectionHighlight(){
 const el=document.getElementById("connectionCards"); if(!el)return;
 const active=new Set();
 if(state.food<80)active.add("food"); if(state.energy<80)active.add("energy"); if(state.trust<70)active.add("trust"); if(state.invest>75)active.add("capital"); if(state.conc>60)active.add("economy");
 el.querySelectorAll(".connection-card").forEach(c=>c.classList.toggle("hot",active.has(c.dataset.conn)));
}

function log(msg){const el=document.getElementById("simLog");el.insertAdjacentHTML("afterbegin",`<div class="log">${new Date().toLocaleTimeString("de-DE")} · ${msg}</div>`)}
function scenario(s){
 if(s==="digital"){state.trust-=13;state.energy-=5;state.reserve-=7;log("Digitalausfall: Vertrauen und Zahlungs-/Logistikfähigkeit sinken.")}
 if(s==="harvest"){state.food-=22;state.reserve-=9;log("Erntekrise: Lebensmittelversorgung fällt, Reserven puffern den Schock.")}
 if(s==="energy"){state.energy-=24;state.reserve-=12;log("Energieschock: Produktions- und Transportkapazität werden belastet.")}
 if(s==="trust"){state.trust-=25;state.invest-=10;log("Vertrauenskrise: Investitionsbereitschaft sinkt, Informationsprüfung wird wichtiger.")}
 if(s==="compound"){state.food-=18;state.energy-=17;state.trust-=18;state.reserve-=18;log("Mehrfachkrise: mehrere Engpässe verstärken sich gegenseitig.")}
 clamp();simRender()
}
function clamp(){for(const k of ["food","energy","trust","conc","invest","reserve"])state[k]=Math.max(0,Math.min(120,state[k]))}

function renderDocument(){
 const toc=document.getElementById("toc"),doc=document.getElementById("document");
 toc.innerHTML=constitution.map((p,i)=>`<button data-part="${i}">Teil ${p.part} · ${p.title}</button>`).join("");
 doc.innerHTML=`<h1>Verfassung — Arbeitsfassung 1.0</h1><p><strong>Hinweis:</strong> Dies ist ein politisches Gedankenmodell und keine geltende Rechtsordnung. Die Artikel sind Entwurfstexte und ausdrücklich offen für Kritik, Änderung und Streichung.</p>`+
 constitution.map((p,i)=>`<section id="part-${i}"><h2>Teil ${p.part} · ${p.title}</h2>${p.articles.map(a=>`<div class="article"><div class="num">ARTIKEL ${a[0]}</div><h3>${a[1]}</h3><p>${a[2]}</p></div>`).join("")}</section>`).join("");
 toc.querySelectorAll("button").forEach(b=>b.onclick=()=>document.getElementById("part-"+b.dataset.part).scrollIntoView({behavior:"smooth",block:"start"}));
}
function fullText(){
 return "# Verfassung des Gesellschaftsmodells — Arbeitsfassung 1.0\\n\\nHinweis: Politischer Entwurf / Gedankenmodell, keine geltende Rechtsordnung.\\n\\n"+
 constitution.map(p=>`## Teil ${p.part} · ${p.title}\\n\\n`+p.articles.map(a=>`### Artikel ${a[0]} — ${a[1]}\\n${a[2]}`).join("\\n\\n")).join("\\n\\n");
}
function download(name,type,data){const blob=new Blob([data],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadAll(){download("gesellschaftsmodell-arbeitsfassung.md","text/markdown;charset=utf-8",fullText())}


const heroSlides=[
 {eyebrow:"INTERAKTIVES SYSTEMMODELL",title:"Eine Gesellschaft, die sich erkunden lässt.",text:"Eine lebendige Landschaft als Modell: Wohnen, Versorgung, Bildung, Wirtschaft, Landwirtschaft und Gemeinschaft liegen sichtbar nebeneinander.",part:"ÜBERBLICK",target:"old"},
 {eyebrow:"I · GRUNDLAGEN",title:"Gemeinschaft braucht Räume.",text:"Plätze, Gehwege, Nachbarschaften und kleine Läden bilden den sozialen Alltag.",part:"MARKTPLATZ",target:"shopCafe"},
 {eyebrow:"II · DEMOKRATIE",title:"Entscheidungen bleiben sichtbar.",text:"Das Rathaus ist ein öffentlicher Ort für Beratung, Entscheidung und Kontrolle.",part:"RATHAUS",target:"rathaus"},
 {eyebrow:"III · GESUNDHEIT",title:"Versorgung gehört zum Alltag.",text:"Gesundheit, Freibad und soziale Infrastruktur liegen mitten in der Stadt.",part:"GESUNDHEIT",target:"health"},
 {eyebrow:"IV · WIRTSCHAFT",title:"Arbeit hat viele Formen.",text:"Werkstätten, Läden, Mehrfamilienhäuser und die Fabrik zeigen unterschiedliche Arbeitswelten.",part:"FABRIK",target:"factory"},
 {eyebrow:"V · BILDUNG",title:"Lernen braucht Orte.",text:"Schule und öffentliche Räume sind Teil des täglichen Weges durch die Stadt.",part:"SCHULE",target:"education"},
 {eyebrow:"VI · LANDWIRTSCHAFT",title:"Nahrung beginnt vor der Stadt.",text:"Felder, Gewächshäuser, Hofverkauf und Untergrundplantagen verbinden Ernährung mit sichtbarer Infrastruktur.",part:"UNTERGRUNDPLANTAGEN",target:"underground"},
 {eyebrow:"VII · ENERGIE & INFRASTRUKTUR",title:"Eine Stadt ist ein Netzwerk.",text:"Straßen, Gehwege, Fluss, Industrie, Energie und Mobilität greifen ineinander.",part:"INFRASTRUKTUR",target:"factory"},
 {eyebrow:"VIII · KRISENORDNUNG",title:"Auch Krisen brauchen Räume.",text:"Reserve, Analyse und gemeinschaftliche Reaktion werden als Teil der Landschaft nachvollziehbar.",part:"ALTES HAUS",target:"old"}
];
let heroIndex=0;
function findTarget(key){if(key==="shopCafe") return objects.find(x=>x.userData.label==="CAFÉ")||objects.find(x=>x.userData.key==="economy"); if(key==="rathaus") return objects.find(x=>x.userData.label==="RATHAUS"); if(key==="health") return objects.find(x=>x.userData.label==="GESUNDHEIT"); if(key==="education") return objects.find(x=>x.userData.label==="SCHULE"); if(key==="factory") return objects.find(x=>x.userData.label==="FABRIK"); if(key==="underground") return objects.find(x=>x.userData.key==="food")||objects.find(x=>x.userData.label==="UNTERGRUNDPLANTAGEN"); if(key==="old") return objects.find(x=>x.userData.label==="ALTES HAUS");}
function focusHeroTarget(){const o=findTarget(heroSlides[heroIndex].target); if(o){focus(o);}}
function renderHeroSlide(){const s=heroSlides[heroIndex];document.querySelector('.hero .eyebrow').textContent=s.eyebrow;const parts=s.title.split(', ');document.querySelector('.hero h1').innerHTML=parts.length>1?`${parts[0]},<br><em>${parts.slice(1).join(', ')}</em>`:s.title;document.querySelector('.hero p').textContent=s.text;const pager=document.querySelector('#heroPager');if(pager)pager.innerHTML=`<button class="hero-arrow" data-dir="-1" aria-label="Vorheriger Bereich">←</button><div class="preview-copy"><span>${heroIndex+1} / ${heroSlides.length}</span><strong>${s.part}</strong><small>Ansicht öffnen · Gebäudesprung</small></div><button class="hero-arrow" data-dir="1" aria-label="Nächster Bereich">→</button>`; focusHeroTarget();}
function moveHeroSlide(dir){heroIndex=(heroIndex+dir+heroSlides.length)%heroSlides.length;renderHeroSlide();}
function setupHeroCollapse(){
 const card=document.getElementById("heroCard"), btn=document.getElementById("heroCollapse");
 if(!card||!btn)return;
 btn.addEventListener("click",()=>{const collapsed=card.classList.toggle("collapsed");btn.textContent=collapsed?"⌄":"⌃";btn.setAttribute("aria-expanded",String(!collapsed));});
}
function setupViews(){
 document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
 setupHeroCollapse();
 document.addEventListener("click",e=>{const b=e.target.closest(".hero-arrow");if(b){moveHeroSlide(Number(b.dataset.dir));return;} if(e.target.closest("#heroPager")) focusHeroTarget();});
 renderHeroSlide();
}
function switchView(id){
 document.querySelector("#infoPanel")?.classList.remove("open");
 document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
 document.querySelectorAll(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
 if(id==="world")setTimeout(resize,30);
}
document.querySelector("#closePanel").onclick=()=>document.querySelector("#infoPanel").classList.remove("open");
document.querySelector("#downloadAll").onclick=downloadAll;
document.querySelector("#downloadMd").onclick=()=>download("gesellschaftsmodell-arbeitsfassung.md","text/markdown;charset=utf-8",fullText());
document.querySelector("#downloadTxt").onclick=()=>download("gesellschaftsmodell-arbeitsfassung.txt","text/plain;charset=utf-8",fullText().replaceAll("#",""));
document.querySelector("#resetSim").onclick=()=>{state={food:100,energy:100,trust:88,conc:20,invest:60,reserve:82};simRender();log("Ausgangslage wiederhergestellt.")};
document.querySelector("#clearSimLog")?.addEventListener("click",()=>{document.querySelector("#simLog").innerHTML="";});
["food","energy","trust","conc","invest"].forEach(k=>document.getElementById(k).oninput=e=>{state[k]=+e.target.value;simRender()});
document.querySelectorAll("[data-scenario]").forEach(b=>b.onclick=()=>scenario(b.dataset.scenario));
document.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>{switchView("world");const o=objects.find(x=>x.userData.key===b.dataset.focus);if(o){focus(o);showInfo(o.userData.key)}});
document.addEventListener("keydown",e=>{
 if(e.key.toLowerCase()==="r")resetCamera();
 if(document.querySelector("#world").classList.contains("active")){ if(e.key==="ArrowLeft"){e.preventDefault();moveHeroSlide(-1);} if(e.key==="ArrowRight"){e.preventDefault();moveHeroSlide(1);} }
});
renderDocument();
document.querySelector("#critgrid").innerHTML=critique.map(x=>`<article class="critcard"><div class="label">PRÜFPUNKT</div><h3>${x[0]}</h3><p><strong>Gedanke:</strong> ${x[1]}</p><p><strong>Offene Frage:</strong> ${x[2]}</p></article>`).join("");
setupViews();renderGermanyStats();renderGermanyBridge();renderConnections();simRender();
init3D();
window.addEventListener("error", e => { const el=document.querySelector("#statusHint"); if(el) el.textContent="Fehler beim Laden der 3D-Ansicht: bitte Startskript verwenden und Internetverbindung prüfen."; });
