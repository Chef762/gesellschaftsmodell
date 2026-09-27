import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js";

import { constitution as constitutionData } from "./constitution.js";

const constitution = Object.entries(constitutionData).map(([part, value]) => ({part, title:value.title, articles:value.articles.map(a=>[String(a.number),a.title,a.text])}));
const movingCars=[]; const walkers=[]; const farmers=[]; const undergroundDoors=[];

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
 scene.background=new THREE.Color(0xb8d3c0);
 scene.fog=new THREE.Fog(0xb8d3c0,35,95);
 camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,250);
 camera.position.set(20,14,27);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.setSize(innerWidth,innerHeight-72);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.05;
 document.querySelector("#canvasWrap").appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true; controls.dampingFactor=.045;
 controls.minDistance=12; controls.maxDistance=55;
 controls.maxPolarAngle=Math.PI/2.18; controls.target.set(0,1.5,0);
 scene.add(new THREE.HemisphereLight(0xeaf5e9,0x58715b,2.1));
 const sun=new THREE.DirectionalLight(0xfff3d6,2.6);
 sun.position.set(-20,30,12); scene.add(sun);
 createLivingLandscape();
 raycaster=new THREE.Raycaster(); mouse=new THREE.Vector2();
 renderer.domElement.addEventListener("pointerdown",onPointer);
 addEventListener("resize",resize); animate();
 setTimeout(()=>document.querySelector("#boot").style.display="none",700);
}
function canvasTexture(type, seed=1){
 const c=document.createElement("canvas"); c.width=1024; c.height=1024; const x=c.getContext("2d");
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
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function buildingMaterial(type,color){const m=new THREE.MeshStandardMaterial({color,roughness:.78}); if(type)m.map=canvasTexture(type,Math.floor(color)); return m}
function detailedBuilding(key,label,x,z,w,d,h,wall,roof){
 const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMaterial("plaster",wall));body.position.y=h/2;g.add(body);
 const roofGeo=new THREE.ConeGeometry(Math.max(w,d)*.78,Math.max(2.2,h*.22),4);const r=new THREE.Mesh(roofGeo,new THREE.MeshStandardMaterial({color:roof,roughness:.9}));r.rotation.y=Math.PI/4;r.position.y=h+.75;g.add(r);
 const door=new THREE.Mesh(new THREE.BoxGeometry(.9,1.8,.08),buildingMaterial("wood",0x6a4b34));door.position.set(0,.9,d/2+.045);g.add(door);
 const winMat=new THREE.MeshStandardMaterial({color:0xb8d4c1,roughness:.35,metalness:.05,emissive:0x6e9278,emissiveIntensity:.08});
 for(const side of [-1,1]){for(const yy of [h*.43,h*.68]){const win=new THREE.Mesh(new THREE.BoxGeometry(1.05,.82,.07),winMat);win.position.set(side*(w/2+.04),yy,0);win.rotation.y=Math.PI/2;g.add(win)}}
 for(const xx of [-w*.27,w*.27]){const win=new THREE.Mesh(new THREE.BoxGeometry(1.0,.8,.07),winMat);win.position.set(xx,h*.56,d/2+.04);g.add(win)}
 const chimney=new THREE.Mesh(new THREE.BoxGeometry(.45,.9,.45),buildingMaterial("brick",0x9b684d));chimney.position.set(w*.22,h+.95,0);g.add(chimney);
 g.userData={key,label,base:h};scene.add(g);objects.push(g);return g;
}
function officeBuilding(key,label,x,z,w,d,h,wall,roof){
 const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMaterial("plaster",wall));body.position.y=h/2;g.add(body);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.35,.35,d+.35),new THREE.MeshStandardMaterial({color:roof,roughness:.9}));roof.position.y=h+.2;g.add(roof);
 const glass=new THREE.MeshStandardMaterial({color:0x789f91,roughness:.28,metalness:.12,emissive:0x314f46,emissiveIntensity:.12});
 for(let yy=1.8;yy<h;yy+=1.9) for(let xx=-w/2+1.2;xx<w/2-.4;xx+=1.55){const win=new THREE.Mesh(new THREE.BoxGeometry(.95,.72,.07),glass);win.position.set(xx,yy,d/2+.05);g.add(win)}
 const sign=new THREE.Mesh(new THREE.BoxGeometry(Math.min(4,w*.55),.62,.08),new THREE.MeshStandardMaterial({color:0xf0e5c5,roughness:.8}));sign.position.set(0,h*.64,d/2+.09);g.add(sign);
 g.userData={key,label,base:h};scene.add(g);objects.push(g);return g;
}

