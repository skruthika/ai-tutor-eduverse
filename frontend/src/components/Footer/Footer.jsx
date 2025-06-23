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
import './Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Courses', href: '#courses' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
    { name: 'Help Center', href: '#help' },
    { name: 'Privacy Policy', href: '#privacy' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook size={20} />, href: '#facebook' },
    { name: 'Twitter', icon: <Twitter size={20} />, href: '#twitter' },
    { name: 'Instagram', icon: <Instagram size={20} />, href: '#instagram' },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, href: '#linkedin' },
    { name: 'GitHub', icon: <Github size={20} />, href: '#github' },
  ];

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
                  <span>support@aitutor.com</span>
                </div>
                <div className="contact-item">
                  <Telephone size={16} className="contact-icon" />
                  <span>+1 (555) 123-4567</span>
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
                <li><a href="#blog" className="footer-link">Blog</a></li>
                <li><a href="#tutorials" className="footer-link">Tutorials</a></li>
                <li><a href="#documentation" className="footer-link">Documentation</a></li>
                <li><a href="#community" className="footer-link">Community</a></li>
                <li><a href="#webinars" className="footer-link">Webinars</a></li>
                <li><a href="#newsletter" className="footer-link">Newsletter</a></li>
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
              <a href="#terms" className="bottom-link">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#privacy" className="bottom-link">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#cookies" className="bottom-link">Cookie Policy</a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;