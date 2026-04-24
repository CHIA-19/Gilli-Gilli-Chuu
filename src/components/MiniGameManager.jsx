import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MiniGameManager({ game, character, onClose }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlaying, setIsPlaying] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawn = setInterval(() => {
      const newItem = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        scale: Math.random() * 0.5 + 0.5
      };
      setItems(prev => [...prev, newItem]);
      
      // Auto-remove after 2s
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== newItem.id));
      }, 2000);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(spawn);
    };
  }, [isPlaying]);

  const handleCollect = (id) => {
    setScore(prev => prev + 1);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '800px', height: '600px', borderRadius: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Game Header */}
        <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: character.color }}>{game.title}</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{game.desc}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '1px' }}>SCORE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{score}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '1px' }}>TIME</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: timeLeft < 5 ? '#f43f5e' : 'white' }}>{timeLeft}s</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Game Board */}
        <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.3)', cursor: 'crosshair' }}>
          {isPlaying ? (
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: item.scale, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handleCollect(item.id)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: '80px',
                    height: '80px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem'
                  }}
                >
                  {game.type === 'puddle-jump' ? '💧' : game.type === 'alien-match' ? '👽' : '👗'}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <Trophy size={100} color="#fbbf24" style={{ marginBottom: '20px' }} />
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem' }}>WELL DONE!</h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>You scored {score} points!</p>
                <button onClick={onClose} className="glass" style={{ padding: '15px 40px', borderRadius: '40px', border: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', background: character.color }}>
                  CONTINUE CHATTING
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '15px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.4 }}>
          {isPlaying ? 'Quick! Click the items as they appear!' : 'Game Over!'}
        </div>
      </div>
    </div>
  );
}
