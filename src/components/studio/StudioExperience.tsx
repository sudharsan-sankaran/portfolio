"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import profile from "../../../content/profile.json";
import { ProjectArt } from "../ProjectArt";
import { ResultsExplorer } from "../ResultsExplorer";
import { StudioScene } from "./StudioScene";
import { useStudioMotion } from "./useStudioMotion";
import s from "./studio.module.css";

const chapters = [
  { label: "The background", number: "01", title: "People. Processes. Perspective.", text: "Before computer science, my work involved coordinating people and keeping everyday operations moving. That experience is part of how I approach a technical question.", detail: "Supervisor · Sai Ram Industries, India", date: "August 2021–August 2025", points: ["Workforce coordination", "Attendance records", "Operational responsibilities"] },
  { label: "The present", number: "02", title: "A deeper look at technology.", text: "I’m studying MSc Computer Science and Technology at Ulster University through QA Higher Education, exploring computing through academic projects and practical experiments.", detail: "MSc Computer Science and Technology", date: "Expected October 2027", points: ["R modelling and evaluation", "Python Q-learning coursework", "Azure and Docker deployment support"] },
  { label: "The direction", number: "03", title: "Make information useful.", text: "I’m working towards Data Analyst roles in the UK, with a parallel interest in junior analytics engineering. My next priorities are stronger SQL analysis, Power BI reporting and reproducible data workflows.", detail: "Primary focus · UK Data Analyst opportunities", date: "Skills I’m developing next", points: ["SQL analysis", "Power BI reporting", "Reproducible data workflows"] },
];

