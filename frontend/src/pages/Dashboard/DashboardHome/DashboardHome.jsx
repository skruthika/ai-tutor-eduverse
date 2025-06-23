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
  ChatSquare
} from "react-bootstrap-icons";
import { getUserStats, getAllLearningGoals } from "../../../api";
import ChatWidget from "../../../components/ChatWidget/ChatWidget";
import "./DashboardHome.scss";

const DashboardHome = () => {
  const [userStats, setUserStats] = useState(null);
  const [learningGoals, setLearningGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChatWidget, setShowChatWidget] = useState(false);

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

  const recentCourses = learningGoals.slice(0, 3).map(goal => ({
    id: goal.name,
    title: goal.name,
    progress: goal.progress || 0,
    duration: goal.duration,
    lastAccessed: "2 hours ago",
    difficulty: "Intermediate"
  }));

  const recommendedCourses = [
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      description: "Master closures, promises, and async/await",
      duration: "8 weeks",
      rating: 4.8,
      students: "12.5k",
      image: "/icons/aitutor-short-no-bg.png"
    },
    {
      id: 2,
      title: "React.js Fundamentals",
      description: "Build modern web applications with React",
      duration: "6 weeks",
      rating: 4.9,
      students: "18.2k",
      image: "/icons/aitutor-short-no-bg.png"
    },
    {
      id: 3,
      title: "Python for Data Science",
      description: "Analyze data with pandas and numpy",
      duration: "10 weeks",
      rating: 4.7,
      students: "9.8k",
      image: "/icons/aitutor-short-no-bg.png"
    }
  ];

  const achievements = [
    { title: "First Course", description: "Completed your first learning goal", earned: true },
    { title: "Quiz Master", description: "Scored 90% or higher on 5 quizzes", earned: userStats?.totalQuizzes >= 5 },
    { title: "Consistent Learner", description: "Maintained a 7-day study streak", earned: (userStats?.streakDays || 0) >= 7 },
    { title: "Knowledge Seeker", description: "Completed 3 learning goals", earned: (userStats?.completedGoals || 0) >= 3 }
  ];

  if (loading) {
    return (
      <div className="dashboard-home">
        <Container fluid className="dashboard-container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading your dashboard...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <Container fluid className="dashboard-container">
        {/* Welcome Section */}
        <Row className="welcome-row">
          <Col>
            <div className="welcome-section">
              <h1 className="welcome-title">
                {greeting}, {userName}! 👋
              </h1>
              <p className="welcome-subtitle">
                Ready to continue your learning journey? Let's make today productive!
              </p>
            </div>
          </Col>
        </Row>

        {/* Progress Overview Cards - Grid Layout */}
        <Row className="progress-row">
          {progressCards.map((card, index) => (
            <Col xl={3} lg={6} md={6} className="progress-col" key={index}>
              <Card className="progress-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className={`progress-icon bg-${card.color}`}>
                      {card.icon}
                    </div>
                    <div className="text-end">
                      <h3 className="progress-value mb-0">{card.value}</h3>
                      <small className="text-muted">{card.subtitle}</small>
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <ProgressBar 
                      now={card.progress} 
                      variant={card.color}
                      className="custom-progress"
                    />
                    <small className="text-muted">{Math.round(card.progress)}% progress</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="content-row">
          {/* My Courses Section - 3 columns on desktop, 2 on tablet, 1 on mobile */}
          <Col lg={8} className="courses-col">
            <Card className="content-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <BookHalf className="me-2" />
                  My Courses
                </h5>
                <Button variant="outline-primary" size="sm">
                  View All <ArrowRight size={16} />
                </Button>
              </Card.Header>
              <Card.Body>
                {recentCourses.length > 0 ? (
                  <Row className="courses-grid">
                    {recentCourses.map((course, index) => (
                      <Col xl={4} md={6} className="course-col" key={index}>
                        <Card className="course-card h-100">
                          <Card.Body>
                            <h6 className="course-title">{course.title}</h6>
                            <div className="course-meta mb-3">
                              <small className="text-muted">
                                <ClockHistory size={14} className="me-1" />
                                {course.duration}
                              </small>
                              <Badge bg="secondary" className="ms-2">
                                {course.difficulty}
                              </Badge>
                            </div>
                            <ProgressBar 
                              now={course.progress} 
                              className="mb-2"
                              style={{ height: "6px" }}
                            />
                            <div className="d-flex justify-content-between align-items-center">
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
                  <div className="text-center py-4">
                    <BookHalf size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No courses yet</h6>
                    <p className="text-muted mb-3">Start your learning journey by creating your first course!</p>
                    <Button variant="primary">
                      <Plus size={16} className="me-2" />
                      Create Learning Goal
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Achievements */}
          <Col lg={4} className="achievements-col">
            <Card className="content-card">
              <Card.Header>
                <h5 className="mb-0">
                  <TrophyFill className="me-2" />
                  Achievements
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="achievements-list">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`achievement-item ${achievement.earned ? 'earned' : 'locked'}`}
                    >
                      <div className="achievement-icon">
                        <TrophyFill size={20} />
                      </div>
                      <div className="achievement-content">
                        <h6 className="achievement-title">{achievement.title}</h6>
                        <p className="achievement-description">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <div className="achievement-badge">
                          <StarFill size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recommended Courses */}
        <Row className="recommendations-row">
          <Col>
            <Card className="content-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <StarFill className="me-2" />
                  Recommended for You
                </h5>
                <Button variant="outline-primary" size="sm">
                  Explore All <ArrowRight size={16} />
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="recommendations-grid">
                  {recommendedCourses.map((course) => (
                    <Col lg={4} md={6} className="recommendation-col" key={course.id}>
                      <Card className="recommended-course-card h-100">
                        <div className="course-image">
                          <img src={course.image} alt={course.title} />
                          <div className="course-overlay">
                            <Button variant="light" size="sm">
                              <PlayCircleFill size={16} />
                            </Button>
                          </div>
                        </div>
                        <Card.Body>
                          <h6 className="course-title">{course.title}</h6>
                          <p className="course-description">{course.description}</p>
                          <div className="course-stats">
                            <div className="d-flex align-items-center mb-2">
                              <StarFill size={14} className="text-warning me-1" />
                              <span className="rating">{course.rating}</span>
                              <span className="text-muted ms-2">({course.students} students)</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <ClockHistory size={14} className="me-1" />
                                {course.duration}
                              </small>
                              <Button variant="primary" size="sm">
                                Start Course
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Chat Widget - Fixed bottom-right position */}
      <div className="chat-widget-container">
        <Button 
          className="chat-toggle-btn"
          onClick={() => setShowChatWidget(!showChatWidget)}
          title="Open AI Chat"
        >
          <ChatSquare size={24} />
        </Button>
        
        {showChatWidget && (
          <ChatWidget onClose={() => setShowChatWidget(false)} />
        )}
      </div>
    </div>
  );
};

export default DashboardHome;