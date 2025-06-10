import React, { useState, useEffect, useRef } from "react";
import "./ChatBot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome! I'm your waste management assistant. I can help you with directions, recycling information, and more. Try asking \"list all locations\" or \"path from cafeteria to reception\".",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { 
      sender: "user", 
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Check for custom commands before sending to backend
    const lowerCaseInput = input.trim().toLowerCase();
    
    if (lowerCaseInput.includes("get directions") || lowerCaseInput === "directions") {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          sender: "bot",
          text: "I can help you find paths between locations in our facility. Please specify your starting point and destination, for example: \"from cafeteria to reception\"",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.reply || "...",
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      const errorMessage = { 
        sender: "bot", 
        text: "An error occurred. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleQuickAction = (action) => {
    if (action === "Get directions") {
      // Special handling for directions to prompt for more info
      setMessages(prev => [...prev, {
        sender: "user",
        text: action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: "bot",
          text: "I can help you navigate our facility! Please tell me where you want to go from and to, for example: \"from cafeteria to reception\"",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    } else {
      // Normal handling for other quick actions
      setInput(action);
      setTimeout(() => {
        handleSend();
      }, 100);
    }
  };

  return (
    <div className="chatbot-container" style={{ 
      maxWidth: '800px', 
      height: '700px',
      margin: '2rem auto'
    }}>
      <div className="chat-header">
        <div className="chat-title">Waste Management Assistant</div>
        <div className="chat-subtitle">How can I help you today?</div>
      </div>

      <div className="quick-actions" style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px',
        background: 'var(--bot-bubble)',
        borderBottom: '1px solid #eee'
      }}>
        <div 
          className="quick-action"
          onClick={() => handleQuickAction("List all locations")}
          style={{
            padding: '8px 15px',
            background: 'white',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          📍 List Locations
        </div>
        <div 
          className="quick-action"
          onClick={() => handleQuickAction("Get directions")}
          style={{
            padding: '8px 15px',
            background: 'white',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          🧭 Get Directions
        </div>
        <div 
          className="quick-action"
          onClick={() => handleQuickAction("What can I recycle?")}
          style={{
            padding: '8px 15px',
            background: 'white',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          ♻️ Recycling Info
        </div>
        <div 
          className="quick-action"
          onClick={() => handleQuickAction("Help")}
          style={{
            padding: '8px 15px',
            background: 'white',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          ❓ Help
        </div>
      </div>

      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender}`}>
            <div className={`profile-pic ${msg.sender}`}>
              {msg.sender === "user" ? "👤" : "🤖"}
            </div>
            <div className={`chat-message ${msg.sender}`}>
              {msg.text}
              <div className="timestamp">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-container bot">
            <div className="profile-pic bot">🤖</div>
            <div className="chat-message bot">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button 
          className="chat-send-button" 
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;