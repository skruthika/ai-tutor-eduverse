import React from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    return !!(token && username && token.trim() !== "" && username.trim() !== "");
  };

  // Check if we're on welcome/login page
  const isWelcomePage = location.pathname === '/welcome' || location.pathname === '/';
  const showMinimalFooter = isAuthenticated() && !isWelcomePage;

  // One-line minimal footer for all pages
  return (
    <footer className="minimal-footer">
      <Container fluid>
        <div className="footer-content">
          <span className="copyright">
            © {currentYear} AI Tutor. All rights reserved.
          </span>
          <div className="footer-links">
            <a href="#privacy" className="footer-link">Privacy</a>
            <span className="separator">•</span>
            <a href="#terms" className="footer-link">Terms</a>
            <span className="separator">•</span>
            <a href="#support" className="footer-link">Support</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;