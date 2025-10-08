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
  );
};

export default MarkdownRenderer;