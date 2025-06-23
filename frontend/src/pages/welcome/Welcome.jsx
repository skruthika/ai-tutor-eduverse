import { useState } from "react";
import { Tab, Tabs, Button, Form, Modal, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../../api";
import "./welcome.scss";
import { FaUserGraduate, FaRocket, FaChartLine, FaBrain, FaGraduationCap, FaLightbulb } from "react-icons/fa";

const Welcome = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      console.log("Login Success:", data);
      localStorage.setItem("username", email);
      navigate("/dashboard");
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
      console.log("Signup Success:", data);
      setActiveTab("login");
      clearForm();
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add click handler to header buttons
  const handleAuthModalOpen = () => {
    setShowModal(true);
  };

  // Add event listener for header button clicks
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

  return (
    <div className="welcome-container">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-content">
              <div className="brand-logo mb-4">
                <img
                  src="/icons/aitutor-short-no-bg.png"
                  alt="AI Tutor Logo"
                  className="logo-image"
                />
              </div>
              <h1 className="hero-title">
                Welcome to <span className="brand-highlight">AI Tutor</span>
              </h1>
              <p className="hero-subtitle">
                Transform your learning journey with AI-powered personalized education. 
                Get instant help, create custom study plans, and achieve your goals faster.
              </p>
              <div className="hero-actions">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="cta-button me-3"
                  onClick={() => setShowModal(true)}
                >
                  Start Learning Today
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg"
                  onClick={() => setShowModal(true)}
                >
                  Sign In
                </Button>
              </div>
              
              {/* Stats */}
              <div className="hero-stats mt-5">
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Courses</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </Col>
            
            <Col lg={6} className="hero-visual">
              <div className="hero-image-container">
                <img
                  src="/icons/aitutor-short-no-bg.png"
                  alt="AI Learning"
                  className="hero-main-image"
                />
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
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Why Choose AI Tutor?</h2>
              <p className="section-subtitle">
                Experience the future of learning with our advanced AI technology
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaUserGraduate />
                </div>
                <h3>Personalized Learning Paths</h3>
                <p>
                  Get custom study plans tailored to your learning style, pace, and goals. 
                  Our AI analyzes your progress and adapts accordingly.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaRocket />
                </div>
                <h3>Instant AI Assistance</h3>
                <p>
                  Get immediate help with any question. Our AI tutor is available 24/7 
                  to provide explanations, examples, and guidance.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon">
                  <FaChartLine />
                </div>
                <h3>Progress Tracking</h3>
                <p>
                  Monitor your learning journey with detailed analytics, achievements, 
                  and insights to keep you motivated and on track.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row>
            <Col lg={12} className="text-center">
              <h2 className="cta-title">Ready to Transform Your Learning?</h2>
              <p className="cta-subtitle">
                Join thousands of students who are already learning smarter with AI Tutor
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                className="cta-button"
                onClick={() => setShowModal(true)}
              >
                Get Started for Free
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Authentication Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-flex align-items-center">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor"
              width="32"
              height="32"
              className="me-2"
            />
            {activeTab === "login" ? "Welcome Back" : "Join AI Tutor"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => { setActiveTab(k); clearForm(); }} 
            className="mb-4 custom-tabs"
          >
            {/* Login Tab */}
            <Tab eventKey="login" title="Sign In">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modern-input"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  className="w-100 mb-3 modern-button"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                  Sign In
                </Button>
              </Form>
            </Tab>

            {/* Signup Tab */}
            <Tab eventKey="signup" title="Sign Up">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="modern-input"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modern-input"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  className="w-100 mb-3 modern-button"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                  Create Account
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Welcome;