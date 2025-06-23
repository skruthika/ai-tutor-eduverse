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
      <Navbar className="simple-navbar" fixed="top">
        <Container fluid className="px-4">
          {/* Brand Section */}
          <Navbar.Brand className="brand-container" href="#home">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor"
              width="40"
              height="40"
              className="logo-image"
            />
            <span className="brand-text">AI Tutor</span>
          </Navbar.Brand>

          {/* Right Section - Get Started Button */}
          <Button 
            variant="primary" 
            className="get-started-btn auth-modal-trigger"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </Container>
      </Navbar>
    );
  }

  // Dashboard Header - Simple with minimal controls
  return (
    <Navbar className="simple-navbar dashboard" fixed="top">
      <Container fluid className="px-4">
        {/* Brand Section */}
        <Navbar.Brand className="brand-container" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img
            src="/icons/aitutor-short-no-bg.png"
            alt="AI Tutor"
            width="40"
            height="40"
            className="logo-image"
          />
          <span className="brand-text">AI Tutor</span>
        </Navbar.Brand>

        {/* Right Section - Simple user controls */}
        <div className="user-controls">
          {/* Notifications */}
          <Button variant="ghost" className="control-btn">
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="ghost" className="user-toggle">
              <div className="user-avatar">
                <Person size={18} />
              </div>
              <span className="user-name d-none d-md-inline">{userName}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="user-menu">
              <div className="user-info">
                <div className="user-avatar-large">
                  <Person size={20} />
                </div>
                <div>
                  <div className="name">{userName}</div>
                  <div className="email">{localStorage.getItem("username")}</div>
                </div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => navigate('/dashboard')}>
                Dashboard
              </Dropdown.Item>
              <Dropdown.Item href="#profile">
                Profile
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