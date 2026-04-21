import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar-wrap">
      <nav className="navbar section-shell" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={handleLinkClick}>
          <span className="brand-logo-circle" aria-hidden="true">
            🎓
          </span>
          <span className="brand-copy">
            <span className="brand-text">JobHub</span>
            <span className="brand-tagline">Your Gateway to Great Careers</span>
          </span>
        </Link>

        <button
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div id="main-menu" className={`nav-cluster ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <a href="#home" onClick={handleLinkClick}>
                Home
              </a>
            </li>
            <li>
              <a href="#about" onClick={handleLinkClick}>
                About
              </a>
            </li>
            <li>
              <a href="#services" onClick={handleLinkClick}>
                Services
              </a>
            </li>
            <li>
              <a href="#contact" onClick={handleLinkClick}>
                Contact
              </a>
            </li>
          </ul>

          <NavLink to="/login" className="login-btn" onClick={handleLinkClick}>
            Login
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
