import { config } from '../config/config.js';

export class HumanBehavior {
  static randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async randomWait() {
    const wait = this.randomDelay(config.minWaitBetweenComments, config.maxWaitBetweenComments);
    console.log(`⏳ Waiting ${Math.floor(wait / 1000 / 60)} minutes before next comment...`);
    await new Promise(resolve => setTimeout(resolve, wait));
  }

  static async humanType(page, selector, text) {
    await page.click(selector);
    await page.waitForTimeout(this.randomDelay(300, 800));
    
    for (const char of text) {
      await page.keyboard.type(char, { 
        delay: this.randomDelay(config.typingDelayMin, config.typingDelayMax) 
      });
      
      // Random pauses (thinking)
      if (Math.random() < 0.1) {
        await page.waitForTimeout(this.randomDelay(500, 1500));
      }
    }
  }

  static async humanScroll(page) {
    const scrollAmount = this.randomDelay(300, 800);
    await page.evaluate((amount) => {
      window.scrollBy({
        top: amount,
        behavior: 'smooth'
      });
    }, scrollAmount);
    await page.waitForTimeout(this.randomDelay(1000, 3000));
  }

  static async humanMouseMove(page, x, y) {
    await page.mouse.move(x, y, { 
      steps: this.randomDelay(10, 30) 
    });
  }
}
