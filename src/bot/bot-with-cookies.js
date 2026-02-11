import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { AIHandler } from '../utils/ai-handler.js';
import { HumanBehavior } from '../utils/human-behavior.js';
import { Storage } from '../utils/storage.js';
import { config } from '../config/config.js';
import { UltraContextLogger } from '../utils/ultracontext-logger.js';

class TwitterBot {
  constructor() {
    this.ai = new AIHandler();
    this.logger = new UltraContextLogger();
    this.browser = null;
    this.page = null;
    this.lastRefreshTime = Date.now();
    this.refreshInterval = 10 * 60 * 1000; // Refresh every 10 minutes
  }

  async init() {
    console.log('🚀 Starting Twitter AI Commenter...');
    console.log(`📊 Today's count: ${Storage.getTodayCount()}/${config.maxCommentsPerDay}`);
    
    // Initialize UltraContext logging
    await this.logger.init();
    
    console.log('🌐 Launching Chrome...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      userDataDir: './bot-profile-clean',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      defaultViewport: null,
      protocolTimeout: 180000
    });

    const pages = await this.browser.pages();
    this.page = pages[0] || await this.browser.newPage();
    
    // Set longer default timeout
    this.page.setDefaultNavigationTimeout(120000);
    this.page.setDefaultTimeout(120000);
    
    // Go to Twitter first to set cookies
    console.log('🍪 Loading your Twitter cookies...');
    await this.page.goto('https://twitter.com', { waitUntil: 'domcontentloaded', timeout: 120000 });
    
    try {
      const cookies = JSON.parse(readFileSync('./twitter-cookies.json', 'utf8'));
      
      // Set cookies for both twitter.com and x.com
      const cookiesToSet = [
        {
          name: 'auth_token',
          value: cookies.auth_token,
          domain: '.twitter.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        },
        {
          name: 'ct0',
          value: cookies.ct0,
          domain: '.twitter.com',
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax'
        },
        {
          name: 'auth_token',
          value: cookies.auth_token,
          domain: '.x.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        },
        {
          name: 'ct0',
          value: cookies.ct0,
          domain: '.x.com',
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax'
        }
      ];
      
      await this.page.setCookie(...cookiesToSet);
      
      console.log('✅ Cookies injected for twitter.com and x.com! Reloading...');
      await this.page.reload({ waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log('⚠️  Error loading cookies:', error.message);
      console.log('⚠️  You\'ll need to log in manually.');
    }
    
    Storage.log('Bot initialized');
  }

  async navigateToTwitterSearch() {
    const searchQuery = config.targetKeywords.join(' OR ');
    const url = `https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=live`;
    
    console.log('🔍 Navigating to Twitter search...');
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    } catch (error) {
      console.log('⚠️  Navigation timeout, but page might have loaded. Continuing...');
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if logged in by looking for the compose tweet button or profile
    const currentUrl = this.page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('login') || currentUrl.includes('i/flow/login')) {
      console.log('');
      console.log('❌ NOT LOGGED IN!');
      console.log('❌ The cookies might be expired or invalid.');
      console.log('❌ Check the Chrome window - if you see a login page, get fresh cookies.');
      console.log('');
      
      // Don't throw error, let user log in manually
      console.log('⏳ Waiting 60 seconds for you to log in manually in the Chrome window...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      // Try navigating again
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log('✅ On Twitter search page!');
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

      return { 
        postId, 
        postText, 
        postUrl: `https://twitter.com/i/status/${postId}`,
        screenshotBase64, 
        element: postElement 
      };
    } catch (error) {
      return null;
    }
  }

  async commentOnPost(postElement, comment) {
    try {
      // Randomly like the post first (70% chance)
      if (Math.random() < 0.7) {
        try {
          const likeButton = await postElement.$('[data-testid="like"]');
          if (likeButton) {
            await likeButton.click();
            console.log('❤️  Liked the post');
            await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(500, 1500)));
          }
        } catch (e) {
          // Already liked or button not found, continue
        }
      }

      // Randomly retweet (20% chance)
      if (Math.random() < 0.2) {
        try {
          const retweetButton = await postElement.$('[data-testid="retweet"]');
          if (retweetButton) {
            await retweetButton.click();
            await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(500, 1000)));
            
            // Click the "Retweet" option (not quote tweet)
            const retweetConfirm = await this.page.$('[data-testid="retweetConfirm"]');
            if (retweetConfirm) {
              await retweetConfirm.click();
              console.log('🔄 Retweeted the post');
              await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(500, 1500)));
            }
          }
        } catch (e) {
          // Already retweeted or button not found, continue
        }
      }

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
        // Check if it's time to refresh the page for fresh content
        const timeSinceRefresh = Date.now() - this.lastRefreshTime;
        if (timeSinceRefresh > this.refreshInterval) {
          console.log('🔄 Refreshing page for fresh content...');
          await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
          await new Promise(resolve => setTimeout(resolve, 5000));
          this.lastRefreshTime = Date.now();
          console.log('✅ Page refreshed!');
        }

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

          // Sometimes just like/retweet without commenting (30% chance)
          if (Math.random() < 0.3) {
            console.log('👀 Just engaging without commenting...');
            
            if (Math.random() < 0.8) {
              try {
                const likeButton = await postData.element.$('[data-testid="like"]');
                if (likeButton) {
                  await likeButton.click();
                  console.log('❤️  Liked');
                  await this.logger.logEngagement(postData, 'like');
                  await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(1000, 2000)));
                }
              } catch (e) {}
            }
            
            if (Math.random() < 0.3) {
              try {
                const retweetButton = await postData.element.$('[data-testid="retweet"]');
                if (retweetButton) {
                  await retweetButton.click();
                  await new Promise(resolve => setTimeout(resolve, 500));
                  const retweetConfirm = await this.page.$('[data-testid="retweetConfirm"]');
                  if (retweetConfirm) {
                    await retweetConfirm.click();
                    console.log('🔄 Retweeted');
                    await this.logger.logEngagement(postData, 'retweet');
                    await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(1000, 2000)));
                  }
                }
              } catch (e) {}
            }
            
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
            
            // Log to UltraContext
            await this.logger.logComment(postData, comment, analysis);
            
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
        await this.logger.logError(error, 'main_loop');
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
    
    // Log session end
    await this.logger.logSessionEnd({
      totalComments: Storage.getTodayCount(),
      goal: config.maxCommentsPerDay
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const bot = new TwitterBot();

bot.run()
  .then(async () => {
    console.log('✅ Bot finished successfully');
    await bot.logger.logSessionEnd({
      totalComments: Storage.getTodayCount(),
      status: 'completed'
    });
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('💥 Fatal error:', error);
    Storage.log('Fatal error', { error: error.message, stack: error.stack });
    await bot.logger.logError(error, 'fatal');
    await bot.logger.logSessionEnd({
      totalComments: Storage.getTodayCount(),
      status: 'error'
    });
    process.exit(1);
  });

process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  await bot.close();
  process.exit(0);
});
