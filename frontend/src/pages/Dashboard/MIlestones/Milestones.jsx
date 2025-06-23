import React, { useState, useEffect } from "react";
import { Card, Button, ProgressBar, Spinner, Alert } from "react-bootstrap";
import { ChevronRight, ChevronLeft, Trophy, Fire, Award } from "react-bootstrap-icons";
import { ResizableBox } from "react-resizable";
import { getUserStats } from "../../../api";
import "./Milestones.scss";
import { BiMedal } from "react-icons/bi";

const Milestones = ({ isCollapsed, togglePreferences, width, setWidth }) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate milestone progress based on real data
  const getMilestoneProgress = () => {
    if (!userStats) return [];

    return [
      {
        id: 1,
        title: "Course Champion",
        description: "🏆 Complete 5 learning goals to earn this milestone",
        icon: Trophy,
        current: userStats.completedGoals || 0,
        target: 5,
        type: "goals"
      },
      {
        id: 2,
        title: "Quiz Master",
        description: "🏅 Ace 10 quizzes to earn this milestone",
        icon: BiMedal,
        current: userStats.totalQuizzes || 0,
        target: 10,
        type: "quizzes"
      },
      {
        id: 3,
        title: "Streak Warrior",
        description: "🔥 Maintain your daily streak for 30 days",
        icon: Fire,
        current: userStats.streakDays || 0,
        target: 30,
        type: "streak"
      },
      {
        id: 4,
        title: "Study Champion",
        description: "📚 Complete 100 hours of study time",
        icon: Award,
        current: userStats.totalStudyTime || 0,
        target: 100,
        type: "studyTime"
      }
    ];
  };

  const milestones = getMilestoneProgress();
  const totalEarned = milestones.filter(m => m.current >= m.target).length;
  const inProgress = milestones.filter(m => m.current > 0 && m.current < m.target).length;

  if (loading) {
    return (
      <ResizableBox
        width={isCollapsed ? 80 : width}
        height={"100%"}
        axis="x"
        minConstraints={[300, 0]}
        maxConstraints={[window.innerWidth * 0.6, 0]}
        resizeHandles={["w"]}
        onResizeStop={(e, { size }) => setWidth(size.width)}
      >
        <div className={`d-flex flex-column bg-light border-start h-100 p-3 ${isCollapsed ? "collapsed" : ""}`} style={{ width: "100%" }}>
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading milestones...</p>
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
      minConstraints={[300, 0]}
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
          <div className="milestone">
            <div className="milestone-header d-flex align-items-center">
              <Trophy size={24} className="text-primary me-2" />
              <h4 className="mb-0">My Milestones</h4>
            </div>
            <p className="m-2 text-muted">Accomplish tasks to earn milestones!</p>

            {error && (
              <Alert variant="warning" className="mb-3">
                <Alert.Heading>Unable to load milestones</Alert.Heading>
                <p className="mb-0">
                  {error === "User not authenticated" 
                    ? "Please log in to view your milestones." 
                    : "Milestone tracking is coming soon! Your progress will be tracked automatically."}
                </p>
                <hr />
                <div className="d-flex justify-content-end">
                  <Button variant="outline-warning" size="sm" onClick={fetchUserStats}>
                    Try Again
                  </Button>
                </div>
              </Alert>
            )}

            <div className="mile-stats">
              <div>
                <h4>{totalEarned}</h4>
                <p>Total Earned</p>
              </div>
              <div>
                <h4>{inProgress}</h4>
                <p>In Progress</p>
              </div>
            </div>

            {milestones.map((milestone) => {
              const IconComponent = milestone.icon;
              const progress = Math.min((milestone.current / milestone.target) * 100, 100);
              const isCompleted = milestone.current >= milestone.target;
              
              return (
                <div key={milestone.id} className={`milestone-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="milestone-content">
                    {/* Left Side - Icon */}
                    <div className="icon-container">
                      {typeof IconComponent === 'function' ? (
                        <IconComponent size={60} />
                      ) : (
                        <Trophy size={60} />
                      )}
                    </div>

                    {/* Right Side - Text & Progress */}
                    <div className="text-container">
                      <p className="subtitle">
                        {milestone.description}
                      </p>
                      <h6 className="milestone-title">{milestone.title}</h6>

                      {/* Progress Bar */}
                      <div className="progress-section">
                        <ProgressBar 
                          now={progress} 
                          className="progress-bar" 
                          variant={isCompleted ? "success" : "primary"}
                        />
                        <span className="progress-text">
                          {milestone.type === "studyTime" 
                            ? `${milestone.current}/${milestone.target} hrs`
                            : `${milestone.current}/${milestone.target}`
                          }
                        </span>
                      </div>
                      
                      {isCompleted && (
                        <div className="completion-badge">
                          <Award size={16} className="me-1" />
                          Completed!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {!error && userStats && Object.values(userStats).every(val => val === 0) && (
              <div className="text-center py-4">
                <Trophy size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Start Your Learning Journey</h5>
                <p className="text-muted">
                  Complete learning goals, take quizzes, and maintain study streaks to earn milestones!
                </p>
                <Button variant="outline-primary" onClick={() => {
                  // Navigate to create learning goal
                  console.log("Navigate to create learning goal");
                }}>
                  Create Your First Learning Goal
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </ResizableBox>
  );
};

export default Milestones;