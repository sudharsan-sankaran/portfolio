"use client";
import {useEffect,useRef,type RefObject} from "react";
import type {DirectionSlug} from "./config";
export function useDirectionMotion(root:RefObject<HTMLDivElement|null>,progress:RefObject<number>,mode:DirectionSlug,paused:boolean,reduced:boolean){
 const pause=useRef(paused),control=useRef<((value:boolean)=>void)|null>(null);
 useEffect(()=>{pause.current=paused;control.current?.(paused);},[paused]);
 useEffect(()=>{
  const el=root.current;if(!el||reduced||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let cancelled=false,clean:(()=>void)|undefined;
  void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([{gsap},{ScrollTrigger}])=>{
   if(cancelled)return;gsap.registerPlugin(ScrollTrigger);
   const transient:gsap.core.Animation[]=[],focusCleanup:(()=>void)[]=[];let sequence:gsap.core.Timeline|undefined,trigger:ReturnType<typeof ScrollTrigger.create>|undefined;
   const mm=gsap.matchMedia();
   const ctx=gsap.context(()=>{
    const title=el.querySelectorAll("[data-title-line]");
    const entry=gsap.fromTo(title,{yPercent:110,rotateX:mode==="form"?-50:0,opacity:0},{yPercent:0,rotateX:0,opacity:1,stagger:.13,duration:1.1,ease:"power4.out"});transient.push(entry);
    if(mode==="atelier"){const portrait=el.querySelector("[data-hero-photo] img");if(portrait)transient.push(gsap.fromTo(portrait,{scale:1.12,opacity:.4},{scale:1,opacity:1,duration:1.8,ease:"power3.out"}));}
    mm.add("(min-width: 700px) and (min-height: 650px)",()=>{
     const track=el.querySelector<HTMLElement>("[data-hero-track]");if(!track)return;track.dataset.pinned="true";
     const proxy={p:0};sequence=gsap.timeline({paused:true,defaults:{ease:"none"}});
     sequence.to(proxy,{p:1,duration:1,onUpdate:()=>{progress.current=proxy.p;}},0);
     const photo=el.querySelector("[data-hero-photo]"),copy=el.querySelector("[data-hero-type]");
     if(mode==="orbit")sequence.to(photo,{scale:.73,y:85,rotation:-6,duration:1},0).to(copy,{scale:1.18,y:-100,opacity:.3,duration:1},0);
     if(mode==="form")sequence.to(copy,{xPercent:-22,y:50,rotation:-7,duration:1},0).to(photo,{rotation:12,xPercent:20,scale:1.12,duration:1},0);
     if(mode==="atelier"){
      sequence.to(photo,{width:"100%",height:"100%",right:"0%",top:"0%",borderRadius:"0% 0% 0% 0%",duration:.59,ease:"power2.inOut"},.08)
       .to(copy,{xPercent:-16,y:-70,autoAlpha:0,duration:.34},.08)
       .to(el.querySelector("[data-cinema-shade]"),{opacity:1,duration:.45},.28)
       .fromTo(el.querySelector("[data-cinema-copy]"),{y:65,autoAlpha:0},{y:0,autoAlpha:1,duration:.25},.53)
       .to(el.querySelector("[data-cinema-progress]"),{scaleX:1,duration:1},0);
     }
     if(mode==="prism")sequence.to(photo,{rotationY:-22,rotationZ:12,x:60,scale:.86,duration:1},0).to(copy,{xPercent:-10,rotationZ:-5,y:-45,duration:1},0);
     if(mode==="terminal")sequence.to(copy,{y:-75,opacity:.12,duration:1},0).to(photo,{y:-100,x:60,rotation:7,duration:1},0);
     if(mode==="horizon")sequence.to(photo,{scale:1.65,y:90,opacity:.4,duration:1},0).to(copy,{scale:1.8,opacity:0,duration:.8},0);
     if(mode!=="atelier")sequence.fromTo(el.querySelector("[data-hero-end]"),{y:32,autoAlpha:0},{y:0,autoAlpha:1,duration:.35,ease:"power2.out"},.6);
     const seek=()=>{if(!pause.current&&sequence&&trigger)gsap.to(sequence,{progress:trigger.progress,duration:.55,ease:"power2.out",overwrite:true});};
     trigger=ScrollTrigger.create({trigger:track,start:"top top",end:"bottom bottom",onUpdate:seek,onRefresh:seek});seek();
     return()=>{if(sequence)gsap.killTweensOf(sequence);delete track.dataset.pinned;progress.current=0;};
    });
    el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node,i)=>{
     const tl=gsap.fromTo(node,{opacity:0,y:mode==="prism"?65:40,rotation:mode==="prism"?(i%2?2:-2):0},{opacity:1,y:0,rotation:0,duration:.85,paused:true,ease:"power3.out"});transient.push(tl);
     ScrollTrigger.create({trigger:node,start:"top 96%",once:true,onEnter:()=>{if(pause.current)tl.progress(1);else tl.play();}});
     const show=()=>{tl.progress(1);};node.addEventListener("focusin",show,{once:true});focusCleanup.push(()=>node.removeEventListener("focusin",show));
    });
   },el);
   control.current=(value)=>{if(sequence)gsap.killTweensOf(sequence);if(value)transient.forEach(t=>t.progress(1));else if(sequence&&trigger)gsap.to(sequence,{progress:trigger.progress,duration:.55});};
   if(pause.current)control.current(true);
   void document.fonts.ready.then(()=>{if(!cancelled)ScrollTrigger.refresh();});
   clean=()=>{control.current=null;if(sequence)gsap.killTweensOf(sequence);focusCleanup.forEach(f=>f());mm.revert();ctx.revert();progress.current=0;};
  }).catch(()=>{});
  return()=>{cancelled=true;clean?.();};
 },[root,progress,mode,reduced]);
}
