import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { Picture } from "../ui/Picture";

export function Projects() {
  return (
    <section className="section projects" id="projects">
      <div className="container">
        <div className="projects__head">
          <div>
            <p className="eyebrow">Real results. Real homes.</p>
            <h2 className="section-title">Recent Projects</h2>
          </div>
          <a className="btn btn--secondary" href="/#estimate">
            Start Your Project <Icon name="arrow-right" />
          </a>
        </div>
        <div className="projects__scroller">
          {site.projects.map((p) => (
            <figure className="project-card" key={p.image}>
              <Picture name={p.image} alt={`${p.title} in ${p.location}`} sizes="(min-width:720px) 32vw, 78vw" />
              <figcaption className="project-card__meta">
                <p className="project-card__title">{p.title}</p>
                <p className="project-card__loc">{p.location}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
