import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { ChevronRight, ChevronLeft, Trophy, Clock, Book, Plus } from "react-bootstrap-icons";
import { ResizableBox } from "react-resizable";
import { getAssessments } from "../../../api";
import "./Assessments.scss";

const Assessments = ({ isCollapsed, togglePreferences, width, setWidth }) => {
  const [activeTab, setActiveTab] = useState('attempted');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(assessment => 
    activeTab === 'attempted' ? assessment.status === 'completed' : assessment.status === 'pending'
  );

  const renderAssessmentImage = (type, status) => {
    const colorClass = status === 'completed' ? 'green' : 'blue';
    return (
      <div className={`contest-image ${colorClass}`}>
        <div className="cube-decoration">
          <Book size={24} className="assessment-icon" />
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (!score || score === "0/10") return "text-muted";
    const [current, total] = score.split('/').map(Number);
    const percentage = (current / total) * 100;
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-danger";
  };

  if (loading) {
    return (
      <div className="assessments-sidebar">
        <div className="sidebar-header">
          <button 
            className="collapse-btn"
            onClick={togglePreferences}
          >
            {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
          </button>
          {!isCollapsed && <span className="sidebar-title">Assessments</span>}
        </div>
        
        {!isCollapsed && (
          <div className="loading-content">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading assessments...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`assessments-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={togglePreferences}
        >
          {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
        </button>
        {!isCollapsed && (
          <div className="header-content">
            <Trophy size={20} className="text-primary me-2" />
            <span className="sidebar-title">My Assessments</span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {error && (
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>Unable to load assessments</Alert.Heading>
              <p className="mb-0">
                {error === "User not authenticated" 
                  ? "Please log in to view your assessments." 
                  : "Assessment feature is coming soon! Check back later for quiz results and progress tracking."}
              </p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button variant="outline-warning" size="sm" onClick={fetchAssessments}>
                  Try Again
                </Button>
              </div>
            </Alert>
          )}

          <div className="assessments-container">
            {/* Tabs */}
            <div className="tabs-navigation">
              <div 
                className={`tab ${activeTab === 'attempted' ? 'active' : ''}`}
                onClick={() => setActiveTab('attempted')}
              >
                Attempted ({assessments.filter(a => a.status === 'completed').length})
              </div>
              <div 
                className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending ({assessments.filter(a => a.status === 'pending').length})
              </div>
            </div>
            
            {/* Assessment List */}
            <div className="assessments-list">
              {assessments.length === 0 ? (
                <div className="empty-state">
                  <Book size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No Assessments Yet</h6>
                  <p className="text-muted">
                    Complete learning paths and take quizzes to see your assessment history here.
                  </p>
                  <Button variant="outline-primary" size="sm">
                    <Plus size={16} className="me-2" />
                    Create Quiz
                  </Button>
                </div>
              ) : filteredAssessments.length === 0 ? (
                <div className="empty-state">
                  <p className="text-muted">
                    {activeTab === 'attempted' 
                      ? "No completed assessments yet. Take some quizzes to see your results here!" 
                      : "No pending assessments. Great job staying on top of your studies!"}
                  </p>
                </div>
              ) : (
                filteredAssessments.map(assessment => (
                  <div key={assessment.id} className="assessment-item">
                    {renderAssessmentImage(assessment.type, assessment.status)}
                    <div className="assessment-info">
                      <div className="assessment-title">{assessment.type}</div>
                      <div className="assessment-date">
                        <Clock size={12} className="me-1" />
                        {formatDate(assessment.date)}
                      </div>
                      {assessment.subject && (
                        <div className="assessment-subject">
                          Subject: {assessment.subject}
                        </div>
                      )}
                    </div>
                    <div className={`assessment-score ${getScoreColor(assessment.score)}`}>
                      {assessment.score}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            {activeTab === 'pending' && filteredAssessments.length > 0 && (
              <div className="action-section">
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-100"
                  onClick={() => {
                    console.log("Start assessment");
                  }}
                >
                  Start Assessment
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;