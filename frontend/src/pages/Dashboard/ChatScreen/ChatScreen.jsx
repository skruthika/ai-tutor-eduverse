import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatInput from "./ChatInput";
import AIMessage from "./AIMessage";
import { fetchChatHistory, clearChat } from "../../../api";
import { formatDistanceToNow } from "date-fns";
import { Container, Row, Card, Spinner, Button, Modal } from "react-bootstrap";
import {
  setChatHistory,
  setIsGenerating,
  setIsLearningPathQuery,
  setIsQuizQuery,
} from "../../../globalSlice";
import "./ChatScreen.scss";
import { Book, List, X } from "react-bootstrap-icons";

const ChatScreen = () => {
  const dispatch = useDispatch();
  const { chatHistory, isGenerating, isLearningPathQuery, isQuizQuery } = useSelector(
    (state) => state.global
  );
  const hasFetched = useRef(false);
  const messagesEndRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStudyPlan = () => {
    dispatch(setIsLearningPathQuery(!isLearningPathQuery));
  };

  const handleSelfyQuiz = () => {
    dispatch(setIsQuizQuery(!isQuizQuery));
  };

  const handleClearChat = () => {
    setShowConfirmModal(true);
  };

  const confirmClearChat = async () => {
    try {
      await clearChat();
      dispatch(setChatHistory([]));
    } catch (error) {
      console.error("Error clearing chat history:", error.message);
    }
    setShowConfirmModal(false);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await fetchChatHistory();
      dispatch(setChatHistory(history));
    } catch (error) {
      console.error("Error fetching chat history:", error.message);
    }
  };

  const refreshChat = (message) => {
    if (message) {
      dispatch(addTemporaryMessage(message));
    } else {
      loadChatHistory();
    }
    dispatch(setIsGenerating(false));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="chatgpt-chat-screen">
      <Container fluid className="chat-container">
        {/* Chat Messages */}
        <div className="chat-messages">
          {chatHistory.length > 0 ? (
            chatHistory.map((message, index) => (
              <div
                key={index}
                className={`message-row ${
                  message.role === "user" ? "user-message" : "ai-message"
                }`}
              >
                {message.role === "user" ? (
                  <div className="user-message-bubble">
                    <div className="message-content">{message.content}</div>
                    {message.timestamp && (
                      <div className="message-time">
                        {formatDistanceToNow(new Date(message.timestamp), {
                          addSuffix: true,
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <AIMessage
                    content={message.content}
                    type={message.type}
                    timestamp={message.timestamp}
                    refreshChat={refreshChat}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="welcome-message">
              <div className="welcome-content">
                <img 
                  src="/icons/aitutor-short-no-bg.png" 
                  alt="AI Tutor" 
                  className="welcome-logo"
                />
                <h2 className="welcome-title">How can I help you today?</h2>
                
                {/* Optimized Action Buttons - Single Horizontal Row */}
                <div className="action-options">
                  <button 
                    className="action-option"
                    onClick={handleStudyPlan}
                  >
                    Create a study plan
                  </button>
                  <span className="separator">|</span>
                  <button 
                    className="action-option"
                    onClick={handleSelfyQuiz}
                  >
                    Generate a quiz
                  </button>
                  <span className="separator">|</span>
                  <button className="action-option">
                    📚 Explain a concept
                  </button>
                  <span className="separator">|</span>
                  <button className="action-option">
                    💡 Get homework help
                  </button>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {isGenerating && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <span>AI Tutor is thinking...</span>
          </div>
        )}

        {/* Action Buttons - Only show when there's chat history */}
        {chatHistory.length > 0 && (
          <div className="chat-actions-section">
            <div className="action-buttons-group">
              <Button
                variant={isLearningPathQuery ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={handleStudyPlan}
                className="action-btn"
              >
                <Book size={16} className="me-2" />
                Study Plan
              </Button>
              <Button
                variant={isQuizQuery ? "primary" : "outline-primary"}
                size="sm"
                onClick={handleSelfyQuiz}
                className="action-btn"
              >
                <List size={16} className="me-2" />
                Quiz
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleClearChat}
                className="action-btn"
              >
                <X size={16} className="me-2" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="chat-input-section">
          <ChatInput refreshChat={refreshChat} />
        </div>
      </Container>

      {/* Clear Chat Confirmation Modal */}
      <Modal show={showConfirmModal} centered onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Clear Chat History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear the chat history? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClearChat}>
            Clear Chat
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatScreen;