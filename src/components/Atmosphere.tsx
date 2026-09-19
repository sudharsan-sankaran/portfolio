"use client";

import { useEffect, useRef, useState } from "react";

const vertexShader = `
uniform float uTime;
uniform float uMorph;
uniform float uScale;
uniform float uPixelRatio;
uniform float uShift;
uniform float uDrop;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;
const float PI=3.14159265359;
void main(){
  float a=position.x, b=position.y, s=position.z;
  float ripple=sin(a*9.0+uTime*.35+b)*.075+sin(a*17.0-uTime*.2+b*2.0)*.04;
  float radius=2.45+cos(b)*(.10+s*.15)+ripple;
  vec3 ring=vec3(cos(a)*radius,sin(a)*radius,sin(b)*.24+sin(a*4.0+uTime*.2)*.13);
  float turn=a*2.6+uTime*.1;
  vec3 helix=vec3(cos(turn)*(1.05+s*.48), (a/PI-1.0)*3.0, sin(turn)*(1.05+s*.48));
  helix.x += sin(b)*.10;
  vec3 wave=vec3((a/PI-1.0)*5.4, sin(a*1.6+uTime*.2)*.45+sin(b*1.7+a+uTime*.16)*.3-1.2, (b/PI-1.0)*2.2);
  float lat=acos(2.0*s-1.0);
  vec3 orb=vec3(sin(lat)*cos(a),cos(lat),sin(lat)*sin(a))*(2.0+.08*sin(b+uTime*.4));
  vec3 p=mix(ring,helix,smoothstep(0.0,1.0,uMorph));
  p=mix(p,wave,smoothstep(1.0,2.0,uMorph));
  p=mix(p,orb,smoothstep(2.0,3.0,uMorph));
  p*=uScale;
  p.x+=uShift;
  p.y+=uDrop;
  float cyanToViolet=(sin(a+.6)+1.0)*.5;
  vColor=mix(vec3(.05,.58,1.0),vec3(.53,.18,1.0),cyanToViolet);
  vColor=mix(vColor,vec3(1.0,.25,.53),pow(max(sin(a-1.0),0.0),4.0)*.8);
  vColor=mix(vColor,vec3(.7,.9,1.0),step(.92,aSeed)*.65);
  vAlpha=.35+aSeed*.65;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=clamp((2.0+aSeed*3.0)*uPixelRatio*(6.0/-mv.z),1.0,16.0);
  gl_Position=projectionMatrix*mv;
}`;

