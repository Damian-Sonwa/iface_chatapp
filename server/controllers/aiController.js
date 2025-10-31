const Message = require('../models/Message');
const Summary = require('../models/Summary');
const Room = require('../models/Room');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY not found. AI features will be disabled.');
}

/**
 * POST /api/ai/summarize
 * Summarize recent messages in a room using OpenAI
 */
const summarizeRoom = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured. OPENAI_API_KEY is missing.' });
    }

    const { roomId } = req.params;
    const { messageCount = 50 } = req.body;
    const userId = req.userId;

    // Verify room exists and user is a member
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.members.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch recent messages
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(messageCount))
      .lean();

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages to summarize' });
    }

    // Reverse to get chronological order
    messages.reverse();

    // Compose prompt
    const messagesText = messages
      .map(m => `${m.sender?.username || 'Unknown'}: ${m.content}`)
      .join('\n');

    const prompt = `Summarize the following chat conversation in a concise way. Highlight key topics, decisions, and important information.\n\nConversation:\n${messagesText}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a concise summarizer. Provide a brief, clear summary of chat conversations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const summaryText = completion.choices[0].message.content;

    // Save summary to database
    const summary = await Summary.create({
      roomId,
      requestedBy: userId,
      summary: summaryText,
      messageRange: {
        from: messages[0]?.createdAt,
        to: messages[messages.length - 1]?.createdAt,
        count: messages.length
      },
      metadata: {
        model: 'gpt-3.5-turbo',
        tokensUsed: completion.usage?.total_tokens || 0
      }
    });

    console.log(`📝 AI Summary generated for room ${roomId} by user ${userId}`);

    res.json({
      summary: summaryText,
      summaryId: summary._id,
      messageCount: messages.length,
      createdAt: summary.createdAt
    });
  } catch (error) {
    console.error('AI Summarize error:', error);
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
};

/**
 * POST /api/ai/suggest-replies
 * Generate 3 suggested replies for a given message
 */
const suggestReplies = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured. OPENAI_API_KEY is missing.' });
    }

    const { messageText, context } = req.body;
    const userId = req.userId;

    if (!messageText || typeof messageText !== 'string') {
      return res.status(400).json({ error: 'messageText is required' });
    }

    // Compose prompt
    const contextPrompt = context 
      ? `Context: ${context}\n\nMessage: ${messageText}`
      : `Message: ${messageText}`;

    const prompt = `Given the following message, suggest 3 short, natural reply options. Each reply should be concise (maximum 2 sentences). Format as a JSON array of strings.\n\n${contextPrompt}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that suggests natural, concise replies to messages. Return ONLY a JSON array of 3 reply strings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON array from response
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleaned);
    } catch (parseError) {
      // Fallback: try to extract array-like format
      const arrayMatch = responseText.match(/\[.*\]/s);
      if (arrayMatch) {
        suggestions = JSON.parse(arrayMatch[0]);
      } else {
        // Last resort: split by newlines and take first 3
        suggestions = responseText
          .split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 3)
          .map(line => line.replace(/^\d+[\.\)]\s*/, '').replace(/["']/g, '').trim());
      }
    }

    // Ensure we have exactly 3 suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      suggestions = [
        'Thanks for sharing!',
        'That\'s interesting.',
        'I see what you mean.'
      ];
    } else if (suggestions.length < 3) {
      suggestions = suggestions.concat(
        Array(3 - suggestions.length).fill('Got it!')
      );
    }

    suggestions = suggestions.slice(0, 3);

    console.log(`💡 AI Reply suggestions generated for user ${userId}`);

    res.json({ suggestions });
  } catch (error) {
    console.error('AI Suggest Replies error:', error);
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to generate suggestions', details: error.message });
  }
};

module.exports = {
  summarizeRoom,
  suggestReplies
};

/**
 * POST /api/ai/assistant
 * General-purpose assistant chat
 */
module.exports.assistantChat = async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured. OPENAI_API_KEY is missing.' });
    }

    const { messages } = req.body; // [{ role: 'user'|'assistant'|'system', content }]
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 400,
      temperature: 0.7
    });

    res.json({ reply: completion.choices[0].message });
  } catch (error) {
    console.error('AI Assistant error:', error);
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to process assistant request', details: error.message });
  }
};


