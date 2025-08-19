// global.d.ts
declare module './TypingDots' {
  const TypingDots: React.FC;
  export default TypingDots;
}

declare module "react-markdown";
declare module "remark-gfm";
// global.d.ts
declare module "rehype-highlight";
declare module "react-syntax-highlighter";
declare module "react-syntax-highlighter/dist/cjs/styles/prism";
declare module "react-syntax-highlighter/dist/cjs/styles/hljs";
declare module "react-syntax-highlighter/dist/esm/styles/prism";
declare module "react-syntax-highlighter/dist/esm/styles/hljs";
declare module '*.svg' {
  const content: string;
  export default content;
}
