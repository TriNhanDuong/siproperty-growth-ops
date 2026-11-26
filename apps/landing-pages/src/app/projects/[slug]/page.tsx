import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { variantFrom } from "@siproperty/contracts";
import { findProject, projects } from "../../../lib/projects";
import LeadForm from "../../../components/LeadForm";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = findProject((await params).slug);
  return { title: project?.name ?? "Project not found" };
}
export default async function Project({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const project = findProject((await params).slug);
  if (!project) notFound();
  const variant = variantFrom((await searchParams).variant);
  return (
    <main>
      <nav className="breadcrumb">
        <a href="/">← All projects</a>
        <span>CAMPAIGN VARIANT {variant.toUpperCase()}</span>
      </nav>
      <section className="project-layout">
        <div className={"project-hero " + project.accent}>
          <p className="eyebrow">{project.eyebrow}</p>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div className="building-art large" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
          <div className="project-details">
            <span>{project.category}</span>
            <span>{project.homes}</span>
            <span>Fictional project</span>
          </div>
        </div>
        <LeadForm projectId={project.id} variant={variant} />
      </section>
    </main>
  );
}
