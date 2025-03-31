import { NextResponse } from 'next/server';

// Replace this with your actual agent address from Agentverse platform
const AGENT_ADDRESS = "test-agent://agent1qd7swedy4jdqfaf5fk0ra3jrnzgyq5z52guz0m2nrrgak95839rpypyhaak";
const API_BASE_URL = "https://api.agentverse.ai/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_AGENTVERSE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Agentverse API key not configured" },
        { status: 500 }
      );
    }

    // Format the request according to Agentverse API requirements
    const requestBody = {
      protocol: "ChatProtocol",
      message: {
        content: body.message,
        chat_history: body.chat_history
      }
    };

    console.log('Sending request to Agentverse:', {
      url: `${API_BASE_URL}/agents/${AGENT_ADDRESS}/chat`,
      body: requestBody
    });

    const response = await fetch(`${API_BASE_URL}/agents/${AGENT_ADDRESS}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agentverse API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Agentverse:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
} 