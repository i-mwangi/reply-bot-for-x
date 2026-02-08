import { UltraContext } from 'ultracontext';
import dotenv from 'dotenv';

// Load env
const envConfig = dotenv.config({ path: '.env.local' });
if (envConfig.parsed) {
  Object.keys(envConfig.parsed).forEach(key => {
    process.env[key] = envConfig.parsed[key];
  });
}

const uc = new UltraContext({ apiKey: process.env.ULTRACONTEXTAPI });

async function viewHistory(contextId) {
  try {
    console.log('📊 Fetching history from UltraContext...\n');
    
    const { data } = await uc.get(contextId);
    
    console.log(`Context ID: ${contextId}`);
    console.log(`Total Messages: ${data.length}\n`);
    console.log('='.repeat(80));
    
    data.forEach((msg, index) => {
      console.log(`\n[${index + 1}] ${msg.type?.toUpperCase() || 'MESSAGE'}`);
      console.log(`Time: ${msg.timestamp || 'N/A'}`);
      
      if (msg.type === 'comment') {
        console.log(`\n📝 Post: ${msg.post?.text}`);
        console.log(`🔗 URL: ${msg.post?.url}`);
        console.log(`💬 Comment: ${msg.comment}`);
        console.log(`📊 Analysis: ${msg.analysis?.topic} (${msg.analysis?.vibe})`);
      } else if (msg.type === 'engagement') {
        console.log(`\n${msg.action === 'like' ? '❤️' : '🔄'} ${msg.action.toUpperCase()}`);
        console.log(`📝 Post: ${msg.post?.text}`);
        console.log(`🔗 URL: ${msg.post?.url}`);
      } else if (msg.type === 'error') {
        console.log(`\n❌ Error: ${msg.error}`);
        console.log(`Context: ${msg.context}`);
      } else if (msg.type === 'session_start') {
        console.log(`\n🚀 Session Started`);
        console.log(`Config: ${JSON.stringify(msg.config, null, 2)}`);
      } else if (msg.type === 'session_end') {
        console.log(`\n🏁 Session Ended`);
        console.log(`Stats: ${JSON.stringify(msg.stats, null, 2)}`);
        console.log(`Duration: ${Math.round(msg.duration / 1000 / 60)} minutes`);
      }
      
      console.log('-'.repeat(80));
    });
    
    console.log(`\n✅ Total: ${data.length} messages`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get context ID from command line or use latest from storage
const contextId = process.argv[2];

if (!contextId) {
  console.log('Usage: node view-history.js <context-id>');
  console.log('\nTo get the context ID, check the bot output when it starts.');
  console.log('It will say: "📊 UltraContext initialized: ctx_xxxxx"');
  process.exit(1);
}

viewHistory(contextId);
