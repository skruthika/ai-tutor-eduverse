import React, { useState } from "react";
import { Tab, Tabs, Button, Form, Modal, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login, signup, getAdminInfo } from "../../api";
import "./Welcome.scss";
import { FaUserGraduate, FaRocket, FaChartLine, FaBrain, FaGraduationCap, FaLightbulb, FaPlay, FaCheck, FaShield } from "react-icons/fa";

const Welcome = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch admin info when component mounts
  React.useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const info = await getAdminInfo();
        setAdminInfo(info);
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    fetchAdminInfo();
  }, []);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const isDefaultAdminEmail = (email) => {
    return email.toLowerCase() === "blackboxgenai@gmail.com";
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("username", email);
      
      // Show admin welcome message if applicable
      if (data.isAdmin) {
        setError("Welcome, Admin! You have been granted administrative privileges.");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      const data = await signup(name, email, password);
      setActiveTab("login");
      clearForm();
      setError(null);
      
      // Show success message with admin info if applicable
      let successMessage = "Account created successfully! Please sign in.";
      if (data.isAdmin) {
        successMessage += " (Admin privileges have been granted)";
      }
      
      setTimeout(() => {
        setError(successMessage);
      }, 100);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthModalOpen = () => {
    setShowModal(true);
    clearForm();
  };

  React.useEffect(() => {
    const authTriggers = document.querySelectorAll('.auth-modal-trigger');
    authTriggers.forEach(trigger => {
      trigger.addEventListener('click', handleAuthModalOpen);
    });

    return () => {
      authTriggers.forEach(trigger => {
        trigger.removeEventListener('click', handleAuthModalOpen);
      });
    };
  }, []);

  const features = [
    {
      icon: <FaUserGraduate />,
      title: "Personalized Learning Paths",
      description: "Get custom study plans tailored to your learning style, pace, and goals. Our AI analyzes your progress and adapts accordingly.",
      color: "primary"
    },
    {
      icon: <FaRocket />,
      title: "Instant AI Assistance",
      description: "Get immediate help with any question. Our AI tutor is available 24/7 to provide explanations, examples, and guidance.",
      color: "success"
    },
    {
      icon: <FaChartLine />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics, achievements, and insights to keep you motivated and on track.",
      color: "warning"
    }
  ];

  const benefits = [
    "AI-powered personalized learning",
    "24/7 instant support and guidance",
    "Adaptive study plans that evolve",
    "Real-time progress tracking",
    "Interactive quizzes and assessments",
    "Multi-language support"
  ];

  return (
    <div className="optimized-welcome">
      {/* Enhanced Hero Section */}
      <section className="enhanced-hero">
        <Container fluid>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-content">
              <div className="content-wrapper">
                <div className="hero-badge">
                  <FaBrain className="me-2" />
                  AI-Powered Learning Platform
                </div>
                
                <h1 className="hero-title">
                  Transform Your Learning with 
                  <span className="brand-highlight"> AI Tutor</span>
                </h1>
                
                <p className="hero-subtitle">
                  Experience personalized education powered by artificial intelligence. 
                  Create custom study plans, get instant help, and achieve your learning goals faster than ever.
                </p>

                <div className="benefits-list">
                  {benefits.slice(0, 3).map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <FaCheck className="check-icon" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="hero-actions">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="cta-button"
                    onClick={() => setShowModal(true)}
                  >
                    <FaPlay className="me-2" />
                    Start Learning Today
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    className="secondary-button"
                    onClick={() => setShowModal(true)}
                  >
                    Sign In
                  </Button>
                </div>
                
                {/* Admin Info Display */}
                {adminInfo && (
                  <div className="admin-info-banner">
                    <FaShield className="me-2" />
                    <span>
                      Admin Access: <strong>{adminInfo.default_admin_email}</strong> automatically receives admin privileges
                    </span>
                  </div>
                )}
                
                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Active Students</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Learning Paths</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col lg={6} className="hero-visual">
              <div className="hero-image-container">
                <div className="floating-elements">
                  <div className="floating-card card-1">
                    <FaBrain className="icon" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="floating-card card-2">
                    <FaGraduationCap className="icon" />
                    <span>Personalized</span>
                  </div>
                  <div className="floating-card card-3">
                    <FaLightbulb className="icon" />
                    <span>Interactive</span>
                  </div>
                </div>
                <img
                  src="/icons/aitutor-short-no-bg.png"
                  alt="AI Learning"
                  className="hero-main-image"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Features Section */}
      <section className="enhanced-features" id="features">
        <Container>
          <Row>
            <Col lg={12} className="text-center section-header">
              <div className="section-badge">
                <FaRocket className="me-2" />
                Features
              </div>
              <h2 className="section-title">Why Choose AI Tutor?</h2>
              <p className="section-subtitle">
                Experience the future of learning with our advanced AI technology
              </p>
            </Col>
          </Row>
          <Row className="features-grid">
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index} className="feature-col">
                <div className="enhanced-feature-card">
                  <div className={`feature-icon bg-${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-arrow">
                    <FaRocket />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Enhanced CTA Section */}
      <section className="enhanced-cta">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <div className="cta-content">
                <h2 className="cta-title">Ready to Transform Your Learning?</h2>
                <p className="cta-subtitle">
                  Join thousands of students who are already learning smarter with AI Tutor
                </p>
                <div className="cta-benefits">
                  {benefits.slice(3).map((benefit, index) => (
                    <div key={index} className="cta-benefit">
                      <FaCheck className="check-icon" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="final-cta-button"
                  onClick={() => setShowModal(true)}
                >
                  <FaPlay className="me-2" />
                  Get Started for Free
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Authentication Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="auth-modal">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-flex align-items-center">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor"
              width="32"
              height="32"
              className="me-2"
            />
            {activeTab === "login" ? "Welcome Back to AI Tutor" : "Join AI Tutor Today"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant={error.includes("successfully") || error.includes("Admin") ? "success" : "danger"} className="mb-3">
              {error}
            </Alert>
          )}
          
          {/* Admin Email Info */}
          {adminInfo && (
            <Alert variant="info" className="mb-3">
              <FaShield className="me-2" />
              <strong>Admin Access:</strong> Users with email <code>{adminInfo.default_admin_email}</code> automatically receive admin privileges.
            </Alert>
          )}
          
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => { setActiveTab(k); clearForm(); }} 
            className="mb-4 enhanced-tabs"
          >
            <Tab eventKey="login" title="Sign In">
              <div className="auth-form">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="enhanced-input"
                    />
                    {isDefaultAdminEmail(email) && (
                      <Form.Text className="text-success">
                        <FaShield className="me-1" />
                        This email will receive admin privileges
                      </Form.Text>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="enhanced-input"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="w-100 mb-3 enhanced-button"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <FaPlay className="me-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="signup" title="Sign Up">
              <div className="auth-form">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="enhanced-input"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="enhanced-input"
                    />
                    {isDefaultAdminEmail(email) && (
                      <Form.Text className="text-success">
                        <FaShield className="me-1" />
                        This email will receive admin privileges automatically
                      </Form.Text>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="enhanced-input"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="w-100 mb-3 enhanced-button"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaRocket className="me-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Welcome;