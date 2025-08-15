import React, { useState } from "react";
import "./style.css";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function CopilotUI() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    const text:string  = inputValue.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botReply:string  = await generateBotResponse(text as string);
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error fetching reply." }
      ]);
    }

    setIsTyping(false);
  };

  const generateBotResponse = async (userText: any): Promise<any> => {
    console.log("User input:", userText);
    const response = await fetch("http://127.0.0.1:8000/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: userText })
    });
    const data = await response.json();
    console.log("Bot response:", data.data);
    return data.data;
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🤖 ERIS expert</h2>
        <nav>
          <ul>
            <li className="active">Ask me anything about eris codebase</li>
          </ul>
        </nav>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-area">
        <div className="messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.sender}`}
              style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            >
              <div className="avatar">
                {msg.sender === "user" ? "🧑" : "🤖"}
              </div>
              <div
                className="bubble"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div className="avatar">🤖</div>
              <div className="bubble typing">Bot is typing...</div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="input-area">

        <input
        type="text"
        placeholder="Type your question here..."
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        />
          <button onClick={sendMessage}>➤</button>
        </div>
      </main>
    </div>
  );
}
