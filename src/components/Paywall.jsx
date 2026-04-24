import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, Sparkles, Clock } from 'lucide-react';
import { AgentSystem } from '../lib/AgentSystem';

export default function Paywall({ type, character, onClose, onPurchase }) {
  const isPremiumChar = type === 'character';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: '#1a1a2e', border: '2px solid #f1c40f', borderRadius: '32px', maxWidth: '450px', width: '100%', padding: '40px', position: 'relative', textAlign: 'center', margin: 'auto' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{isPremiumChar ? '🔓' : '⏳'}</div>
        
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'white', marginBottom: '16px' }}>
          {isPremiumChar ? `Unlock ${character.name}!` : 'Time to Recharge!'}
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '30px', lineHeight: 1.6 }}>
          {isPremiumChar 
            ? `Get unlimited access to ${character.name} and their special learning missions about agents!` 
            : "You've used up your learning hours for today. Ready to continue your journey into the world of AI?"}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => onPurchase(isPremiumChar ? 'unlock' : 'hours')}
            style={{ background: '#f1c40f', color: '#111', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <CreditCard size={20} /> {isPremiumChar ? 'Unlock for $4.99' : 'Add 5 Hours for $9.99'}
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '1rem', cursor: 'pointer' }}
          >
            Maybe Later
          </button>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f1c40f', fontSize: '0.8rem' }}>
          <Sparkles size={14} /> <span>Educational content included with every purchase!</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
