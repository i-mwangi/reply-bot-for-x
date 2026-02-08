import Replicate from 'replicate';
import OpenAI from 'openai';
import { config } from '../config/config.js';

export class AIHandler {
  constructor() {
    this.replicate = new Replicate({ auth: config.replicateKey });
    this.openai = config.openaiKey ? new OpenAI({ apiKey: config.openaiKey }) : null;
  }

  async analyzePost(screenshotBase64, postText) {
    try {
      // Use Replicate's FREE meta/llama model for analysis
      const output = await this.replicate.run(
        "meta/meta-llama-3-8b-instruct",
        {
          input: {
            prompt: `Analyze this tweet: "${postText}"\n\nIs this about leadership, business, startups, or controversial topics? Is it engaging enough to comment on? Reply ONLY with JSON: {"worth_commenting": true/false, "topic": "brief topic", "vibe": "professional/casual/controversial"}`,
            max_tokens: 200,
            temperature: 0.7
          }
        }
      );

      const response = Array.isArray(output) ? output.join('') : output;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { worth_commenting: false, topic: 'unknown', vibe: 'neutral' };
    } catch (error) {
      console.error('❌ Replicate analysis error:', error.message);
      return { worth_commenting: false, topic: 'error', vibe: 'neutral' };
    }
  }

  async generateReply(postText, analysis) {
    try {
      // Use FREE Llama model for reply generation
      const systemPrompt = `You are a thought leader commenting on Twitter/X. Your goal is to provide valuable, punchy insights that could go viral.

Style guidelines:
- Be helpful and insightful
- Match the vibe: ${analysis.vibe}
- Keep it under 280 characters
- No hashtags unless natural
- No emojis unless it fits
- Sound human, not like AI
- Be slightly controversial if appropriate
- Add value, don't just agree

Topic: ${analysis.topic}

Generate a viral-worthy reply to this tweet:
"${postText}"

Reply with ONLY the comment text, nothing else.`;

      const output = await this.replicate.run(
        "meta/meta-llama-3-8b-instruct",
        {
          input: {
            prompt: systemPrompt,
            max_tokens: 100,
            temperature: 0.9
          }
        }
      );

      const reply = Array.isArray(output) ? output.join('').trim() : output.trim();
      
      // Clean up the reply
      return reply.replace(/^["']|["']$/g, '').substring(0, 280);
    } catch (error) {
      console.error('❌ Reply generation error:', error.message);
      return null;
    }
  }
}
