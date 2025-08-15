document.addEventListener("DOMContentLoaded", () => {
    const messagesContainer = document.getElementById("messages");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    // Send message on button click  
    sendBtn.addEventListener("click", sendMessage);
    // Send message on Enter key  
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        // Append user message  
        appendMessage("user", text);
        chatInput.value = "";

        // Add typing indicator  
        const typingId = appendTypingIndicator();
        (async () => {
            const botReply = await generateBotResponse(text);
            // Remove typing indicator  
            removeTypingIndicator(typingId);
            appendMessage("bot", botReply);
        })();

    }

    function appendMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
         messageDiv.style = "white-space: pre-wrap; font-family: monospace;";
// style="white-space: pre-wrap; font-family: monospace;"
        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("avatar");
        avatarDiv.textContent = sender === "user" ? "🧑" : "🤖";

        const bubbleDiv = document.createElement("div");
        bubbleDiv.classList.add("bubble");
        bubbleDiv.innerHTML = text;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendTypingIndicator() {
        const typingId = "typing-" + Date.now();
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("message", "bot");
        typingDiv.setAttribute("id", typingId);

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("avatar");
        avatarDiv.textContent = "🤖";

        const bubbleDiv = document.createElement("div");
        bubbleDiv.classList.add("bubble", "typing");
        bubbleDiv.textContent = "Bot is typing...";

        typingDiv.appendChild(avatarDiv);
        typingDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return typingId; 
    }

    function removeTypingIndicator(typingId) {
        const typingDiv = document.getElementById(typingId);
        if (typingDiv) {
            typingDiv.remove();
        }
    }
 
    async function generateBotResponse(userText) {
        console.log('input is ', userText);
        const response = await fetch("http://127.0.0.1:8000/qa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: userText
            })
        });

        const data = await response.json();
        console.log("\n The response is ", data.data);
        return await data.data; // returns the post body text  
    }
});

