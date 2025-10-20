// QAComponent.tsx

import { Divider } from "primereact/divider";
import React, { useEffect, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import MermaidChart from "./MermaidChart";

// Type for each block of content (markdown or mermaid)
type ContentBlock = {
  type: "markdown" | "mermaid";
  content: string;
};

// Props expected by the component
export type QAItem = {
  asked: string;
  answer: string;
  loading: boolean;
};

// Function to parse multiple <mermaid> blocks and split the content
function parseAnswerWithMermaidBlocks(input: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const mermaidRegex = /<mermaid>([\s\S]*?)<\/mermaid>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mermaidRegex.exec(input)) !== null) {
    const matchStart = match.index;
    const matchEnd = mermaidRegex.lastIndex;

    // Push markdown before this mermaid block
    if (matchStart > lastIndex) {
      const markdownText = input.slice(lastIndex, matchStart).trim();
      if (markdownText) {
        blocks.push({ type: "markdown", content: markdownText });
      }
    }

    // Push the mermaid content
    const mermaidContent = match[1].trim();
    blocks.push({ type: "mermaid", content: mermaidContent });

    lastIndex = matchEnd;
  }

  // Push any remaining markdown after the last mermaid block
  if (lastIndex < input.length) {
    const remainingText = input.slice(lastIndex).trim();
    if (remainingText) {
      blocks.push({ type: "markdown", content: remainingText });
    }
  }

  return blocks;
}

const QAComponent: React.FC<QAItem> = ({ asked, answer, loading }) => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    if (!loading) {
      const parsedBlocks = parseAnswerWithMermaidBlocks(answer);
      console.log(parsedBlocks); // Optional: debug output
      setContentBlocks(parsedBlocks);
    }
  }, [loading, answer]);

  return (
    <div>
      <Divider />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div>🤩</div>
        <div>{asked}</div>
      </div>
      <Divider />

      {/* While loading, render the full answer as Markdown */}
      {loading && <MarkdownRenderer content={answer} />}

      {/* When not loading, render parsed blocks */}
      {!loading &&
        contentBlocks.map((block, index) => {
          if (block.type === "markdown") {
            return <MarkdownRenderer key={index} content={block.content} />;
          } else if (block.type === "mermaid") {
            return <MermaidChart key={index} chart={block.content} />;
          } else {
            return null;
          }
        })}
    </div>
  );
};

export default QAComponent;
