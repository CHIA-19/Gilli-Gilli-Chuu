import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MiniGameManager from './components/MiniGameManager';
import Paywall from './components/Paywall';
import { CHARACTERS } from './constants';
import { AgentSystem } from './lib/AgentSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, PlusCircle, BookOpen, Sparkles } from 'lucide-react';

function App() {
  const [activeChar, setActiveChar] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [hoursBalance, setHoursBalance] = useState(AgentSystem.getHoursBalance());
  const [showPaywall, setShowPaywall] = useState(null); // 'hours' or 'character'

  // Background Canvas Animation
  useEffect(() => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let animColor = activeChar ? activeChar.color : '#27ae60';

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        r: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x * W/1000, p.y * H/1000, p.r, 0, Math.PI*2);
        ctx.fillStyle = animColor + Math.floor(p.alpha * 255).toString(16).padStart(2,'0');
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
    return () => window.removeEventListener('resize', resize);
  }, [activeChar]);

  // Time Deduction Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeChar && hoursBalance > 0) {
        const newBalance = AgentSystem.deductMinutes(1);
        setHoursBalance(newBalance);
        if (newBalance <= 0) {
          setShowPaywall('hours');
          setActiveChar(null);
        }
      }
    }, 60000); // Every 1 minute
    return () => clearInterval(timer);
  }, [activeChar, hoursBalance]);

  const handleSelectChar = (char) => {
    if (hoursBalance <= 0) {
      setShowPaywall('hours');
      return;
    }
    if (!AgentSystem.isCharacterUnlocked(char)) {
      setShowPaywall('character');
      setActiveChar(char); // Keep track of which one they wanted
      return;
    }
    setActiveChar(char);
  };

  const handlePurchase = (type) => {
    if (type === 'unlock') {
      AgentSystem.unlockCharacter(activeChar.id);
      setShowPaywall(null);
    } else {
      localStorage.setItem('gili_hours', (hoursBalance + 5).toFixed(2));
      setHoursBalance(prev => prev + 5);
      setShowPaywall(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: activeChar ? activeChar.bg : '#1a1a2e', transition: 'background 0.6s ease' }}>
      <canvas id="bg-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}></canvas>

      <header style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderBottom: `3px solid ${activeChar ? activeChar.color : '#f9d423'}`, padding: '12px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.5s' }}>
        <div className="logo" style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: activeChar ? activeChar.color : '#f9d423', letterSpacing: '4px', textShadow: '3px 3px 0 rgba(0,0,0,0.4)', transition: 'color 0.5s' }}>
          <span style={{ color: 'white' }}>Gilli</span> Gilli <span style={{ color: 'white' }}>Chuu</span> ✨
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hoursBalance < 1 ? '#e74c3c' : '#f1c40f', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Clock size={16} />
            <span style={{ fontWeight: 800 }}>{hoursBalance.toFixed(2)}h Left</span>
            <button onClick={() => setShowPaywall('hours')} style={{ background: 'none', border: 'none', color: '#f1c40f', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <PlusCircle size={16} />
            </button>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Learning about AI Agents</div>
          <div style={{ fontSize: '0.7rem', background: 'rgba(0,206,201,0.2)', color: '#00cec9', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(0,206,201,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={12} /> ACADEMY
          </div>
        </div>
      </header>

      <div className="app" style={{ position: 'relative', zIndex: 5, display: 'flex', height: 'calc(100vh - 65px)', padding: '16px', gap: '16px' }}>
        <Sidebar activeId={activeChar?.id} onSelect={handleSelectChar} />

        <div className="chat-panel" style={{ flex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: `2px solid ${activeChar ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'border-color 0.5s' }}>
          <AnimatePresence mode="wait">
            {!activeChar ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px', gap: '16px' }}
              >
                <div style={{ fontSize: '4rem', animation: 'bounce 2s infinite' }}>✨</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'white', letterSpacing: '3px' }}>Gilli Gilli Chuu!</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '600px' }}>
                  Choose your favorite character and start a mission to learn how **AI Agents** think, see, and work in the digital world!
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  {['⌚','🐱','👑','❄️','🌺','💖','🎒','💪'].map((emoji, i) => (
                    <span key={i} style={{ fontSize: '2rem', animation: 'wiggle 3s infinite', animationDelay: `${i*0.2}s` }}>{emoji}</span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeChar.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <div style={{ background: activeChar.color + '22', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={16} color={activeChar.color} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>MISSION: {activeChar.learningMission}</span>
                </div>
                <ChatWindow character={activeChar} onOpenGame={setActiveGame} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showPaywall && (
          <Paywall 
            type={showPaywall} 
            character={activeChar} 
            onClose={() => setShowPaywall(null)} 
            onPurchase={handlePurchase} 
          />
        )}
      </AnimatePresence>

      {activeGame && (
        <MiniGameManager game={activeGame} character={activeChar} onClose={() => setActiveGame(null)} />
      )}
    </div>
  );
}

export default App;
