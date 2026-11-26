export const projects = [
  {
    id: "harbour-residences",
    name: "Harbour Residences",
    eyebrow: "A quieter coastal rhythm",
    description:
      "A fictional waterfront community for exploring project campaigns, lead capture and measurable experiments.",
    category: "Coastal living",
    homes: "2–3 bedrooms",
    accent: "harbour",
  },
  {
    id: "garden-district",
    name: "Garden District",
    eyebrow: "Room to grow",
    description:
      "A fictional neighbourhood built around shared gardens, walkable streets and thoughtful family spaces.",
    category: "Garden community",
    homes: "Townhomes",
    accent: "garden",
  },
  {
    id: "coastal-quarter",
    name: "Coastal Quarter",
    eyebrow: "A new view, every day",
    description:
      "A fictional city-meets-coast collection used to test flexible marketing pages across projects.",
    category: "Urban coastal",
    homes: "1–2 bedrooms",
    accent: "coastal",
  },
] as const;
export function findProject(id: string) {
  return projects.find((project) => project.id === id);
}
