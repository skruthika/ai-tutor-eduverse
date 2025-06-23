import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="modern-footer">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <div className="d-flex align-items-center">
              <img
                src="/icons/aitutor-short-no-bg.png"
                alt="AI Tutor"
                width="30"
                height="30"
                className="me-2"
              />
              <span className="footer-brand">AI Tutor</span>
            </div>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="footer-text mb-0">
              © 2024 AI Tutor. Empowering learning through AI.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;