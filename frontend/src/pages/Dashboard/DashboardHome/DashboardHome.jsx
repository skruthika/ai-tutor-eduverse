import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ProgressBar } from "react-bootstrap";
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
  ChatSquare
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

  const recentCourses = learningGoals.slice(0, 6).map(goal => ({
    id: goal.name,
    title: goal.name,
    progress: goal.progress || 0,
    duration: goal.duration,
    lastAccessed: "2 hours ago",
    difficulty: "Intermediate"
  }));

  if (loading) {
    return (
      <div className="simple-dashboard-home">
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
    <div className="simple-dashboard-home">
      <Container fluid className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            {greeting}, {userName}! 👋
          </h1>
          <p className="welcome-subtitle">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Progress Cards */}
        <div className="progress-section">
          <Row className="g-3">
            {progressCards.map((card, index) => (
              <Col lg={3} md={6} key={index}>
                <Card className="progress-card">
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
                        className="custom-progress"
                      />
                      <small className="progress-text">{Math.round(card.progress)}% progress</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* My Courses Section */}
        <div className="courses-section">
          <div className="section-header">
            <h2 className="section-title">
              <BookHalf className="me-2" />
              My Courses
            </h2>
            <Button variant="outline-primary" size="sm">
              View All <ArrowRight size={16} />
            </Button>
          </div>

          {recentCourses.length > 0 ? (
            <Row className="g-3">
              {recentCourses.map((course, index) => (
                <Col lg={4} md={6} key={index}>
                  <Card className="course-card">
                    <Card.Body>
                      <h6 className="course-title">{course.title}</h6>
                      <div className="course-meta">
                        <small className="text-muted">
                          <ClockHistory size={14} className="me-1" />
                          {course.duration}
                        </small>
                      </div>
                      <ProgressBar 
                        now={course.progress} 
                        className="course-progress"
                      />
                      <div className="course-actions">
                        <small className="text-muted">{course.progress}% complete</small>
                        <Button variant="primary" size="sm">
                          <PlayCircleFill size={14} className="me-1" />
                          Continue
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <BookHalf size={48} className="text-muted mb-3" />
              <h6 className="text-muted">No courses yet</h6>
              <p className="text-muted mb-3">Start your learning journey!</p>
              <Button variant="primary">
                <Plus size={16} className="me-2" />
                Create Learning Goal
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default DashboardHome;