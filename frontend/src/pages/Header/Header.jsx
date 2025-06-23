import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { List } from "react-bootstrap-icons"; // Bootstrap Icons
import './header.scss'

const Header = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="px-3 header">
      <Container fluid className="d-flex align-items-center">
        
        {/* App Icon */}
        <img
          src="/icons/aitutor-short-no-bg.png"
          alt="AI Tutor Logo"
          width="40"
          height="40"
          className="me-2"
        />

        {/* Logo Text */}
        <Navbar.Brand className="fw-bold fs-4">AI Tutor</Navbar.Brand>

        {/* Empty Space for Future Elements */}
        <div className="flex-grow-1"></div>
      </Container>
    </Navbar>
  );
};

export default Header;