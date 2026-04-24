import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CHARACTERS, CATEGORIES } from '../constants';
import { AgentSystem } from '../lib/AgentSystem';
import { motion } from 'framer-motion';
import { Lock, Sparkles, BookOpen } from 'lucide-react';

export default function Sidebar({ activeId }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
      <div className="sidebar-title" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', letterSpacing: '3px', padding: '0 4px 6px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' }}>
        LEARNING AGENTS
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat.label} style={{ marginBottom: '4px' }}>
          <div className="section-label" style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', padding: '8px 4px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginTop: '4px', marginBottom: '8px' }}>
            {cat.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cat.ids.map(charId => {
              const char = CHARACTERS.find(c => c.id === charId);
              const isActive = location.pathname.includes(`/chat/${charId}`) || location.pathname.includes(`/game/${charId}`);
              const isUnlocked = AgentSystem.isCharacterUnlocked(char);
              
              return (
                <motion.div
                  key={charId}
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chat/${charId}`)}
                  className={`char-card ${isActive ? 'active' : ''}`}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: isActive ? `2px solid ${char.color}` : '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    opacity: isUnlocked ? 1 : 0.8
                  }}
                >
                  {!isUnlocked && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5, color: '#f1c40f' }}>
                      <Lock size={12} />
                    </div>
                  )}
                  {isActive && (
                    <div style={{ position: 'absolute', inset: 0, background: char.color, opacity: 0.15, zIndex: 0 }} />
                  )}
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden',
                    border: `3px solid ${isActive ? char.color : 'rgba(255,255,255,0.2)'}`,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    flexShrink: 0, zIndex: 1, transition: 'border-color 0.3s'
                  }}>
                    <img src={char.image} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} 
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = char.icon; }} />
                  </div>
                  <div style={{ zIndex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '1px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {char.name}
                      {char.tier === 'premium' && <Sparkles size={10} color="#f1c40f" />}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: char.color, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <BookOpen size={10} /> {char.tier.toUpperCase()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
