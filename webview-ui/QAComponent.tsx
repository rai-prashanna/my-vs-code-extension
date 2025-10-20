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

function extractMermaidParts(input: string): {
  beforeMermaid: string;
  mermaidContent: string;
  afterMermaid: string;
} {
  const mermaidRegex = /<mermaid>([\s\S]*?)<\/mermaid>/;
  const mermaidMatch = input.match(mermaidRegex);

  if (mermaidMatch) {
    const mermaidContent = mermaidMatch[1].trim();

    const startIdx = mermaidMatch.index!;
    const endIdx = startIdx + mermaidMatch[0].length;

    const beforeMermaid = input.slice(0, startIdx).trim();
    const afterMermaid = input.slice(endIdx).trim();

    return { beforeMermaid, mermaidContent, afterMermaid };
  } else {
    // No <mermaid> block found
    return {
      beforeMermaid: input.trim(),
      mermaidContent: "",
      afterMermaid: "",
    };
  }
}

const QAComponent: React.FC<QAItem> = ({ asked, answer, loading }) => {
  // Split the answer into text and mermaid code parts
  const [textBeforeMermaid, setTextBeforeMermaid] = useState<string>("");
  const [textAfterMermaid, setTextAfterMermaid] = useState<string>("");

  const [mermaidCode, setMermaidCode] = useState<string | null>(null);

  const sampleDiagram = `
graph TB
  A --> B
`;

  useEffect(() => {
    if (!loading) {
      const parsed_answer = extractMermaidParts(answer);
      console.log(parsed_answer);
      setTextBeforeMermaid(parsed_answer.beforeMermaid);
      setMermaidCode(String.raw`${parsed_answer.mermaidContent}`);
      setTextAfterMermaid(parsed_answer.afterMermaid);

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
          <MarkdownRenderer content={textAfterMermaid} />
        </>
      )}
    </div>
  );
};

export default QAComponent;
