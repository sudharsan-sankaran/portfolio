"use client";
import { useEffect, useRef, type RefObject } from "react";
import type { BufferGeometry } from "three";
import type { DirectionSlug } from "./config";

export function DirectionScene({mode,paused,progress}:{mode:DirectionSlug;paused:boolean;progress:RefObject<number>}) {
 const host=useRef<HTMLDivElement>(null), pause=useRef(paused),wake=useRef<(()=>void)|null>(null);
 useEffect(()=>{pause.current=paused;wake.current?.();},[paused]);
 useEffect(()=>{
  const mount=host.current;if(!mount)return;
  const media=matchMedia("(prefers-reduced-motion: reduce)");
  if(media.matches)return;
  let cancelled=false,dispose:(()=>void)|undefined;
  void Promise.all([import("three"),import("three/addons/environments/RoomEnvironment.js")]).then(([T,{RoomEnvironment}])=>{
   if(cancelled)return;
   let renderer:InstanceType<typeof T.WebGLRenderer>;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}catch{return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;
   mount.appendChild(renderer.domElement);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(mode==="horizon"?58:38,1,.1,90);camera.position.z=9;
   const envScene=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(envScene,.05);scene.environment=env.texture;
   const group=new T.Group();scene.add(group);
   const colors={orbit:0xbda4ff,form:0x3158ff,atelier:0xd1bfaa,prism:0xffb4d3,terminal:0x95ffd2,horizon:0xc78d59};
   const metal=new T.MeshPhysicalMaterial({color:colors[mode],metalness:mode==="atelier"?.25:.88,roughness:.17,clearcoat:1});
   const meshes:InstanceType<typeof T.Object3D>[]=[];
   const make=(geo:BufferGeometry,mat:InstanceType<typeof T.Material>=metal)=>{const m=new T.Mesh(geo,mat);group.add(m);meshes.push(m);return m;};
   if(mode==="orbit"){
    const globe=make(new T.SphereGeometry(1.25,40,32));globe.scale.setScalar(.32);globe.position.set(-2.5,1.7,-1);
    [2.05,2.65,3.15].forEach((r,i)=>{const m=make(new T.TorusGeometry(r,.025+i*.007,8,120));m.rotation.set(.7+i*.5,.2+i*.35,.4);});
    const positions=new Float32Array(360*3);for(let i=0;i<360;i++){const a=i*2.399963,rad=3.3+(i%13)*.12;positions[i*3]=Math.cos(a)*rad;positions[i*3+1]=Math.sin(a)*rad;positions[i*3+2]=Math.sin(i*1.7)*2;}
    const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(positions,3));group.add(new T.Points(g,new T.PointsMaterial({color:0xc7c5ff,size:.024,transparent:true,opacity:.65})));
   }else if(mode==="form"){
    const m=make(new T.IcosahedronGeometry(1.85,0));m.rotation.set(.3,.4,.2);
    const wire=new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0xdfff64}));wire.scale.setScalar(1.15);group.add(wire);meshes.push(wire);
    const ring=make(new T.TorusGeometry(2.6,.13,12,90));ring.rotation.x=1.2;
   }else if(mode==="atelier"){
    // A light kinetic mobile: brushed brass arcs and small pearl counterweights.
    const brass=new T.MeshPhysicalMaterial({color:0xb28a52,metalness:.78,roughness:.3,clearcoat:.45});
    const pearl=new T.MeshPhysicalMaterial({color:0xf4e9d3,metalness:.15,roughness:.22,clearcoat:.8});
    [2.15,2.48,2.8].forEach((r,i)=>{
     const ring=make(new T.TorusGeometry(r,.022+i*.009,10,144,Math.PI*(1.63+i*.12)),brass);
     ring.rotation.set(.3+i*.3,-.45+i*.28,-.7+i*.65);ring.scale.set(1,.86+i*.07,1);
    });
    const pearlNode=make(new T.SphereGeometry(.14,24,18),pearl);pearlNode.position.set(-1.95,-1.1,.65);
    const goldNode=make(new T.SphereGeometry(.08,20,16),brass);goldNode.position.set(2.25,.85,-.3);
   }else if(mode==="prism"){
    const geo=new T.OctahedronGeometry(1.3,0);
    for(let i=0;i<5;i++){const mat=new T.MeshPhysicalMaterial({color:[0xecff99,0xffb0ca,0xa4beff,0xfff0a0,0xb8ffee][i],metalness:.65,roughness:.09,iridescence:1,iridescenceIOR:1.4,clearcoat:1});const m=make(geo,mat);m.position.set(Math.cos(i*1.256)*2.15,Math.sin(i*1.256)*2.15,Math.sin(i)*.8);m.scale.set(.7,1.2,.55);}
   }else if(mode==="terminal"){
    const line=new T.LineBasicMaterial({color:0x89e6c2,transparent:true,opacity:.5});
    [2.0,3.3,4.6].forEach((r,i)=>{const cube=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(r,r,r)),line);cube.rotation.set(i*.16,i*.2,0);group.add(cube);meshes.push(cube);});
    const g=new T.SphereGeometry(.065,8,6),m=new T.MeshBasicMaterial({color:0xa0ffd8});
    for(let i=0;i<24;i++){const node=make(g,m);node.position.set(Math.sin(i*2.7)*2,Math.cos(i*1.8)*2,Math.sin(i*1.5)*2);}
   }else{
    const beam=new T.MeshStandardMaterial({color:0x6d5748,metalness:.6,roughness:.4});
    const edge=new T.MeshBasicMaterial({color:0xf1b981});
    for(let i=0;i<9;i++){
     const portal=new T.Group();portal.position.z=-i*4;
     for(const side of [-1,1]){
      const upright=new T.Mesh(new T.BoxGeometry(.13,6,.22),beam);upright.position.set(side*3.2,0,0);portal.add(upright);
      const horizontal=new T.Mesh(new T.BoxGeometry(6.4,.12,.22),beam);horizontal.position.set(0,side*3,0);portal.add(horizontal);
      const strip=new T.Mesh(new T.BoxGeometry(.016,5.9,.24),edge);strip.position.set(side*3.11,0,0);portal.add(strip);
     }
     group.add(portal);
    }
    group.rotation.z=-.08;camera.position.z=10;
   }
   scene.add(new T.HemisphereLight(0xffffff,0x272c45,2));const key=new T.DirectionalLight(0xffffff,3);key.position.set(4,5,6);scene.add(key);
   const fill=new T.PointLight(colors[mode],60,30);fill.position.set(-4,1,5);scene.add(fill);
   let raf=0,last=0,drawn=0,time=0,inView=true,stopped=false;const pointer={x:0,y:0},smooth={x:0,y:0};
   const pointerMove=(e:PointerEvent)=>{if(e.pointerType!=="mouse")return;pointer.x=(e.clientX/window.innerWidth-.5)*2;pointer.y=(e.clientY/window.innerHeight-.5)*2;};
   const start=()=>{if(!raf&&inView&&!document.hidden&&!stopped)raf=requestAnimationFrame(draw);};
   function draw(now:number){
    raf=0;if(!inView||document.hidden||stopped)return;
    if(!pause.current&&drawn&&now-drawn<32){start();return;}
    const dt=last?Math.min((now-last)/1000,.08):0;last=now;drawn=now;
    if(!pause.current){time+=dt;smooth.x+=(pointer.x-smooth.x)*.06;smooth.y+=(pointer.y-smooth.y)*.06;}
    const p=progress.current;
    if(mode==="horizon") {camera.position.set(smooth.x*.4,smooth.y*.25,10-p*9);group.rotation.z=-.08+p*.12;}
    else {
     group.rotation.y=time*.12+smooth.x*.12+p*.7;group.rotation.x=Math.sin(time*.15)*.13+smooth.y*.07;
     group.rotation.z=mode==="prism"?time*.1+p*.4:mode==="form"?-.2+p*.3:0;
     camera.position.set(smooth.x*.15,0,9-p*1.5);
     if(mode==="atelier"){
      group.rotation.y=Math.sin(time*.16)*.22+smooth.x*.1+p*.25;
      group.rotation.x=.12+Math.sin(time*.12)*.08+smooth.y*.05;
      group.rotation.z=-.12+Math.sin(time*.1)*.1;
      meshes.slice(0,3).forEach((ring,i)=>{ring.rotation.z=-.7+i*.65+Math.sin(time*.16+i)*.14;});
     }
     if(mode==="orbit")meshes.slice(1).forEach((m,i)=>{m.rotation.z=time*.08*(i%2?1:-1)+i*.8;});
     if(mode==="prism")meshes.forEach((m,i)=>{m.rotation.y=time*.23+i;m.rotation.x=time*.1;});
    }
    camera.lookAt(0,0,mode==="horizon"?-12:0);renderer.render(scene,camera);
    if(!pause.current)start();
   }
   const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);if(mode!=="horizon")group.scale.setScalar(Math.min(1,w/h));start();};
   const ro=new ResizeObserver(resize);ro.observe(mount);
   const io=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){last=0;start();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:"100px"});io.observe(mount);
   const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;start();}};
   const preference=()=>{stopped=media.matches;mount.style.opacity=stopped?"0":"1";if(stopped){cancelAnimationFrame(raf);raf=0;}else start();};
   const lost=(e:Event)=>{e.preventDefault();stopped=true;cancelAnimationFrame(raf);raf=0;mount.style.opacity="0";};
   wake.current=()=>{last=0;start();};document.addEventListener("pointermove",pointerMove,{passive:true});document.addEventListener("visibilitychange",visibility);media.addEventListener("change",preference);renderer.domElement.addEventListener("webglcontextlost",lost);resize();start();
   dispose=()=>{cancelAnimationFrame(raf);wake.current=null;ro.disconnect();io.disconnect();document.removeEventListener("pointermove",pointerMove);document.removeEventListener("visibilitychange",visibility);media.removeEventListener("change",preference);renderer.domElement.removeEventListener("webglcontextlost",lost);const geometries=new Set<BufferGeometry>(),materials=new Set<InstanceType<typeof T.Material>>();scene.traverse(o=>{const a=o as InstanceType<typeof T.Mesh>;if(a.geometry)geometries.add(a.geometry);if(a.material){if(Array.isArray(a.material))a.material.forEach(m=>materials.add(m));else materials.add(a.material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());metal.dispose();env.dispose();envScene.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
  }).catch(()=>{});
  return()=>{cancelled=true;dispose?.();};
 },[mode,progress]);
 return <div ref={host} data-scene-canvas aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none"}}/>;
}
