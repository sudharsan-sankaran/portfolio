import { DirectionExperience } from "@/components/directions/DirectionExperience";
import { directions } from "@/components/directions/config";
import { projects } from "@/data/projects";
export default function Home() {
  return <DirectionExperience direction={directions.find(d=>d.slug==="atelier")!} projects={projects}/>;
}
