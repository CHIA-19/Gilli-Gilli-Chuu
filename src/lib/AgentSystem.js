export const AgentSystem = {
  // Memory Management
  saveUserPref: (key, value) => {
    const prefs = JSON.parse(localStorage.getItem('gili_prefs') || '{}');
    prefs[key] = value;
    localStorage.setItem('gili_prefs', JSON.stringify(prefs));
  },

  getUserPref: (key) => {
    const prefs = JSON.parse(localStorage.getItem('gili_prefs') || '{}');
    return prefs[key];
  },

  // Hours & Monetization Logic
  getHoursBalance: () => {
    const balance = localStorage.getItem('gili_hours');
    if (balance === null) {
      localStorage.setItem('gili_hours', '5.0'); // Default 5 hours
      return 5.0;
    }
    return parseFloat(balance);
  },

  deductMinutes: (mins) => {
    let balance = AgentSystem.getHoursBalance();
    balance = Math.max(0, balance - (mins / 60));
    localStorage.setItem('gili_hours', balance.toFixed(2));
    return balance;
  },

  isCharacterUnlocked: (char) => {
    if (char.tier === 'free') return true;
    const unlocked = JSON.parse(localStorage.getItem('gili_unlocked') || '[]');
    return unlocked.includes(char.id);
  },

  unlockCharacter: (charId) => {
    const unlocked = JSON.parse(localStorage.getItem('gili_unlocked') || '[]');
    if (!unlocked.includes(charId)) {
      unlocked.push(charId);
      localStorage.setItem('gili_unlocked', JSON.stringify(unlocked));
    }
  },

  // Mission Tracking
  updateMission: (charId, type) => {
    const missions = JSON.parse(localStorage.getItem('gili_missions') || '{}');
    if (!missions[charId]) missions[charId] = { chats: 0, games: 0, badges: [] };
    
    if (type === 'chat') missions[charId].chats += 1;
    if (type === 'game') missions[charId].games += 1;

    // Award badges based on Agent Concepts
    if (missions[charId].chats >= 3 && !missions[charId].badges.includes('Agent Beginner')) {
      missions[charId].badges.push('Agent Beginner');
      return { awarded: 'Agent Beginner Badge! 🏅', meta: missions[charId] };
    }
    
    localStorage.setItem('gili_missions', JSON.stringify(missions));
    return { awarded: null, meta: missions[charId] };
  },

  // Safety Filter
  isSafe: (text) => {
    const badWords = ['badword1', 'badword2']; // Placeholder
    return !badWords.some(word => text.toLowerCase().includes(word));
  },

  // Mood Analysis
  analyzeMood: (text) => {
    const happy = ['happy', 'love', 'yay', 'cool', 'awesome', 'great', 'wow'];
    const angry = ['angry', 'hate', 'bad', 'stupid', 'stop', 'no'];
    const textLower = text.toLowerCase();
    
    if (happy.some(w => textLower.includes(w))) return 'happy';
    if (angry.some(w => textLower.includes(w))) return 'angry';
    return 'neutral';
  }
};
