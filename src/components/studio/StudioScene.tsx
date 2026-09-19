"use client";

import { useEffect, useRef, type RefObject } from "react";

// These are actual foreground meshes. The portrait behind them is an edited still.
export function StudioScene({ paused, angle, progress }: { paused: boolean; angle: number; progress: RefObject<number> }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const state = useRef({ paused, angle });
  const wake = useRef<(() => void) | null>(null);
  useEffect(() => { state.current = { paused, angle }; wake.current?.(); }, [paused, angle]);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || (navigator as Navigator & {connection?: {saveData?: boolean}}).connection?.saveData) return;
    let cancelled = false, cleanup: (() => void) | undefined;
    void Promise.all([import("three"), import("three/addons/environments/RoomEnvironment.js")]).then(([T, { RoomEnvironment }]) => {
      if (cancelled) return;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      mount.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(37, 1, .1, 50); camera.position.z = 9;
      const environment = new RoomEnvironment();
      const pmrem = new T.PMREMGenerator(renderer);
      const env = pmrem.fromScene(environment, .04); scene.environment = env.texture;
      const material = new T.MeshPhysicalMaterial({ color: 0x728a9a, metalness: .97, roughness: .13, clearcoat: 1, side: T.DoubleSide });
      // A bevel-like folded ribbon catches the environment across its curved surface.
      const vertices: number[] = [], indices: number[] = [];
      const segments = 36;
      for (let i = 0; i <= segments; i++) {
        const v = i / segments, twist = v * 2.8 - 1.4;
        const width = .05 + Math.sin(Math.PI * v) * .27;
        for (const side of [-1, 1]) {
          vertices.push(Math.sin(v * Math.PI) * .3 + Math.cos(twist) * width * side,
            (v - .5) * 3.2, Math.sin(twist) * width * side + Math.sin(v * Math.PI * 2) * .18);
        }
        if (i < segments) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const geometry = new T.BufferGeometry();
      geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices); geometry.computeVertexNormals();
      const group = new T.Group(); scene.add(group);
      const locations = [[-4.2,-1.6,2,.8,-.65],[4.0,2.3,.6,.9,.55],[4.5,-1.8,2.3,1.1,-.75],[2.6,-2.7,.7,.48,.4],[-3.4,2.7,-1,.65,.65]];
      const meshes = locations.map(([x,y,z,scale,rotation]) => {
        const mesh = new T.Mesh(geometry, material); mesh.position.set(x,y,z); mesh.scale.setScalar(scale); mesh.rotation.set(.2,.4,rotation); group.add(mesh); return mesh;
      });
      scene.add(new T.AmbientLight(0xcde1ff, 1.2));
      const light = new T.PointLight(0xc8e7ff, 80, 30); light.position.set(-3,3,5); scene.add(light);
      const warm = new T.PointLight(0xe5ae76, 25, 30); warm.position.set(4,-2,4); scene.add(warm);
      let frame=0, last=0, previousDraw=0, time=0, inView=true, stopped=false;
      const draw = (now:number) => {
        frame=0; if (!inView || document.hidden || stopped) return;
        if (!state.current.paused && previousDraw && now-previousDraw<32) { start(); return; }
        const dt=last ? Math.min((now-last)/1000,.08) : 0; last=now; previousDraw=now;
        if (!state.current.paused) time+=dt;
        const angle=state.current.angle/100;
        const travel = progress.current;
        group.rotation.y=angle*.20 + travel*.24;
        group.position.z = travel*1.2;
        light.position.x=-2+angle*7;
        meshes.forEach((mesh,index)=>{
          mesh.rotation.y=.4+Math.sin(time*.28+index)*.32+angle*.28+travel*(index%2 ? 1 : -1);
          mesh.position.y=locations[index][1]+Math.sin(time*.3+index)*.12+travel*(index%2 ? .7 : -.5);
        });
        camera.position.set(angle*.2+travel*.75, travel*.25, 9-travel*1.4);
        camera.lookAt(travel*.5,0,0); renderer.render(scene,camera);
        if (!state.current.paused) start();
      };
      function start(){ if (!frame && inView && !document.hidden && !stopped) frame=requestAnimationFrame(draw); }
      wake.current=()=>{last=0;start();};
      const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);group.scale.set(Math.min(1,(w/h)/1.6),w<700?.8:1,1);start();};
      const ro=new ResizeObserver(resize);ro.observe(mount);
      const io=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){last=0;start();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:"100px"});io.observe(mount);
      const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=0;start();}};
      const preference=()=>{stopped=reduced.matches;if(stopped){cancelAnimationFrame(frame);frame=0;renderer.domElement.style.display="none";}else{renderer.domElement.style.display="";start();}};
      const lost=(event:Event)=>{event.preventDefault();stopped=true;cancelAnimationFrame(frame);frame=0;renderer.domElement.style.display="none";};
      document.addEventListener("visibilitychange",visibility);reduced.addEventListener("change",preference);renderer.domElement.addEventListener("webglcontextlost",lost);
      resize();start();
      cleanup=()=>{cancelAnimationFrame(frame);wake.current=null;ro.disconnect();io.disconnect();document.removeEventListener("visibilitychange",visibility);reduced.removeEventListener("change",preference);renderer.domElement.removeEventListener("webglcontextlost",lost);geometry.dispose();material.dispose();env.dispose();environment.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
    }).catch(()=>{});
    return()=>{cancelled=true;cleanup?.();};
  },[progress]);
  return <div ref={mountRef} aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:3}}/>;
}
