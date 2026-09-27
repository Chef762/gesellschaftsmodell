import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js";

import { constitution as constitutionData } from "./constitution.js";

const constitution = Object.entries(constitutionData).map(([part, value]) => ({part, title:value.title, articles:value.articles.map(a=>[String(a.number),a.title,a.text])}));

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
 scene=new THREE.Scene();
 scene.fog=new THREE.FogExp2(0x05070b,.012);
 camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,500);
 camera.position.set(31,24,34);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
 renderer.setSize(innerWidth,innerHeight-72);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.12;
 document.querySelector("#canvasWrap").appendChild(renderer.domElement);

 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true; controls.dampingFactor=.055;
 controls.minDistance=15; controls.maxDistance=100;
 controls.maxPolarAngle=Math.PI/2.12; controls.target.set(0,2,0);

 scene.add(new THREE.AmbientLight(0x8da2bf,.7));
 const keyLight=new THREE.DirectionalLight(0xdcecff,2.8);
 keyLight.position.set(18,35,20); scene.add(keyLight);
 const rim=new THREE.PointLight(0x72ffc1,90,80); rim.position.set(-18,12,-12); scene.add(rim);
 const violet=new THREE.PointLight(0x8d7cff,70,75); violet.position.set(22,9,-18); scene.add(violet);

 createCivicWorld();
 raycaster=new THREE.Raycaster(); mouse=new THREE.Vector2();
 renderer.domElement.addEventListener("pointerdown",onPointer);
 addEventListener("resize",resize);
 animate();
 setTimeout(()=>document.querySelector("#boot").style.display="none",700);
}

function glowMat(color,emissive=color,opacity=1){
 return new THREE.MeshStandardMaterial({
   color, emissive, emissiveIntensity:1.35, metalness:.48, roughness:.26,
   transparent:opacity<1, opacity
 });
}
function solidMat(color){
 return new THREE.MeshStandardMaterial({color,metalness:.62,roughness:.3});
}
function addRing(radius,y,color,opacity=.35){
 const ring=new THREE.Mesh(
   new THREE.TorusGeometry(radius,.025,8,160),
   new THREE.MeshBasicMaterial({color,transparent:true,opacity})
 );
 ring.rotation.x=Math.PI/2; ring.position.y=y; scene.add(ring);
 return ring;
}
function createModule(key,label,x,z,color,icon,scale=1){
 const g=new THREE.Group(); g.position.set(x,0,z); g.scale.setScalar(scale);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.8,.55,48),solidMat(0x111923));
 base.position.y=.28; g.add(base);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(2.8,.055,10,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.55}));
 halo.rotation.x=Math.PI/2; halo.position.y=.65; g.add(halo);
 const core=new THREE.Mesh(new THREE.OctahedronGeometry(1.65,1),glowMat(color));
 core.position.y=2.15; g.add(core);
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.46,24,24),new THREE.MeshBasicMaterial({color}));
 orb.position.y=2.15; g.add(orb);
 for(let i=0;i<4;i++){
   const p=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,1.7),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.5}));
   p.position.y=2.15; p.rotation.y=i*Math.PI/2; g.add(p);
 }
 g.userData={key,label,baseY:0,color};
 scene.add(g); objects.push(g);
 return g;
}
function createCivicWorld(){
 // Deep platform: the city floats above a dark civic "datum".
 const ground=new THREE.Mesh(
   new THREE.CylinderGeometry(49,53,1.2,96),
   new THREE.MeshStandardMaterial({color:0x070b11,metalness:.55,roughness:.55})
 );
 ground.position.y=-.72; scene.add(ground);

 for(let r=9;r<=43;r+=8) addRing(r,-.08,0x3c5060,.20);
 const inner=addRing(6.2,.05,0x79ffd0,.45);

 // Central civic core
 const coreGroup=new THREE.Group(); coreGroup.userData={key:"democracy",label:"DEMOKRATIE"};
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(4.2,5.1,.9,64),solidMat(0x121b24));
 pedestal.position.y=.45; coreGroup.add(pedestal);
 const sphere=new THREE.Mesh(new THREE.IcosahedronGeometry(3.0,3),glowMat(0x73ffc5));
 sphere.position.y=4.0; coreGroup.add(sphere);
 const innerSphere=new THREE.Mesh(new THREE.SphereGeometry(1.15,32,32),new THREE.MeshBasicMaterial({color:0xeafff5}));
 innerSphere.position.y=4; coreGroup.add(innerSphere);
 [4.5,5.5,6.5].forEach((r,i)=>{
   const rr=new THREE.Mesh(new THREE.TorusGeometry(r,.035,8,160),new THREE.MeshBasicMaterial({color:i===1?0x8d7cff:0x6df7c0,transparent:true,opacity:.34}));
   rr.rotation.set(Math.PI/2 + i*.22,i*.38,0); rr.position.y=4; coreGroup.add(rr);
 });
 scene.add(coreGroup); objects.push(coreGroup);

 const modules=[
  ["health","GESUNDHEIT",-14,-8,0xff7397,1],
  ["education","BILDUNG",0,-16,0x71a7ff,.95],
  ["economy","WIRTSCHAFT",15,-7,0xffc76d,1.05],
  ["food","ERNÄHRUNG",-15,8,0x78e8a5,.92],
  ["capital","BÜRGERKAPITAL",15,8,0xb08cff,1],
  ["crisis","KRISENZENTRUM",0,16,0x72d8ff,1.1]
 ];
 modules.forEach(m=>createModule(...m));

 // Energy/data paths from center to each module.
 modules.forEach((m,i)=>{
   const [key,label,x,z,color]=m;
   const pts=new THREE.CatmullRomCurve3([
     new THREE.Vector3(0,.15,0),
     new THREE.Vector3(x*.45,.3,z*.45),
     new THREE.Vector3(x,.15,z)
   ]);
   const tube=new THREE.Mesh(new THREE.TubeGeometry(pts,32,.035,6,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.45}));
   scene.add(tube);
   const pulse=new THREE.Mesh(new THREE.SphereGeometry(.11,12,12),new THREE.MeshBasicMaterial({color}));
   pulse.userData={curve:pts,phase:i/6}; scene.add(pulse);
 });

 // Peripheral skyline: intentionally abstract, not a blocky city.
 for(let i=0;i<28;i++){
   const a=i/28*Math.PI*2, r=31+Math.sin(i*2.1)*5;
   const h=2+((i*17)%9);
   const b=new THREE.Mesh(new THREE.CylinderGeometry(.55+((i%3)*.18),.8+((i%2)*.2),h,6),solidMat(0x101821));
   b.position.set(Math.cos(a)*r,h/2-.2,Math.sin(a)*r);
   b.rotation.y=a; scene.add(b);
 }
}

