export class AgentverseService {
  private chatHistory: { role: 'user' | 'chatbot'; content: string }[] = [];

  constructor() {
    // No need for API key in the frontend anymore
  }

  async initialize() {
    try {
      console.log("Agentverse service initialized");
    } catch (error) {
      console.error("Error initializing service:", error);
      throw error;
    }
  }

  async sendMessage(message: string) {
    try {
      // Add user message to chat history
      this.chatHistory.push({ role: 'user', content: message });

      // Prepare the request
      const request = {
        message: message,
        chat_history: this.chatHistory.map(msg => ({
          content: msg.content,
          role: msg.role === 'user' ? 'user' : 'assistant',
          timestamp: new Date().toISOString()
        }))
      };

      console.log('Sending message to API:', request);

      // Send message to our API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from API:', data);

      // Add bot response to chat history
      this.chatHistory.push({ 
        role: 'chatbot', 
        content: data.content 
      });

      return {
        content: data.content,
        metadata: {
          mood: data.mood || 'happy',
          timestamp: data.timestamp || new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async cleanup() {
    try {
      // Clear chat history
      this.chatHistory = [];
      console.log("Service cleaned up");
    } catch (error) {
      console.error("Error cleaning up service:", error);
      throw error;
    }
  }
} 