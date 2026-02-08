import { chromium } from 'playwright';
import { AIHandler } from './ai-handler.js';
import { HumanBehavior } from './human-behavior.js';
import { Storage } from './storage.js';
import { config } from './config.js';

class TwitterBot {
  constructor() {
    this.ai = new AIHandler();
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Starting Twitter AI Commenter...');
    console.log(`📊 Today's count: ${Storage.getTodayCount()}/${config.maxCommentsPerDay}`);
    
    // Use YOUR actual Chrome profile
    const profilePath = 'C:\\Users\\JUSTIN LORD\\AppData\\Local\\Google\\Chrome\\User Data';
    const profileName = 'Profile 1'; // Change this if your profile has a different name
    
    console.log('🌐 Launching YOUR Chrome profile...');
    console.log('⚠️  IMPORTANT: Close all Chrome windows first!');
    console.log('⏳ Waiting 5 seconds for you to close Chrome...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    this.browser = await chromium.launchPersistentContext(`${profilePath}\\${profileName}`, {
      headless: false,
      channel: 'chrome',
      viewport: null,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--start-maximized'
      ],
      ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=AutomationControlled']
    });

    this.page = this.browser.pages()[0] || await this.browser.newPage();
    
    // Aggressive anti-detection
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
      
      window.chrome = {
        runtime: {}
      };
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    Storage.log('Bot initialized');
  }

  async navigateToTwitterSearch() {
    const searchQuery = config.targetKeywords.join(' OR ');
    const url = `https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=live`;
    
    console.log('🔍 Navigating to Twitter search...');
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(3000);
  }

  async findPosts() {
    // Twitter's article elements contain tweets
    return await this.page.$$('article[data-testid="tweet"]');
  }

  async extractPostData(postElement) {
    try {
      const postText = await postElement.$eval('[data-testid="tweetText"]', el => el.innerText).catch(() => '');
      const postId = await postElement.evaluate(el => {
        const link = el.querySelector('a[href*="/status/"]');
        return link ? link.href.split('/status/')[1].split('?')[0] : null;
      });

      if (!postId || !postText) return null;

      // Take screenshot of the post
      const screenshot = await postElement.screenshot({ type: 'png' });
      const screenshotBase64 = screenshot.toString('base64');

      return { postId, postText, screenshotBase64, element: postElement };
    } catch (error) {
      console.error('Error extracting post data:', error.message);
      return null;
    }
  }

  async commentOnPost(postElement, comment) {
    try {
      // Find and click reply button
      const replyButton = await postElement.$('[data-testid="reply"]');
      if (!replyButton) {
        throw new Error('Reply button not found');
      }

      await replyButton.click();
      await this.page.waitForTimeout(HumanBehavior.randomDelay(1000, 2000));

      // Wait for compose box
      const composeBox = await this.page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 5000 });
      
      // Type with human-like behavior
      await HumanBehavior.humanType(this.page, '[data-testid="tweetTextarea_0"]', comment);
      await this.page.waitForTimeout(HumanBehavior.randomDelay(1000, 2000));

      // Click tweet button
      const tweetButton = await this.page.$('[data-testid="tweetButton"]');
      if (tweetButton) {
        await tweetButton.click();
        await this.page.waitForTimeout(2000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error commenting:', error.message);
      return false;
    }
  }

  async run() {
    await this.init();
    await this.navigateToTwitterSearch();

    let consecutiveErrors = 0;
    const maxErrors = 5;

    while (Storage.getTodayCount() < config.maxCommentsPerDay) {
      try {
        console.log(`\n📍 Looking for posts... (${Storage.getTodayCount()}/${config.maxCommentsPerDay})`);
        
        const posts = await this.findPosts();
        console.log(`Found ${posts.length} posts on screen`);

        for (const post of posts) {
          if (Storage.getTodayCount() >= config.maxCommentsPerDay) {
            console.log('🎯 Daily limit reached!');
            return;
          }

          const postData = await this.extractPostData(post);
          if (!postData) continue;

          // Skip if already commented
          if (Storage.hasCommented(postData.postId)) {
            console.log('⏭️  Already commented on this post');
            continue;
          }

          console.log(`\n📝 Analyzing post: "${postData.postText.substring(0, 80)}..."`);

          // Step 1: Analyze with cheap model
          const analysis = await this.ai.analyzePost(postData.screenshotBase64, postData.postText);
          
          if (!analysis.worth_commenting) {
            console.log('⏭️  Not worth commenting (topic/quality filter)');
            continue;
          }

          console.log(`✅ Worth commenting! Topic: ${analysis.topic}, Vibe: ${analysis.vibe}`);

          // Step 2: Generate reply with GPT-4
          const comment = await this.ai.generateReply(postData.postText, analysis);
          
          if (!comment) {
            console.log('❌ Failed to generate comment');
            continue;
          }

          console.log(`💬 Generated comment: "${comment}"`);

          // Step 3: Post the comment
          const success = await this.commentOnPost(postData.element, comment);

          if (success) {
            const count = Storage.saveCommentedPost(postData.postId, postData.postText, comment);
            console.log(`✅ Comment posted! (${count}/${config.maxCommentsPerDay})`);
            Storage.log('Comment posted', { postText: postData.postText.substring(0, 100), comment });
            
            consecutiveErrors = 0;

            // Human-like wait before next comment
            await HumanBehavior.randomWait();
          } else {
            console.log('❌ Failed to post comment');
            consecutiveErrors++;
          }

          // Safety: too many errors in a row
          if (consecutiveErrors >= maxErrors) {
            console.log('🛑 Too many consecutive errors. Stopping.');
            Storage.log('Stopped due to errors', { consecutiveErrors });
            return;
          }
        }

        // Scroll to load more posts
        console.log('📜 Scrolling for more posts...');
        await HumanBehavior.humanScroll(this.page);
        await this.page.waitForTimeout(HumanBehavior.randomDelay(2000, 4000));

      } catch (error) {
        console.error('❌ Error in main loop:', error.message);
        consecutiveErrors++;
        
        if (consecutiveErrors >= maxErrors) {
          console.log('🛑 Too many errors. Stopping.');
          Storage.log('Stopped due to errors', { error: error.message });
          break;
        }
        
        await this.page.waitForTimeout(5000);
      }
    }

    console.log('\n🎉 Daily goal reached! Shutting down...');
    Storage.log('Daily goal reached');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the bot
const bot = new TwitterBot();

bot.run()
  .then(() => {
    console.log('✅ Bot finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    Storage.log('Fatal error', { error: error.message, stack: error.stack });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await bot.close();
  process.exit(0);
});
