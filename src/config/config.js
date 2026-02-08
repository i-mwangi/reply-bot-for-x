import dotenv from 'dotenv';

// Load .env.local and FORCE override any system environment variables
const envConfig = dotenv.config({ path: '.env.local' });
if (envConfig.parsed) {
  // Force override - set each env var even if it already exists
  Object.keys(envConfig.parsed).forEach(key => {
    process.env[key] = envConfig.parsed[key];
  });
}

export const config = {
  // API Keys
  replicateKey: process.env.REPLICATE_API_KEY,
  openaiKey: process.env.OPENAI_API_KEY || '', // Add this to .env.local
  
  // Daily limits
  maxCommentsPerDay: 100,
  
  // Timing (milliseconds)
  minWaitBetweenComments: 5 * 60 * 1000, // 5 minutes
  maxWaitBetweenComments: 15 * 60 * 1000, // 15 minutes
  typingDelayMin: 50,
  typingDelayMax: 150,
  
  // Post filtering
  minViews: 1000,
  maxComments: 100,
  minFollowers: 10000,
  
  // Keywords for targeting
  targetKeywords: ['leadership', 'controversial', 'CEO', 'startup', 'founder', 'business'],
  
  // Chrome profile path (Windows default - update if needed)
  chromeProfilePath: process.env.CHROME_PROFILE_PATH || 'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\User Data',
  
  // Storage
  commentedPostsFile: './commented-posts.json',
  logFile: './bot-log.json'
};
