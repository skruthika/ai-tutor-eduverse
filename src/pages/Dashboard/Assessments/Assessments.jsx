import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { ChevronRight, ChevronLeft, Trophy, Clock, Book } from "react-bootstrap-icons";
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
      <ResizableBox
        width={isCollapsed ? 80 : width}
        height={"100%"}
        axis="x"
        minConstraints={[400, 0]}
        maxConstraints={[window.innerWidth * 0.6, 0]}
        resizeHandles={["w"]}
        onResizeStop={(e, { size }) => setWidth(size.width)}
      >
        <div className={`d-flex flex-column bg-light border-start h-100 p-3 ${isCollapsed ? "collapsed" : ""}`} style={{ width: "100%" }}>
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading assessments...</p>
            </div>
          </div>
        </div>
      </ResizableBox>
    );
  }

  return (
    <ResizableBox
      width={isCollapsed ? 80 : width}
      height={"100%"}
      axis="x"
      minConstraints={[400, 0]}
      maxConstraints={[window.innerWidth * 0.6, 0]}
      resizeHandles={["w"]}
      onResizeStop={(e, { size }) => setWidth(size.width)}
    >
      <div
        className={`d-flex flex-column bg-light border-start h-100 p-3 ${
          isCollapsed ? "collapsed" : ""
        }`}
        style={{ width: "100%" }}
      >
        <div className="nav-heading" style={{width: "100% !important"}}>
          <button 
            className="collapse-btn"
            variant="light"
            onClick={togglePreferences}
            style={{ width: "50px" }}
          >
            {isCollapsed ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="assessment">
            <div className="d-flex align-items-center mb-3">
              <Trophy size={24} className="text-primary me-2" />
              <h4 className="mb-0">My Assessments</h4>
            </div>

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

            <div className="contests-container">
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
              <div className="contest-rows">
                {assessments.length === 0 ? (
                  <div className="text-center py-5">
                    <Book size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No Assessments Yet</h5>
                    <p className="text-muted">
                      Complete learning paths and take quizzes to see your assessment history here.
                    </p>
                  </div>
                ) : filteredAssessments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      {activeTab === 'attempted' 
                        ? "No completed assessments yet. Take some quizzes to see your results here!" 
                        : "No pending assessments. Great job staying on top of your studies!"}
                    </p>
                  </div>
                ) : (
                  filteredAssessments.map(assessment => (
                    <div key={assessment.id} className="contest-item mb-3">
                      {renderAssessmentImage(assessment.type, assessment.status)}
                      <div className="contest-info">
                        <div className="contest-title">{assessment.type}</div>
                        <div className="contest-date">
                          <Clock size={14} className="me-1" />
                          {formatDate(assessment.date)}
                        </div>
                        {assessment.subject && (
                          <div className="contest-subject text-muted">
                            Subject: {assessment.subject}
                          </div>
                        )}
                      </div>
                      <div className={`contest-badge ${getScoreColor(assessment.score)}`}>
                        {assessment.score}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              {activeTab === 'pending' && filteredAssessments.length > 0 && (
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={() => {
                      // TODO: Implement assessment taking functionality
                      console.log("Start assessment");
                    }}
                  >
                    Start Assessment
                  </Button>
                </div>
              )}

              {/* Empty State Action */}
              {assessments.length === 0 && !error && (
                <div className="text-center mt-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => {
                      // Navigate to chat to create quizzes
                      console.log("Navigate to create quiz");
                    }}
                  >
                    Create Your First Quiz
                  </Button>
                </div>
              )}
            </div>             
          </div>
        )}
      </div>
    </ResizableBox>
  );
};

export default Assessments;