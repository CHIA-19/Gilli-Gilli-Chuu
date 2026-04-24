import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MiniGameManager from './components/MiniGameManager';
import Paywall from './components/Paywall';
import { CHARACTERS } from './constants';
import { AgentSystem } from './lib/AgentSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, PlusCircle, BookOpen, Home as HomeIcon } from 'lucide-react';

// --- Shared Layout Component ---
function Layout({ children, activeChar, hoursBalance, setShowPaywall }) {
  const navigate = useNavigate();
  
  return (
    <div style={{ minHeight: '100vh', background: activeChar ? activeChar.bg : '#1a1a2e', transition: 'background 0.6s ease' }}>
      <canvas id="bg-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}></canvas>

      <header style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderBottom: `3px solid ${activeChar ? activeChar.color : '#f9d423'}`, padding: '12px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: activeChar ? activeChar.color : '#f9d423', letterSpacing: '4px' }}>
          <span style={{ color: 'white' }}>Gilli</span> Gilli <span style={{ color: 'white' }}>Chuu</span> ✨
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hoursBalance < 1 ? '#e74c3c' : '#f1c40f', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Clock size={16} />
            <span style={{ fontWeight: 800 }}>{hoursBalance.toFixed(2)}h Left</span>
            <button onClick={() => setShowPaywall('hours')} style={{ background: 'none', border: 'none', color: '#f1c40f', cursor: 'pointer' }}>
              <PlusCircle size={16} />
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', background: 'rgba(0,206,201,0.2)', color: '#00cec9', padding: '2px 8px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={12} /> ACADEMY
          </div>
        </div>
      </header>

      <div className="app" style={{ position: 'relative', zIndex: 5, display: 'flex', height: 'calc(100vh - 65px)', padding: '16px', gap: '16px' }}>
        <Sidebar activeId={activeChar?.id} onSelect={(char) => navigate(`/chat/${char.id}`)} />
        <div className="chat-panel" style={{ flex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: `2px solid ${activeChar ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Home Page ---
function HomePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px', gap: '16px' }}>
      <div style={{ fontSize: '4rem', animation: 'bounce 2s infinite' }}>✨</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'white', letterSpacing: '3px' }}>Gilli Gilli Chuu!</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '600px' }}>
        Welcome to the AI Multiverse! Choose a character from the sidebar to start your learning mission.
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        {['🐱','👑','❄️','🌺','💖'].map((e, i) => <span key={i} style={{ fontSize: '2rem' }}>{e}</span>)}
      </div>
    </motion.div>
  );
}

// --- Chat Page ---
function ChatPage({ setGlobalChar, hoursBalance, setShowPaywall }) {
  const { charId } = useParams();
  const navigate = useNavigate();
  const char = CHARACTERS.find(c => c.id === charId);

  useEffect(() => {
    if (char) {
      if (hoursBalance <= 0) {
        setShowPaywall('hours');
        navigate('/');
      } else if (!AgentSystem.isCharacterUnlocked(char)) {
        setShowPaywall('character');
        setGlobalChar(char);
        navigate('/');
      } else {
        setGlobalChar(char);
      }
    }
  }, [charId, hoursBalance]);

  if (!char) return <Navigate to="/" />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: char.color + '22', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>✨</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>MISSION: {char.learningMission}</span>
      </div>
      <ChatWindow character={char} onOpenGame={() => navigate(`/game/${char.id}`)} />
    </div>
  );
}

// --- Game Page ---
function GamePage({ setGlobalChar }) {
  const { charId } = useParams();
  const navigate = useNavigate();
  const char = CHARACTERS.find(c => c.id === charId);

  useEffect(() => {
    if (char) setGlobalChar(char);
  }, [charId]);

  if (!char) return <Navigate to="/" />;

  return (
    <MiniGameManager 
      game={char.game} 
      character={char} 
      onClose={() => navigate(`/chat/${charId}`)} 
    />
  );
}

// --- Main App ---
export default function App() {
  const [activeChar, setActiveChar] = useState(null);
  const [hoursBalance, setHoursBalance] = useState(AgentSystem.getHoursBalance());
  const [showPaywall, setShowPaywall] = useState(null);

  // Time Deduction
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeChar && hoursBalance > 0) {
        const newBalance = AgentSystem.deductMinutes(1);
        setHoursBalance(newBalance);
        if (newBalance <= 0) setShowPaywall('hours');
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [activeChar, hoursBalance]);

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
    <Router>
      <Layout activeChar={activeChar} hoursBalance={hoursBalance} setShowPaywall={setShowPaywall}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:charId" element={<ChatPage setGlobalChar={setActiveChar} hoursBalance={hoursBalance} setShowPaywall={setShowPaywall} />} />
          <Route path="/game/:charId" element={<GamePage setGlobalChar={setActiveChar} />} />
        </Routes>
      </Layout>

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
    </Router>
  );
}
