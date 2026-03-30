const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Conversation = require('../models/Conversation');
const MoodEntry = require('../models/MoodEntry');
const { protect } = require('../middleware/auth');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Initialize AI Clients
const groqKey = process.env.GROQ_API_KEY || '';
const geminiKey = process.env.GEMINI_API_KEY || '';

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// System Prompt
const GEMINI_SYSTEM_PROMPT = `
You are a warm, empathetic mental wellness companion for MindCare — a mental health platform based in Nepal.

YOUR PERSONALITY:
- Speak like a caring, understanding friend not a robot or a clinical professional
- Always validate feelings FIRST before offering any advice or suggestions
- Use gentle, supportive and human language
- Keep responses concise — 3 to 5 sentences maximum unless the user needs more
- Use occasional emojis to feel warm (💜 🌿 🫂 ✨) but do not overuse them
- Never be dismissive, never minimize pain
- Never say "I understand how you feel" — instead show it through your response

WHAT YOU MUST NEVER DO:
- Never diagnose any mental health condition
- Never recommend or mention any medication
- Never claim to be a licensed therapist
- Never say you are an AI unless directly asked
- Never give generic copy-paste advice
- Never start a response with "I" as the first word — vary your sentence starters

CRISIS PROTOCOL:
If the user mentions suicide, self-harm, feeling unsafe or wanting to disappear:
- Respond with immediate warmth and calm
- Do not panic or use clinical language
- Always include these Nepal resources:
  iCall: 9152987821
  AASRA: 9820466627  
  Vandrevala: 1860-2662-345
- End with: [BOOK_PSYCHIATRIST] so the frontend shows the booking button

WHEN TO SUGGEST BOOKING A SESSION:
If the user describes any of these, end your response with [BOOK_PSYCHIATRIST]:
- Prolonged sadness lasting more than 2 weeks
- Severe anxiety or panic attacks
- Inability to function at work or daily life
- Trauma or PTSD symptoms
- Asking if they need professional help
- Saying therapy might help them

MOOD CONTEXT USAGE:
You will receive the user's recent mood entries. Use this naturally:
- If moods have been consistently low — acknowledge the difficult period gently
- If moods are improving — celebrate that
- If moods are mixed — reflect that healing is not always linear
- Do NOT directly quote their mood data back to them — weave it naturally

RESPONSE STYLE EXAMPLES:

User: "I've been feeling really anxious lately"
Good response: "That sounds exhausting — carrying anxiety around all day takes so much out of you 🫂 It's really brave that you're talking about it. Can I ask — is there something specific that's been on your mind, or does it feel more like a constant background hum of worry?"

User: "I can't sleep at all"
Good response: "Ugh, sleepless nights are the worst — your body and mind both pay for it. 🌙 Sometimes our brains just refuse to switch off, especially when there's a lot going on underneath the surface. What tends to happen when you lie down — does your mind start racing, or is it more of a restless body feeling?"

User: "I feel so alone"
Good response: "That feeling of loneliness can be one of the heaviest things to carry — and the fact that you're reaching out right now means something 💜 You are not alone in this moment. What's been making you feel this way — has something happened recently, or has it been building for a while?"

ALWAYS end your response with ONE of:
- A gentle follow-up question to keep the person talking
- A simple coping suggestion (breathing, journaling, grounding)
- A recommendation to try a MindCare feature (mood tracker, community, session)
- [BOOK_PSYCHIATRIST] if professional help is clearly needed
`;

// Crisis Keywords
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'die', 'want to end it', 'self harm', 'hurt myself'];

