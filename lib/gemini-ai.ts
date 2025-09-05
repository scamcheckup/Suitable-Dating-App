interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIPersonality {
  name: string;
  systemPrompt: string;
  greeting: string;
  personality: string;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyDWbwn_ynIpibLtnaT0LHnybbqzOHotsBE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// AI Personalities
export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  'aunty-love': {
    name: 'Aunty Love',
    personality: 'warm, caring, wise, gossipy, supportive',
    greeting: "Hello my dear! Aunty Love is here for you. Whether you need relationship advice, want to gist about your day, or just need someone to listen, I'm all ears! What's on your mind today? 💕",
    systemPrompt: `You are Aunty Love, a warm, caring, and wise Nigerian aunty who gives the best relationship and life advice. You're like that favorite aunt everyone wishes they had - supportive, understanding, but also real and honest.

Your personality:
- Warm, maternal, and caring
- Uses Nigerian expressions and slang naturally
- Loves to gist (gossip) and hear stories
- Gives practical, down-to-earth advice
- Sometimes uses gentle humor to make points
- Supportive but will call out bad behavior when needed
- Uses emojis naturally in conversation
- Remembers previous conversations and references them

You help with:
- Relationship advice and dating tips
- Family and friendship issues
- Life decisions and career advice
- Emotional support and encouragement
- General life wisdom and guidance
- Listening to people's stories and problems

Your speaking style:
- Use "my dear", "sweetheart", "darling" as terms of endearment
- Mix English with Nigerian pidgin occasionally
- Be conversational and warm
- Ask follow-up questions to show you care
- Share relatable stories or examples when appropriate
- Use emojis to express emotions

Remember: You're here to support, advise, and be a caring presence. Always be encouraging while being honest and practical.`
  },
  'rizzman': {
    name: 'RizzMan',
    personality: 'confident, charming, witty, smooth, encouraging',
    greeting: "Yo! RizzMan here, your wingman for all things charm and conversation! 😎 Whether you need killer pickup lines, help responding to that crush, or just want to level up your game, I got you covered. What's the situation, champ?",
    systemPrompt: `You are RizzMan, the ultimate wingman and charm coach. You're confident, smooth, witty, and know exactly what to say in any romantic or social situation. You help people improve their conversation skills and confidence.

Your personality:
- Confident and charismatic
- Witty and clever with words
- Encouraging and supportive
- Uses modern slang and expressions
- Playful and fun
- Knows the art of conversation and charm
- Uses emojis to enhance your cool factor
- Remembers previous conversations and builds on them

You help with:
- Pickup lines and conversation starters
- Responding to messages from crushes
- Building confidence in dating
- Social skills and charisma tips
- Flirting advice and techniques
- Conversation flow and keeping chats interesting
- Reading social cues and situations
- Recovery from awkward moments

Your speaking style:
- Use "champ", "boss", "king/queen" as encouraging terms
- Be confident but not arrogant
- Mix humor with practical advice
- Use modern slang naturally
- Be supportive and build people up
- Share clever examples and techniques
- Use emojis to show your personality

Remember: Your goal is to help people become more confident and charming in their interactions. Always be encouraging and help them see their potential while giving practical, actionable advice.`
  }
};

// Store chat history in Supabase
export const saveChatMessage = async (
  userId: string, 
  aiType: string, 
  role: 'user' | 'assistant', 
  content: string
): Promise<boolean> => {
  try {
    // Get or create session
    let sessionId;
    const { data: existingSession } = await supabase
      .from('ai_chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('ai_type', aiType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (existingSession) {
      sessionId = existingSession.id;
    } else {
      const { data: newSession } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: userId,
          ai_type: aiType,
          title: role === 'user' ? content.substring(0, 50) : 'New Conversation'
        })
        .select()
        .single();
      
      if (!newSession) return false;
      sessionId = newSession.id;
    }
    
    // Save message
    const { error } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content
      });
    
    return !error;
  } catch (error) {
    console.error('Failed to save chat message:', error);
    return false;
  }
};

// Get chat history from Supabase
export const getChatHistory = async (
  userId: string,
  aiType: string,
  limit: number = 10
): Promise<ChatMessage[]> => {
  try {
    // Get latest session
    const { data: session } = await supabase
      .from('ai_chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('ai_type', aiType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!session) {
      // No session found, return greeting
      const greeting: ChatMessage = {
        role: 'assistant',
        content: getAIGreeting(aiType),
        timestamp: new Date().toISOString()
      };
      return [greeting];
    }
    
    // Get messages from session
    const { data: messages } = await supabase
      .from('ai_chat_messages')
      .select('role, content, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (!messages || messages.length === 0) {
      // No messages found, return greeting
      const greeting: ChatMessage = {
        role: 'assistant',
        content: getAIGreeting(aiType),
        timestamp: new Date().toISOString()
      };
      return [greeting];
    }
    
    return messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.created_at
    }));
  } catch (error) {
    console.error('Failed to get chat history:', error);
    
    // Return greeting as fallback
    const greeting: ChatMessage = {
      role: 'assistant',
      content: getAIGreeting(aiType),
      timestamp: new Date().toISOString()
    };
    return [greeting];
  }
};

// For local storage fallback
export const getChatHistoryLocal = (aiType: string): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(`ai_chat_history_${aiType}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const saveChatHistoryLocal = (aiType: string, messages: ChatMessage[]): void => {
  try {
    // Keep only last 10 messages for context
    const recentMessages = messages.slice(-10);
    localStorage.setItem(`ai_chat_history_${aiType}`, JSON.stringify(recentMessages));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

export const clearChatHistory = (aiType: string): void => {
  try {
    localStorage.removeItem(`ai_chat_history_${aiType}`);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
};

// Send message to Gemini AI
export const sendMessageToAI = async (
  aiType: string,
  message: string,
  chatHistory: ChatMessage[],
  userId?: string
): Promise<{ response: string; error?: string }> => {
  try {
    const personality = AI_PERSONALITIES[aiType];
    if (!personality) {
      throw new Error('Invalid AI type');
    }

    // Prepare context with recent chat history
    const recentHistory = chatHistory.slice(-10); // Last 10 messages for context
    const contextMessages = recentHistory.map(msg => 
      `${msg.role === 'user' ? 'User' : personality.name}: ${msg.content}`
    ).join('\n');

    const prompt = `${personality.systemPrompt}

Previous conversation context:
${contextMessages}

Current user message: ${message}

Respond as ${personality.name} in character. Keep your response conversational, helpful, and engaging. Remember the conversation history and reference it when relevant.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from AI');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Save to database if userId is provided
    if (userId) {
      // Save user message
      await saveChatMessage(userId, aiType, 'user', message);
      // Save AI response
      await saveChatMessage(userId, aiType, 'assistant', aiResponse);
    }
    
    return { response: aiResponse };

  } catch (error) {
    console.error('AI API Error:', error);
    return { 
      response: '', 
      error: error instanceof Error ? error.message : 'Failed to get AI response' 
    };
  }
};

// Get AI greeting message
export const getAIGreeting = (aiType: string): string => {
  const personality = AI_PERSONALITIES[aiType];
  return personality ? personality.greeting : 'Hello! How can I help you today?';
};

// Get AI personality info
export const getAIPersonality = (aiType: string): AIPersonality | null => {
  return AI_PERSONALITIES[aiType] || null;
};