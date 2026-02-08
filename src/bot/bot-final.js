import puppeteer from 'puppeteer-core';
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
    
    console.log('🔌 Connecting to your Chrome (should already be running)...');
    
    // Try to connect multiple times
    let connected = false;
    let attempts = 0;
    const maxAttempts = 15;
    
    while (!connected && attempts < maxAttempts) {
      try {
        this.browser = await puppeteer.connect({
          browserURL: 'http://localhost:9444',
          defaultViewport: null
        });
        connected = true;
        console.log('✅ Connected to your Chrome Profile 12!');
      } catch (error) {
        attempts++;
        if (attempts === 1) {
          console.log('⏳ Waiting for Chrome to start...');
        }
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!connected) {
      console.log('\n\n❌ Could not connect to Chrome!');
      console.log('Make sure Chrome is running with:');
      console.log('START-CHROME-PROFILE12.bat');
      throw new Error('Failed to connect to Chrome');
    }
    
    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();
    
    console.log('');
    Storage.log('Bot initialized');
  }

  async navigateToTwitterSearch() {
    console.log('🔍 Opening Twitter...');
    await this.page.goto('https://twitter.com', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we need to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('login') || currentUrl.includes('i/flow')) {
      console.log('');
      console.log('⚠️  You need to log in to Twitter in the Chrome window');
      console.log('⚠️  Waiting 60 seconds for you to log in...');
      console.log('');
      
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
    const searchQuery = config.targetKeywords.join(' OR ');
    const url = `https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=live`;
    
    console.log('🔍 Navigating to Twitter search...');
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
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
      return null;
    }
  }

  async commentOnPost(postElement, comment) {
    try {
      const replyButton = await postElement.$('[data-testid="reply"]');
      if (!replyButton) throw new Error('Reply button not found');

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
      await this.browser.disconnect();
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
