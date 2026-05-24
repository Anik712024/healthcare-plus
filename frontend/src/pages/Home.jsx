import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const quotes = [
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Health is the greatest gift.", author: "Buddha" },
  { text: "To keep the body in good health is a duty.", author: "Buddha" },
  { text: "A healthy outside starts from inside.", author: "Robert Urich" },
];

export default function Home() {
  const navigate = useNavigate();
  const [qi, setQi] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQi(prev => (prev + 1) % quotes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <h1>Your Health, Our Priority</h1>
        <p>Comprehensive healthcare services at your fingertips — book appointments, check your BMI, and connect with expert doctors.</p>
        <div className="hero-btns">
          <button className="btn-hero-primary" onClick={() => navigate('/appointment')}>
            <i className="fa fa-calendar" style={{ marginRight: 8 }}></i>
            Book Appointment
          </button>
          <button className="btn-hero-outline" onClick={() => navigate('/services')}>
            Our Services
          </button>
        </div>
      </section>

      {/* Quote rotator */}
      <section className="home-quote-section">
        <p className="home-quote">"{quotes[qi].text}"</p>
        <div className="home-author">— {quotes[qi].author}</div>
      </section>

      {/* Why Choose */}
      <section className="home-section">
        <h2>Why Choose HealthCare+?</h2>
        <p>Trusted by thousands of patients across Bangladesh</p>
        <div className="home-cards">
          <div className="home-card">
            <div className="home-card-icon ic-blue"><i className="fas fa-heart-pulse"></i></div>
            <h3>Expert Doctors</h3>
            <p>Experienced medical professionals dedicated to your care</p>
          </div>
          <div className="home-card">
            <div className="home-card-icon ic-green"><i className="fas fa-clock"></i></div>
            <h3>24/7 Service</h3>
            <p>Round-the-clock medical assistance whenever you need it</p>
          </div>
          <div className="home-card">
            <div className="home-card-icon ic-purple"><i className="fas fa-shield-heart"></i></div>
            <h3>Secure &amp; Private</h3>
            <p>Your health information is safe and confidential</p>
          </div>
          <div className="home-card">
            <div className="home-card-icon ic-orange"><i className="fas fa-award"></i></div>
            <h3>Quality Care</h3>
            <p>Award-winning healthcare services and facilities</p>
          </div>
        </div>
      </section>
    </>
  );
}