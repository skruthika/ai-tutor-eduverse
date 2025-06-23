import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ProgressBar, Badge } from "react-bootstrap";
import { 
  TrophyFill, 
  BookHalf, 
  ClockHistory, 
  Bullseye,
  PlayCircleFill,
  StarFill,
  ArrowRight,
  Plus,
  Fire,
  ChatSquare,
  Calendar
} from "react-bootstrap-icons";
import { getUserStats, getAllLearningGoals } from "../../../api";
import "./DashboardHome.scss";

const DashboardHome = () => {
  const [userStats, setUserStats] = useState(null);
  const [learningGoals, setLearningGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, goals] = await Promise.all([
        getUserStats(),
        getAllLearningGoals()
      ]);
      setUserStats(stats);
      setLearningGoals(goals);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = localStorage.getItem("name") || "Student";
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const progressCards = [
    {
      title: "Learning Goals",
      value: userStats?.totalGoals || 0,
      subtitle: `${userStats?.completedGoals || 0} completed`,
      icon: <Bullseye size={24} />,
      color: "primary",
      progress: userStats?.totalGoals > 0 ? (userStats.completedGoals / userStats.totalGoals) * 100 : 0
    },
    {
      title: "Study Streak",
      value: `${userStats?.streakDays || 0} days`,
      subtitle: "Keep it up!",
      icon: <Fire size={24} />,
      color: "warning",
      progress: Math.min((userStats?.streakDays || 0) * 10, 100)
    },
    {
      title: "Quizzes Taken",
      value: userStats?.totalQuizzes || 0,
      subtitle: "Practice makes perfect",
      icon: <TrophyFill size={24} />,
      color: "success",
      progress: Math.min((userStats?.totalQuizzes || 0) * 5, 100)
    },
    {
      title: "Study Time",
      value: `${userStats?.totalStudyTime || 0}h`,
      subtitle: "Total hours",
      icon: <ClockHistory size={24} />,
      color: "info",
      progress: Math.min((userStats?.totalStudyTime || 0) * 2, 100)
    }
  ];

  // Filter to show only user's actual courses, not sample data
  const userCourses = learningGoals.slice(0, 6).map(goal => ({
    id: goal.name,
    title: goal.name,
    progress: goal.progress || 0,
    duration: goal.duration,
    lastAccessed: "2 hours ago",
    difficulty: "Intermediate",
    isUserCourse: true
  }));

  if (loading) {
    return (
      <div className="enhanced-dashboard-home">
        <Container fluid className="dashboard-container">
          <div className="loading-state">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard-home">
      <Container fluid className="dashboard-container">
        {/* Enhanced Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="greeting-badge">
              <Calendar size={16} className="me-2" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <h1 className="welcome-title">
              {greeting}, {userName}! 👋
            </h1>
            <p className="welcome-subtitle">
              Ready to continue your learning journey? Let's make today productive!
            </p>
            <div className="quick-actions">
              <Button variant="primary" className="action-btn">
                <ChatSquare size={16} className="me-2" />
                Start Learning
              </Button>
              <Button variant="outline-primary" className="action-btn">
                <Plus size={16} className="me-2" />
                Set Goal
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Cards */}
        <div className="progress-section">
          <Row className="g-4">
            {progressCards.map((card, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="enhanced-progress-card">
                  <Card.Body>
                    <div className="card-header-content">
                      <div className={`progress-icon bg-${card.color}`}>
                        {card.icon}
                      </div>
                      <div className="progress-values">
                        <h3 className="progress-value">{card.value}</h3>
                        <small className="progress-subtitle">{card.subtitle}</small>
                      </div>
                    </div>
                    <div className="progress-bar-section">
                      <ProgressBar 
                        now={card.progress} 
                        variant={card.color}
                        className="enhanced-progress"
                      />
                      <small className="progress-text">{Math.round(card.progress)}% progress</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Enhanced My Courses Section */}
        <div className="courses-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">
                <BookHalf className="me-2" />
                My Courses
              </h2>
              <p className="section-description">Your personalized learning paths</p>
            </div>
            {userCourses.length > 0 && (
              <Button variant="outline-primary" size="sm" className="view-all-btn">
                View All <ArrowRight size={16} />
              </Button>
            )}
          </div>

          {userCourses.length > 0 ? (
            <Row className="g-4">
              {userCourses.map((course, index) => (
                <Col lg={4} md={6} key={index}>
                  <Card className="enhanced-course-card">
                    <Card.Body>
                      <div className="course-header">
                        <h6 className="course-title">{course.title}</h6>
                        <Badge bg="primary" className="user-badge">My Course</Badge>
                      </div>
                      <div className="course-meta">
                        <small className="text-muted">
                          <ClockHistory size={14} className="me-1" />
                          {course.duration}
                        </small>
                        <small className="text-muted">
                          Last accessed: {course.lastAccessed}
                        </small>
                      </div>
                      <div className="progress-section">
                        <ProgressBar 
                          now={course.progress} 
                          className="course-progress"
                          variant="primary"
                        />
                        <div className="progress-info">
                          <small className="text-muted">{course.progress}% complete</small>
                          <small className="text-muted">{course.difficulty}</small>
                        </div>
                      </div>
                      <div className="course-actions">
                        <Button variant="primary" size="sm" className="continue-btn">
                          <PlayCircleFill size={14} className="me-1" />
                          Continue Learning
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <div className="empty-content">
                <BookHalf size={64} className="empty-icon" />
                <h5 className="empty-title">No courses yet</h5>
                <p className="empty-description">
                  Start your learning journey by creating your first personalized study plan!
                </p>
                <div className="empty-actions">
                  <Button variant="primary" className="create-btn">
                    <Plus size={16} className="me-2" />
                    Create Learning Goal
                  </Button>
                  <Button variant="outline-primary" className="explore-btn">
                    <StarFill size={16} className="me-2" />
                    Explore Topics
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Summary */}
        {userCourses.length > 0 && (
          <div className="stats-summary">
            <Card className="summary-card">
              <Card.Body>
                <Row className="text-center">
                  <Col md={3}>
                    <div className="stat-item">
                      <h4 className="stat-number">{userStats?.totalGoals || 0}</h4>
                      <p className="stat-label">Active Goals</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-item">
                      <h4 className="stat-number">{userStats?.completedGoals || 0}</h4>
                      <p className="stat-label">Completed</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-item">
                      <h4 className="stat-number">{userStats?.totalQuizzes || 0}</h4>
                      <p className="stat-label">Quizzes Taken</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="stat-item">
                      <h4 className="stat-number">{userStats?.streakDays || 0}</h4>
                      <p className="stat-label">Day Streak</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
};

export default DashboardHome;