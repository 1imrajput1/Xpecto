import { Agent, AgentContext, AgentMessage } from "@fetch-ai/agentverse";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyD7Lo4tZk7V3iwZ0XsutrjZEEwYqqVBr40");

// System prompt for the agent
const SYSTEM_PROMPT = `You are Claim Saathi, an AI assistant for Swift Claim - an insurance claims processing platform.

Your personality:
- Friendly and empathetic
- Professional but approachable
- Expert in insurance claims
- Uses simple language, avoiding jargon
- Keeps responses concise (2-3 sentences max)

Your capabilities:
- Guide users through claim filing process
- Explain insurance terms simply
- Check claim status
- Provide policy information
- Help with document requirements
- Offer claim processing estimates

When responding:
1. Be empathetic to user concerns
2. Give clear, actionable steps
3. Use positive language
4. Maintain a helpful tone
5. If unsure, ask for clarification

Current conversation context: Insurance claims assistance`;

// Create the agent class
export class ClaimSaathiAgent extends Agent {
  private chatHistory: { role: 'user' | 'chatbot'; content: string }[] = [];
  private model: any;

  constructor() {
    super({
      name: "Claim Saathi",
      description: "AI Insurance Claims Assistant",
      version: "1.0.0"
    });
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  // Initialize the agent
  async initialize(context: AgentContext): Promise<void> {
    console.log("Initializing Claim Saathi Agent...");
  }

  // Process incoming messages
  async processMessage(message: AgentMessage, context: AgentContext): Promise<AgentMessage> {
    try {
      // Add user message to chat history
      this.chatHistory.push({ role: 'user', content: message.content });

      // Construct context string from chat history
      let contextString = "";
      for (const msg of this.chatHistory) {
        contextString += `${msg.role}: ${msg.content}\n`;
      }

      // Generate response using Gemini
      const prompt = `${SYSTEM_PROMPT}\n\n${contextString}\n\nClaim Saathi:`;
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Add bot response to chat history
      this.chatHistory.push({ role: 'chatbot', content: response });

      // Return response as AgentMessage
      return {
        content: response,
        metadata: {
          timestamp: new Date().toISOString(),
          mood: this.getMoodFromContent(response)
        }
      };
    } catch (error) {
      console.error("Error processing message:", error);
      return {
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        metadata: {
          timestamp: new Date().toISOString(),
          mood: "confused"
        }
      };
    }
  }

  // Helper function to determine mood from content
  private getMoodFromContent(content: string): string {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("sorry") || lowerContent.includes("unfortunately")) return "grumpy";
    if (lowerContent.includes("great") || lowerContent.includes("approved")) return "excited";
    if (lowerContent.includes("help") || lowerContent.includes("guide")) return "winking";
    if (lowerContent.includes("error") || lowerContent.includes("invalid")) return "angry";
    if (lowerContent.includes("processing") || lowerContent.includes("checking")) return "neutral";
    if (lowerContent.includes("success") || lowerContent.includes("completed")) return "dancing";
    return "happy";
  }

  // Cleanup when agent is stopped
  async cleanup(context: AgentContext): Promise<void> {
    console.log("Cleaning up Claim Saathi Agent...");
    this.chatHistory = [];
  }
} 