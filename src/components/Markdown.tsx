import { Fragment, type ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Renderer markdown minimal: ## judul, ### subjudul, - daftar, 1. daftar bernomor, **tebal**, paragraf. */
export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const text = block.trim();
        if (!text) return null;
        if (text.startsWith("### ")) return <h3 key={i}>{inline(text.slice(4))}</h3>;
        if (text.startsWith("## ")) return <h2 key={i}>{inline(text.slice(3))}</h2>;
        const rows = text.split("\n");
        if (rows.every((r) => /^[-*] /.test(r))) {
          return <ul key={i}>{rows.map((r, j) => <li key={j}>{inline(r.slice(2))}</li>)}</ul>;
        }
        if (rows.every((r) => /^\d+\. /.test(r))) {
          return <ol key={i}>{rows.map((r, j) => <li key={j}>{inline(r.replace(/^\d+\. /, ""))}</li>)}</ol>;
        }
        return (
          <p key={i}>
            {rows.map((r, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(r)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
