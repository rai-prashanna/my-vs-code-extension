import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image } from "primereact/image";
import Robot from "./robot.svg";
import Markdown from "react-markdown";
import DOMPurify from 'dompurify';
import 'github-markdown-css/github-markdown.css';

type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom when content changes
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content]);
  return (
    <div className="markdown-body">
      <ReactMarkdown>{content}</ReactMarkdown>
      <div ref={bottomRef} />
    </div>
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

    // <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    //   <img className= "top-0 left-0"
    //     src={Robot}
    //     alt="Description"
    //     style={{ width: "28px", height: "20px" }}
    //   />
    //   <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    // </div>
  );
};

export default MarkdownRenderer;
