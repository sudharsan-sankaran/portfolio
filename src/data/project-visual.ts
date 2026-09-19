export type ProjectVisual = "abstract" | "network" | "grid" | "deployment" | "analytics";
const visualTypes = new Set<string>(["abstract", "network", "grid", "deployment", "analytics"]);

/** Choose a decorative cover, independently of a project's evidence or results. */
export function resolveProjectVisual(project: {visual?: string; category: string; title: string; tools: string[]}): ProjectVisual {
 if (project.visual && visualTypes.has(project.visual)) return project.visual as ProjectVisual;
 const subject = `${project.category} ${project.title}`.toLowerCase();
 if (/q[ -]?learning|reinforcement|grid[ -]?world/.test(subject)) return "grid";
 if (/data engineer|analytics engineer|pipeline|deployment|cloud|\betl\b|\belt\b|warehouse|database/.test(subject)) return "deployment";
 if (/machine learning|artificial intelligence|\bai\b|fraud|network|graph|classification/.test(subject)) return "network";
 if (/data analy|dashboard|reporting|business intelligence|visuali[sz]ation|exploratory/.test(subject)) return "analytics";
 const tools = project.tools.join(" ").toLowerCase();
 if (/power\s?bi|tableau|excel/.test(tools)) return "analytics";
 if (/docker|azure|airflow|\bdbt\b|spark/.test(tools)) return "deployment";
 return "abstract";
}
