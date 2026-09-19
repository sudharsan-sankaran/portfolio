import { readFile } from "node:fs/promises";

const file = new URL("../content/projects.json", import.meta.url);
const entries = JSON.parse(await readFile(file, "utf8"));
if (!Array.isArray(entries)) throw new Error("projects.json must contain a list of project entries.");
const seen = new Set();
for (const [index, project] of entries.entries()) {
  const label = project.title || `Entry ${index + 1}`;
  for (const field of ["slug", "title", "category", "context", "summary", "role"]) {
    if (typeof project[field] !== "string" || !project[field].trim()) throw new Error(`${label}: add ${field}.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new Error(`${label}: use lowercase words and hyphens for the page address.`);
  if (seen.has(project.slug)) throw new Error(`${label}: the page address is already used.`);
  seen.add(project.slug);
  if (typeof project.visible !== "boolean" || typeof project.featured !== "boolean") throw new Error(`${label}: visible and featured must be true or false.`);
  if (!Array.isArray(project.tools) || !project.tools.every(tool => typeof tool === "string" && tool.trim())) throw new Error(`${label}: tools must be a list of names.`);
  if (!Array.isArray(project.sections) || !project.sections.length || !project.sections.every(section => typeof section.heading === "string" && section.heading.trim() && typeof section.body === "string" && section.body.trim())) throw new Error(`${label}: add at least one complete case-study section.`);
  if (!Array.isArray(project.links)) throw new Error(`${label}: links must be a list, which can be empty.`);
  for (const link of project.links) {
    if (typeof link.label !== "string" || !link.label.trim() || typeof link.url !== "string") throw new Error(`${label}: each link needs a name and address.`);
    const url = new URL(link.url);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error(`${label}: project links must use HTTPS and contain no credentials.`);
  }
  if (project.evidence && project.evidence !== "elliptic-report") throw new Error(`${label}: unknown evidence block. Leave this field out for an ordinary project.`);
}
console.log(`Content checked: ${entries.filter(p => p.visible).length} visible projects; ${entries.filter(p => !p.visible).length} drafts. Each visible entry generates a card and case-study page.`);
