// QAComponent.tsx

import { Divider } from "primereact/divider";
import React, { useEffect, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MermaidChart from "./MermaidChart";

export type QAItem = {
  asked: string;
  answer: string;
  loading: boolean;
};

const QAComponent: React.FC<QAItem> = ({ asked, answer, loading }) => {
  // Split the answer into text and mermaid code parts
  const [textBeforeMermaid, setTextBeforeMermaid] = useState<string>("");
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const sampleDiagram = `
graph TB
  A --> B
`;

  useEffect(() => {
    if (!loading) {
      // --- Extract parts
      const mermaidStartTag = "<mermaid>";
      const mermaidEndTag = "</mermaid>";

      const mermaidStart = answer.indexOf(mermaidStartTag);
      const mermaidEnd = answer.indexOf(mermaidEndTag);

      // if (mermaidStart === -1 || mermaidEnd === -1) {
      //   throw new Error("Mermaid section not found.");
      // }

      const firstHalf = answer.slice(0, mermaidStart).trim(); // before <mermaid>

      const secondHalf = answer
        .slice(mermaidStart + "<mermaid>".length, mermaidEnd)
        .trim(); // inside <mermaid> ... </mermaid>

      console.log(secondHalf);
      setTextBeforeMermaid(firstHalf);
      setMermaidCode(String.raw`${secondHalf}`);
    }
  }, [loading]);

  return (
    <div>
      <Divider />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div>🤩</div>
        <div>{asked}</div>
      </div>
      <Divider />
      {loading && <MarkdownRenderer content={answer} />}
      {!loading && (
        <>
          <p>Hello</p>
          <MarkdownRenderer content={textBeforeMermaid} />
          {mermaidCode && (
            <>
              <MermaidChart chart={mermaidCode} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QAComponent;
