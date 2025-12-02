import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Review Collector. All rights reserved.
        </p>
        <p className="footer-text">
          Built with ❤️ by Yogendra
        </p>
      </div>
    </footer>
  );
};

export default Footer;
