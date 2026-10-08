import { documentationSections, documentationUrl } from "../data/documentation";
import { Icon } from "./Icon";

export function DocumentationMenu() {
  return (
    <details className="documentation-menu">
      <summary>
        <Icon name="book" size={15} />
        Tài liệu
      </summary>
      <nav className="documentation-panel" aria-label="Tài liệu Dev Recall">
        <div className="documentation-heading">
          <strong>Thư viện tài liệu</strong>
          <span>
            {
              documentationSections.flatMap((section) => section.documents)
                .length
            }{" "}
            tài liệu
          </span>
        </div>
        <div className="documentation-groups">
          {documentationSections.map((section, index) => (
            <section
              key={section.title}
              aria-labelledby={`docs-group-${index}`}
            >
              <h2 id={`docs-group-${index}`}>{section.title}</h2>
              <ul>
                {section.documents.map((document) => (
                  <li key={document.source}>
                    <a
                      className="documentation-title"
                      href={documentationUrl(document.source, "html")}
                    >
                      {document.title}
                    </a>
                    <p>{document.description}</p>
                    <a
                      className="documentation-source"
                      href={documentationUrl(document.source, "md")}
                    >
                      Markdown nguồn
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </nav>
    </details>
  );
}
