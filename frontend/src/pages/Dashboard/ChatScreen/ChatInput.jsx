import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { Send, Paperclip, Mic } from "react-bootstrap-icons";
import { askQuestion } from "../../../api";
import { useDispatch, useSelector } from "react-redux";
import { setChatHistory, setIsGenerating, setIsLearningPathQuery, setStreamChat } from "../../../globalSlice";
import "./ChatInput.scss";

const ChatInput = ({ refreshChat }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatHistory = useSelector((state) => state.global.chatHistory);
  const isGenerating = useSelector((state) => state.global.isGenerating);
  const dispatch = useDispatch();
  const isLearningPathQuery = useSelector((state) => state.global.isLearningPathQuery);
  const isQuizQuery = useSelector((state) => state.global.isQuizQuery);

  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;

    const userMessage = message.trim();
    setMessage(""); // Clear input immediately
    setIsTyping(false);

    const updatedHistory = [
      ...chatHistory,
      { role: "user", content: userMessage, type: "content", isLearningPathQuery },
      { role: "assistant", content: "", type: "streaming" }
    ];
    
    dispatch(setChatHistory(updatedHistory));
    dispatch(setIsGenerating(true));
    
    try {
      await askQuestion(
        userMessage,
        (partialResponse) => {
          dispatch(setStreamChat(partialResponse));
        },
        () => {
          refreshChat(); 
          dispatch(setIsGenerating(false));
          dispatch(setIsLearningPathQuery(false));
        },
        isQuizQuery, 
        isLearningPathQuery
      );
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(setIsGenerating(false));
    }
  };
  
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div className="enhanced-chat-input">
      <div className="input-container">
        <Button 
          variant="ghost" 
          className="attachment-btn"
          disabled={isGenerating}
        >
          <Paperclip size={20} />
        </Button>
        
        <Form.Control
          as="textarea"
          rows={1}
          placeholder={
            isLearningPathQuery 
              ? "Tell me what you want to learn and I'll create a personalized study plan..." 
              : isQuizQuery
              ? "Ask me to create a quiz on any topic..."
              : "Ask me anything you want to know..."
          }
          className="message-input"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={isGenerating}
          style={{ 
            resize: 'none',
            minHeight: '52px',
            maxHeight: '120px'
          }}
        />

        <div className="action-buttons">
          <Button 
            variant="ghost" 
            className="voice-btn"
            disabled={isGenerating}
          >
            <Mic size={20} />
          </Button>
          
          <Button 
            variant="primary" 
            className={`send-btn ${isGenerating ? 'sending' : ''} ${isTyping ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={!message.trim() || isGenerating}
          >
            {isGenerating ? (
              <div className="sending-animation">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
      
      {isLearningPathQuery && (
        <div className="mode-indicator learning-path">
          📚 Learning Path Mode - I'll create a personalized study plan for you
        </div>
      )}
      
      {isQuizQuery && (
        <div className="mode-indicator quiz">
          📝 Quiz Mode - I'll create interactive quizzes to test your knowledge
        </div>
      )}
    </div>
  );
};

export default ChatInput;