function onPointer(e){
 const rect=renderer.domElement.getBoundingClientRect();
 mouse.x=(e.clientX-rect.left)/rect.width*2-1;
 mouse.y=-(e.clientY-rect.top)/rect.height*2+1;
 raycaster.setFromCamera(mouse,camera);
 const hit=raycaster.intersectObjects(objects,true)[0]; if(!hit)return;
 let o=hit.object; while(o.parent && !o.userData.key)o=o.parent;
 showInfo(o.userData.key); focus(o);
}
function focus(o){
 const p=o.position.clone(); p.y+=2;
 controls.target.lerp(p,.5);
 camera.position.lerp(new THREE.Vector3(p.x+15,p.y+12,p.z+15),.5);
}
function showInfo(key){
 const d=blocks[key]; if(!d)return;
 document.querySelector("#panelContent").innerHTML=
 `<span class="tag">${d.tag}</span><h2>${d.title}</h2><p>${d.text}</p><div class="proscons"><div><h4>Mögliche Stärken</h4><ul>${d.pros.map(x=>`<li>${x}</li>`).join("")}</ul></div><div><h4>Offene Fragen</h4><ul>${d.cons.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>`;
 document.querySelector("#infoPanel").classList.add("open");
}
function animate(){
 requestAnimationFrame(animate);
 controls.update();
 const t=performance.now()/1000;
 objects.forEach((o,i)=>{
   o.position.y=o.userData.baseY+Math.sin(t*.65+i)*.06;
   o.rotation.y+=.0009*(i%2?1:-1);
 });
 scene.traverse(o=>{
   if(o.userData && o.userData.curve){
     const u=(t*.09+o.userData.phase)%1;
     const p=o.userData.curve.getPointAt(u);
     o.position.copy(p);
   }
 });
 renderer.render(scene,camera);
}
function resize(){
 if(!renderer)return;
 camera.aspect=innerWidth/(innerHeight-72);
 camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight-72);
}
function resetCamera(){camera.position.set(31,24,34);controls.target.set(0,2,0)}

