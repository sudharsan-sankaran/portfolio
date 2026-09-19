"use client";
import {useEffect,useRef,type RefObject} from "react";

export function useAtelierJournalMotion(root:RefObject<HTMLDivElement|null>,enabled:boolean,paused:boolean,reduced:boolean,projectKey:string){
 const pause=useRef(paused),sync=useRef<((paused:boolean)=>void)|null>(null);
 useEffect(()=>{pause.current=paused;sync.current?.(paused);},[paused]);
 useEffect(()=>{
  if(!enabled||reduced||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const el=root.current;if(!el)return;
  let cancelled=false,cleanup:(()=>void)|undefined;
  void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([{gsap},{ScrollTrigger}])=>{
   if(cancelled)return;
   gsap.registerPlugin(ScrollTrigger);
   const controls:{animation:gsap.core.Tween;trigger:ReturnType<typeof ScrollTrigger.create>}[]=[];
   const mm=gsap.matchMedia();
   const context=gsap.context(()=>{
    mm.add("(min-width: 700px)",()=>{
     el.querySelectorAll<HTMLElement>("[data-atelier-art]").forEach((card,i)=>{
      const artwork=card.querySelector("svg");if(!artwork)return;
      const animation=gsap.fromTo(artwork,{yPercent:-7,scale:1.08,rotation:i%2?-2:2},{yPercent:7,scale:1.02,rotation:0,duration:1,ease:"none",paused:true});
      const trigger=ScrollTrigger.create({trigger:card,start:"top bottom",end:"bottom top",onUpdate:self=>{if(!pause.current)gsap.to(animation,{progress:self.progress,duration:.65,ease:"power2.out",overwrite:true});}});
      controls.push({animation,trigger});
     });
     return()=>{controls.forEach(c=>gsap.killTweensOf(c.animation));controls.length=0;};
    });
   },el);
   sync.current=value=>controls.forEach(({animation,trigger})=>{gsap.killTweensOf(animation);if(!value)gsap.to(animation,{progress:trigger.progress,duration:.65});});
   ScrollTrigger.refresh();
   cleanup=()=>{sync.current=null;controls.forEach(c=>gsap.killTweensOf(c.animation));mm.revert();context.revert();};
  }).catch(()=>{});
  return()=>{cancelled=true;cleanup?.();};
 },[root,enabled,reduced,projectKey]);
}