export function StudioExperience({ projects }: { projects: Project[] }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [angle, setAngle] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("contribution");
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  useStudioMotion(root, track, progress, paused, reduced);
  const quick = useRef<HTMLDialogElement>(null);
  const detail = useRef<HTMLDialogElement>(null);
  const categories = ["All", ...new Set(projects.map(p => p.category))];
  const filtered = projects.filter(p => (category === "All" || p.category === category) && [p.title, p.category, p.summary, p.role, ...p.tools].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const active = filtered.find(p => p.slug === activeSlug) ?? filtered[0];
  const story = chapters[chapter];
  const contribution = active?.sections.find(section => /my contribution/i.test(section.heading));
  const limitations = active?.sections.filter(section => /closer look|improve|scope|useful lesson/i.test(section.heading)) ?? [];

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches); change(); media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);


  return <div className={s.root} ref={root} data-paused={paused || reduced}>
    <a className={s.skip} href="#studio-work">Skip to project evidence</a>
    <header className={s.nav}>
      <a className={s.signature} href="#studio-home" aria-label="Sudharsan Sankaran home">SS<span>+</span></a>
      <span className={s.navContext}>Personal portfolio <span> / </span> Data & technology</span>
      <nav aria-label="Portfolio navigation"><a href="#studio-profile">The person</a><a href="#studio-work">The work</a><button type="button" onClick={()=>quick.current?.showModal()}>Recruiter view <span aria-hidden="true">↗</span></button></nav>
    </header>

    <main>
      <div ref={track} className={s.heroTrack} id="studio-home">
      <section className={s.hero} aria-labelledby="studio-name" style={{"--angle":angle/100} as React.CSSProperties}>
        <div className={s.heroArtwork} data-frame><img data-portrait className={s.heroImage} src="/images/studio-portrait-v1.png" alt="AI-styled portrait of Sudharsan in sunglasses, surrounded by sculptural chrome forms." width="1672" height="941" fetchPriority="high"/><div className={s.heroShade}/><div className={s.sceneShade} data-scene-shade/></div>
        <StudioScene paused={paused || reduced} angle={angle} progress={progress}/>
        <div className={s.sceneGuides} aria-hidden="true"><i/><i/><i/></div>
        <div className={s.heroTop}><span><i/> A different perspective</span><span>Scroll to explore <span aria-hidden="true">↓</span></span></div>
        <div className={s.heroCopy} data-hero-copy>
          <p className={s.introLine}>Sankaran / Sudharsan</p>
          <h1 id="studio-name" aria-label="Sudharsan Sankaran"><span>SUDHAR</span><span className={s.nameSecond}>SAN<span className={s.nameDot}>.</span></span></h1>
          <div className={s.heroByline}><span className={s.smallLine}/><p>An operations background.<br/><strong>A direction in data.</strong></p></div>
          <a className={s.heroAction} href="#studio-work"><span>Explore my work</span><span aria-hidden="true">↗</span></a>
        </div>
        <div className={s.heroStatement} data-statement><p className={s.micro}>The perspective behind the work</p><h2>From people.<br/><em>To possibilities.</em></h2><p>Industrial experience. Computer science.<br/>A growing curiosity about data.</p><a href="#studio-profile">Meet the person <span aria-hidden="true">↗</span></a></div>
        <span className={s.verticalNote}>Curiosity is the starting point.</span>
        <div className={s.heroBottom}>
          <div className={s.studyNote}><span>Currently</span><p>MSc Computer Science & Technology<br/><strong>Ulster University / QA Higher Education</strong></p></div>
          <div className={s.lightControl}><label htmlFor="studio-light">Explore the light <span aria-hidden="true">↔</span></label><input id="studio-light" aria-label="Foreground light angle" type="range" min="-100" max="100" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><button type="button" onClick={()=>setAngle(0)}>Reset</button></div>
          <button className={s.motion} type="button" aria-pressed={paused || reduced} disabled={reduced} onClick={()=>setPaused(p=>!p)}>{reduced?"Reduced motion":paused?"Resume motion":"Pause motion"}<span aria-hidden="true">{paused?"▷":"Ⅱ"}</span></button>
        </div>
        <div className={s.scrollLine} aria-hidden="true"><span data-scroll-line/></div>
      </section>
      </div>

      <section className={s.profile} id="studio-profile" aria-labelledby="studio-profile-title">
        <div className={s.sectionCap}><span>01 / The person</span><span>Context before conclusions.</span></div>
        <div className={s.profileLead}><h2 data-reveal id="studio-profile-title">Curiosity.<br/><em>With context.</em></h2><p>I’m Sudharsan. My route into computing brings together mechanical engineering, industrial team supervision and a growing interest in data.</p></div>
        <div className={s.chapterLayout} data-reveal>
          <div className={s.chapterNav} role="group" aria-label="Explore my background">{chapters.map((c,i)=><button key={c.label} type="button" aria-pressed={chapter===i} onClick={()=>setChapter(i)}><span>{c.number}</span>{c.label}<span aria-hidden="true">↗</span></button>)}</div>
          <article className={s.chapterBody} aria-live="polite" aria-atomic="true"><span className={s.chapterNumber} aria-hidden="true">{story.number}</span><div className={s.chapterText} key={chapter}><span className={s.micro}>{story.date}</span><h3>{story.title}</h3><p>{story.text}</p><div className={s.chapterTags}>{story.points.map(point=><span key={point}>{point}</span>)}</div><span className={s.chapterDetail}>{story.detail}</span></div></article>
        </div>
      </section>

      <section className={s.work} id="studio-work" aria-labelledby="studio-work-title">
        <div className={s.sectionCap}><span>02 / The work</span><span>{projects.length.toString().padStart(2,"0")} projects / An expanding collection</span></div>
        <div className={s.workHeading}><h2 data-reveal id="studio-work-title">Look closer.</h2><p>The question. My contribution.<br/>What the evidence can support.</p></div>
        <div className={s.workControls} data-reveal><div className={s.categories} role="group" aria-label="Project categories">{categories.map(c=><button key={c} type="button" aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className={s.search}><span className={s.srOnly}>Search projects</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search work or tools"/><span aria-hidden="true">⌕</span></label></div>
        <p className={s.resultCount} aria-live="polite">{filtered.length} {filtered.length===1?"project":"projects"} in this view</p>
        {active?<div className={s.workbench}>
          <div className={s.projectSelector} role="group" aria-label="Choose a project">{filtered.map((p,i)=><button key={p.slug} type="button" aria-pressed={active.slug===p.slug} onClick={()=>{setActiveSlug(p.slug);setView("contribution");}}><span>{String(i+1).padStart(2,"0")}</span><strong>{p.title}</strong><span aria-hidden="true">↗</span><small>{p.category}</small></button>)}</div>
          <article className={s.projectPanel} key={active.slug}>
            <div className={s.projectVisual}><ProjectArt kind={active.visual}/><span>Concept illustration</span></div>
            <div className={s.projectContent}><span className={s.micro}>{active.context}</span><h3>{active.title}</h3><div className={s.projectTabs} role="group" aria-label="What to inspect">{[{id:"contribution",label:"My contribution"},{id:"question",label:"The question"},{id:"limits",label:"Limitations"}].map(item=><button type="button" key={item.id} aria-pressed={view===item.id} onClick={()=>setView(item.id)}>{item.label}</button>)}</div>
              <div className={s.projectAnswer} key={view} aria-live="polite" aria-atomic="true">
                {view==="contribution" ? <><h4>{active.role}</h4><p>{contribution?.body ?? active.summary}</p></> :
                  view==="question" ? <><h4>{active.sections[0]?.heading ?? "The project"}</h4><p>{active.sections[0]?.body ?? active.summary}</p></> :
                  <><h4>What I can support</h4>{limitations.length ? limitations.map(section=><p key={section.heading}>{section.body}</p>) : <p>{active.sections.at(-1)?.body ?? "See the full case study for context."}</p>}</>}
              </div>
              <div className={s.projectTools}>{active.tools.map(tool=><span key={tool}>{tool}</span>)}</div><button type="button" className={s.caseButton} onClick={()=>detail.current?.showModal()}>Open the case study <span aria-hidden="true">↗</span></button>
            </div>
          </article>
        </div>:<div className={s.empty}><h3>No matching projects.</h3><p>Try a different tool, title or category.</p><button type="button" onClick={()=>{setQuery("");setCategory("All");}}>Show all projects ↗</button></div>}
      </section>

      <section className={s.contact} id="studio-contact"><div className={s.sectionCap}><span>03 / The conversation</span><span>Something worth exploring?</span></div><h2 data-reveal>Let’s make<br/><em>the connection.</em></h2><div className={s.contactBottom} data-reveal><p>Questions about my work,<br/>or a data opportunity in the UK.</p><a href={profile.links.linkedin}>LinkedIn <span aria-hidden="true">↗</span></a><a href={profile.links.github}>GitHub <span aria-hidden="true">↗</span></a></div></section>
    </main>
    <footer className={s.footer}><span>Sudharsan Sankaran</span><span>Keep looking. Keep learning.</span><a href="#studio-home">Back to the beginning ↑</a></footer>

    <dialog className={s.quickDialog} ref={quick} aria-labelledby="studio-quick-title"><div className={s.dialogHead}><span className={s.micro}>A quick introduction</span><button type="button" aria-label="Close recruiter view" onClick={()=>quick.current?.close()}>×</button></div><h2 id="studio-quick-title">Sudharsan<br/>Sankaran.</h2><p className={s.quickLead}>Computer science student with industrial team-supervision experience, building towards data roles in the UK.</p><dl><div><dt>Direction</dt><dd>Data Analyst · UK<br/>Parallel interest in junior analytics engineering</dd></div><div><dt>Education</dt><dd>{profile.education}<br/>{profile.institution}<br/>{profile.completion}</dd></div><div><dt>Experience</dt><dd>Supervisor · Sai Ram Industries, India<br/>August 2021–August 2025</dd></div><div><dt>Evidence</dt><dd>R modelling and feature importance; Python Q-learning coursework; Azure and Docker deployment support.</dd></div><div><dt>Developing next</dt><dd>SQL, Power BI and reproducible data workflows.</dd></div></dl><div className={s.quickLinks}><a href="#studio-work" onClick={()=>quick.current?.close()}>Inspect project contributions ↗</a><a href={profile.links.linkedin}>LinkedIn ↗</a></div></dialog>

    <dialog className={s.caseDialog} ref={detail} aria-labelledby="studio-case-title"><div className={s.dialogHead}><span className={s.micro}>{active?.context}</span><button type="button" aria-label="Close case study" onClick={()=>detail.current?.close()}>×</button></div>{active&&<><h2 id="studio-case-title">{active.title}</h2><p className={s.quickLead}>{active.summary}</p><div className={s.caseRole}><span>My role</span><strong>{active.role}</strong></div>{active.sections.map(section=><section className={s.caseSection} key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}{active.evidence==="elliptic-report"&&<section className={s.caseResults}><h3>Reported results, with context.</h3><ResultsExplorer/></section>}{active.links.map(link=><a className={s.externalLink} key={link.url} href={link.url}>{link.label} ↗</a>)}</>}</dialog>
  </div>;
}
