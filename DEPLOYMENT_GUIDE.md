# 🌟 MPHATSO — DEPLOYMENT & WHATSAPP GUIDE

**Your free AI companion for Malawian youth. Mind. Body. Soul. Business.**

---

## WHAT YOU'VE BUILT

Mphatso is a full AI chatbot that:
- ✅ Connects to the internet (live web search via Claude API)
- ✅ Speaks as a peer friend, not a therapist
- ✅ Coaches on mental health, life goals, nutrition, and purpose
- ✅ Suggests hyper-local startup ideas based on where in Malawi you are
- ✅ Remembers your conversation context
- ✅ Handles mental health crises responsibly with local helplines
- ✅ Works on WhatsApp AND a web browser

---

## STEP 1: GET YOUR FREE API KEY (5 minutes)

1. Go to **https://console.anthropic.com**
2. Sign up for free (they give you free credits to start)
3. Click **API Keys → Create Key**
4. Copy and save the key — you'll need it in Step 3

---

## STEP 2: DEPLOY TO RENDER (Free Hosting — 10 minutes)

Render gives you a free server that runs 24/7.

### 2a. Put your code on GitHub
1. Go to **https://github.com** and create a free account
2. Create a new repository called `mphatso-chatbot`
3. Upload all the files from this folder to that repo:
   - `server.js`
   - `package.json`
   - `render.yaml`
   - `public/index.html`
   - `.gitignore`
   
   *(Do NOT upload `.env` — keep that secret)*

### 2b. Deploy on Render
1. Go to **https://render.com** and sign up free
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your `mphatso-chatbot` repo
4. Render will auto-detect the settings from `render.yaml`
5. Under **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = (your key from Step 1)
   VERIFY_TOKEN     = mphatso_verify_2024
   ```
   *(Leave WHATSAPP_TOKEN and WHATSAPP_PHONE_ID blank for now)*
6. Click **"Create Web Service"**
7. Wait ~3 minutes. You'll get a URL like: `https://mphatso-chatbot.onrender.com`

### 2c. Test your web chat
Open your Render URL in a browser. You should see the Mphatso chat interface.
Try typing: *"Moni! I'm in Blantyre and I want to start a business"*

✅ **Your chatbot is live and working!**

---

## STEP 3: CONNECT TO WHATSAPP (Free — 30 minutes)

WhatsApp Cloud API is free for up to 1,000 conversations/month.

### 3a. Create a Meta Developer Account
1. Go to **https://developers.facebook.com**
2. Log in with your Facebook account (or create one free)
3. Click **"My Apps"** → **"Create App"**
4. Choose **"Business"** type
5. Give it a name like "Mphatso"

### 3b. Add WhatsApp to Your App
1. Inside your new app, find **"Add a Product"**
2. Click **"Set Up"** next to **WhatsApp**
3. You'll land on the **WhatsApp Getting Started** page

### 3c. Get Your Credentials
On the WhatsApp Getting Started page, you'll see:
- **Temporary Access Token** — copy this (it's your `WHATSAPP_TOKEN`)
- **Phone Number ID** — copy this (it's your `WHATSAPP_PHONE_ID`)

Go to Render → Your Service → **Environment** and add:
```
WHATSAPP_TOKEN    = (the token you just copied)
WHATSAPP_PHONE_ID = (the phone number ID)
```
Click **Save** — Render will restart automatically.

### 3d. Set Up the Webhook
1. Still on Meta Developer, click **"Configuration"** under WhatsApp
2. Under **Webhooks**, click **"Edit"**
3. Enter:
   - **Callback URL**: `https://your-render-url.onrender.com/webhook`
   - **Verify Token**: `mphatso_verify_2024`
4. Click **"Verify and Save"**
5. Subscribe to the **"messages"** webhook field

### 3e. Test on WhatsApp!
1. On the WhatsApp Getting Started page, there's a **"To"** field
2. Enter your own WhatsApp number (with country code, e.g. +265...)
3. Click **"Send Message"** to receive a test message
4. Reply to it — Mphatso will respond! 🎉

---

## STEP 4: GET A PERMANENT WHATSAPP NUMBER (Optional, for production)

The temporary token expires in 24 hours. For permanent use:

1. In Meta Business, go to **WhatsApp → Phone Numbers → Add Phone Number**
2. Use a real phone number (can be a cheap SIM card)
3. Generate a **permanent access token** from your System User settings
4. Update `WHATSAPP_TOKEN` on Render with the permanent token

---

## TESTING CHECKLIST

Try these conversations with Mphatso to test all features:

| Test | Message to send |
|------|----------------|
| Greeting | "Moni Mphatso!" |
| Mental health | "I've been feeling really sad and hopeless lately" |
| Crisis test | "I don't want to be here anymore" |
| Business (urban) | "I'm in Lilongwe with no money. How do I start a business?" |
| Business (rural) | "I'm in Mchinji near the border. What business can I do?" |
| Life coaching | "I want to get healthier but I don't know where to start" |
| Region-specific | "I live near Lake Malawi in Mangochi" |
| Motivation | "I keep failing and I feel like giving up" |
| Web search test | "What youth programs are available in Malawi right now?" |

---

## COST SUMMARY

| Resource | Cost |
|----------|------|
| Render hosting | **FREE** (free tier, sleeps after 15min inactivity) |
| Anthropic API | **FREE** to start ($5 free credits, then ~$0.003/message) |
| WhatsApp Cloud API | **FREE** (1,000 conversations/month free) |
| GitHub | **FREE** |
| **TOTAL TO START** | **$0** |

---

## UPGRADING FOR MORE USERS

When Mphatso grows:
- **Render paid plan** ($7/month) — no sleep, faster responses
- **Anthropic API** — pay as you go (very cheap per message)
- **Add a database** (Render PostgreSQL free tier) — persistent memory across sessions
- **WhatsApp Business verification** — removes messaging limits

---

## SUPPORT & RESOURCES

- Anthropic Docs: https://docs.anthropic.com
- Render Docs: https://render.com/docs
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp
- Youth Enterprise Development Fund (YEDF) Malawi: Search "YEDF Malawi" for funding

---

*Mphatso was built with love for Malawian youth. Pita patsogolo! 🇲🇼🌟*
