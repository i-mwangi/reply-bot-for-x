<div align="center">
  <img src="tmp0rw_iho1.jpg" alt="Vibey Logo" width="200"/>
  
  # Vibey
  
  ### AI-Powered Twitter Engagement Automation
  
  *Build authentic engagement at scale with intelligent, context-aware replies*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
  
</div>

---

## 🚀 Overview

Vibey is an intelligent Twitter automation bot that generates high-quality, contextually relevant replies to tweets in your target niche. Unlike traditional bots, Vibey uses advanced AI to analyze posts, understand context, and craft authentic responses that add value to conversations.

**Key Features:**
- 🧠 **AI-Powered Analysis** - Uses Llama 3 to understand tweet context and sentiment
- 💬 **Natural Replies** - Generates unique, human-like comments that match the conversation vibe
- 🎯 **Smart Targeting** - Focuses on leadership, business, and controversial topics
- 🔒 **Secure Session Management** - Uses your real Twitter cookies for authentic engagement
- 📊 **Complete Activity Tracking** - Every action logged to UltraContext for full transparency
- 🤖 **Human-Like Behavior** - Random delays, likes, and retweets to avoid detection
- ⚡ **Rate Limiting** - Built-in safeguards to prevent account suspension

---

## 🎯 Why UltraContext Integration is Critical

**Without UltraContext, you're flying blind.** Here's why it's essential:

### 📊 Complete Activity Tracking
Every comment, like, and retweet is logged with:
- Full post text and URL
- Your generated comment
- AI analysis (topic, vibe, reasoning)
- Timestamps for every action
- Error logs for debugging

### 🔍 Performance Analytics
Track what's working:
- Which topics get the most engagement
- Comment quality over time
- Success/failure rates
- Session statistics

### 🛡️ 100% Secure & Private
- **End-to-end encryption** - Your data is encrypted in transit and at rest
- **No data sharing** - UltraContext never sells or shares your data
- **Full ownership** - You own all your data, export anytime
- **Automatic versioning** - Every change is tracked, nothing is ever lost
- **Time travel** - Roll back to any point in history

### 📈 Continuous Improvement
With UltraContext, you can:
- Analyze which comments perform best
- Identify patterns in successful engagement
- Refine your targeting strategy
- A/B test different comment styles
- Export data for external analysis

**Example UltraContext Output:**
```json
{
  "type": "comment",
  "timestamp": "2026-01-29T14:21:52.590Z",
  "post": {
    "id": "2016879142646559051",
    "text": "Leadership isn't about being in charge. It's about taking care of those in your charge.",
    "url": "https://twitter.com/i/status/2016879142646559051"
  },
  "comment": "This is the difference between managers and leaders. True leadership is servant leadership - putting your team first and empowering them to succeed.",
  "analysis": {
    "topic": "leadership",
    "vibe": "professional",
    "worth_commenting": true
  }
}
```

---

## 📋 Prerequisites

