import { UltraContext } from 'ultracontext';
import { config } from '../config/config.js';

class UltraContextLogger {
  constructor() {
    this.uc = new UltraContext({ apiKey: process.env.ULTRACONTEXTAPI });
    this.contextId = null;
    this.sessionStartTime = new Date().toISOString();
  }

  async init() {
    try {
      // Only initialize if API key exists and is valid
      if (!process.env.ULTRACONTEXTAPI || process.env.ULTRACONTEXTAPI === 'your-ultracontext-api-key-here') {
        console.log('⚠️  UltraContext API key not configured, skipping...');
        return null;
      }
      
      // Create a new context for this bot session
      const ctx = await this.uc.create();
      this.contextId = ctx.id;
      
      // Add session start message
      await this.uc.append(this.contextId, {
        type: 'session_start',
        timestamp: this.sessionStartTime,
        config: {
          maxCommentsPerDay: config.maxCommentsPerDay,
          targetKeywords: config.targetKeywords
        }
      });
      
      console.log(`📊 UltraContext initialized: ${this.contextId}`);
      return this.contextId;
    } catch (error) {
      console.error('❌ Failed to initialize UltraContext:', error.message);
      console.log('⚠️  Continuing without UltraContext logging...');
      return null;
    }
  }

  async logComment(postData, comment, analysis) {
    if (!this.contextId) return;
    
    try {
      await this.uc.append(this.contextId, {
        type: 'comment',
        timestamp: new Date().toISOString(),
        post: {
          id: postData.postId,
          text: postData.postText,
          url: postData.postUrl
        },
        comment: comment,
        analysis: {
          topic: analysis.topic,
          vibe: analysis.vibe,
          worth_commenting: analysis.worth_commenting
        }
      });
    } catch (error) {
      console.error('❌ Failed to log comment to UltraContext:', error.message);
    }
  }

  async logEngagement(postData, action) {
    if (!this.contextId) return;
    
    try {
      await this.uc.append(this.contextId, {
        type: 'engagement',
        timestamp: new Date().toISOString(),
        action: action, // 'like' or 'retweet'
        post: {
          id: postData.postId,
          text: postData.postText,
          url: postData.postUrl
        }
      });
    } catch (error) {
      console.error('❌ Failed to log engagement to UltraContext:', error.message);
    }
  }

  async logError(error, context) {
    if (!this.contextId) return;
    
    try {
      await this.uc.append(this.contextId, {
        type: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        context: context
      });
    } catch (err) {
      console.error('❌ Failed to log error to UltraContext:', err.message);
    }
  }

  async logSessionEnd(stats) {
    if (!this.contextId) return;
    
    try {
      await this.uc.append(this.contextId, {
        type: 'session_end',
        timestamp: new Date().toISOString(),
        stats: stats,
        duration: Date.now() - new Date(this.sessionStartTime).getTime()
      });
    } catch (error) {
      console.error('❌ Failed to log session end to UltraContext:', error.message);
    }
  }

  async getHistory() {
    if (!this.contextId) return null;
    
    try {
      const { data, versions } = await this.uc.get(this.contextId, { history: true });
      return { data, versions };
    } catch (error) {
      console.error('❌ Failed to get history from UltraContext:', error.message);
      return null;
    }
  }
}

export { UltraContextLogger };