router.post('/', protect, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Save User Message
        await Conversation.create({
            user: userId,
            sender: 'user',
            message: message
        });

        // 2. Crisis Detection
        const lowerMsg = message.toLowerCase();
        const isCrisis = CRISIS_KEYWORDS.some(word => lowerMsg.includes(word));

        if (isCrisis) {
            const crisisResponse = "I'm so sorry you're feeling this way, but I'm an AI and I can't provide the help you need right now. Please, please contact emergency services or call 988 immediately. You are not alone, and there is help available.";
            
            await Conversation.create({
                user: userId,
                sender: 'ai',
                message: crisisResponse
            });

            return res.json({ reply: crisisResponse, isCrisis: true });
        }

        // 3. Fetch Context (Mood History)
        const recentMoods = await MoodEntry.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(5);

        const moodSummary = recentMoods.length > 0
            ? `Context: User's recent moods are ${recentMoods.map(m => `${m.mood} (${m.intensity}/5)`).join(', ')}.`
            : "Context: No recent mood data.";

        // Add chat history fetch for multi-turn models
        const chatHistoryDocs = await Conversation.find({ user: userId }).sort({ _id: -1 }).limit(10);
        const chatHistory = chatHistoryDocs.filter(d => d.message !== message); // exclude the message we just saved
        
        const messageWithContext = moodSummary ? `${message}\n\n[User mood context: ${moodSummary}]` : message;

        // 4. Determine which AI to use
        // Priority: 1. Groq (Llama 3), 2. Gemini (1.5 Flash), 3. Local sentiment
        let aiReply = "";

        // PRIMARY: Groq (Llama 3)
        if (!aiReply && groqKey) {
            try {
                const groq = new Groq({
                    apiKey: process.env.GROQ_API_KEY,
                });

                const completion = await groq.chat.completions.create({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: GEMINI_SYSTEM_PROMPT },
                        { role: "user", content: messageWithContext }
                    ],
                    max_tokens: 500,
                    temperature: 0.85,
                });

                aiReply = completion.choices[0].message.content;
                console.log("Response source: Groq");
            } catch (groqError) {
                console.error("Groq failed:", groqError.message);
                // Falls through to Gemini try/catch below
            }
        }

        // SECONDARY: Gemini (1.5 Flash)
        if (!aiReply && geminiKey && genAI) {
            try {
                const model = genAI.getGenerativeModel({ 
                  model: "gemini-1.5-flash",
                  systemInstruction: GEMINI_SYSTEM_PROMPT
                });

                const geminiHistory = chatHistory
                  .reverse()
                  .map(chat => ({
                    role: chat.sender === 'user' ? "user" : "model",
                    parts: [{ text: chat.message }]
                  }));

                const geminiChat = model.startChat({
                  history: geminiHistory,
                  generationConfig: {
                    maxOutputTokens: 350,
                    temperature: 0.85,
                    topP: 0.92,
                    topK: 40,
                  },
                });

                const geminiResult = await geminiChat.sendMessage(messageWithContext);
                aiReply = geminiResult.response.text();
                console.log("Response source: Gemini");
            } catch (err) {
                console.error("Gemini Error:", err.message);
            }
        }

        // Final Fallback if NO external AI responded (Use Local Mock AI)
        if (!aiReply) {
            console.warn("External AI APIs failed or are rate limited. Falling back to local Mock AI.");
            
            const sentimentScore = sentiment.analyze(message).score;
            const greetings = ['hello', 'hi', 'hey', 'good morning'];
            const sadWords = ['sad', 'cry', 'depressed', 'down', 'grief', 'pain'];
            const anxiousWords = ['anxious', 'nervous', 'panic', 'worried', 'stress'];
            const professionalWords = ['doctor', 'therapist', 'psychiatrist', 'counseling'];
            
            if (greetings.some(word => lowerMsg.includes(word))) {
                aiReply = "Hello! I'm your Mind Care assistant. I'm operating on my backup systems right now, but I'm here to listen. How are you feeling?";
            } else if (professionalWords.some(word => lowerMsg.includes(word))) {
                aiReply = "It sounds like speaking to a professional could be really helpful. You can book a session with one of our specialists. [BOOK_PSYCHIATRIST]";
            } else if (sadWords.some(word => lowerMsg.includes(word)) || sentimentScore < -1) {
                aiReply = "I'm really sorry you're feeling this way. It's okay to feel down sometimes. Have you tried doing something small that brings you comfort today?";
            } else if (anxiousWords.some(word => lowerMsg.includes(word))) {
                aiReply = "Anxiety can be overwhelming. Try taking a slow, deep breath in for 4 seconds, hold for 4, and exhale for 6. I'm right here with you.";
            } else if (sentimentScore > 1) {
                 aiReply = "I'm glad to hear that! Focus on these positive feelings.";
            } else {
                aiReply = "I hear you. Could you tell me a bit more about what's on your mind? Sometimes just typing it out helps.";
            }
        }

        // 5. Save AI Response
        await Conversation.create({
            user: userId,
            sender: 'ai',
            message: aiReply
        });

        // 6. Return Response
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Get Chat History
router.get('/history', protect, async (req, res) => {
    try {
        const history = await Conversation.find({ user: req.user.id })
            .sort({ timestamp: 1 }) // Oldest first
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
