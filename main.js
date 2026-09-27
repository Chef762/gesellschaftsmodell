import * as THREE from "three";
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
 scene.fog=new THREE.Fog(0x070a0f,45,135);
 camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,300);
 camera.position.set(28,27,34);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight-72);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 document.querySelector("#canvasWrap").appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.06; controls.minDistance=13; controls.maxDistance=85; controls.maxPolarAngle=Math.PI/2.08; controls.target.set(0,0,0);
 scene.add(new THREE.HemisphereLight(0xbdd5ff,0x11151b,2));
 const sun=new THREE.DirectionalLight(0xffffff,2.2); sun.position.set(25,40,10); scene.add(sun);
 const grid=new THREE.GridHelper(120,40,0x27313b,0x151b22); grid.position.y=-.05; scene.add(grid);
 const ground=new THREE.Mesh(new THREE.CylinderGeometry(54,58,1,64),new THREE.MeshStandardMaterial({color:0x0b1016,roughness:1})); ground.position.y=-.55; scene.add(ground);
 createCity();
 raycaster=new THREE.Raycaster(); mouse=new THREE.Vector2();
 renderer.domElement.addEventListener("pointerdown",onPointer);
 addEventListener("resize",resize);
 animate();
 setTimeout(()=>document.querySelector("#boot").style.display="none",650);
}
function mat(c,em=0){return new THREE.MeshStandardMaterial({color:c,roughness:.62,metalness:.18,emissive:em?c:0,emissiveIntensity:em?0.22:0})}
function building(key,label,x,z,h,color){
 const g=new THREE.Group(); g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.BoxGeometry(6,h,6),mat(color)); body.position.y=h/2; g.add(body);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(6.5,.25,6.5),mat(0x202b36)); roof.position.y=h+.15; g.add(roof);
 for(let yy=2;yy<h;yy+=2.2){for(let s=-2;s<=2;s+=2){const win=new THREE.Mesh(new THREE.BoxGeometry(.12,.7,.9),mat(0xa8ffcc,1));win.position.set(3.02,yy,s);g.add(win)}}
 g.userData={key,label,base:h}; scene.add(g); objects.push(g);
}
function createCity(){
 building("democracy","DEMOKRATIE",-14,-8,10,0x273b4b);
 building("health","GESUNDHEIT",0,-10,15,0x2d3f48);
 building("education","BILDUNG",14,-7,12,0x304338);
 building("economy","WIRTSCHAFT",-15,8,18,0x3b3847);
 building("food","ERNÄHRUNG",0,8,9,0x33463b);
 building("capital","BÜRGERKAPITAL",14,8,14,0x403d31);
 building("crisis","KRISENZENTRUM",0,0,23,0x3f3535);
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=26;const b=new THREE.Mesh(new THREE.BoxGeometry(2+Math.random()*2,3+Math.random()*9,2+Math.random()*2),mat(0x1c252d));b.position.set(Math.cos(a)*r,(b.geometry.parameters.height/2)-.1,Math.sin(a)*r);scene.add(b)}
}
function onPointer(e){
 const rect=renderer.domElement.getBoundingClientRect(); mouse.x=(e.clientX-rect.left)/rect.width*2-1; mouse.y=-(e.clientY-rect.top)/rect.height*2+1;
 raycaster.setFromCamera(mouse,camera); const hit=raycaster.intersectObjects(objects,true)[0]; if(!hit)return;
 let o=hit.object; while(o.parent && !o.userData.key)o=o.parent; showInfo(o.userData.key); focus(o);
}
function focus(o){const p=o.position.clone();controls.target.lerp(p,.35);camera.position.lerp(new THREE.Vector3(p.x+17,p.y+15,p.z+17),.35)}
function showInfo(key){const d=blocks[key]; if(!d)return; document.querySelector("#panelContent").innerHTML=`<span class="tag">${d.tag}</span><h2>${d.title}</h2><p>${d.text}</p><div class="proscons"><div><h4>Mögliche Stärken</h4><ul>${d.pros.map(x=>`<li>${x}</li>`).join("")}</ul></div><div><h4>Offene Fragen</h4><ul>${d.cons.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>`;document.querySelector("#infoPanel").classList.add("open")}
function animate(){requestAnimationFrame(animate);controls.update();const t=performance.now()/1000;objects.forEach((o,i)=>{o.position.y=Math.sin(t*.65+i)*.05;o.rotation.y=Math.sin(t*.18+i)*.008});renderer.render(scene,camera)}
function resize(){if(!renderer)return;camera.aspect=innerWidth/(innerHeight-72);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight-72)}
function resetCamera(){camera.position.set(28,27,34);controls.target.set(0,0,0)}

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
