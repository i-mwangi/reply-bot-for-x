import fs from 'fs';
import { config } from '../config/config.js';

export class Storage {
  static loadCommentedPosts() {
    try {
      if (fs.existsSync(config.commentedPostsFile)) {
        return JSON.parse(fs.readFileSync(config.commentedPostsFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading commented posts:', error.message);
    }
    return { posts: [], count: 0, lastReset: new Date().toISOString() };
  }

  static saveCommentedPost(postId, postText, comment) {
    const data = this.loadCommentedPosts();
    
    // Reset daily counter
    const lastReset = new Date(data.lastReset);
    const now = new Date();
    if (now.getDate() !== lastReset.getDate()) {
      data.count = 0;
      data.lastReset = now.toISOString();
    }

    data.posts.push({
      id: postId,
      text: postText.substring(0, 100),
      comment: comment,
      timestamp: now.toISOString()
    });
    data.count++;

    fs.writeFileSync(config.commentedPostsFile, JSON.stringify(data, null, 2));
    return data.count;
  }

  static hasCommented(postId) {
    const data = this.loadCommentedPosts();
    return data.posts.some(p => p.id === postId);
  }

  static getTodayCount() {
    const data = this.loadCommentedPosts();
    const lastReset = new Date(data.lastReset);
    const now = new Date();
    
    if (now.getDate() !== lastReset.getDate()) {
      return 0;
    }
    return data.count;
  }

  static log(message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      ...data
    };
    
    console.log(`📝 ${message}`, data);
    
    try {
      let logs = [];
      if (fs.existsSync(config.logFile)) {
        logs = JSON.parse(fs.readFileSync(config.logFile, 'utf8'));
      }
      logs.push(logEntry);
      
      // Keep only last 1000 entries
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      
      fs.writeFileSync(config.logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error writing log:', error.message);
    }
  }
}
