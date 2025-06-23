import React, { useState } from "react";
import { Navbar, Container, Button, Dropdown } from "react-bootstrap";
import { Person, Bell, BoxArrowRight } from "react-bootstrap-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../api";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import './header.scss';

const Header = () => {
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

  const handleGetStarted = () => {
    // Scroll to auth section or open modal
    const authSection = document.querySelector('.auth-modal-trigger');
    if (authSection) {
      authSection.click();
    }
  };

  const userName = localStorage.getItem("name") || "User";

  // Render different headers based on authentication status
  if (!isAuthenticated() || isWelcomePage) {
    // Public/Welcome Header - Very simple
    return (
      <Navbar className="clean-navbar welcome" fixed="top">
        <Container fluid className="navbar-container">
          {/* Brand Section - Left */}
          <Navbar.Brand className="brand-section" href="#home">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor"
              width="40"
              height="40"
              className="brand-logo"
            />
            <span className="brand-name">AI Tutor</span>
          </Navbar.Brand>

          {/* Actions Section - Right */}
          <div className="header-actions">
            <ThemeToggle />
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

  // Dashboard Header - Clean and minimal
  return (
    <Navbar className="clean-navbar dashboard" fixed="top">
      <Container fluid className="navbar-container">
        {/* Brand Section - Left (No duplication with sidebar) */}
        <Navbar.Brand className="brand-section" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img
            src="/icons/aitutor-short-no-bg.png"
            alt="AI Tutor"
            width="40"
            height="40"
            className="brand-logo"
          />
          <span className="brand-name">AI Tutor</span>
        </Navbar.Brand>

        {/* User Controls - Right */}
        <div className="header-actions">
          {/* Notifications */}
          <Button variant="ghost" className="action-btn">
            <Bell size={18} />
            <span className="notification-dot">3</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="ghost" className="user-dropdown">
              <div className="user-avatar">
                <Person size={18} />
              </div>
              <span className="user-name d-none d-md-inline">{userName}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="user-menu">
              <div className="user-header">
                <div className="user-avatar-large">
                  <Person size={20} />
                </div>
                <div className="user-details">
                  <div className="name">{userName}</div>
                  <div className="email">{localStorage.getItem("username")}</div>
                </div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => navigate('/dashboard')}>
                Dashboard
              </Dropdown.Item>
              <Dropdown.Item href="#settings">
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
      </Container>
    </Navbar>
  );
};

export default Header;