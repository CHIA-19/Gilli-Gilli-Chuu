export const AIProvider = {
  async getResponse(systemPrompt, userMessage, history = []) {
    const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
    const apiKey = import.meta.env.VITE_AI_API_KEY;

    if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
      console.warn('AI API Key not configured. Using fallback simulation.');
      return this.getFallback(userMessage);
    }

    try {
      if (provider === 'gemini') {
        return await this.fetchGemini(systemPrompt, userMessage, history, apiKey);
      } else if (provider === 'anthropic') {
        return await this.fetchAnthropic(systemPrompt, userMessage, history, apiKey);
      }
    } catch (error) {
      console.error('AI Request Failed:', error);
      return "Oops! My cartoon magic is fizzling out. Try again? 🌀";
    }
  },

  async fetchGemini(systemPrompt, userMessage, history, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Combine system prompt and history into contents
    const contents = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
      { role: 'model', parts: [{ text: "Understood. I will follow those instructions." }] },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure what to say to that!";
  },

  async fetchAnthropic(systemPrompt, userMessage, history, apiKey) {
    const url = 'https://api.anthropic.com/v1/messages';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true' // Only for prototyping
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    return data.content?.[0]?.text || "Something went wrong with the multiverse!";
  },

  getFallback(text) {
    return `[SIMULATED] That's interesting! You said: "${text}". Please add a real API key to .env to chat for real! ✨`;
  }
};
