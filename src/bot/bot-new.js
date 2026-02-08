import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { execSync } from 'child_process';
import { AIHandler } from './ai-handler.js';
import { HumanBehavior } from './human-behavior.js';
import { Storage } from './storage.js';
import { config } from './config.js';

puppeteer.use(StealthPlugin());

class TwitterBot {
  constructor() {
    this.ai = new AIHandler();
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Starting Twitter AI Commenter...');
    console.log(`📊 Today's count: ${Storage.getTodayCount()}/${config.maxCommentsPerDay}`);
    
    console.log('🌐 Launching YOUR Chrome profile...');
    
    // Kill existing Chrome instances
    try {
      execSync('taskkill /F /IM chrome.exe', { stdio: 'ignore' });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      // Chrome wasn't running, that's fine
    }

    // Launch Chrome with YOUR profile using Puppeteer
    this.browser = await puppeteer.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      userDataDir: 'C:\\Users\\JUSTIN LORD\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 12',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--start-maximized'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      defaultViewport: null
    });

    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();
    
    console.log('✅ Chrome launched with YOUR profile!');
    Storage.log('Bot initialized');
  }

  async navigateToTwitterSearch() {
    const searchQuery = config.targetKeywords.join(' OR ');
    const url = `https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=live`;
    
    console.log('🔍 Navigating to Twitter search...');
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  async findPosts() {
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
      const replyButton = await postElement.$('[data-testid="reply"]');
      if (!replyButton) {
        throw new Error('Reply button not found');
      }

      await replyButton.click();
      await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(1000, 2000)));

      const composeBox = await this.page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 5000 });
      
      await composeBox.click();
      await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(300, 800)));
      
      for (const char of comment) {
        await this.page.keyboard.type(char, { 
          delay: HumanBehavior.randomDelay(config.typingDelayMin, config.typingDelayMax) 
        });
        
        if (Math.random() < 0.1) {
          await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(500, 1500)));
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(1000, 2000)));

      const tweetButton = await this.page.$('[data-testid="tweetButton"]');
      if (tweetButton) {
        await tweetButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
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

          if (Storage.hasCommented(postData.postId)) {
            console.log('⏭️  Already commented on this post');
            continue;
          }

          console.log(`\n📝 Analyzing post: "${postData.postText.substring(0, 80)}..."`);

          const analysis = await this.ai.analyzePost(postData.screenshotBase64, postData.postText);
          
          if (!analysis.worth_commenting) {
            console.log('⏭️  Not worth commenting (topic/quality filter)');
            continue;
          }

          console.log(`✅ Worth commenting! Topic: ${analysis.topic}, Vibe: ${analysis.vibe}`);

          const comment = await this.ai.generateReply(postData.postText, analysis);
          
          if (!comment) {
            console.log('❌ Failed to generate comment');
            continue;
          }

          console.log(`💬 Generated comment: "${comment}"`);

          const success = await this.commentOnPost(postData.element, comment);

          if (success) {
            const count = Storage.saveCommentedPost(postData.postId, postData.postText, comment);
            console.log(`✅ Comment posted! (${count}/${config.maxCommentsPerDay})`);
            Storage.log('Comment posted', { postText: postData.postText.substring(0, 100), comment });
            
            consecutiveErrors = 0;
            await HumanBehavior.randomWait();
          } else {
            console.log('❌ Failed to post comment');
            consecutiveErrors++;
          }

          if (consecutiveErrors >= maxErrors) {
            console.log('🛑 Too many consecutive errors. Stopping.');
            Storage.log('Stopped due to errors', { consecutiveErrors });
            return;
          }
        }

        console.log('📜 Scrolling for more posts...');
        await this.page.evaluate(() => {
          window.scrollBy({ top: 500, behavior: 'smooth' });
        });
        await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(2000, 4000)));

      } catch (error) {
        console.error('❌ Error in main loop:', error.message);
        consecutiveErrors++;
        
        if (consecutiveErrors >= maxErrors) {
          console.log('🛑 Too many errors. Stopping.');
          Storage.log('Stopped due to errors', { error: error.message });
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
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

process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await bot.close();
  process.exit(0);
});