const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-.5)*2.0;
  if(d>1.0) discard;
  float alpha=pow(1.0-d,1.7)*vAlpha;
  gl_FragColor=vec4(vColor*1.8,alpha);
}`;

export function Atmosphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const wakeRef = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(!media.matches && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => { pausedRef.current = paused; wakeRef.current?.(); document.documentElement.dataset.motion = paused ? "paused" : "active"; return () => { delete document.documentElement.dataset.motion; }; }, [paused]);
  useEffect(() => {
    if (!enabled || !mountRef.current) return;
    const mount = mountRef.current;
    let cancelled = false, cleanup: (() => void) | undefined;
    void import("three").then(async THREE => {
      const [{EffectComposer},{RenderPass},{UnrealBloomPass}]=await Promise.all([import("three/addons/postprocessing/EffectComposer.js"),import("three/addons/postprocessing/RenderPass.js"),import("three/addons/postprocessing/UnrealBloomPass.js")]);
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias:false, alpha:true, powerPreference:"low-power" }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setClearColor(0x050610,0); mount.appendChild(renderer.domElement);
      const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(42,1,.1,60); camera.position.z=9;
      const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),1.1,.45,.3);composer.addPass(bloom);
      const count=innerWidth<700?5500:12000;
      const parameters=new Float32Array(count*3), seeds=new Float32Array(count);
      let seed=747; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      for(let i=0;i<count;i++){parameters[i*3]=random()*Math.PI*2;parameters[i*3+1]=random()*Math.PI*2;parameters[i*3+2]=random();seeds[i]=random();}
      const geometry=new THREE.BufferGeometry(); geometry.setAttribute("position",new THREE.BufferAttribute(parameters,3));geometry.setAttribute("aSeed",new THREE.BufferAttribute(seeds,1));
      const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{uTime:{value:0},uMorph:{value:0},uScale:{value:1},uPixelRatio:{value:renderer.getPixelRatio()},uShift:{value:1.65},uDrop:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
      const particles=new THREE.Points(geometry,material); particles.frustumCulled=false; scene.add(particles);
      const filamentMaterial=new THREE.ShaderMaterial({vertexShader,fragmentShader:"varying vec3 vColor; void main(){gl_FragColor=vec4(vColor*2.0,.5);}",uniforms:material.uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
      const filamentGeometries:InstanceType<typeof THREE.BufferGeometry>[]=[];
      const filaments=new THREE.Group();scene.add(filaments);
      for(let strand=0;strand<15;strand++){
        const p=new Float32Array(641*3),s=new Float32Array(641);
        for(let j=0;j<=640;j++){p[j*3]=j/640*Math.PI*2;p[j*3+1]=strand/15*Math.PI*2;p[j*3+2]=(strand+.5)/15;s[j]=.8;}
        const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(p,3));g.setAttribute("aSeed",new THREE.BufferAttribute(s,1));filamentGeometries.push(g);const line=new THREE.Line(g,filamentMaterial);line.frustumCulled=false;filaments.add(line);
      }
      const starGeometry=new THREE.BufferGeometry(), starPositions=new Float32Array(240*3);
      for(let i=0;i<240;i++){starPositions[i*3]=(random()-.5)*28;starPositions[i*3+1]=(random()-.5)*19;starPositions[i*3+2]=-random()*16-2;}
      starGeometry.setAttribute("position",new THREE.BufferAttribute(starPositions,3));
      const starMaterial=new THREE.PointsMaterial({size:.022,color:0x7795d1,transparent:true,opacity:.48,depthWrite:false});const stars=new THREE.Points(starGeometry,starMaterial);scene.add(stars);
      let frame=0, time=0, last=0, lastDraw=0, target=0, morph=0, px=0, py=0, cx=0, cy=0, mobile=false;
      const sections=["about","experience","work"].map(id=>document.getElementById(id));
      const scroll=()=>{
        // Section positions, rather than project count or names, drive the background.
        const about=sections[0]?.getBoundingClientRect().top??Infinity;
        const experience=sections[1]?.getBoundingClientRect().top??Infinity;
        const work=sections[2]?.getBoundingClientRect().top??Infinity;
        const phase=(top:number)=>Math.max(0,Math.min(1,(innerHeight*.72-top)/(innerHeight*.8)));
        target=phase(about)+phase(experience)+phase(work);start();
      };
      const draw=(now:number)=>{
        frame=0;if(document.hidden)return;
        if(!pausedRef.current&&lastDraw&&now-lastDraw<30){start();return;}
        const delta=last?Math.min((now-last)/1000,.07):0;last=now;lastDraw=now;
        if(!pausedRef.current){time+=delta;morph+=(target-morph)*.09;cx+=(px-cx)*.06;cy+=(py-cy)*.06;}
        material.uniforms.uTime.value=time;material.uniforms.uMorph.value=morph;material.uniforms.uShift.value=(1-Math.min(morph,1))*(mobile?0:1.85);
        material.uniforms.uDrop.value=(1-Math.min(morph,1))*(mobile?-2.7:0);
        mount.style.opacity=String((mobile?.78:1)*(1-.66*Math.min(morph,1)));
        particles.rotation.y=cx*.13;particles.rotation.x=cy*.07;filaments.rotation.copy(particles.rotation);stars.rotation.y=cx*.015;
        camera.position.x=cx*.18;camera.position.y=-cy*.12;camera.lookAt(0,0,0);
        composer.render();if(!pausedRef.current)start();
      };
      function start(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
      wakeRef.current=()=>{last=0;start();};
      const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;mobile=w<700;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.fov=mobile?53:42;camera.updateProjectionMatrix();material.uniforms.uScale.value=mobile?.66:1;scroll();};
      const move=(event:PointerEvent)=>{if(event.pointerType!=="mouse")return;px=event.clientX/innerWidth*2-1;py=event.clientY/innerHeight*2-1;};
      const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else start();};
      const lost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;setReady(false);};
      const observer=new ResizeObserver(resize);observer.observe(mount);window.addEventListener("scroll",scroll,{passive:true});window.addEventListener("pointermove",move,{passive:true});document.addEventListener("visibilitychange",visibility);renderer.domElement.addEventListener("webglcontextlost",lost);
      resize();setReady(true);
      cleanup=()=>{cancelAnimationFrame(frame);wakeRef.current=null;observer.disconnect();window.removeEventListener("scroll",scroll);window.removeEventListener("pointermove",move);document.removeEventListener("visibilitychange",visibility);renderer.domElement.removeEventListener("webglcontextlost",lost);geometry.dispose();material.dispose();filamentGeometries.forEach(g=>g.dispose());filamentMaterial.dispose();starGeometry.dispose();starMaterial.dispose();bloom.dispose();composer.dispose();renderer.dispose();renderer.domElement.remove();};
    }).catch(()=>setReady(false));
    return()=>{cancelled=true;cleanup?.();setReady(false);};
  },[enabled]);
  return <><div className={`atmosphere ${ready?"is-ready":""}`} aria-hidden="true"><div className="cosmic-fallback"/><div ref={mountRef} className="particle-canvas"/></div>{ready&&<button className="motion-toggle" type="button" onClick={()=>setPaused(p=>!p)} aria-pressed={paused}>{paused?"Resume motion":"Pause motion"}<span aria-hidden="true">{paused?"▷":"Ⅱ"}</span></button>}</>;
}
