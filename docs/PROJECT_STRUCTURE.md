# Project Structure

```
ReplyX/
├── src/
│   ├── bot/
│   │   ├── bot-with-cookies.js    # Main bot (recommended)
│   │   ├── bot-selenium.js        # Selenium-based bot
│   │   ├── bot-new.js             # Puppeteer variant
│   │   ├── bot-final.js           # Remote debugging variant
│   │   └── bot.js                 # Original implementation
│   │
│   ├── config/
│   │   └── config.js              # Bot configuration
│   │
│   └── utils/
│       ├── ai-handler.js          # AI analysis & reply generation
│       ├── human-behavior.js      # Human-like delays & patterns
│       ├── storage.js             # Local data persistence
│       └── ultracontext-logger.js # UltraContext integration
│
├── scripts/
│   ├── view-history.js            # View UltraContext history
│   ├── SIMPLE-BOT.bat             # Windows launcher
│   ├── RUN-BOT.bat                # Alternative launcher
│   └── ...                        # Other utility scripts
│
├── docs/
│   ├── GET-COOKIES.md             # Cookie extraction guide
│   ├── SECURITY.md                # Security policy
│   └── PROJECT_STRUCTURE.md       # This file
│
├── .env.example                   # Environment variables template
├── twitter-cookies.example.json  # Cookie template
├── .gitignore                     # Git ignore rules
├── index.js                       # Main entry point
├── package.json                   # Dependencies & scripts
├── README.md                      # Main documentation
├── LICENSE                        # MIT License
└── tmp0rw_iho1.jpg               # Project logo

```

## File Descriptions

### Core Bot Files (`src/bot/`)

- **bot-with-cookies.js** ⭐ *Recommended*
  - Uses Puppeteer with cookie injection
  - Most reliable and feature-complete
  - Includes UltraContext logging
  - Human-like behavior patterns

- **bot-selenium.js**
  - Selenium WebDriver implementation
  - Alternative if Puppeteer has issues
  - Profile copying approach

- **bot-new.js**
  - Puppeteer with profile launch
  - Direct profile access attempt

- **bot-final.js**
  - Remote debugging connection
  - Requires manual Chrome launch

- **bot.js**
  - Original implementation
  - Legacy/reference code

### Configuration (`src/config/`)

- **config.js**
  - Daily comment limits
  - Timing configurations
  - Target keywords
  - API key loading

### Utilities (`src/utils/`)

- **ai-handler.js**
  - Replicate API integration
  - Post analysis with Llama 3
  - Reply generation
  - OpenAI fallback support

- **human-behavior.js**
  - Random delay generation
  - Typing speed simulation
  - Wait time calculations
  - Natural behavior patterns

- **storage.js**
  - Local JSON file management
  - Commented posts tracking
  - Daily count management
  - Activity logging

- **ultracontext-logger.js**
  - UltraContext API integration
  - Session management
  - Activity logging
  - History retrieval

### Scripts (`scripts/`)

- **view-history.js**
  - CLI tool to view UltraContext logs
  - Formatted output
  - Session analysis

- **Batch files (.bat)**
  - Windows convenience launchers
  - Chrome profile management
  - Bot execution helpers

### Documentation (`docs/`)

- **GET-COOKIES.md**
  - Step-by-step cookie extraction
  - DevTools guide
  - Security notes

- **SECURITY.md**
  - Security best practices
  - Vulnerability reporting
  - Data protection guidelines

- **PROJECT_STRUCTURE.md**
  - This file
  - Architecture overview
  - File descriptions

## Data Flow

```
1. User runs: npm start
2. index.js loads src/bot/bot-with-cookies.js
3. Bot initializes:
   - Loads config from src/config/config.js
   - Creates UltraContext session (src/utils/ultracontext-logger.js)
   - Launches Chrome with cookies
4. Main loop:
   - Finds posts on Twitter
   - Analyzes with AI (src/utils/ai-handler.js)
   - Generates reply (src/utils/ai-handler.js)
   - Posts comment with human delays (src/utils/human-behavior.js)
   - Logs to UltraContext (src/utils/ultracontext-logger.js)
   - Saves locally (src/utils/storage.js)
5. User views history: npm run history <context-id>
```

## Configuration Files

### `.env.local` (not in repo)
```env
REPLICATE_API_KEY=your_key
ULTRACONTEXTAPI=your_key
```

### `twitter-cookies.json` (not in repo)
```json
{
  "auth_token": "your_token",
  "ct0": "your_ct0"
}
```

### `commented-posts.json` (generated)
```json
{
  "2026-01-29": {
    "count": 10,
    "posts": ["post_id_1", "post_id_2", ...]
  }
}
```

### `bot-log.json` (generated)
```json
[
  {
    "timestamp": "2026-01-29T14:20:00.000Z",
    "action": "Comment posted",
    "data": {...}
  }
]
```

## Adding New Features

1. **New bot variant**: Add to `src/bot/`
2. **New utility**: Add to `src/utils/`
3. **New config option**: Update `src/config/config.js`
4. **New script**: Add to `scripts/`
5. **New documentation**: Add to `docs/`

## Best Practices

- Keep sensitive data out of `src/`
- Use relative imports
- Follow existing naming conventions
- Document new features
- Update this file when structure changes
