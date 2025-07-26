import React from 'react';
import { useNavigate } from 'react-router-dom';
import VantaFog from './VantaFog';
import Header from './components/Header';

const About: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    window.playClickSound?.();
    navigate('/');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <VantaFog 
        baseColor="#fffbfa"
        highlightColor="#f2e8e6"
        midtoneColor="#a1c7ef"
        lowlightColor="#e3f4fc"
        enableControls={false}
      />
      
      <Header />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        width: '90%',
        maxWidth: '800px',
        zIndex: 20,
      }}>
        {/* Inspiration Section */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3d3d3d',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ color: '#81C784' }}>🌱</span> Inspiration
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#3d3d3d',
            margin: 0,
          }}>
            Healing Drinks is a personal side project, but also a piece of 
            my story. Each drink carries a different path toward self-care. 
            Whether you're overwhelmed, unmotivated, or simply in need of a pause, 
            I hope this space feels like a quiet companion. Just enough to breathe, 
            reset, and move forward, one sip at a time.
          </p>
        </div>

        {/* Contributor Section */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3d3d3d',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ color: '#FFD54F' }}>✨</span> Contributor
          </h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            <img 
              src="/Avatar.png" 
              alt="Carol's Avatar"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }} 
            />
            
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#3d3d3d',
                marginBottom: '20px',
                margin: 0,
              }}>
                I'm Carol, a creative developer navigating life between 
                design and technology. If this project resonates with you, I'd 
                love to connect.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '15px',
                marginTop: '20px',
              }}>
                <a href="#" style={{ display: 'block' }}>
                  <img src="/mdi_web.png" alt="Website" style={{ width: '24px', height: '24px' }} />
                </a>
                <a href="#" style={{ display: 'block' }}>
                  <img src="/mdi_linkedin.png" alt="LinkedIn" style={{ width: '24px', height: '24px' }} />
                </a>
                <a href="#" style={{ display: 'block' }}>
                  <img src="/mdi_github.png" alt="GitHub" style={{ width: '24px', height: '24px' }} />
                </a>
                <a href="#" style={{ display: 'block' }}>
                  <img src="/prime_twitter.png" alt="Twitter" style={{ width: '24px', height: '24px' }} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
        }}>
          <button
            onClick={handleBackClick}
            style={{
              padding: '15px 50px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              fontWeight: '500',
            }}
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