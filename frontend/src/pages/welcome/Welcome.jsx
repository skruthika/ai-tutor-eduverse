import { useState, useEffect } from "react";
import { Tab, Tabs, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { login, signup, googleLogin, githubLogin } from "../../api";
import "./welcome.scss";
import { FaUserGraduate, FaRocket, FaChartLine } from "react-icons/fa";

const Welcome = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize Google OAuth
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "your-google-client-id", // Replace with your actual Google Client ID
        callback: handleGoogleResponse,
      });
    }
  }, []);

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

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    try {
      const data = await googleLogin(response.credential);
      console.log("Google Login Success:", data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google OAuth not loaded. Please refresh and try again.");
    }
  };

  const handleGithubLogin = () => {
    const clientId = "your-github-client-id"; // Replace with your actual GitHub Client ID
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = "user:email";
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  // Handle GitHub OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && window.location.pathname === '/auth/github/callback') {
      setLoading(true);
      githubLogin(code)
        .then((data) => {
          console.log("GitHub Login Success:", data);
          navigate("/dashboard");
        })
        .catch((err) => {
          setError(err.message || "GitHub login failed. Please try again.");
          navigate("/welcome");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [navigate]);

  return (
    <div className="welcome-container">
      {/* Background Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="brand-logo">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor Logo"
              className="logo-image"
            />
          </div>
          <h1>Welcome to AI Tutor</h1>
          <p>
            Empower your learning with personalized AI-driven learning paths. 
            Designed to adapt to your needs and help you grow with intelligent tutoring.
          </p>
          <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
            Get Started
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose AI Tutor?</h2>
        <div className="features">
          <div className="feature-card">
            <FaUserGraduate className="icon" />
            <h3>🎯 Personalized Learning</h3>
            <p>Get a custom learning path based on your goals and interests with AI-powered recommendations.</p>
          </div>
          <div className="feature-card">
            <FaRocket className="icon" />
            <h3>🚀 Intelligent Tutoring</h3>
            <p>Leverage advanced AI to get instant help, explanations, and guidance on any topic.</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="icon" />
            <h3>📊 Progress Tracking</h3>
            <p>Track your learning journey with detailed analytics and achieve your goals efficiently.</p>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor"
              width="32"
              height="32"
              className="me-2"
            />
            {activeTab === "login" ? "Login to AI Tutor" : "Create an Account"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Tabs activeKey={activeTab} onSelect={(k) => { setActiveTab(k); clearForm(); }} className="mb-3">

            {/* Login Tab */}
            <Tab eventKey="login" title="Login">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  className="w-100 mb-3"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Login"}
                </Button>
                
                <div className="oauth-divider">
                  <span>or continue with</span>
                </div>
                
                <div className="oauth-buttons">
                  <Button 
                    variant="outline-dark" 
                    className="oauth-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <FcGoogle className="me-2" /> Google
                  </Button>
                  <Button 
                    variant="outline-dark" 
                    className="oauth-btn"
                    onClick={handleGithubLogin}
                    disabled={loading}
                  >
                    <FaGithub className="me-2" /> GitHub
                  </Button>
                </div>
              </Form>
            </Tab>

            {/* Signup Tab */}
            <Tab eventKey="signup" title="Sign Up">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="success"
                  className="w-100 mb-3"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : "Sign Up"}
                </Button>
                
                <div className="oauth-divider">
                  <span>or continue with</span>
                </div>
                
                <div className="oauth-buttons">
                  <Button 
                    variant="outline-dark" 
                    className="oauth-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <FcGoogle className="me-2" /> Google
                  </Button>
                  <Button 
                    variant="outline-dark" 
                    className="oauth-btn"
                    onClick={handleGithubLogin}
                    disabled={loading}
                  >
                    <FaGithub className="me-2" /> GitHub
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Welcome;