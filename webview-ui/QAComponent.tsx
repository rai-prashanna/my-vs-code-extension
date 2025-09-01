// QAComponent.tsx

import { Divider } from "primereact/divider";
import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

export type QAItem = {
  asked: string;
  answer: string;
};

const QAComponent: React.FC<QAItem> = ({ asked, answer }) => {
  return (
    <div>
      <Divider />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div>🤩</div>
        <div>{asked}</div>
      </div>
      <Divider />
      <MarkdownRenderer content={answer} />
    </div>
  );
};

export default QAComponent;
