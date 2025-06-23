import React, { useState } from "react";
import { Navbar, Container, Form, InputGroup, Dropdown, Button, Nav } from "react-bootstrap";
import { Search, Person, Bell, Gear, BoxArrowRight, House, BookHalf, TrophyFill, BarChartFill } from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../api";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import './header.scss';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    return !!(token && username && token.trim() !== "" && username.trim() !== "");
  };

  // Check if we're on welcome/login page
  const isWelcomePage = location.pathname === '/welcome' || location.pathname === '/';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/welcome', { replace: true });
      setTimeout(() => {
        window.location.href = '/welcome';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality
    }
  };

  const handleGetStarted = () => {
    // Scroll to auth section or open modal
    const authSection = document.querySelector('.auth-modal-trigger');
    if (authSection) {
      authSection.click();
    }
  };

  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("username") || "";

  // Render different headers based on authentication status
  if (!isAuthenticated() || isWelcomePage) {
    // Public/Welcome Header - Simple and minimal
    return (
      <Navbar className="welcome-navbar" expand="lg" fixed="top">
        <Container fluid className="px-4">
          {/* Brand Section */}
          <Navbar.Brand className="brand-container" href="#home">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor Logo"
              width="50"
              height="50"
              className="logo-image"
            />
            <span className="brand-text">
              <span className="brand-main">AI</span>
              <span className="brand-accent">Tutor</span>
            </span>
          </Navbar.Brand>

          {/* Right Section - Get Started Button */}
          <div className="d-flex align-items-center gap-3">
            <ThemeToggle className="d-none d-md-block" />
            <Button 
              variant="primary" 
              className="get-started-btn auth-modal-trigger"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </Container>
      </Navbar>
    );
  }

  // Dashboard Header - Streamlined with navigation
  return (
    <Navbar className="dashboard-navbar" expand="lg" fixed="top">
      <Container fluid className="px-4">
        {/* Brand Section */}
        <Navbar.Brand className="brand-container" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img
            src="/icons/aitutor-short-no-bg.png"
            alt="AI Tutor Logo"
            width="40"
            height="40"
            className="logo-image"
          />
          <span className="brand-text">
            <span className="brand-main">AI</span>
            <span className="brand-accent">Tutor</span>
          </span>
        </Navbar.Brand>

        {/* Center Navigation */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-nav-center mx-auto d-none d-lg-flex">
            <Nav.Link 
              onClick={() => navigate('/dashboard')} 
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <House size={18} className="me-2" />
              Dashboard
            </Nav.Link>
            <Nav.Link 
              href="#courses" 
              className="nav-item"
            >
              <BookHalf size={18} className="me-2" />
              My Courses
            </Nav.Link>
            <Nav.Link 
              href="#progress" 
              className="nav-item"
            >
              <BarChartFill size={18} className="me-2" />
              Progress
            </Nav.Link>
            <Nav.Link 
              href="#achievements" 
              className="nav-item"
            >
              <TrophyFill size={18} className="me-2" />
              Achievements
            </Nav.Link>
          </Nav>

          {/* Search Bar - Hidden on mobile */}
          <div className="search-container d-none d-xl-flex">
            <Form onSubmit={handleSearch} className="search-form">
              <InputGroup className="search-input-group">
                <Form.Control
                  type="text"
                  placeholder="Search courses, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button variant="outline-secondary" type="submit" className="search-button">
                  <Search size={16} />
                </Button>
              </InputGroup>
            </Form>
          </div>

          {/* Right Section - User Controls */}
          <div className="user-controls d-flex align-items-center gap-3">
            {/* Search Icon for mobile */}
            <Button variant="ghost" className="search-btn d-xl-none">
              <Search size={20} />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="ghost" className="user-dropdown-toggle">
                <div className="user-avatar">
                  <Person size={20} />
                </div>
                <div className="user-info d-none d-lg-block">
                  <div className="user-name">{userName}</div>
                  <div className="user-email">{userEmail}</div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-avatar-large">
                    <Person size={24} />
                  </div>
                  <div>
                    <div className="dropdown-user-name">{userName}</div>
                    <div className="dropdown-user-email">{userEmail}</div>
                  </div>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => navigate('/dashboard')}>
                  <House size={16} className="me-2" />
                  Dashboard
                </Dropdown.Item>
                <Dropdown.Item href="#profile">
                  <Person size={16} className="me-2" />
                  Profile
                </Dropdown.Item>
                <Dropdown.Item href="#settings">
                  <Gear size={16} className="me-2" />
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="logout-item">
                  <BoxArrowRight size={16} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;