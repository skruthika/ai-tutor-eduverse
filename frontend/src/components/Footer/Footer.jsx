import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github,
  Envelope,
  Telephone,
  GeoAlt
} from 'react-bootstrap-icons';
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

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Courses', href: '#courses' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
    { name: 'Help Center', href: '#help' },
    { name: 'Privacy Policy', href: '#privacy' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook size={20} />, href: 'https://facebook.com/aitutor' },
    { name: 'Twitter', icon: <Twitter size={20} />, href: 'https://twitter.com/aitutor' },
    { name: 'Instagram', icon: <Instagram size={20} />, href: 'https://instagram.com/aitutor' },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, href: 'https://linkedin.com/company/aitutor' },
    { name: 'GitHub', icon: <Github size={20} />, href: 'https://github.com/aitutor' },
  ];

  // Minimal footer for post-login pages
  if (showMinimalFooter) {
    return (
      <footer className="minimal-footer">
        <Container fluid>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="copyright mb-0">
                © {currentYear} AI Tutor. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="footer-links">
                <a href="#privacy" className="footer-link">Privacy</a>
                <span className="separator">•</span>
                <a href="#terms" className="footer-link">Terms</a>
                <span className="separator">•</span>
                <a href="#support" className="footer-link">Support</a>
              </div>
              <div className="social-links-minimal">
                {socialLinks.slice(0, 3).map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="social-link-minimal"
                    title={social.name}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {React.cloneElement(social.icon, { size: 16 })}
                  </a>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }

  // Full footer for welcome page
  return (
    <footer className="modern-footer">
      <Container>
        <Row className="footer-content">
          {/* Company Information */}
          <Col lg={4} md={6} className="mb-4">
            <div className="footer-section">
              <div className="footer-brand">
                <img
                  src="/icons/aitutor-short-no-bg.png"
                  alt="AI Tutor"
                  width="40"
                  height="40"
                  className="footer-logo"
                />
                <span className="brand-name">AI Tutor</span>
              </div>
              <p className="footer-description">
                Empowering learners worldwide with AI-powered personalized education. 
                Transform your learning journey with intelligent tutoring and adaptive content.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <Envelope size={16} className="contact-icon" />
                  <a href="mailto:support@aitutor.com" className="contact-link">
                    support@aitutor.com
                  </a>
                </div>
                <div className="contact-item">
                  <Telephone size={16} className="contact-icon" />
                  <a href="tel:+15551234567" className="contact-link">
                    +1 (555) 123-4567
                  </a>
                </div>
                <div className="contact-item">
                  <GeoAlt size={16} className="contact-icon" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={3} md={6} className="mb-4">
            <div className="footer-section">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* Learning Resources */}
          <Col lg={3} md={6} className="mb-4">
            <div className="footer-section">
              <h5 className="footer-title">Learning Resources</h5>
              <ul className="footer-links">
                <li><a href="https://blog.aitutor.com" className="footer-link" target="_blank" rel="noopener noreferrer">Blog</a></li>
                <li><a href="https://tutorials.aitutor.com" className="footer-link" target="_blank" rel="noopener noreferrer">Tutorials</a></li>
                <li><a href="https://docs.aitutor.com" className="footer-link" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="https://community.aitutor.com" className="footer-link" target="_blank" rel="noopener noreferrer">Community</a></li>
                <li><a href="https://webinars.aitutor.com" className="footer-link" target="_blank" rel="noopener noreferrer">Webinars</a></li>
                <li><a href="https://newsletter.aitutor.com" className="footer-link" target="_blank" rel="noopener noreferrer">Newsletter</a></li>
              </ul>
            </div>
          </Col>

          {/* Social Media & Newsletter */}
          <Col lg={2} md={6} className="mb-4">
            <div className="footer-section">
              <h5 className="footer-title">Connect With Us</h5>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="social-link"
                    title={social.name}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="newsletter-signup">
                <p className="newsletter-text">Stay updated with our latest courses and features</p>
                <div className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="newsletter-input"
                  />
                  <button className="newsletter-button">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <Row className="footer-bottom">
          <Col md={6}>
            <p className="copyright">
              © {currentYear} AI Tutor. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="footer-bottom-links">
              <a href="https://aitutor.com/terms" className="bottom-link" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              <span className="separator">•</span>
              <a href="https://aitutor.com/privacy" className="bottom-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="https://aitutor.com/cookies" className="bottom-link" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;