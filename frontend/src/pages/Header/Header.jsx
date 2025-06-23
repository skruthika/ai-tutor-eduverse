import React, { useState } from "react";
import { Navbar, Container, Form, InputGroup, Dropdown, Button } from "react-bootstrap";
import { Search, Person, Bell, Settings, BoxArrowRight } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import './header.scss';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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

  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("username") || "";

  return (
    <Navbar className="modern-navbar" expand="lg" fixed="top">
      <Container fluid className="px-4">
        {/* Brand Section */}
        <div className="d-flex align-items-center">
          <div className="logo-container">
            <img
              src="/icons/aitutor-short-no-bg.png"
              alt="AI Tutor Logo"
              width="50"
              height="50"
              className="logo-image"
            />
          </div>
          <Navbar.Brand className="brand-text ms-3">
            <span className="brand-main">AI</span>
            <span className="brand-accent">Tutor</span>
          </Navbar.Brand>
        </div>

        {/* Center Section - Search */}
        <div className="navbar-search-center d-none d-lg-flex">
          <Form onSubmit={handleSearch} className="search-form">
            <InputGroup className="search-input-group">
              <Form.Control
                type="text"
                placeholder="Search courses, topics, or resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Button variant="outline-secondary" type="submit" className="search-button">
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>
        </div>

        {/* Right Section - User Actions */}
        <div className="d-flex align-items-center gap-3">
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
                <Person size={24} />
              </div>
              <div className="user-info d-none d-md-block">
                <div className="user-name">{userName}</div>
                <div className="user-email">{userEmail}</div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="user-dropdown-menu">
              <div className="dropdown-header">
                <div className="user-avatar-large">
                  <Person size={32} />
                </div>
                <div>
                  <div className="dropdown-user-name">{userName}</div>
                  <div className="dropdown-user-email">{userEmail}</div>
                </div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item href="#profile">
                <Person size={16} className="me-2" />
                My Profile
              </Dropdown.Item>
              <Dropdown.Item href="#settings">
                <Settings size={16} className="me-2" />
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