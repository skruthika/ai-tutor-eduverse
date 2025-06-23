import React from "react";
import { Navbar, Container } from "react-bootstrap";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import './header.scss';

const Header = () => {
  return (
    <Navbar className="modern-navbar shadow-sm" expand="lg">
      <Container fluid className="px-4">
        {/* Brand Section */}
        <div className="d-flex align-items-center">
          <img
            src="/icons/aitutor-short-no-bg.png"
            alt="AI Tutor Logo"
            width="45"
            height="45"
            className="me-3 logo-image"
          />
          <Navbar.Brand className="brand-text">
            AI Tutor
          </Navbar.Brand>
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          <ThemeToggle />
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;