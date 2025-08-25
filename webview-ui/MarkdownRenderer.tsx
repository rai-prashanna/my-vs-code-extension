import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image } from "primereact/image";
import Robot from "./robot.svg";
import Markdown from "react-markdown";

type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    // <div className="prose max-w-none">
    //   <Image
    //     className="inline"
    //     src={Robot}
    //     alt="Robot"
    //     width="28px"
    //     height="20px"
    //   />
    //   <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    // </div>

    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src={Robot}
        alt="Description"
        style={{ width: "28px", height: "20px" }}
      />
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};

export default MarkdownRenderer;
