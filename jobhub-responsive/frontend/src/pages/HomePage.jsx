import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';

const services = [
  { title: 'Job Search', tag: 'Discover', icon: '🔍', description: 'Explore curated opportunities across startups, enterprises, and remote-first teams.' },
  { title: 'Skill Matching', tag: 'Analyze', icon: '⚡', description: 'Get roles aligned to your profile with intelligent skill-based recommendations.' },
  { title: 'Company Hiring', tag: 'Connect', icon: '🏢', description: 'Connect with verified employers actively hiring top candidates like you.' },
  { title: 'Easy Applications', tag: 'Apply', icon: '🚀', description: 'Apply faster with a streamlined workflow and track your status in one place.' },
];

const metrics = [
  { value: '10K+', label: 'Active Candidates', icon: '👥' },
  { value: '2K+', label: 'Hiring Companies', icon: '🏆' },
  { value: '95%', label: 'Profile Match Accuracy', icon: '🎯' },
];

const whyUs = [
  'AI-powered recommendation engine for role-fit matching',
  'Verified employers and authentic job postings',
  'Fast profile setup and one-click application workflow',
  'Real-time application tracking and status updates',
  'Role suggestions based on skills, location, and preferences',
  'Career-focused ecosystem for both candidates and recruiters',
];

const CONTACT_RECEIVER_EMAIL = 'indersen949@gmail.com';

function HomePage() {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="home-root">
      <Navbar />

      <main>
        {/* HERO */}
        <section id="home" className="hero-section">
          <div className="hero-bg-orb orb-1" />
          <div className="hero-bg-orb orb-2" />
          <div className="hero-bg-orb orb-3" />

          <div className="hero-content">
            <span className="hero-chip animate-chip">
              <span className="chip-dot" />
              Smart Job Placement Platform
            </span>

            <h1 className="animate-h1">
              Find Your <span className="gradient-text">Dream Job</span> Easily
            </h1>

            <p className="animate-p">
              JobHub helps students and professionals discover the right opportunities
              with intelligent matching, verified recruiters, and a smooth application experience.
            </p>

            <div className="hero-cta-group animate-cta">
              <Link to="/login" className="cta-button">
                Get Started <span className="btn-arrow">→</span>
              </Link>
              <a href="#services" className="cta-secondary">Explore Services</a>
            </div>

            <div className="hero-metrics">
              {metrics.map((metric, i) => (
                <article className="metric-card" key={metric.label} style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
                  <div className="metric-icon">{metric.icon}</div>
                  <h3>{metric.value}</h3>
                  <p>{metric.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-scroll-hint">
            <div className="scroll-mouse"><div className="scroll-wheel" /></div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="about-section section-shell">
          <div className="about-grid">
            <div className="section-heading reveal reveal-left">
              <span className="section-label">About Us</span>
              <h2>About JobHub</h2>
              <p>JobHub is a modern job placement platform that bridges the gap between talent and opportunity. From personalized role discovery to quick applications, everything is designed to keep your hiring journey simple, transparent, and effective.</p>
              <p>Whether you are a fresher, final-year student, or an experienced professional, JobHub helps you move from profile creation to interview calls with a guided and data-driven process.</p>
              <p>For employers and hiring teams, JobHub reduces hiring time by surfacing relevant candidates through skill-first filtering, verified profiles, and fast communication workflows.</p>
            </div>

            <div className="about-panel reveal reveal-right">
              <div className="about-panel-header">
                <span className="panel-badge">✦</span>
                <h3>Why Professionals Choose Us</h3>
              </div>
              <ul className="why-list">
                {whyUs.map((item, i) => (
                  <li key={i}><span className="why-check">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="services-section section-shell">
          <div className="section-heading centered reveal reveal-up">
            <span className="section-label">What We Offer</span>
            <h2>Services</h2>
            <p>Everything you need to discover, match, and apply with confidence.</p>
          </div>

          <div className="services-grid">
            {services.map((service, i) => (
              <article className="service-card reveal reveal-up" key={service.title} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="service-icon-wrap">{service.icon}</div>
                <span className="service-tag">{service.tag}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="card-hover-line" />
              </article>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact-section section-shell">
          <div className="section-heading centered reveal reveal-up">
            <span className="section-label">Get In Touch</span>
            <h2>Contact Us</h2>
            <p>Have questions about hiring, onboarding, or placements? Our team is ready to help you move faster.</p>
          </div>

          <div className="contact-layout">
            <div className="contact-grid reveal reveal-left">
              <article className="contact-card"><div className="contact-card-icon">✉️</div><h3>Email</h3><p>{CONTACT_RECEIVER_EMAIL}</p></article>
              <article className="contact-card"><div className="contact-card-icon">📞</div><h3>Phone</h3><p>+91 9770303911</p></article>
              <article className="contact-card"><div className="contact-card-icon">📍</div><h3>Office</h3><p>Bengaluru, India</p></article>
            </div>

            <form className="contact-form reveal reveal-right" action={`https://formsubmit.co/${CONTACT_RECEIVER_EMAIL}`} method="POST">
              <input type="hidden" name="_subject" value="New JobHub Contact Enquiry" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <div className="form-row"><label htmlFor="name">Full Name</label><input id="name" name="name" type="text" placeholder="Enter your name" required /></div>
              <div className="form-row"><label htmlFor="email">Email</label><input id="email" name="email" type="email" placeholder="Enter your email" required /></div>
              <div className="form-row"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" placeholder="Enter your phone number" required /></div>
              <div className="form-row"><label htmlFor="message">Message</label><textarea id="message" name="message" rows="4" placeholder="Write your message" required /></div>
              <button type="submit" className="contact-cta">Send Message <span className="btn-arrow">→</span></button>
            </form>
          </div>

          <p className="contact-note">Note: First submission par FormSubmit verification email aayega. Verify karne ke baad sab form responses seedhe inbox me aayenge.</p>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-glow" />
        <div className="section-shell footer-inner">
          <div className="footer-brand">
            <div className="footer-logo"><span>JH</span></div>
            <h3>JobHub</h3>
            <p>Empowering careers with smarter job discovery and faster hiring.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <a href={`mailto:${CONTACT_RECEIVER_EMAIL}`}>{CONTACT_RECEIVER_EMAIL}</a>
            <a href="tel:+919770303911">+91 9770303911</a>
          </div>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} JobHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
