import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Volume2, Gamepad2, Sparkles } from 'lucide-react';
import { AIProvider } from '../lib/AIProvider';
import { AgentSystem } from '../lib/AgentSystem';
import confetti from 'canvas-confetti';

export default function ChatWindow({ character, onOpenGame }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState('neutral');
  const scrollRef = useRef(null);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = character.id === 'peppa' ? 1.5 : character.id === 'ben10' ? 1.2 : 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported.');
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages([{ role: 'char', text: character.greeting || `¡Hola! I'm ${character.name}! Ready for an adventure? ✨`, id: Date.now() }]);
  }, [character]);

  const insertEmoji = (emoji) => {
    setInput(prev => prev + emoji);
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    // Use a small timeout to ensure state update before sending
    setTimeout(() => {
      document.getElementById('send-form-btn')?.click();
    }, 10);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const textToSend = input.trim();
    if (!textToSend || isTyping) return;
    
    setInput('');
    const newMessages = [...messages, { role: 'user', text: textToSend, id: Date.now() }];
    setMessages(newMessages);
    
    const currentMood = AgentSystem.analyzeMood(textToSend);
    setMood(currentMood);
    setIsTyping(true);
    
    try {
      // Call the real AI Provider
      const aiResponse = await AIProvider.getResponse(
        character.systemPrompt, 
        textToSend, 
        messages.filter(m => m.id !== messages[0].id) // Exclude greeting from history
      );

      setMessages(prev => [...prev, { role: 'char', text: aiResponse, id: Date.now() }]);
      speak(aiResponse);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
      AgentSystem.updateMission(character.id, 'chat');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Chat Header (Original Style) */}
      <div className="chat-header" style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: '2px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${character.color}`, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0, transition: 'border-color 0.5s', boxShadow: `0 0 20px ${character.color}, 0 0 40px rgba(0,0,0,0.3)` }}>
          <img src={character.image} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        </div>
        <div className="header-info">
          <div className="header-name" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: character.color, letterSpacing: '2px', transition: 'color 0.5s' }}>{character.name}</div>
          <div className="header-show" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{character.show}</div>
        </div>
        <div className="header-status" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#2ecc71' }}>
          <div className="status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71', animation: 'pulse-dot 2s infinite' }}></div> Online
        </div>
        <button onClick={() => onOpenGame(character.game)} style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <Gamepad2 size={14} /> Game
        </button>
      </div>

      {/* Messages (Original Style) */}
      <div className="messages" ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`msg-row ${m.role === 'user' ? 'user' : ''}`} style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div className="msg-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${character.color}`, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                {m.role === 'char' ? <img src={character.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div style={{ maxWidth: '70%' }}>
                <div className="bubble-sender" style={{ fontSize: '0.7rem', fontWeight: 800, color: m.role === 'char' ? character.color : '#aaa', marginBottom: '4px', textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.role === 'char' ? character.name : 'You'}</div>
                <div className={`bubble ${m.role === 'char' ? 'char-bubble' : 'user-bubble'}`} style={{ 
                  padding: '12px 18px', borderRadius: '20px', fontSize: '0.95rem', lineHeight: 1.5,
                  background: m.role === 'char' ? 'rgba(255,255,255,0.1)' : character.color,
                  color: m.role === 'char' ? 'white' : '#111',
                  border: m.role === 'char' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  borderBottomLeftRadius: m.role === 'char' ? '4px' : '20px',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '20px',
                  fontWeight: m.role === 'user' ? 700 : 400
                }}>
                  {m.text}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="typing-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <div className="msg-icon" style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${character.color}`, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={character.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="typing-bubble" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', borderBottomLeftRadius: '4px', padding: '14px 18px', display: 'flex', gap: '5px' }}>
                <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: character.color, animation: 'typing-dot 1.2s infinite' }}></div>
                <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: character.color, animation: 'typing-dot 1.2s infinite', animationDelay: '0.2s' }}></div>
                <div className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: character.color, animation: 'typing-dot 1.2s infinite', animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mood-banner" style={{ 
        margin: '0 20px 8px', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8rem', 
        display: mood !== 'neutral' ? 'block' : 'none', fontWeight: 700, animation: 'msgIn 0.3s ease',
        background: character.color, color: '#111'
      }}>
        Mood: {mood === 'happy' ? 'Feeling Great! ✨' : mood === 'angry' ? 'A Bit Grumpy... 😤' : ''}
      </div>

      {/* Quick Replies */}
      <div className="quick-replies" style={{ padding: '0 20px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {character.quickReplies?.map((reply, i) => (
          <button 
            key={i} onClick={() => handleQuickReply(reply)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 14px', color: 'rgba(255,255,255,0.8)', fontFamily: 'inherit', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.target.style.background = character.color; e.target.style.color = '#111'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.8)'; e.target.style.transform = 'scale(1)'; }}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Area (Original Style) */}
      <div className="input-area" style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.3)', borderTop: '2px solid rgba(255,255,255,0.08)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={startListening} style={{ background: 'none', border: 'none', color: isListening ? character.color : 'white', cursor: 'pointer' }}>
          <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
        </button>
        <div className="input-wrap" style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '30px', display: 'flex', alignItems: 'center', padding: '0 18px' }}>
          <div className="emoji-bar" style={{ display: 'flex', gap: '6px', marginRight: '10px' }}>
            {character.emojiBar?.map((emoji, i) => (
              <button 
                key={i} onClick={() => insertEmoji(emoji)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', padding: '4px', transition: 'transform 0.2s', opacity: 0.6 }}
                onMouseOver={(e) => { e.target.style.transform = 'scale(1.3)'; e.target.style.opacity = '1'; }}
                onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.opacity = '0.6'; }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ flex: 1, display: 'flex' }}>
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Say something..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', padding: '12px 0' }}
            />
          </form>
        </div>
        <button onClick={handleSend} id="send-form-btn" className="send-btn" style={{ width: '48px', height: '48px', borderRadius: '50%', background: character.color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#111' }}>
          ➤
        </button>
      </div>
    </div>
  );
}
