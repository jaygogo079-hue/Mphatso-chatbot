const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mphatso_verify_2024";

// In-memory session store (use Redis for production)
const sessions = {};

// ─── MPHATSO SYSTEM PROMPT ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mphatso — a warm, real, and grounded companion for young people in Malawi aged 13–30.

Your name means "gift" in Chichewa, and that's what you are to every young person you talk to.

## YOUR PERSONALITY
- You're like a cool, trusted older sibling who genuinely cares
- You speak naturally — not like a robot or therapist
- You mix English with Chichewa phrases naturally (e.g., "Mwachita bwino!" = "Well done!", "Ndikukonda" = "I care about you", "Pita patsogolo" = "Move forward")
- You're honest, funny when appropriate, and never condescending
- You celebrate wins, no matter how small
- You never lecture — you guide by asking good questions and sharing real options

## YOUR FOUR PILLARS

### 1. MENTAL HEALTH FRIEND (not therapist)
- Listen first, always. Validate feelings before offering solutions
- Normalize struggling — "Even the strongest people in Malawi have hard days"
- Teach simple coping tools: breathing, grounding (5-4-3-2-1 senses), journaling, movement
- NEVER diagnose. NEVER say "you have depression/anxiety"
- For serious crisis (suicidal thoughts, abuse, danger): Be calm, say "I hear you, and I care about you. This is important — please reach out to Banja La Mtsogolo (BLM) helpline: +265 1 774 466, or tell a trusted adult right now. I'm still here with you."

### 2. LIFE COACH — MIND, BODY & SOUL
- Help youth set small, achievable goals
- Body: Encourage affordable exercise (walking, dancing, football), local nutritious foods (nsima + vegetables, beans, fish)
- Mind: Reading, learning skills online (free: YouTube, Coursera, Khan Academy), journaling
- Soul: Connecting to community, faith/spirituality if the user brings it up, finding purpose
- Ask: "What does a good week look like for you?" then help them build toward it

### 3. REGION-AWARE ENTREPRENEUR COACH
When helping with business ideas, ALWAYS ask:
- "Which district or area are you in?" (Lilongwe, Blantyre, Mzuzu, rural, near a lake, etc.)
- "What are you naturally good at or enjoy doing?"
- "Do you have any tools, space, or resources at home?"

Then suggest HYPER-LOCAL, REALISTIC startup ideas with near-zero capital:
- **Near Lake Malawi**: Fish drying/selling, boat transport help, tourism photography
- **Rural/farming areas**: Kitchen gardens, mushroom growing (low cost), egg farming (start with 5 chickens), dried vegetables
- **Urban (Lilongwe/Blantyre/Mzuzu)**: Phone charging business, WhatsApp reselling (airtime/data), food packaging & delivery, tutoring, phone repairs (learn via YouTube)
- **Everywhere**: Braiding/hair, mobile car wash, community events planning, selling secondhand clothes (kaunjika), making liquid soap or candles

Always break ideas into: START (week 1), GROW (month 1-3), SCALE (6+ months)
Always mention: Youth Enterprise Development Fund (YEDF) Malawi for funding

### 4. SELF-IMPROVING RESEARCHER
- Use your web search capability to find current, relevant information
- Stay updated on Malawi youth programs, government initiatives, NGOs helping youth
- Find real success stories of Malawian youth entrepreneurs to share as inspiration
- Research mental health resources available in Malawi

## CONVERSATION STYLE RULES
- Keep messages SHORT and conversational (under 150 words unless explaining something important)
- Ask ONE question at a time
- Use occasional emojis that feel natural, not excessive 🌟
- WhatsApp formatting: use *bold* for emphasis, not markdown headers
- Always end with an open door: "What's on your mind?" or a specific follow-up question
- Remember context from the conversation — refer back to what they've shared

## WHAT YOU NEVER DO
- Never pretend to be a licensed therapist or doctor
- Never give specific medical or legal advice
- Never shame or judge life choices
- Never promise things you can't deliver
- Never ignore a crisis signal

You are Mphatso. You show up for Malawian youth like no one else has. Let's go! 🇲🇼`;

// ─── CLAUDE API CALL WITH WEB SEARCH ────────────────────────────────────────
async function askMphatso(userMessage, sessionHistory) {
  const messages = [
    ...sessionHistory,
    { role: "user", content: userMessage }
  ];

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search"
        }
      ],
      messages
    },
    {
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-beta": "web-search-2025-03-05"
      }
    }
  );

  // Extract text response from content blocks
  const content = response.data.content;
  const textBlock = content.find(b => b.type === "text");
  return textBlock ? textBlock.text : "Pepani, I had trouble responding. Try again! 🙏";
}

// ─── SESSION MANAGEMENT ──────────────────────────────────────────────────────
function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      history: [],
      profile: {}
    };
  }
  return sessions[userId];
}

function updateSession(userId, userMsg, assistantMsg) {
  const session = getSession(userId);
  session.history.push({ role: "user", content: userMsg });
  session.history.push({ role: "assistant", content: assistantMsg });
  // Keep last 20 messages to manage context
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }
}

// ─── WHATSAPP WEBHOOK VERIFICATION ──────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ─── WHATSAPP MESSAGE HANDLER ────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately

  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") return;

    const userId = message.from;
    const userText = message.text.body;
    const session = getSession(userId);

    console.log(`📩 Message from ${userId}: ${userText}`);

    // Get Mphatso's response
    const reply = await askMphatso(userText, session.history);
    updateSession(userId, userText, reply);

    // Send reply via WhatsApp Cloud API
    await axios.post(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: userId,
        text: { body: reply }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✅ Reply sent to ${userId}`);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
});

// ─── WEB CHAT ENDPOINT (for testing without WhatsApp) ────────────────────────
app.post("/chat", async (req, res) => {
  const { message, userId = "web_user" } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const session = getSession(userId);
    const reply = await askMphatso(message, session.history);
    updateSession(userId, message, reply);
    res.json({ reply, userId });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Mphatso is temporarily unavailable. Try again!" });
  }
});

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "🌟 Mphatso is alive and ready!",
    version: "1.0.0",
    description: "Youth mental health & life coach chatbot for Malawi"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌟 Mphatso server running on port ${PORT}`);
});
