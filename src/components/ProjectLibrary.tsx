"use client";
import { useState } from "react";
import type { ProjectSummary } from "@/data/projects";
import { ProjectArt } from "./ProjectArt";

export function ProjectLibrary({projects}:{projects:ProjectSummary[]}) {
  const [category,setCategory]=useState("All");const [query,setQuery]=useState("");
  const categories=["All",...new Set(projects.map(p=>p.category))];
  const filtered=projects.filter(p=>(category==="All"||p.category===category)&&[p.title,p.summary,p.category,...p.tools].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  return <div className="project-library"><div className="library-controls"><div className="filters" role="group" aria-label="Filter projects by category">{categories.map(c=><button key={c} type="button" aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search-box"><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects or tools" value={query} onChange={e=>setQuery(e.target.value)}/><span aria-hidden="true">⌕</span></label></div><p className="result-count" aria-live="polite">{filtered.length} {filtered.length===1?"project":"projects"}</p><div className="project-cards">{filtered.map(project=><article className="project-card" key={project.slug}><a href={`/work/${project.slug}/`} aria-label={`Read ${project.title} case study`}><ProjectArt kind={project.visual}/><div className="project-card-copy"><span className="eyebrow">{project.context}</span><h3>{project.title}<span aria-hidden="true">↗</span></h3><p>{project.summary}</p><div className="tools">{project.tools.map(tool=><span key={tool}>{tool}</span>)}</div></div></a></article>)}</div>{!filtered.length&&<div className="empty-results"><p>No projects match that search.</p><button type="button" onClick={()=>{setQuery("");setCategory("All");}}>Show all projects</button></div>}</div>;
}
