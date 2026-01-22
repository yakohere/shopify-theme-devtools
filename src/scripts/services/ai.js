/**
 * AI Service for Theme Devtools
 * Handles OpenAI API communication and conversation management
 */

const STORAGE_KEY_API_KEY = 'tdt-ai-api-key';
const STORAGE_KEY_CONVERSATIONS = 'tdt-ai-conversations';
const MAX_CONVERSATIONS = 20;

class AIService {
  constructor() {
    this.apiKey = null;
    this.conversations = new Map(); // pageKey -> messages[]
    this.listeners = new Set();
    this._loadApiKey();
    this._loadConversations();
  }

  // ============ API Key Management ============

  _loadApiKey() {
    try {
      this.apiKey = localStorage.getItem(STORAGE_KEY_API_KEY);
    } catch (e) {
      console.warn('[TDT AI] Failed to load API key:', e);
    }
  }

  setApiKey(key) {
    this.apiKey = key;
    try {
      if (key) {
        localStorage.setItem(STORAGE_KEY_API_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
    } catch (e) {
      console.warn('[TDT AI] Failed to save API key:', e);
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return !!this.apiKey;
  }

  // ============ Conversation Management ============

  _getPageKey() {
    // Use pathname + template as key to group conversations by page type
    const path = window.location.pathname;
    return path || '/';
  }

  _loadConversations() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.conversations = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.warn('[TDT AI] Failed to load conversations:', e);
      this.conversations = new Map();
    }
  }

  _saveConversations() {
    try {
      // Convert Map to object for JSON serialization
      const obj = Object.fromEntries(this.conversations);

      // Limit total conversations
      const keys = Object.keys(obj);
      if (keys.length > MAX_CONVERSATIONS) {
        const toRemove = keys.slice(0, keys.length - MAX_CONVERSATIONS);
        toRemove.forEach(key => delete obj[key]);
      }

      sessionStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(obj));
    } catch (e) {
      console.warn('[TDT AI] Failed to save conversations:', e);
    }
  }

  getConversation(pageKey = null) {
    const key = pageKey || this._getPageKey();
    return this.conversations.get(key) || [];
  }

  addMessage(role, content, pageKey = null) {
    const key = pageKey || this._getPageKey();
    const messages = this.getConversation(key);

    messages.push({
      role,
      content,
      timestamp: Date.now()
    });

    // Keep last 50 messages per conversation
    if (messages.length > 50) {
      messages.splice(0, messages.length - 50);
    }

    this.conversations.set(key, messages);
    this._saveConversations();
    this._notify();
  }

  clearConversation(pageKey = null) {
    const key = pageKey || this._getPageKey();
    this.conversations.delete(key);
    this._saveConversations();
    this._notify();
  }

  clearAllConversations() {
    this.conversations.clear();
    try {
      sessionStorage.removeItem(STORAGE_KEY_CONVERSATIONS);
    } catch (e) {
      // Ignore
    }
    this._notify();
  }

  // ============ OpenAI API ============

  async chat(userMessage, context, onChunk = null) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    // Add user message to conversation
    this.addMessage('user', userMessage);

    // Build messages array with system prompt and conversation history
    const systemPrompt = this._buildSystemPrompt(context);
    const conversationHistory = this.getConversation();

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    try {
      if (onChunk) {
        // Streaming mode
        const response = await this._streamChat(messages, onChunk);
        this.addMessage('assistant', response);
        return response;
      } else {
        // Non-streaming mode
        const response = await this._sendChat(messages);
        this.addMessage('assistant', response);
        return response;
      }
    } catch (error) {
      // Remove the user message if the request failed
      const conversation = this.getConversation();
      conversation.pop();
      this._saveConversations();
      this._notify();
      throw error;
    }
  }

  async _sendChat(messages) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async _streamChat(messages, onChunk) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content, fullContent);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    return fullContent;
  }

  _buildSystemPrompt(context) {
    return `You are an expert Shopify theme developer assistant embedded in a browser devtools panel. You have direct access to the current page's runtime data including Liquid objects, metafields, cart data, network requests, and more.

Your role is to help developers:
- Debug issues with their Shopify theme
- Understand the available data and how to access it
- Write Liquid code snippets based on real data
- Explain Shopify/Liquid concepts
- Identify potential bugs or issues in their data
- Generate section schemas and settings

WHAT YOU CAN ACCESS:
- Page/template info, shop details, current resource (product/collection/page/etc.)
- Customer data (if logged in)
- Cart state and cart history (recent changes)
- Metafields for all resources
- Section schemas (when in theme editor mode or detected from page)
- HTML structure of the page
- Network requests and responses
- Cookies, localStorage, sessionStorage
- Liquid errors detected on the page
- Accessibility scan results
- Analytics events (GA4, Facebook Pixel, TikTok, Pinterest, Snapchat, Klaviyo, Shopify, dataLayer)

WHAT YOU CANNOT ACCESS:
- Raw .liquid template source files (Shopify renders server-side)
- Theme settings_schema.json file directly
- Theme code files (.liquid, .js, .css) as source
- Shopify Admin data not exposed to storefront

CURRENT PAGE CONTEXT:
${context}

GUIDELINES:
1. When referencing data, use the exact paths from the context (e.g., "product.title", "cart.total_price")
2. Prices in Shopify are in cents - remind users to use the | money filter
3. Provide copy-paste ready Liquid code when helpful
4. Be concise but thorough
5. If you need more context to answer a question, suggest the user select "Full" or "Custom" context mode
6. Point out potential issues you notice in the data
7. Use markdown formatting for code blocks with language hints (liquid, javascript, json)
8. When generating Liquid code, base it on actual data structures you can see

Remember: The user is looking at a Shopify storefront. You see runtime data, not source code. Generate code based on the data patterns you observe.`;
  }

  // ============ Subscription ============

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify() {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (e) {
        console.error('[TDT AI] Listener error:', e);
      }
    });
  }
}

export const aiService = new AIService();
