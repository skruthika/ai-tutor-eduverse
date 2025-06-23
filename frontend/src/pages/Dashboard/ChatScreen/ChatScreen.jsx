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
    <div className="enhanced-chat-screen">
      <Container fluid className="chat-container">
        {/* Clean Header */}
        <div className="chat-header">
          <h2 className="chat-title">AI Tutor Chat</h2>
        </div>

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
                  <Card className="user-message-card">
                    <Card.Body>
                      <Card.Text>{message.content}</Card.Text>
                      {message.timestamp && (
                        <small className="message-time">
                          {formatDistanceToNow(new Date(message.timestamp), {
                            addSuffix: true,
                          })}
                        </small>
                      )}
                    </Card.Body>
                  </Card>
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
              <Card className="welcome-card">
                <Card.Body className="text-center">
                  <img 
                    src="/icons/aitutor-short-no-bg.png" 
                    alt="AI Tutor" 
                    className="welcome-logo"
                  />
                  <h3 className="welcome-title">Welcome to AI Tutor</h3>
                  <p className="welcome-subtitle">
                    Your intelligent learning companion is ready to help!
                  </p>
                  <div className="welcome-actions">
                    <Button 
                      variant="primary" 
                      onClick={handleStudyPlan}
                      className="me-2"
                    >
                      <Book size={16} className="me-2" />
                      Create Study Plan
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      onClick={handleSelfyQuiz}
                    >
                      <List size={16} className="me-2" />
                      Take a Quiz
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {isGenerating && (
          <div className="typing-indicator">
            <Spinner animation="grow" size="sm" className="me-2" />
            <span>
              {isLearningPathQuery
                ? "Creating your personalized study plan..."
                : "AI Tutor is thinking..."}
            </span>
          </div>
        )}

        {/* Action Buttons - Moved to bottom above input */}
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
            {chatHistory.length > 0 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleClearChat}
                className="action-btn"
              >
                <X size={16} className="me-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

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