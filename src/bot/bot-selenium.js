import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { execSync } from 'child_process';
import chromedriver from 'chromedriver';
import { AIHandler } from './ai-handler.js';
import { HumanBehavior } from './human-behavior.js';
import { Storage } from './storage.js';
import { config } from './config.js';

// Set ChromeDriver path
process.env.PATH = `${chromedriver.path};${process.env.PATH}`;

class TwitterBot {
  constructor() {
    this.ai = new AIHandler();
    this.driver = null;
  }

  async init() {
    console.log('🚀 Starting Twitter AI Commenter...');
    console.log(`📊 Today's count: ${Storage.getTodayCount()}/${config.maxCommentsPerDay}`);
    
    console.log('🌐 Setting up Chrome with YOUR REAL profile...');
    
    // Kill existing Chrome
    try {
      console.log('🔪 Closing any running Chrome instances...');
      execSync('taskkill /F /IM chrome.exe', { stdio: 'ignore' });
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {}

    // Use the REAL Chrome User Data directory with Profile 12
    const userDataDir = 'C:\\Users\\JUSTIN LORD\\AppData\\Local\\Google\\Chrome\\User Data';
    const profileDir = 'Profile 12';
    
    console.log('✅ Using YOUR real Chrome profile (Profile 12)...');

    const options = new chrome.Options();
    options.addArguments(`--user-data-dir=${userDataDir}`);
    options.addArguments(`--profile-directory=${profileDir}`);
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--disable-infobars');
    options.addArguments('--start-maximized');
    options.addArguments('--remote-debugging-port=9223');
    options.excludeSwitches(['enable-automation', 'enable-logging']);
    options.setUserPreferences({
      'credentials_enable_service': false,
      'profile.password_manager_enabled': false
    });

    console.log('🚀 Launching Chrome with YOUR REAL profile...');
    
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log('⏳ Waiting for Chrome to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Remove webdriver flag
    await this.driver.executeScript('Object.defineProperty(navigator, "webdriver", {get: () => undefined})');
    
    console.log('✅ Chrome launched with YOUR REAL profile!');
    Storage.log('Bot initialized');
  }

  async navigateToTwitterSearch() {
    console.log('🔍 Opening Twitter...');
    await this.driver.get('https://twitter.com');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if we need to login
    const currentUrl = await this.driver.getCurrentUrl();
    if (currentUrl.includes('login') || currentUrl.includes('i/flow')) {
      console.log('');
      console.log('⚠️  ========================================');
      console.log('⚠️  PLEASE LOG IN TO TWITTER NOW');
      console.log('⚠️  ========================================');
      console.log('⚠️  The bot will wait for you to log in...');
      console.log('⚠️  Once logged in, the bot will continue automatically');
      console.log('');
      
      // Wait for login to complete (check every 5 seconds)
      let loggedIn = false;
      while (!loggedIn) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const url = await this.driver.getCurrentUrl();
        if (url.includes('twitter.com/home') || url.includes('x.com/home')) {
          loggedIn = true;
          console.log('✅ Login detected! Continuing...');
        } else {
          process.stdout.write('.');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const searchQuery = config.targetKeywords.join(' OR ');
    const url = `https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=live`;
    
    console.log('🔍 Navigating to Twitter search...');
    await this.driver.get(url);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  async findPosts() {
    return await this.driver.findElements(By.css('article[data-testid="tweet"]'));
  }

  async extractPostData(postElement) {
    try {
      const postText = await postElement.findElement(By.css('[data-testid="tweetText"]')).getText().catch(() => '');
      const linkElement = await postElement.findElement(By.css('a[href*="/status/"]')).catch(() => null);
      
      if (!linkElement) return null;
      
      const href = await linkElement.getAttribute('href');
      const postId = href.split('/status/')[1]?.split('?')[0];

      if (!postId || !postText) return null;

      const screenshot = await postElement.takeScreenshot();
      const screenshotBase64 = screenshot;

      return { postId, postText, screenshotBase64, element: postElement };
    } catch (error) {
      return null;
    }
  }

  async commentOnPost(postElement, comment) {
    try {
      const replyButton = await postElement.findElement(By.css('[data-testid="reply"]'));
      await replyButton.click();
      await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(1000, 2000)));

      const composeBox = await this.driver.wait(until.elementLocated(By.css('[data-testid="tweetTextarea_0"]')), 5000);
      await composeBox.click();
      await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(300, 800)));
      
      // Type with human delays
      for (const char of comment) {
        await composeBox.sendKeys(char);
        await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(config.typingDelayMin, config.typingDelayMax)));
        
        if (Math.random() < 0.1) {
          await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(500, 1500)));
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, HumanBehavior.randomDelay(1000, 2000)));

      const tweetButton = await this.driver.findElement(By.css('[data-testid="tweetButton"]'));
      await tweetButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
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
        await this.driver.executeScript('window.scrollBy({ top: 500, behavior: "smooth" })');
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
    if (this.driver) {
      await this.driver.quit();
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
