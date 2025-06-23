import React from "react";
import { Navbar, Container } from "react-bootstrap";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import './header.scss';

const Header = () => {
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

        {/* Center Section - Navigation */}
        <div className="navbar-nav-center d-none d-lg-flex">
          <div className="nav-indicator">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Learning Dashboard</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span className="status-text d-none d-md-inline">Online</span>
          </div>
          <ThemeToggle />
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;