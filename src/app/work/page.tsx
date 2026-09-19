import { projectSummaries } from "@/data/projects";
import { ProjectLibrary } from "@/components/ProjectLibrary";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
export default function Work(){return <><Header/><main className="library-page shell"><span className="eyebrow">Project library</span><h1>Ideas in practice.</h1><p className="section-description">Explore projects, contributions and the lessons behind the work.</p><ProjectLibrary projects={projectSummaries}/></main><Footer/></>;}
