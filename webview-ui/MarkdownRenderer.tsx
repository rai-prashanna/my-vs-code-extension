import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image } from "primereact/image";
import Robot from "./robot.svg";
type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
        <Image className="inline" src={Robot} alt="Robot" width="28px" height="20px" />
        <div className="inline">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: {
            node: unknown;
            inline?: boolean;
            className?: string;
            children: React.ReactNode;
          }) {
            return inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <pre className={className} {...props}>
                <code>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;
