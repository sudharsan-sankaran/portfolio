import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectArt } from "@/components/ProjectArt";
import { ResultsExplorer } from "@/components/ResultsExplorer";
import { reportMetrics } from "@/data/report";

export function generateStaticParams(){return projects.map(project=>({slug:project.slug}));}
export const dynamicParams=false;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const project=projects.find(p=>p.slug===slug);return {title:project?`${project.title} — Sudharsan Sankaran`:"Project not found",description:project?.summary};}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const project=projects.find(p=>p.slug===slug);if(!project)notFound();
  return <><Header/><main className="case-page shell"><a className="back-link" href="/#work">← All projects</a><div className="case-heading"><span className="eyebrow">{project.context}</span><h1>{project.title}</h1><p>{project.summary}</p><div className="tools">{project.tools.map(tool=><span key={tool}>{tool}</span>)}</div></div><div className="case-art"><ProjectArt kind={project.visual}/><span className="art-note">Concept illustration</span></div><div className="case-content"><aside><span className="eyebrow">My role</span><p>{project.role}</p><span className="eyebrow">Focus</span><p>{project.category}</p>{project.links.map(link=><a key={link.url} href={link.url}>{link.label} ↗</a>)}</aside><div>{project.sections.map(section=><section className="case-section" key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}</div></div>{project.evidence==="elliptic-report"&&<section className="case-evidence" aria-labelledby="evidence-heading"><span className="eyebrow">Reading the reported results</span><h2 id="evidence-heading">The numbers, with context.</h2><ResultsExplorer/><div className="comparison-scroll" tabIndex={0} role="region" aria-label="Model comparison"><table className="comparison"><caption>Reported model results — percentages, not independently reproduced</caption><thead><tr><th scope="col">Model</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col">F1</th></tr></thead><tbody>{reportMetrics.map(row=><tr key={row.model}><th scope="row">{row.model}</th><td>{row.precision}</td><td>{row.recall}</td><td>{row.f1}</td></tr>)}</tbody></table></div></section>}<div className="case-end"><h2>More to explore.</h2><a className="button-outline" href="/#work">Back to the project library ↗</a></div></main><Footer/></>;
}
