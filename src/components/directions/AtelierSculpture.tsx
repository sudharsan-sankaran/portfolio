"use client";
import {useEffect,useRef,useState} from "react";
import type {BufferGeometry} from "three";
import {ProjectArt} from "../ProjectArt";
import s from "./directions.module.css";

/** Original conceptual objects, never a representation of measured project output. */
export function AtelierSculpture({kind="abstract",paused}:{kind?:string;paused:boolean}){
 const host=useRef<HTMLDivElement>(null),pause=useRef(paused),wake=useRef<(()=>void)|null>(null);
 const [near,setNear]=useState(false);
 // Keep the GPU cost bounded when the catalogue grows: distant covers use fallback art.
 useEffect(()=>{const mount=host.current;if(!mount)return;const observer=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:"250px"});observer.observe(mount);return()=>observer.disconnect();},[]);
 useEffect(()=>{pause.current=paused;wake.current?.();},[paused]);
 useEffect(()=>{
  const mount=host.current;if(!mount||!near)return;
  let cancelled=false,cleanup:(()=>void)|undefined;
  void Promise.all([import("three"),import("three/addons/environments/RoomEnvironment.js")]).then(([T,{RoomEnvironment}])=>{
   if(cancelled)return;
   let renderer:InstanceType<typeof T.WebGLRenderer>;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}catch{return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;
   mount.appendChild(renderer.domElement);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,60),group=new T.Group();scene.add(group);
   const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.05);scene.environment=env.texture;
   const gold=new T.MeshPhysicalMaterial({color:0xb18a54,metalness:.85,roughness:.25,clearcoat:1});
   const green=new T.MeshPhysicalMaterial({color:0x294c3d,metalness:.4,roughness:.23,clearcoat:1});
   const cream=new T.MeshPhysicalMaterial({color:0xeee5d1,metalness:.18,roughness:.28});
   const wire=new T.LineBasicMaterial({color:0x76694e,transparent:true,opacity:.48});
   const moving:InstanceType<typeof T.Object3D>[]=[];
   const mesh=(geo:BufferGeometry,mat=gold,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m;};
   if(kind==="network"){
    const points:InstanceType<typeof T.Vector3>[]=[];
    for(let i=0;i<44;i++){const y=1-i/21.5,r=Math.sqrt(1-y*y),a=i*2.399963;points.push(new T.Vector3(Math.cos(a)*r*2,y*2,Math.sin(a)*r*2));}
    points.forEach((p,i)=>{mesh(new T.SphereGeometry(i%7===0?.19:.065,16,12),i%7===0?gold:green,p.x,p.y,p.z);[1,8].forEach(d=>{const q=points[(i+d)%points.length];group.add(new T.Line(new T.BufferGeometry().setFromPoints([p,q]),wire));});});
    mesh(new T.IcosahedronGeometry(.7,1),green);const ring=mesh(new T.TorusGeometry(2.45,.018,6,100),gold);ring.rotation.x=1.1;ring.rotation.y=.3;
   }else if(kind==="grid"){
    const walls=[7,12,17],path=[20,15,10,5,0,1,2,3,4,9,14,19,24];
    for(let i=0;i<25;i++){const x=(i%5-2)*.75,z=(Math.floor(i/5)-2)*.75,h=walls.includes(i)?.8:.12;mesh(new T.BoxGeometry(.66,h,.66),walls.includes(i)?green:path.includes(i)?gold:cream,x,h/2-.5,z);}
    const agent=mesh(new T.SphereGeometry(.18,24,16),green,-1.5,.07,1.5);moving.push(agent);
    [5,24].forEach(i=>{const ring=mesh(new T.TorusGeometry(.22,.032,10,40),gold,(i%5-2)*.75,.2,(Math.floor(i/5)-2)*.75);ring.rotation.x=-Math.PI/2;});
    group.rotation.x=.42;group.rotation.y=.55;
   }else if(kind==="analytics"){
    // Fixed decorative forms; their heights do not encode project measurements.
    [.8,1.5,1.1,2,1.7].forEach((height,i)=>mesh(new T.BoxGeometry(.48,height,.8),i%2?gold:green,(i-2)*.65,height/2-.8,0));
    mesh(new T.BoxGeometry(3.6,.12,1.45),cream,0,-.9,0);group.rotation.y=-.38;
   }else if(kind==="deployment"){

    for(let i=0;i<3;i++){const plate=mesh(new T.BoxGeometry(2.7,.2,1.8),i===1?gold:green,0,(i-1)*1.1,0);moving.push(plate);const edges=new T.LineSegments(new T.EdgesGeometry(plate.geometry),new T.LineBasicMaterial({color:0xe0c995,transparent:true,opacity:.7}));plate.add(edges);for(let j=0;j<4;j++)mesh(new T.BoxGeometry(.28,.09,.28),cream,(j-1.5)*.47,(i-1)*1.1+.16,.1);}
    for(const x of [-1.1,1.1])group.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(x,-1.4,.65),new T.Vector3(x,1.5,.65)]),wire));
    group.rotation.x=.4;group.rotation.y=-.45;
   }else{mesh(new T.TorusKnotGeometry(1.2,.3,100,16),gold);}
   scene.add(new T.HemisphereLight(0xffffff,0x6e6554,2));const light=new T.DirectionalLight(0xfff4df,4);light.position.set(4,6,5);scene.add(light);
   camera.position.set(0,kind==="grid"?3.3:1.7,9);camera.lookAt(0,0,0);
   let raf=0,last=0,time=0,inView=false,dead=false;const pointer={x:0,y:0};
   const baseX=group.rotation.x,baseY=group.rotation.y;
   const start=()=>{if(!raf&&inView&&!document.hidden&&!dead)raf=requestAnimationFrame(draw);};
   function draw(now:number){raf=0;if(!inView||document.hidden||dead)return;if(!pause.current&&last&&now-last<33){start();return;}const dt=last?Math.min((now-last)/1000,.06):0;last=now;
    if(!pause.current){time+=dt;group.rotation.y=baseY+Math.sin(time*.27)*.24+pointer.x*.18;group.rotation.x=baseX+Math.sin(time*.21)*.06+pointer.y*.06;group.position.y=Math.sin(time*.65)*.075;}
    renderer.render(scene,camera);if(mount)mount.dataset.ready="true";if(!pause.current)start();
   }
   const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);group.scale.setScalar(Math.min(1,w/h*1.15));start();};
   const ro=new ResizeObserver(resize);ro.observe(mount);
   const io=new IntersectionObserver(([e])=>{inView=e.isIntersecting;if(inView){last=0;start();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:"120px"});io.observe(mount);
   const move=(e:PointerEvent)=>{if(pause.current||e.pointerType!=="mouse")return;const b=mount.getBoundingClientRect();pointer.x=(e.clientX-b.left)/b.width-.5;pointer.y=(e.clientY-b.top)/b.height-.5;};
   const visibility=()=>{cancelAnimationFrame(raf);raf=0;last=0;start();};
   const lost=(e:Event)=>{e.preventDefault();dead=true;cancelAnimationFrame(raf);delete mount.dataset.ready;};
   mount.parentElement?.addEventListener("pointermove",move);document.addEventListener("visibilitychange",visibility);renderer.domElement.addEventListener("webglcontextlost",lost);wake.current=()=>{last=0;start();};resize();
   cleanup=()=>{dead=true;cancelAnimationFrame(raf);wake.current=null;ro.disconnect();io.disconnect();mount.parentElement?.removeEventListener("pointermove",move);document.removeEventListener("visibilitychange",visibility);renderer.domElement.removeEventListener("webglcontextlost",lost);const geos=new Set<InstanceType<typeof T.BufferGeometry>>(),mats=new Set<InstanceType<typeof T.Material>>([gold,green,cream,wire]);scene.traverse(o=>{const m=o as InstanceType<typeof T.Mesh>;if(m.geometry)geos.add(m.geometry);if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(v=>mats.add(v));});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();delete mount.dataset.ready;};
  }).catch(()=>{});
  return()=>{cancelled=true;cleanup?.();};
 },[kind,near]);
 return <div className={s.sculpture} aria-hidden="true"><div ref={host} className={s.sculptureCanvas}/><div className={s.sculptureFallback}><ProjectArt kind={kind}/></div><span className={s.sculptureCaption}>{kind==="network"?"Connections / patterns":kind==="grid"?"Actions / consequences":kind==="deployment"?"Layers / systems":kind==="analytics"?"Comparisons / questions":"Ideas / exploration"}</span><span className={s.artNote}>Concept illustration · interactive 3D</span></div>;
}
