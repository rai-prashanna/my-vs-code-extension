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
        // Simulate bot typing...  
        /*         setTimeout(async () => {
                    const botReply = await generateBotResponse(text);
                    // Remove typing indicator  
                    removeTypingIndicator(typingId);
                    appendMessage("bot", botReply);
                }, 20000); // shorter delay for demo   */
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

    // function generateBotResponse(userText) {
    //     console.log('input is ', userText);
    //     // if (userText.toLowerCase().includes("hello")) {  
    //     //   return "Hi there! 👋 How can I assist you today?";  
    //     // } else if (userText.toLowerCase().includes("code")) {  
    //     //   return `Sure! Here's an example:\n<pre><code>console.log("Hello World");</code></pre>`;  
    //     // } else {  
    //     //   return "I'm still learning! Please connect me to a real AI API for better responses.";  
    //     // }  
    //     const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
    //         method: "GET",
    //         headers: { "Content-Type": "application/json" },
    //     });
    //     console.log('input is ', userText);
    //     var responseText = JSON.parse(await response.text()).body
    //     console.log("\n The response is ", responseText)
    //     return await responseText;
    // }
    // ✅ Async version for API call  
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