function updateMetrics(){
 const supply=Math.round((state.food*.52+state.energy*.48)*.96);
 const reserve=Math.round(Math.max(10, state.reserve-(100-state.food)*.35-(100-state.energy)*.3+(state.invest-60)*.12));
 const trust=Math.round(Math.max(0,Math.min(100,state.trust-(state.conc-20)*.08)));
 const energy=Math.round(state.energy);
 const vals=[["Versorgung",supply],["Energie",energy],["Reserve",reserve],["Vertrauen",trust]];
 document.querySelector("#metrics").innerHTML=vals.map(([n,v])=>`<div class="metric"><div class="mhead"><span>${n}</span><b>${v}</b></div><div class="bar"><i style="width:${Math.max(3,Math.min(100,v))}%"></i></div></div>`).join("");
}
function simRender(){
 for(const id of ["food","energy","trust","conc","invest"])document.getElementById(id+"Out").textContent=state[id];
 const supply=Math.max(0,Math.round((state.food*.55+state.energy*.45)-Math.max(0,state.conc-50)*.2));
 const resilience=Math.max(0,Math.round(state.reserve*.45+state.invest*.28+state.trust*.18+state.energy*.09));
 const risk=Math.max(0,Math.round((100-state.food)*.35+(100-state.energy)*.35+(100-state.trust)*.2+state.conc*.12));
 const rows=[["Versorgung",supply],["Resilienz",resilience],["Systemrisiko",100-risk],["Vertrauen",state.trust]];
 document.getElementById("simBars").innerHTML=rows.map(([n,v])=>`<div class="sbar"><div class="sbarhead"><span>${n}</span><b>${v}</b></div><div class="sbartrack"><i style="width:${Math.max(2,Math.min(100,v))}%"></i></div></div>`).join("");
 updateMetrics();
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

function setupViews(){
 document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
}
function switchView(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));if(id==="world")setTimeout(resize,30)}
document.querySelector("#closePanel").onclick=()=>document.querySelector("#infoPanel").classList.remove("open");
document.querySelector("#downloadAll").onclick=downloadAll;
document.querySelector("#downloadMd").onclick=()=>download("gesellschaftsmodell-arbeitsfassung.md","text/markdown;charset=utf-8",fullText());
document.querySelector("#downloadTxt").onclick=()=>download("gesellschaftsmodell-arbeitsfassung.txt","text/plain;charset=utf-8",fullText().replaceAll("#",""));
document.querySelector("#resetSim").onclick=()=>{state={food:100,energy:100,trust:88,conc:20,invest:60,reserve:82};simRender();log("Ausgangslage wiederhergestellt.")};
["food","energy","trust","conc","invest"].forEach(k=>document.getElementById(k).oninput=e=>{state[k]=+e.target.value;simRender()});
document.querySelectorAll("[data-scenario]").forEach(b=>b.onclick=()=>scenario(b.dataset.scenario));
document.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>{switchView("world");const o=objects.find(x=>x.userData.key===b.dataset.focus);if(o){focus(o);showInfo(o.userData.key)}});
document.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="r")resetCamera()});
renderDocument();
document.querySelector("#critgrid").innerHTML=critique.map(x=>`<article class="critcard"><div class="label">PRÜFPUNKT</div><h3>${x[0]}</h3><p><strong>Gedanke:</strong> ${x[1]}</p><p><strong>Offene Frage:</strong> ${x[2]}</p></article>`).join("");
setupViews();simRender();
init3D();
window.addEventListener("error", e => { const el=document.querySelector("#statusHint"); if(el) el.textContent="Fehler beim Laden der 3D-Ansicht: bitte Startskript verwenden und Internetverbindung prüfen."; });


/* --- DEMETER NATURE LAYER --- */
(function(){
  try{
    if(typeof THREE === "undefined") return;
    const sceneRef = (typeof scene !== "undefined") ? scene : null;
    if(!sceneRef) return;

    // Soft ground: a living meadow instead of a hard sci-fi platform.
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(22,96),
      new THREE.MeshStandardMaterial({
        color:0x173522, roughness:.96, metalness:0,
        transparent:true, opacity:.82
      })
    );
    ground.rotation.x = -Math.PI/2;
    ground.position.y = -0.55;
    sceneRef.add(ground);

    // Concentric planting/field rings.
    [5.5,9.5,14.5,20].forEach((r,i)=>{
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r,r+.035,128),
        new THREE.MeshBasicMaterial({
          color:i%2 ? 0xd8b66a : 0x7fa85a,
          transparent:true, opacity:.18
        })
      );
      ring.rotation.x=-Math.PI/2;
      ring.position.y=-0.49+i*.002;
      sceneRef.add(ring);
    });

    // Stylized trees around the perimeter.
    const trunkMat = new THREE.MeshStandardMaterial({color:0x705238,roughness:1});
    const leafMat = new THREE.MeshStandardMaterial({color:0x6f9450,roughness:1});
    for(let i=0;i<26;i++){
      const a=(i/26)*Math.PI*2;
      const r=16.5+(i%3)*1.25;
      const x=Math.cos(a)*r, z=Math.sin(a)*r;
      const g=new THREE.Group();
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.3,7),trunkMat);
      trunk.position.y=.15;
      g.add(trunk);
      for(let j=0;j<3;j++){
        const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.72-j*.10,1),leafMat);
        crown.position.set((j-1)*.28,.85+j*.18,(j%2)*.18);
        crown.scale.y=1.15;
        g.add(crown);
      }
      g.position.set(x,0,z);
      g.rotation.y=-a;
      sceneRef.add(g);
    }

    // A calm central "source" rather than a neon reactor.
    const source=new THREE.Mesh(
      new THREE.SphereGeometry(1.15,32,20),
      new THREE.MeshStandardMaterial({
        color:0xd8b66a, emissive:0x6d5a2c,
        emissiveIntensity:.22, roughness:.48, metalness:.05
      })
    );
    source.position.y=.65;
    sceneRef.add(source);

    // Slow breathing motion.
    const tick=()=>{
      const t=performance.now()*.00045;
      source.scale.setScalar(1+Math.sin(t)*.035);
    };
    function demeterFrame(){ tick(); requestAnimationFrame(demeterFrame); }
    demeterFrame();
  }catch(e){
    console.warn("Nature layer skipped:",e);
  }
})();
