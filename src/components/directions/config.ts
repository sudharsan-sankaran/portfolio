export const directions = [
  { slug: "orbit", name: "Orbit", number: "01", mood: "A personal universe", note: "Orbital sculpture, a centred portrait and a floating project collection.", color: "#b7a2ff", ink: "#0c0a18" },
  { slug: "form", name: "Form", number: "02", mood: "Think in a different shape", note: "Electric blue, oversized graphic type and an expandable work index.", color: "#eaff6b", ink: "#183bff" },
  { slug: "atelier", name: "Atelier", number: "03", mood: "An evolving point of view", note: "Warm editorial pages, sculptural details and a magazine-like work journal.", color: "#d7c4ad", ink: "#f1eee7" },
  { slug: "prism", name: "Prism", number: "04", mood: "Make room for curiosity", note: "Vivid colour, tilted planes and an interactive project carousel.", color: "#dbff76", ink: "#9d174b" },
  { slug: "terminal", name: "Terminal", number: "05", mood: "Explore the system", note: "A live 3D lattice, keyboard-friendly project explorer and technical field notes.", color: "#99ffd4", ink: "#071a17" },
  { slug: "horizon", name: "Horizon", number: "06", mood: "The next perspective", note: "A camera journey through illuminated portals and full-width story chapters.", color: "#e5ad73", ink: "#191512" },
] as const;
export type Direction = typeof directions[number];
export type DirectionSlug = Direction["slug"];
