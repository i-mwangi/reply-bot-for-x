import Replicate from 'replicate';
import OpenAI from 'openai';
import { config } from '../config/config.js';

export class AIHandler {
  constructor() {
    this.replicate = new Replicate({ auth: config.replicateKey });
    this.openai = config.openaiKey ? new OpenAI({ 
      apiKey: config.openaiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/i-mwangi/reply-bot-for-x',
        'X-Title': 'Vibey'
      }
    }) : null;
  }

  async analyzePost(screenshotBase64, postText) {
    try {
      // Use OpenRouter for analysis with reasoning enabled
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'nousresearch/hermes-3-llama-3.1-405b:free',
          messages: [
            {
              role: 'user',
              content: `Analyze this tweet: "${postText}"\n\nIs this about leadership, business, startups, or controversial topics? Is it engaging enough to comment on? Reply ONLY with JSON: {"worth_commenting": true/false, "topic": "brief topic", "vibe": "professional/casual/controversial"}`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        });

        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      return { worth_commenting: false, topic: 'unknown', vibe: 'neutral' };
    } catch (error) {
      console.error('❌ AI analysis error:', error.message);
      return { worth_commenting: false, topic: 'error', vibe: 'neutral' };
    }
  }

  async generateReply(postText, analysis) {
    try {
      // Use OpenRouter for reply generation
      if (this.openai) {
        const systemPrompt = `You write Twitter replies like a real person on Reddit. Be direct, cut the fluff, speak in plain facts.

RULES:
- NO em dashes (—)
- NO rhetoric stacking ("not just X, but Y")
- NO additive framing ("more than", "beyond")
- NO filler words: "actually", "notably", "essentially", "fundamentally", "truly"
- NO fancy/official language
- Use radical brevity - cut everything unnecessary
- Short, heavy words
- Sound like giving a straight answer, not a sales pitch
- Match the vibe: ${analysis.vibe}
- Keep under 280 characters
- No hashtags unless natural
- No emojis unless it fits

Topic: ${analysis.topic}

WRONG: "Hedera doesn't care about the hype. It's built to actually stay standing when the pressure is on."
RIGHT: "Hedera is strong. It just keeps running when others break."

Reply to: "${postText}"

Write ONLY the comment, nothing else.`;

        const response = await this.openai.chat.completions.create({
          model: 'nousresearch/hermes-3-llama-3.1-405b:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: postText
            }
          ],
          max_tokens: 100,
          temperature: 0.9
        });

        const reply = response.choices[0].message.content.trim();
        
        // Clean up the reply and remove em dashes
        return reply.replace(/^["']|["']$/g, '').replace(/—/g, '-').substring(0, 280);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Reply generation error:', error.message);
      return null;
    }
  }
}