function makeCar(color=0x4f6f5c){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.35,.42,2.35),new THREE.MeshStandardMaterial({color,roughness:.55}));
 body.position.y=.48; g.add(body);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.02,.38,1.05),new THREE.MeshStandardMaterial({color:0x587267,roughness:.25,metalness:.08}));
 cabin.position.set(0,.78,-.08); g.add(cabin);
 const wheelMat=new THREE.MeshStandardMaterial({color:0x252622,roughness:.9});
 for(const x of [-.62,.62]) for(const z of [-.72,.72]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.12,12),wheelMat);w.rotation.z=Math.PI/2;w.position.set(x,.3,z);g.add(w)}
 const lamp=new THREE.MeshStandardMaterial({color:0xf4e8b5,emissive:0xc9b86a,emissiveIntensity:.35});
 for(const x of [-.38,.38]){const l=new THREE.Mesh(new THREE.BoxGeometry(.22,.12,.06),lamp);l.position.set(x,.52,1.19);g.add(l)}
 return g;
}
function addMovingCar(axis, lane, start, speed, color){
 const g=makeCar(color); scene.add(g); movingCars.push({g,axis,lane,start,speed});
}
function makePerson(shirt=0x6b7c63,skin=0xd1a27c){
 const g=new THREE.Group();
 const legs=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.75,7),new THREE.MeshStandardMaterial({color:0x3f463e,roughness:.9}));
 legs.position.set(-.13,.38,0);g.add(legs);
 const leg2=legs.clone();leg2.position.x=.13;g.add(leg2);
 const torso=new THREE.Mesh(new THREE.CylinderGeometry(.25,.29,.7,8),new THREE.MeshStandardMaterial({color:shirt,roughness:.75}));torso.position.y=1.02;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8),new THREE.MeshStandardMaterial({color:skin,roughness:.8}));head.position.y=1.52;g.add(head);
 return g;
}
function addWalker(x,z,dx,dz,speed,color,phase=0){
 const g=makePerson(color);g.position.set(x,.0,z);scene.add(g);walkers.push({g,x,z,dx,dz,speed,phase});
}
function makeFarmer(x,z,flip=1){
 const g=makePerson(0x75834d,0xc49372);
 const hat=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,.10,12),new THREE.MeshStandardMaterial({color:0x8b7046,roughness:1}));
 hat.position.y=1.72;g.add(hat);
 const tool=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.25,7),new THREE.MeshStandardMaterial({color:0x6b4c31,roughness:1}));
 tool.rotation.z=-.55*flip;tool.position.set(.38*flip,1.0,.02);g.add(tool);
 g.position.set(x,0,z);scene.add(g);farmers.push({g,x,z,phase:Math.random()*6.28});
}
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
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(110,110,32,32),new THREE.MeshStandardMaterial({map:canvasTexture("ground",7),roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.65;scene.add(ground);
 const roadMat=new THREE.MeshStandardMaterial({map:canvasTexture("stone",11),roughness:.96});
 const road=(x,z,w,d,rot=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),roadMat);m.rotation.x=-Math.PI/2;m.rotation.z=rot;m.position.set(x,-.60,z);scene.add(m)};
 road(0,0,8,58);road(0,0,58,7);road(-16,-13,7,28,.18);road(16,13,7,28,.18);
 const riverPts=[];for(let i=0;i<=32;i++)riverPts.push(new THREE.Vector3(-30+Math.sin(i*.45)*3.2,-.57,-34+i*2.15));
 const riverCurve=new THREE.CatmullRomCurve3(riverPts);const river=new THREE.Mesh(new THREE.TubeGeometry(riverCurve,64,.72,10,false),new THREE.MeshStandardMaterial({color:0x6fa7a0,roughness:.28,metalness:.02}));scene.add(river);
 const green=new THREE.Mesh(new THREE.BoxGeometry(18,.16,16),new THREE.MeshStandardMaterial({map:canvasTexture("ground",19),roughness:1}));green.position.set(0,-.51,0);scene.add(green);
 // Seven real, distinct civic buildings replace the floating circles.
 officeBuilding("democracy","DEMOKRATIE",-11,-9,8,7,6.5,0xd8d0bb,0x5d664d);
 officeBuilding("health","GESUNDHEIT",0,-12,8.5,7.5,8.5,0xd9d2bf,0x66705b);
 officeBuilding("education","BILDUNG",11,-9,8,7,7.2,0xd7c9ae,0x68735d);
 officeBuilding("economy","WIRTSCHAFT",-12,9,9,7.5,9.2,0xcfc5ad,0x62584a);
 detailedBuilding("food","ERNÄHRUNG",0,9,8,7,5.5,0xd5c69f,0x6f7650);
 detailedBuilding("capital","BÜRGERKAPITAL",12,8,8,7,7.4,0xd7ccb8,0x665c4d);
 detailedBuilding("crisis","KRISENZENTRUM",0,0,10,8,10.5,0xd1c8b4,0x55584b);
 // Homes and farm buildings create depth instead of a ring of anonymous blocks.
 const houseColors=[0xd8cdb5,0xcdbfa4,0xe0d4bd];
 for(let i=0;i<16;i++){const side=i%4, row=Math.floor(i/4),x=-31+side*20+(row%2)*5,z=-25+row*17;detailedBuilding("","",x,z,5,4,3.5+row*.25,houseColors[i%3],0x665844)}
 // Fields with rows, not geometric circles.
 const crop=new THREE.MeshStandardMaterial({color:0x9a9a58,roughness:1});
 for(let f=0;f<6;f++){const x=-25+(f%3)*7,z=19+Math.floor(f/3)*7;for(let r=0;r<7;r++){const row=new THREE.Mesh(new THREE.BoxGeometry(5,.09,.18),crop);row.position.set(x,-.52,z+r*.65);scene.add(row)}}
 // Living traffic, pedestrians and agricultural work.
 addMovingCar("z", -2.0, -28, 5.2, 0x587766);
 addMovingCar("z",  2.0,  20, -4.4, 0x8a6f4f);
 addMovingCar("x", -2.0, -25, 4.0, 0x6f7b58);
 addMovingCar("x",  2.0,  18, -3.6, 0x7a6657);
 for(let i=0;i<12;i++){
   const horizontal=i%2===0, side=(i%3)-1;
   addWalker(horizontal?-24+i*4:side*2.7, horizontal?side*2.7:-24+i*4,
     horizontal?(i%4<2?1:-1):0, horizontal?0:(i%4<2?1:-1), .55+(i%3)*.08,
     [0x66775c,0x806d5b,0x5e746e][i%3], i*.7);
 }
 for(let i=0;i<7;i++) makeFarmer(-25+(i%4)*3.1,20+Math.floor(i/4)*7,(i%2?1:-1));
 addUndergroundFarmEntrance();
 // Tree belts, varied height and canopy shape.
 const trunkMat=new THREE.MeshStandardMaterial({map:canvasTexture("wood",29),roughness:1});
 const leafMats=[0x4f7547,0x638b51,0x78975d].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
 for(let i=0;i<54;i++){const a=i/54*Math.PI*2,r=28+(i%6)*1.7,g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.24,1.6,8),trunkMat);trunk.position.y=.15;g.add(trunk);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.95+(i%3)*.18,2),leafMats[i%3]);crown.position.y=1.3;crown.scale.set(1,1.15,1);g.add(crown);g.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(g)}
 // Small civic square, deliberately irregular rather than circular.
 const square=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-6,-4),new THREE.Vector2(5,-4),new THREE.Vector2(7,1),new THREE.Vector2(4,5),new THREE.Vector2(-5,4),new THREE.Vector2(-7,0),new THREE.Vector2(-6,-4)])),new THREE.MeshStandardMaterial({map:canvasTexture("stone",41),roughness:1}));square.rotation.x=-Math.PI/2;square.position.y=-.39;scene.add(square);
 const treeSmall=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,1.5,8),trunkMat);treeSmall.position.set(0,.35,2);scene.add(treeSmall);const crownSmall=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,2),leafMats[1]);crownSmall.position.set(0,1.5,2);scene.add(crownSmall);
 const pts=[];for(let i=0;i<110;i++)pts.push((Math.random()-.5)*65,1+Math.random()*8,(Math.random()-.5)*65);const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xf1e4ac,size:.07,transparent:true,opacity:.38})));
}
function mat(c,em=0){return new THREE.MeshStandardMaterial({color:c,roughness:.62,metalness:.18,emissive:em?c:0,emissiveIntensity:em?0.22:0})}
function onPointer(e){
 const rect=renderer.domElement.getBoundingClientRect(); mouse.x=(e.clientX-rect.left)/rect.width*2-1; mouse.y=-(e.clientY-rect.top)/rect.height*2+1;
 raycaster.setFromCamera(mouse,camera); const hit=raycaster.intersectObjects(objects,true)[0]; if(!hit)return;
 let o=hit.object; while(o.parent && !o.userData.key)o=o.parent; showInfo(o.userData.key); focus(o);
}
function focus(o){const p=o.position.clone();controls.target.lerp(p,.35);camera.position.lerp(new THREE.Vector3(p.x+17,p.y+15,p.z+17),.35)}
function showInfo(key){const d=blocks[key]; if(!d)return; document.querySelector("#panelContent").innerHTML=`<span class="tag">${d.tag}</span><h2>${d.title}</h2><p>${d.text}</p><div class="proscons"><div><h4>Mögliche Stärken</h4><ul>${d.pros.map(x=>`<li>${x}</li>`).join("")}</ul></div><div><h4>Offene Fragen</h4><ul>${d.cons.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>`;document.querySelector("#infoPanel").classList.add("open")}
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
   p.g.rotation.y=Math.atan2(p.dx,p.dz); p.g.position.y=Math.abs(Math.sin(t*4+p.phase))*.025;
 });
 farmers.forEach((f,i)=>{f.g.rotation.y=Math.sin(t*.45+f.phase)*.18;f.g.position.y=Math.abs(Math.sin(t*2.0+f.phase))*.018;});
 undergroundDoors.forEach(u=>{u.light.intensity=1.8+Math.sin(t*1.7)*.35;});
 renderer.render(scene,camera);
}
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
