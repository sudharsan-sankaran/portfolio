# Add projects without redesigning the website

Your introduction, animated background, experience, skills and contact sections are independent of the projects. Each project has one entry in content/projects.json. Cards, category filters and individual case-study pages are generated from that list.

## Using the local form

1. Open tools/project-editor.html in your browser.
2. Choose the existing content/projects.json file. This keeps all current entries.
3. Add a new entry, or choose an existing project to edit. Write your real contribution, tools, results and limitations. Links are optional.
4. Tick **Show this project on the website** when the wording is ready. Leave it unticked for a draft.
5. Save the entry to the working list, then download projects.json.
6. Review that copy, keep a backup of the current file, and replace content/projects.json with the reviewed version.
7. Run the content check and build, then review the preview before approving publication.

The editor stays local, does not publish anything and is not included in the website export. It downloads a copy rather than overwriting the source. Unsaved browser edits are lost if the editor is closed.

You can also ask Codex: “Add this project to my personal portfolio, keep the existing design, and prepare a local preview.” Provide the real project details and exact source locations.

## What updates automatically

- Project cards and search results.
- Category filters, including new categories.
- The project count.
- A case-study page at /work/your-page-address/.

## No graphic editing required

Leave **Appearance → Cover style** on **Automatic** (the default for new projects). You do not need to make an image, video, animation or 3D model. The site chooses a reusable cover from the project category, title and tools:

- Data analysis, dashboards and reporting → comparison sculpture.
- Data/analytics engineering, pipelines and cloud → layered system sculpture.
- Machine learning and networks → connected network sculpture.
- Q-learning and reinforcement learning → grid sculpture.
- Any other subject → abstract sculpture.

The card, animation, search/category filters and case-study layout update from the same entry. Existing manually selected covers are preserved. Appearance choices are optional; missing or unrecognised values also get an automatic cover. These are conceptual illustrations, never charts of the project's results.

You supply the title, category, short description, your actual contribution, tools and case-study explanation. Repository links are optional. Future projects do not need a separate visual-design task. Atelier only creates live 3D covers near the viewport and releases distant scenes, so adding entries does not create a live 3D renderer for every project at once.

Publishing content still requires a new build and deployment. It does not require changing the homepage layout, animation or project-page template.

## Technical commands

Run `pnpm content:check` and `pnpm build` from this folder. `pnpm dev --port 8770` starts a development preview. The production export is out/.

Only visible entries are sent to the site. Do not add private information, credentials or raw datasets to any content entry. Special result visualisations can be added as optional extensions; ordinary case studies need only text, tools and optional links.
