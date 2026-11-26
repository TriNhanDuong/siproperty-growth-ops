import Link from "next/link";
import { projects } from "../lib/projects";
export default function Home() {
  return (
    <main>
      <section className="intro">
        <p className="eyebrow">MARKETING × ENGINEERING</p>
        <h1>
          Good places.
          <br />
          <em>Better connections.</em>
        </h1>
        <p className="lede">
          One campaign system. Three distinct communities. A working pilot for
          the next generation of real estate growth operations.
        </p>
        <div className="intro-bottom">
          <span className="pill">01 / PROJECT COLLECTION</span>
          <span>Built to measure. Designed to evolve.</span>
        </div>
      </section>
      <section className="project-grid" aria-label="Demo projects">
        {projects.map((p, i) => (
          <Link
            href={"/projects/" + p.id}
            className={"project-card " + p.accent}
            key={p.id}
          >
            <div className="building-art" aria-hidden="true">
              <div />
              <div />
              <div />
            </div>
            <div className="card-top">
              <span>0{i + 1}</span>
              <span>↗</span>
            </div>
            <div className="card-copy">
              <p className="eyebrow">{p.category}</p>
              <h2>{p.name}</h2>
              <p>
                {p.homes} <span>· Fictional project</span>
              </p>
            </div>
          </Link>
        ))}
      </section>
      <aside className="demo-note">
        <strong>A real engineering baseline, with synthetic data.</strong>
        <p>
          These pages demonstrate project templates, A/B variants and form
          routing. No property is being offered for sale.
        </p>
      </aside>
    </main>
  );
}
