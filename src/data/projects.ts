import entries from "../../content/projects.json";
import {resolveProjectVisual} from "./project-visual";

export type Project = {
  slug: string;
  title: string;
  category: string;
  context: string;
  summary: string;
  role: string;
  tools: string[];
  visual?: string;
  featured: boolean;
  visible: boolean;
  sections: { heading: string; body: string }[];
  evidence?: string;
  links: { label: string; url: string }[];
};
export type ProjectSummary = Pick<Project, "slug" | "title" | "category" | "context" | "summary" | "role" | "tools" | "visual" | "featured">;

// Only visible entries reach rendered pages or client component props.
export const projects: Project[] = (entries as Project[]).filter(project => project.visible).map(project => ({...project, visual: resolveProjectVisual(project)}));
export const projectSummaries: ProjectSummary[] = projects.map(({ slug, title, category, context, summary, role, tools, visual, featured }) => ({ slug, title, category, context, summary, role, tools, visual, featured }));
