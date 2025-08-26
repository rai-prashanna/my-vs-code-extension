import React, { useState, useRef ,useEffect} from "react";

export default function StreamingText(){
  const [text, setText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/stream");
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      if (isStreaming) {
        setText((prev) => prev + event.data); // only append when streaming
      }
    };

    ws.onclose = () => {
      console.log("✅ WebSocket closed");
    };

        // disconnect only when window/tab is closed
    const handleBeforeUnload = () => {
      ws.close();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
     window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isStreaming]);

  const handleSubmit = () => {
    setText(""); // reset output
    setIsStreaming(true); // enable streaming
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Streaming Output</h2>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        Submit
      </button>

      <pre className="bg-gray-100 p-3 rounded-lg whitespace-pre-wrap mt-3">
        {text}
      </pre>
    </div>
  );
}
