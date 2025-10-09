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
      const mermaidRegex = /<mermaid>([\s\S]*?)<\/mermaid>/g;

      const matches = [...answer.matchAll(mermaidRegex)];

      const mermaidCodes = matches.map((match) => match[1].trim());

      // Optional: Remove the Mermaid blocks from the original Markdown content
      const markdownWithoutMermaid = answer.replace(mermaidRegex, "").trim();

      console.log("Markdown without Mermaid:\n", markdownWithoutMermaid);
      console.log("Extracted Mermaid code blocks:\n", mermaidCodes);

      setTextBeforeMermaid(markdownWithoutMermaid);
      setMermaidCode(String.raw`${mermaidCodes}`);
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
      {/* <MarkdownRenderer content={answer} /> */}
      {loading && <MarkdownRenderer content={answer} />}
      {!loading && (
        <>
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
