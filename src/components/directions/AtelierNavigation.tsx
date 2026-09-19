"use client";
import {useEffect,useRef,useState} from "react";
import s from "./directions.module.css";

const chapters=[{id:"about",label:"The person"},{id:"work",label:"The journal"},{id:"contact",label:"Say hello"}];

export function AtelierNavigation(){
 const [active,setActive]=useState("about"),[visible,setVisible]=useState(false);
 const line=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const start=document.getElementById("about");
   if(!start)return;
   const offset=start.getBoundingClientRect().top;
   setVisible(offset<innerHeight*.7);
   let current="about";
   for(const chapter of chapters){if((document.getElementById(chapter.id)?.getBoundingClientRect().top??Infinity)<innerHeight*.45)current=chapter.id;}
   setActive(current);
   const remaining=document.documentElement.scrollHeight-innerHeight;
   if(line.current)line.current.style.transform=`scaleX(${remaining>0?Math.min(1,scrollY/remaining):0})`;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const resize=new ResizeObserver(schedule);resize.observe(document.body);
  addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule);update();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();removeEventListener("scroll",schedule);removeEventListener("resize",schedule);};
 },[]);
 return <nav className={s.chapterNav} aria-label="Journal chapters" data-visible={visible} inert={!visible}>
  <span className={s.chapterProgress} aria-hidden="true"><span ref={line}/></span>
  {chapters.map((c,i)=><a key={c.id} href={`#${c.id}`} aria-current={active===c.id?"location":undefined}><span aria-hidden="true">0{i+1}</span>{c.label}</a>)}
 </nav>;
}