- **Node.js** v18.0.0 or higher
- **Chrome** browser installed
- **Twitter account** (logged in on Chrome Profile)
- **Replicate API key** (for AI analysis) - [Get one here](https://replicate.com)
- **UltraContext API key** (for activity tracking) - [Get one here](https://ultracontext.ai)

---

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/i-mwangi/reply-bot-for-x.git
   cd reply-bot-for-x
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   REPLICATE_API_KEY=your_replicate_api_key_here
   ULTRACONTEXTAPI=your_ultracontext_api_key_here
   ```

4. **Set up Twitter cookies**
   
   a. Open Chrome with your Twitter account logged in
   
   b. Go to https://twitter.com
   
   c. Press `F12` to open DevTools
   
   d. Go to **Application** tab → **Cookies** → **https://twitter.com**
   
   e. Find and copy these cookie values:
      - `auth_token`
      - `ct0`
   
   f. Create `twitter-cookies.json`:
   ```bash
   cp twitter-cookies.example.json twitter-cookies.json
   ```
   
   g. Edit `twitter-cookies.json` and paste your cookie values:
   ```json
   {
     "auth_token": "your_auth_token_value",
     "ct0": "your_ct0_value"
   }
   ```

---

## 🚀 Usage

### Start the Bot

```bash
node bot-with-cookies.js
```

The bot will:
1. Initialize UltraContext session
2. Launch Chrome with your Twitter session
3. Navigate to your target search query
4. Start analyzing and commenting on posts

### View Activity History

```bash
node view-history.js <context-id>
```

The context ID is displayed when the bot starts:
```
📊 UltraContext initialized: ctx_abc123xyz
```

---

## ⚙️ Configuration

Edit `config.js` to customize behavior:

```javascript
export const config = {
  // Daily limits
  maxCommentsPerDay: 100,
  
  // Timing (milliseconds)
  minWaitBetweenComments: 5 * 60 * 1000,  // 5 minutes
  maxWaitBetweenComments: 15 * 60 * 1000, // 15 minutes
  
  // Typing speed
  typingDelayMin: 50,
  typingDelayMax: 150,
  
  // Target keywords
  targetKeywords: [
    'leadership',
    'controversial',
    'CEO',
    'startup',
    'founder',
    'business'
  ]
};
```

---

## 🛡️ Safety Guardrails

### Built-in Protections

1. **Rate Limiting**
   - Maximum 100 comments per day
   - 5-15 minute delays between comments
   - Random engagement patterns (likes, retweets)

2. **Human-Like Behavior**
   - Variable typing speed (50-150ms per character)
   - Random pauses while typing
   - 70% chance to like posts
   - 20% chance to retweet posts
   - 30% chance to engage without commenting

3. **Quality Filters**
   - AI analyzes post relevance before commenting
   - Only comments on target topics
   - Skips low-quality or spam posts

4. **Session Management**
   - Uses real browser profile (not headless)
   - Authentic cookies and fingerprints
   - Disabled automation detection flags

### ⚠️ What to Avoid

**DO NOT:**
- ❌ Run the bot 24/7 without breaks
- ❌ Comment more than 100 times per day
- ❌ Use on multiple accounts simultaneously
- ❌ Comment on the same users repeatedly
- ❌ Use aggressive or spammy keywords
- ❌ Ignore Twitter's Terms of Service
- ❌ Run without UltraContext (you'll lose all tracking)

**DO:**
- ✅ Start with 20-30 comments/day for the first week
- ✅ Run for 2-3 hours per day maximum
- ✅ Take weekends off (humans rest!)
- ✅ Manually engage with some posts too
- ✅ Monitor your UltraContext dashboard daily
- ✅ Review generated comments for quality
- ✅ Adjust keywords based on performance

---

## 📊 Understanding the Data

### UltraContext Dashboard

Your UltraContext dashboard shows:

**Session Overview:**
- Total comments posted
- Engagement rate (likes, retweets)
- Success/failure ratio
- Session duration

**Individual Actions:**
- Post text and URL
- Your comment
- AI analysis reasoning
- Timestamp
- Engagement type (comment, like, retweet)

**Error Tracking:**
- Failed actions
- Error messages
- Context for debugging

### Local Storage

The bot also maintains local JSON files:
- `commented-posts.json` - List of post IDs you've commented on
- `bot-log.json` - Local activity log

---

## 🔒 Security Best Practices

1. **Never commit sensitive files**
   - `.env.local` is in `.gitignore`
   - `twitter-cookies.json` is in `.gitignore`
   - Always use example files for sharing

2. **Rotate credentials regularly**
   - Update Twitter cookies monthly
   - Regenerate API keys if compromised

3. **Monitor for suspicious activity**
   - Check UltraContext for unusual patterns (bot might comment low quaility - depends on your system prompt)
   - Watch for Twitter warnings or rate limits (Don't worry about this too much, you won't get ban unless you want to act like a jamesbond doing 100 comments in minutes)

4. **Use a dedicated Twitter account**
   - Don't use your main personal account (You can still use your own account for personal braniding, just keep in mind to run the bot in limit mentioned above unless you're using a lots of accounts with IP address rotation, which works if you already done it)
   - Create a professional engagement account

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This tool is for educational and research purposes. Users are responsible for complying with Twitter's Terms of Service and applicable laws. The authors are not responsible for any misuse or account suspensions resulting from the use of this software.

**Use responsibly and ethically.**

---

## 🙏 Acknowledgments

- [UltraContext](https://ultracontext.ai) - For providing the best context management API
- [Replicate](https://replicate.com) - For AI model hosting
- [Puppeteer](https://pptr.dev/) - For browser automation
- The open-source community

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/i-mwangi/reply-bot-for-x/issues)
- **Discussions**: [GitHub Discussions](https://github.com/i-mwangi/reply-bot-for-x/discussions)
- **Email**: mwangihenry336@gmail.com

---

<div align="center">
  
  **Built with ❤️ for authentic Twitter engagement**
  
  [⭐ Star this repo](https://github.com/i-mwangi/reply-bot-for-x) if you find it useful!
  
</div>
