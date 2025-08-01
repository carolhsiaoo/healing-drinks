import React from 'react';
import { useNavigate } from 'react-router-dom';
import VantaFog from './VantaFog';
import Header from './components/Header';
import styles from './About.module.css';

const About: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    window.playClickSound?.();
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <VantaFog 
        baseColor="#fffbfa"
        highlightColor="#f2e8e6"
        midtoneColor="#a1c7ef"
        lowlightColor="#e3f4fc"
        enableControls={false}
      />
      
      <Header />

      <div className={styles.content}>
        {/* Inspiration Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span style={{ color: '#81C784' }}>🌱</span> Inspiration
          </h2>
          <p className={styles.sectionText}>
            Healing Drinks is a personal side project, but also a piece of 
            my story. Each drink carries a different path toward self-care. 
            Whether you're overwhelmed, unmotivated, or simply in need of a pause, 
            I hope this space feels like a quiet companion. Just enough to breathe, 
            reset, and move forward, one sip at a time.
          </p>
        </div>

        {/* Contributor Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span style={{ color: '#FFD54F' }}>✨</span> Contributor
          </h2>
          
          <div className={styles.contributorContent}>
            <img 
              src="/Avatar.png" 
              alt="Carol's Avatar"
              className={styles.avatar}
            />
            
            <div className={styles.contributorInfo}>
              <p className={styles.sectionText}>
                I'm Carol, a creative developer navigating life between 
                design and technology. If this project resonates with you, I'd 
                love to connect.
              </p>
              
              <div className={styles.socialLinks}>
                <a href="https://www.carolhsiao.com/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src="/mdi_web.png" alt="Website" />
                </a>
                <a href="https://www.linkedin.com/in/carol-hsiao-5779a1158/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src="/mdi_linkedin.png" alt="LinkedIn" />
                </a>
                <a href="https://github.com/carolhsiaoo" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src="/mdi_github.png" alt="GitHub" />
                </a>
                <a href="https://x.com/CarolXiaoo" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src="/prime_twitter.png" alt="Twitter" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className={styles.backButtonContainer}>
          <button
            onClick={handleBackClick}
            className={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;